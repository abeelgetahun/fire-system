"""
Proteus ↔ TeleStock Fire-Detection Bridge
==========================================
Reads JSON lines from the Arduino simulation running in Proteus via a virtual
COM port and forwards fire events to the TeleStock web-app API.

Arduino serial output format (one line per 500 ms per room):
    {"room":"Room 1","status":"Normal","smoke":123,"temp":45,"flame":200}

Arduino status  →  API FireStatus enum
-------------------------------------------------
"Normal"         →  NORMAL
"Fire suspected" →  SUSPICIOUS
"FIRE CONFIRMED" →  FIRE_CONFIRMED
"FIRE ACTIVE"    →  FIRE_CONFIRMED
"Fire cleared"   →  CLEARED

SETUP (do this once)
--------------------
1.  Install Python 3.10+ → https://www.python.org/downloads/
2.  In this folder run:   pip install -r requirements.txt
3.  Install a virtual COM-port pair tool:
        VSPE (free edition) → https://www.eterlogic.com/Products.VSPE.html
      OR com0com (open-source) → https://com0com.sourceforge.net/
4.  Create a pair, e.g. COM1 ↔ COM2.
5.  In Proteus, open PF.pdsprj, double-click the COMPIM component and set:
        Physical port  →  COM1   (Proteus side)
        Baud rate      →  9600
6.  Set COM_PORT below to COM2  (Python side — the other end of the pair).
7.  Make sure your Next.js dev server is running:  npm run dev
8.  Run:  python bridge.py

CONFIGURATION — edit these 3 lines only
"""

import json
import time
import sys
import serial
import requests

# ── User configuration ──────────────────────────────────────────────────────
COM_PORT  = "COM4"                                       # Python end of VSPE pair
BAUD_RATE = 9600                                         # must match Proteus COMPIM
API_URL   = "http://localhost:3000/api/fire-detection"   # or your deployed URL
API_KEY   = "tele-wms-fire-secret-2026"                  # must match FIRE_API_KEY in .env
# ────────────────────────────────────────────────────────────────────────────

HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
}

# Map every string the Arduino can send → our API's FireStatus enum value
ARDUINO_STATUS_MAP: dict[str, str] = {
    "normal":          "NORMAL",
    "fire suspected":  "SUSPICIOUS",
    "fire confirmed":  "FIRE_CONFIRMED",
    "fire active":     "FIRE_CONFIRMED",
    "fire cleared":    "CLEARED",
    "cleared":         "CLEARED",
}

ROOMS = ["Room 1", "Room 2", "Room 3"]

# Cache last-sent status per room — only POST on state change to avoid noise
room_states: dict[str, str] = {r: "" for r in ROOMS}


def map_status(raw: str) -> str:
    """Convert an Arduino status string to the API enum value."""
    return ARDUINO_STATUS_MAP.get(raw.strip().lower(), "NORMAL")


def post_event(room: str, status: str, smoke: int | None, temp: int | None,
               flame: int | None, message: str) -> None:
    payload: dict = {
        "room":    room,
        "status":  status,
        "message": message,
    }
    if smoke is not None:
        payload["smokeLevel"]  = smoke
    if temp is not None:
        payload["temperature"] = temp

    try:
        resp = requests.post(API_URL, json=payload, headers=HEADERS, timeout=8)
        if resp.status_code == 201:
            print(f"  [SENT] {room:<8} → {status:<16}  "
                  f"smoke={smoke}  temp={temp}  flame={flame}")
        else:
            print(f"  [WARN] API {resp.status_code}: {resp.text[:120]}")
    except requests.exceptions.ConnectionError:
        print(f"  [ERR]  Cannot reach {API_URL}")
        print("         → Is 'npm run dev' running?")
    except requests.exceptions.Timeout:
        print(f"  [ERR]  Request timed out — server may be busy, will retry next cycle")
    except Exception as exc:
        print(f"  [ERR]  {exc}")


def process_line(line: str) -> None:
    """Parse one Arduino JSON line and POST to the API if the state changed."""
    line = line.strip()
    if not (line.startswith("{") and line.endswith("}")):
        return  # not a complete JSON record

    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        print(f"  [WARN] Bad JSON: {line[:80]}")
        return

    room   = data.get("room", "").strip()
    status = map_status(data.get("status", "Normal"))
    smoke  = data.get("smoke")
    temp   = data.get("temp")
    flame  = data.get("flame")

    if room not in ROOMS:
        print(f"  [WARN] Unknown room '{room}' — skipping")
        return

    # Build a human-readable message string identical to what the website shows
    raw_status = data.get("status", "Normal")
    message = f"{raw_status} | smoke={smoke} temp={temp} flame={flame}"

    # Only send if the status changed for this room (avoids flooding the DB)
    if room_states.get(room) != status:
        room_states[room] = status
        post_event(room, status, smoke, temp, flame, message)
    else:
        # Still print received data so you can see the simulation is alive
        print(f"  [--]   {room:<8}   {status:<16}  "
              f"smoke={smoke}  temp={temp}  flame={flame}")


def reset_all_rooms() -> None:
    """Send NORMAL to every room on startup so the website starts clean."""
    print("\n  Resetting all rooms to NORMAL on the website...")
    for room in ROOMS:
        post_event(room, "NORMAL", None, None, None, "Bridge started — all clear")
        room_states[room] = "NORMAL"
    print()


def main() -> None:
    print("=" * 58)
    print("  TeleStock × Proteus  Fire-Detection Bridge")
    print("=" * 58)
    print(f"  COM port  : {COM_PORT}")
    print(f"  Baud rate : {BAUD_RATE}")
    print(f"  API URL   : {API_URL}")
    print("=" * 58)

    # Open the virtual serial port
    try:
        ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
        print(f"\n[OK] Connected to {COM_PORT}. Waiting for Proteus data...\n")
    except serial.SerialException as exc:
        print(f"\n[ERROR] Cannot open {COM_PORT}: {exc}")
        print("\nTroubleshooting:")
        print("  1. Install VSPE or com0com and create a COM port pair.")
        print("  2. In Proteus COMPIM component set the OTHER port of the pair.")
        print(f"  3. Change COM_PORT at the top of bridge.py (currently '{COM_PORT}').")
        print("  4. Make sure the Proteus simulation is RUNNING (press ▶).")
        sys.exit(1)

    reset_all_rooms()

    try:
        while True:
            try:
                if ser.in_waiting > 0:
                    raw = ser.readline()
                    line = raw.decode("utf-8", errors="ignore")
                    if line.strip():
                        print(f"[RX] {line.strip()}")
                        process_line(line)
                else:
                    time.sleep(0.05)

            except serial.SerialException as exc:
                print(f"\n[ERR] Serial error: {exc}. Reconnecting in 3 s…")
                time.sleep(3)
                try:
                    ser.close()
                    ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
                    print(f"[OK] Reconnected to {COM_PORT}.")
                except Exception:
                    pass

    except KeyboardInterrupt:
        print("\n\n[STOP] Bridge stopped. Goodbye.")
        ser.close()
        sys.exit(0)


if __name__ == "__main__":
    main()
