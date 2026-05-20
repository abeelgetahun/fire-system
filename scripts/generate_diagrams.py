"""
TeleStock Documentation Diagrams Generator
Generates all figures for the thesis/documentation:
  - Figure 4.11: Software System Architecture Diagram
  - Figure 4.12: Fire Detection Module Data Flow Diagram
  - Figure 4.13: AI Chatbot Module Architecture Diagram
  - Figure 4.14: Entity-Relationship Diagram
  - Figure 4.x:  System Flow Chart (User Journey)
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'diagrams')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Color palette ────────────────────────────────────────────────────────────
C = {
    'blue_dark':   '#1e3a5f',
    'blue_mid':    '#2563eb',
    'blue_light':  '#dbeafe',
    'blue_pale':   '#eff6ff',
    'teal':        '#0d9488',
    'teal_light':  '#ccfbf1',
    'orange':      '#ea580c',
    'orange_light':'#ffedd5',
    'red':         '#dc2626',
    'red_light':   '#fee2e2',
    'green':       '#16a34a',
    'green_light': '#dcfce7',
    'purple':      '#7c3aed',
    'purple_light':'#ede9fe',
    'gray_dark':   '#374151',
    'gray_mid':    '#6b7280',
    'gray_light':  '#f3f4f6',
    'gray_border': '#d1d5db',
    'white':       '#ffffff',
    'black':       '#111827',
}

def save(fig, name):
    path = os.path.join(OUTPUT_DIR, name)
    fig.savefig(path, dpi=180, bbox_inches='tight',
                facecolor=C['white'], edgecolor='none')
    plt.close(fig)
    print(f"  Saved -> {path}")


def rounded_box(ax, x, y, w, h, text, facecolor, edgecolor,
                fontsize=9, fontweight='normal', textcolor=C['black'],
                radius=0.03, linestyle='-', linewidth=1.5,
                subtext=None, subsize=7.5):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle=f"round,pad=0,rounding_size={radius}",
                         facecolor=facecolor, edgecolor=edgecolor,
                         linewidth=linewidth, linestyle=linestyle,
                         zorder=3)
    ax.add_patch(box)
    if subtext:
        ax.text(x, y + h * 0.12, text, ha='center', va='center',
                fontsize=fontsize, fontweight=fontweight, color=textcolor,
                zorder=4, wrap=True)
        ax.text(x, y - h * 0.22, subtext, ha='center', va='center',
                fontsize=subsize, color=C['gray_mid'], zorder=4, style='italic')
    else:
        ax.text(x, y, text, ha='center', va='center',
                fontsize=fontsize, fontweight=fontweight, color=textcolor,
                zorder=4, multialignment='center')
    return box


def arrow(ax, x1, y1, x2, y2, color=C['gray_dark'], label='',
          style='->', lw=1.5, fontsize=7.5, labelside='right'):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color,
                                lw=lw, connectionstyle='arc3,rad=0.0'),
                zorder=5)
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        dx, dy = x2-x1, y2-y1
        if abs(dx) > abs(dy):
            offset = (0, 0.025)
        else:
            offset = (0.04 if labelside == 'right' else -0.04, 0)
        ax.text(mx + offset[0], my + offset[1], label,
                ha='center', va='center', fontsize=fontsize,
                color=color, zorder=6,
                bbox=dict(facecolor=C['white'], edgecolor='none', pad=1))


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  FIGURE 4.11 – Software System Architecture Diagram                      ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def fig_4_11():
    fig, ax = plt.subplots(figsize=(14, 9))
    ax.set_xlim(0, 14); ax.set_ylim(0, 9)
    ax.axis('off')
    fig.patch.set_facecolor(C['white'])

    # ── Title ─────────────────────────────────────────────────────────────
    ax.text(7, 8.65, 'TeleStock — Software System Architecture',
            ha='center', va='center', fontsize=14, fontweight='bold',
            color=C['blue_dark'])
    ax.text(7, 8.35, 'Next.js 15 · PostgreSQL (Neon) · Prisma ORM · JWT/RBAC',
            ha='center', va='center', fontsize=9, color=C['gray_mid'])

    # ─── Layer bands ──────────────────────────────────────────────────────
    layer_defs = [
        (6.9, 1.05, C['blue_pale'],    C['blue_mid'],    'PRESENTATION LAYER',  'Next.js 15 App Router — React 19 Client & Server Components'),
        (4.4, 1.15, C['teal_light'],   C['teal'],        'APPLICATION LAYER',   'Next.js API Routes — Business Logic · Auth Middleware · RBAC'),
        (1.9, 0.9,  C['purple_light'], C['purple'],      'DATA LAYER',          'Prisma ORM — PostgreSQL (Neon) — Schema-managed migrations'),
    ]
    for cy, h, fc, ec, title, sub in layer_defs:
        band = FancyBboxPatch((0.3, cy - h/2), 13.4, h,
                              boxstyle="round,pad=0,rounding_size=0.12",
                              facecolor=fc, edgecolor=ec, linewidth=1.8, zorder=1)
        ax.add_patch(band)
        ax.text(0.65, cy, title, ha='left', va='center', fontsize=8,
                fontweight='bold', color=ec, rotation=90, zorder=2)
        ax.text(7, cy + h/2 - 0.17, sub, ha='center', va='center',
                fontsize=7.5, color=C['gray_mid'], zorder=2, style='italic')

    # ── Presentation layer boxes ──────────────────────────────────────────
    pres_items = [
        (2.2,  7.1, 1.7, 0.55, 'Login / Auth\nPage', C['blue_light'], C['blue_mid']),
        (4.3,  7.1, 1.7, 0.55, 'Role Dashboards\n(5 roles)', C['blue_light'], C['blue_mid']),
        (6.4,  7.1, 1.7, 0.55, 'Inventory\nManagement', C['blue_light'], C['blue_mid']),
        (8.5,  7.1, 1.7, 0.55, 'Fire Monitor\nDashboard', C['blue_light'], C['blue_mid']),
        (10.6, 7.1, 1.7, 0.55, 'AI Chatbot\nInterface', C['blue_light'], C['blue_mid']),
        (12.7, 7.1, 1.5, 0.55, 'Warehouse /\nReports', C['blue_light'], C['blue_mid']),
    ]
    for x, y, w, h, lbl, fc, ec in pres_items:
        rounded_box(ax, x, y, w, h, lbl, fc, ec, fontsize=8)

    # Tailwind badge
    rounded_box(ax, 7.0, 6.28, 3.2, 0.34, 'Tailwind CSS · shadcn/ui (Radix) · Recharts',
                C['blue_mid'], C['blue_mid'], fontsize=7.5, textcolor=C['white'])

    # ── Application layer boxes ───────────────────────────────────────────
    api_items = [
        (2.0,  4.6, 1.6, 0.50, '/api/auth\n/api/profile', C['teal_light'], C['teal']),
        (4.0,  4.6, 1.6, 0.50, '/api/inventory\n/api/categories', C['teal_light'], C['teal']),
        (6.0,  4.6, 1.6, 0.50, '/api/warehouse\n/api/transfers', C['teal_light'], C['teal']),
        (8.0,  4.6, 1.6, 0.50, '/api/fire-\ndetection', C['orange_light'], C['orange']),
        (10.0, 4.6, 1.6, 0.50, '/api/chatbot', C['orange_light'], C['orange']),
        (12.0, 4.6, 1.7, 0.50, '/api/dashboard\n/api/reports', C['teal_light'], C['teal']),
    ]
    for x, y, w, h, lbl, fc, ec in api_items:
        rounded_box(ax, x, y, w, h, lbl, fc, ec, fontsize=7.8)

    # Middleware band inside application layer
    mw_items = [
        (3.5, 3.82, 2.5, 0.38, 'JWT Auth Middleware\n(withAuth)', C['teal'], C['teal'], C['white']),
        (7.0, 3.82, 2.5, 0.38, 'RBAC Authorization\n(withAuthorization)', C['teal'], C['teal'], C['white']),
        (10.5, 3.82, 2.5, 0.38, 'Zod Schema\nValidation', C['teal'], C['teal'], C['white']),
    ]
    for x, y, w, h, lbl, fc, ec, tc in mw_items:
        rounded_box(ax, x, y, w, h, lbl, fc, ec, fontsize=7.5, textcolor=tc)

    # ── Data layer boxes ──────────────────────────────────────────────────
    data_items = [
        (2.5,  2.0, 2.2, 0.50, 'Users · Warehouses\nCategories', C['purple_light'], C['purple']),
        (5.5,  2.0, 2.2, 0.50, 'Inventory Items\nStock Transfers', C['purple_light'], C['purple']),
        (8.5,  2.0, 2.2, 0.50, 'Fire Events\nChat Logs', C['purple_light'], C['purple']),
        (11.5, 2.0, 2.2, 0.50, 'Audits · Reports\nWarnings', C['purple_light'], C['purple']),
    ]
    for x, y, w, h, lbl, fc, ec in data_items:
        rounded_box(ax, x, y, w, h, lbl, fc, ec, fontsize=8)

    # Prisma ORM bar
    rounded_box(ax, 7.0, 1.38, 9.0, 0.34, 'Prisma ORM (Type-safe queries · Schema migrations · Connection pooling)',
                C['purple'], C['purple'], fontsize=7.5, textcolor=C['white'])

    # PostgreSQL Neon bar
    rounded_box(ax, 7.0, 0.8, 9.0, 0.34, 'PostgreSQL · Neon (Serverless) — DATABASE_URL (pooled) + DIRECT_URL (migrations)',
                C['blue_dark'], C['blue_dark'], fontsize=7.5, textcolor=C['white'])

    # ── External systems ──────────────────────────────────────────────────
    # Hardware
    hw = FancyBboxPatch((0.5, 3.5), 1.05, 1.35,
                        boxstyle="round,pad=0,rounding_size=0.08",
                        facecolor=C['orange_light'], edgecolor=C['orange'],
                        linewidth=1.5, zorder=3)
    ax.add_patch(hw)
    ax.text(1.025, 4.35, 'Arduino\nHardware', ha='center', va='center',
            fontsize=7.5, fontweight='bold', color=C['orange'], zorder=4)
    ax.text(1.025, 4.0, 'Smoke/Temp\nSensors', ha='center', va='center',
            fontsize=7, color=C['gray_dark'], zorder=4)
    # Hardware → fire-detection API
    arrow(ax, 1.55, 4.6, 7.2, 4.6, color=C['orange'], label='HTTP POST\n(JSON payload)', fontsize=7)

    # Claude AI
    claude = FancyBboxPatch((12.4, 3.5), 1.25, 1.35,
                            boxstyle="round,pad=0,rounding_size=0.08",
                            facecolor='#fef3c7', edgecolor='#d97706',
                            linewidth=1.5, zorder=3)
    ax.add_patch(claude)
    ax.text(13.025, 4.35, 'Claude\nAI API', ha='center', va='center',
            fontsize=7.5, fontweight='bold', color='#92400e', zorder=4)
    ax.text(13.025, 4.0, 'Anthropic\ncloud service', ha='center', va='center',
            fontsize=7, color=C['gray_mid'], zorder=4)
    arrow(ax, 10.8, 4.6, 12.4, 4.6, color='#d97706', label='Prompt + context', fontsize=7)

    # ── Vertical connector arrows (layer-to-layer) ────────────────────────
    for x in [2.2, 4.3, 6.4, 12.0]:
        arrow(ax, x, 6.82, x, 4.85, color=C['blue_mid'])
    for x in [8.5]:
        arrow(ax, x, 6.82, x, 4.85, color=C['orange'])
    for x in [10.6]:
        arrow(ax, x, 6.82, x, 4.85, color='#d97706')
    for x in [3.5, 7.0, 10.5]:
        arrow(ax, x, 4.61, x, 4.02, color=C['teal'])
    for x in [3.5, 7.0, 10.5]:
        arrow(ax, x, 3.63, x, 2.26, color=C['purple'])

    # ── Legend ─────────────────────────────────────────────────────────────
    legend_items = [
        (mpatches.Patch(facecolor=C['blue_light'], edgecolor=C['blue_mid'], linewidth=1.2), 'Presentation'),
        (mpatches.Patch(facecolor=C['teal_light'], edgecolor=C['teal'], linewidth=1.2), 'Application / API'),
        (mpatches.Patch(facecolor=C['orange_light'], edgecolor=C['orange'], linewidth=1.2), 'Fire Detection / Chatbot'),
        (mpatches.Patch(facecolor=C['purple_light'], edgecolor=C['purple'], linewidth=1.2), 'Data Layer'),
    ]
    ax.legend(handles=[h for h, _ in legend_items],
              labels=[l for _, l in legend_items],
              loc='lower left', fontsize=7.5, framealpha=0.9,
              bbox_to_anchor=(0.02, 0.02))

    save(fig, 'fig_4_11_software_architecture.png')


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  FIGURE 4.12 – Fire Detection Module Data Flow Diagram                   ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def fig_4_12():
    fig, ax = plt.subplots(figsize=(13, 9))
    ax.set_xlim(0, 13); ax.set_ylim(0, 9)
    ax.axis('off')
    fig.patch.set_facecolor(C['white'])

    ax.text(6.5, 8.65, 'Fire Detection Module — Data Flow Diagram',
            ha='center', fontsize=14, fontweight='bold', color=C['blue_dark'])
    ax.text(6.5, 8.32, 'Hardware Event → API Processing → Database Storage → Dashboard Update → User Acknowledgement',
            ha='center', fontsize=8.5, color=C['gray_mid'])

    # ── Swimlane headers ───────────────────────────────────────────────────
    lanes = [
        (8.25, 1.55, C['orange_light'], C['orange'],   'HARDWARE SUBSYSTEM\n(Arduino + Sensors)'),
        (6.55, 1.55, C['blue_pale'],    C['blue_mid'], 'API LAYER\n(/api/fire-detection)'),
        (4.85, 1.55, C['teal_light'],   C['teal'],     'DATABASE LAYER\n(PostgreSQL / Prisma)'),
        (3.15, 1.55, C['green_light'],  C['green'],    'DASHBOARD\n(Next.js Client)'),
        (1.45, 1.55, C['purple_light'], C['purple'],   'USER\n(Authorized Staff)'),
    ]
    for cy, h, fc, ec, label in lanes:
        band = FancyBboxPatch((0.2, cy - h/2), 12.6, h,
                              boxstyle="round,pad=0,rounding_size=0.06",
                              facecolor=fc, edgecolor=ec, linewidth=1.5, zorder=1, alpha=0.45)
        ax.add_patch(band)
        ax.text(0.52, cy, label, ha='left', va='center', fontsize=7.5,
                fontweight='bold', color=ec, rotation=90, zorder=2)

    # ── Step boxes (x=column, y=row in each lane) ─────────────────────────
    def step(x, y, title, subtitle='', fc=C['white'], ec=C['gray_border'], diamond=False):
        if diamond:
            # Decision diamond
            d = 0.38
            xs = [x, x+d, x, x-d, x]
            ys = [y+d*0.6, y, y-d*0.6, y, y+d*0.6]
            ax.fill(xs, ys, facecolor=fc, edgecolor=ec, linewidth=1.8, zorder=3)
            ax.text(x, y, title, ha='center', va='center', fontsize=7.5,
                    fontweight='bold', color=ec, zorder=4, multialignment='center')
        else:
            rounded_box(ax, x, y, 2.0, 0.52, title, fc, ec,
                        fontsize=8, subtext=subtitle, subsize=7)

    # Hardware lane (cy=8.25)
    step(3.0, 8.25, 'Sensor Reading', 'Smoke / Temperature sensors', C['orange_light'], C['orange'])
    step(5.5, 8.25, 'Threshold Check', 'Suspicious / Fire confirmed?', C['orange_light'], C['orange'], diamond=True)
    step(8.3, 8.25, 'HTTP POST Request', 'JSON: room_id, sensors,\nstatus, timestamp', C['orange_light'], C['orange'])

    # API lane (cy=6.55)
    step(8.3,  6.55, 'Receive Request', 'POST /api/fire-detection', C['blue_light'], C['blue_mid'])
    step(6.1,  6.55, 'Zod Validation', 'Schema: room_id,\nsensor_status, fire_flag', C['blue_light'], C['blue_mid'])
    step(3.9,  6.55, 'Auth / RBAC Check', 'Verify API key /\ncredentials', C['blue_light'], C['blue_mid'])

    # Database lane (cy=4.85)
    step(3.9,  4.85, 'Store Fire Event', 'fire_events table:\nsensors, status, time', C['teal_light'], C['teal'])
    step(6.1,  4.85, 'Update Room Status', 'room: NORMAL → FIRE\nextinguishing flag', C['teal_light'], C['teal'])
    step(8.3,  4.85, 'Return 201 Response', 'event_id + room status\nJSON response', C['teal_light'], C['teal'])

    # Dashboard lane (cy=3.15)
    step(8.3,  3.15, 'Real-time Update', 'Status cards refresh\n(no page reload)', C['green_light'], C['green'])
    step(6.1,  3.15, 'Fire Alert Card', 'Room #, sensors triggered\ntimestamp, extinguish status', C['red_light'], C['red'])
    step(3.9,  3.15, 'Extinguish Indicator', 'O₂ release active\nstatus displayed', C['green_light'], C['green'])

    # User lane (cy=1.45)
    step(3.9,  1.45, 'Acknowledge Alert', 'User reviews alert\nand acknowledges', C['purple_light'], C['purple'])
    step(6.1,  1.45, 'Reset Room Status', 'DB: ack=true\nack_by, ack_time logged', C['purple_light'], C['purple'])
    step(8.3,  1.45, 'Normal State', 'Room card resets\nto NORMAL', C['green_light'], C['green'])

    # ── Arrows (flow) ─────────────────────────────────────────────────────
    # Hardware row
    arrow(ax, 4.0, 8.25, 4.72, 8.25, color=C['orange'], lw=1.8)
    # from diamond: YES arm → HTTP POST
    arrow(ax, 6.88, 8.25, 7.3, 8.25, color=C['orange'], lw=1.8, label='Fire confirmed')
    # from diamond: NO arm → loop back (below)
    ax.annotate('', xy=(3.0, 7.8), xytext=(5.5, 7.8),
                arrowprops=dict(arrowstyle='->', color=C['gray_mid'], lw=1.2,
                                connectionstyle='arc3,rad=0.0'))
    ax.text(4.25, 7.67, 'Continue monitoring', ha='center', fontsize=7, color=C['gray_mid'])
    ax.plot([5.5, 5.5], [7.97, 7.8], color=C['gray_mid'], lw=1.2)

    # Hardware → API (down)
    arrow(ax, 8.3, 7.99, 8.3, 6.82, color=C['orange'], lw=1.8)
    # API row
    arrow(ax, 7.3, 6.55, 7.1, 6.55, color=C['blue_mid'], lw=1.8)
    arrow(ax, 5.1, 6.55, 4.9, 6.55, color=C['blue_mid'], lw=1.8)
    # API → DB (down)
    arrow(ax, 3.9, 6.29, 3.9, 5.12, color=C['blue_mid'], lw=1.8)
    # DB row
    arrow(ax, 4.9, 4.85, 5.1, 4.85, color=C['teal'], lw=1.8)
    arrow(ax, 7.1, 4.85, 7.3, 4.85, color=C['teal'], lw=1.8)
    # DB → Dashboard (down)
    arrow(ax, 8.3, 4.59, 8.3, 3.42, color=C['teal'], lw=1.8)
    # Dashboard row
    arrow(ax, 7.3, 3.15, 7.1, 3.15, color=C['green'], lw=1.8)
    arrow(ax, 5.1, 3.15, 4.9, 3.15, color=C['red'], lw=1.8)
    # Dashboard → User (down)
    arrow(ax, 3.9, 2.89, 3.9, 1.72, color=C['green'], lw=1.8)
    # User row
    arrow(ax, 4.9, 1.45, 5.1, 1.45, color=C['purple'], lw=1.8)
    arrow(ax, 7.1, 1.45, 7.3, 1.45, color=C['purple'], lw=1.8)

    # Validation FAIL branch
    ax.annotate('', xy=(6.1, 6.08), xytext=(6.1, 5.85),
                arrowprops=dict(arrowstyle='->', color=C['red'], lw=1.2))
    rounded_box(ax, 6.1, 5.6, 1.8, 0.38, '400 Bad Request\n(Validation error)', C['red_light'], C['red'], fontsize=7)
    ax.text(6.62, 5.94, 'invalid', fontsize=7, color=C['red'])

    save(fig, 'fig_4_12_fire_detection_dataflow.png')


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  FIGURE 4.13 – AI Chatbot Module Architecture Diagram                    ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def fig_4_13():
    fig, ax = plt.subplots(figsize=(13, 8.5))
    ax.set_xlim(0, 13); ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(6.5, 8.15, 'AI Chatbot Module — Architecture Diagram',
            ha='center', fontsize=14, fontweight='bold', color=C['blue_dark'])
    ax.text(6.5, 7.82, 'User Query → Context Retrieval → Claude AI → Grounded Natural Language Response',
            ha='center', fontsize=8.5, color=C['gray_mid'])

    # ── Component boxes ────────────────────────────────────────────────────
    # User
    rounded_box(ax, 1.2, 6.4, 1.7, 0.58, 'User\n(Warehouse Staff)', C['blue_light'], C['blue_mid'],
                fontsize=8.5, fontweight='bold')

    # Chat Interface
    ci_box = FancyBboxPatch((0.4, 4.4), 3.0, 1.5,
                            boxstyle="round,pad=0,rounding_size=0.1",
                            facecolor=C['blue_pale'], edgecolor=C['blue_mid'],
                            linewidth=1.8, zorder=2)
    ax.add_patch(ci_box)
    ax.text(1.9, 5.5, 'Chat Interface', ha='center', fontsize=9,
            fontweight='bold', color=C['blue_dark'], zorder=3)
    ax.text(1.9, 5.18, '• Persistent panel on all dashboards', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(1.9, 4.93, '• Session history (multi-turn)', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(1.9, 4.68, '• Real-time response display', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)

    # API Route
    api_box = FancyBboxPatch((4.3, 3.9), 3.2, 2.3,
                             boxstyle="round,pad=0,rounding_size=0.1",
                             facecolor=C['teal_light'], edgecolor=C['teal'],
                             linewidth=1.8, zorder=2)
    ax.add_patch(api_box)
    ax.text(5.9, 6.0, '/api/chatbot', ha='center', fontsize=9.5,
            fontweight='bold', color=C['teal'], zorder=3, family='monospace')
    ax.text(5.9, 5.68, '• Parse user query (POST body)', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(5.9, 5.43, '• Retrieve DB context', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(5.9, 5.18, '• Build structured prompt', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(5.9, 4.93, '• Call Claude API', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(5.9, 4.68, '• Return + log response', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(5.9, 4.2, 'JWT auth · RBAC check', ha='center',
            fontsize=7.5, color=C['teal'], style='italic', zorder=3)

    # DB context sub-box
    db_box = FancyBboxPatch((0.4, 1.4), 5.8, 2.4,
                            boxstyle="round,pad=0,rounding_size=0.1",
                            facecolor=C['purple_light'], edgecolor=C['purple'],
                            linewidth=1.8, zorder=2)
    ax.add_patch(db_box)
    ax.text(3.3, 3.55, 'Database Context (PostgreSQL / Prisma)', ha='center',
            fontsize=9, fontweight='bold', color=C['purple'], zorder=3)

    db_tables = [
        (1.35, 2.85, 'Room Status\n(fire_events)', C['red_light'], C['red']),
        (3.3,  2.85, 'Inventory\n(inventory_items)', C['teal_light'], C['teal']),
        (5.25, 2.85, 'Warehouse Info\n(warehouses)', C['blue_light'], C['blue_mid']),
        (1.35, 1.9,  'Recent Events\n(last 24h)', C['orange_light'], C['orange']),
        (3.3,  1.9,  'User Context\n(role/warehouse)', C['green_light'], C['green']),
        (5.25, 1.9,  'Chat Logs\n(audit history)', C['purple_light'], C['purple']),
    ]
    for x, y, lbl, fc, ec in db_tables:
        rounded_box(ax, x, y, 1.68, 0.52, lbl, fc, ec, fontsize=7.5)

    # Claude AI box
    claude_box = FancyBboxPatch((8.2, 3.9), 3.5, 2.3,
                                boxstyle="round,pad=0,rounding_size=0.1",
                                facecolor='#fef3c7', edgecolor='#d97706',
                                linewidth=2.0, zorder=2)
    ax.add_patch(claude_box)
    ax.text(9.95, 6.0, 'Claude AI API', ha='center', fontsize=10,
            fontweight='bold', color='#92400e', zorder=3)
    ax.text(9.95, 5.65, 'Anthropic — claude-3-sonnet', ha='center',
            fontsize=8, color='#78350f', zorder=3, style='italic')
    ax.text(9.95, 5.3, '• Receives: prompt + DB context', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(9.95, 5.05, '• Grounded response generation', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(9.95, 4.8, '• Natural language output', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(9.95, 4.55, '• Context-aware follow-up', ha='center',
            fontsize=7.5, color=C['gray_dark'], zorder=3)
    ax.text(9.95, 4.2, 'External cloud service', ha='center',
            fontsize=7.5, color='#d97706', style='italic', zorder=3)

    # Chat Logs DB box
    rounded_box(ax, 10.2, 1.9, 3.2, 1.2,
                'Chat Logs\n(chat_logs table)\nuser_id · query · response · timestamp',
                C['purple_light'], C['purple'], fontsize=7.8)

    # ── Arrows ─────────────────────────────────────────────────────────────
    # User → Chat Interface
    arrow(ax, 1.2, 6.11, 1.2, 5.9, color=C['blue_mid'], lw=2,
          label='Natural language\nquery', fontsize=7.5, labelside='right')
    # Chat Interface → API
    arrow(ax, 3.4, 5.15, 4.3, 5.15, color=C['blue_mid'], lw=2,
          label='POST /api/chatbot\n{query, history}', fontsize=7.5)
    # API ← → DB context
    arrow(ax, 5.0, 3.9, 4.2, 3.58, color=C['purple'], lw=1.8,
          label='SELECT context', fontsize=7.5)
    arrow(ax, 4.2, 3.2, 5.0, 3.58, color=C['purple'], lw=1.8, label='')
    # API → Claude
    arrow(ax, 7.5, 5.15, 8.2, 5.15, color='#d97706', lw=2,
          label='Structured prompt\n+ DB context', fontsize=7.5)
    # Claude → API (response)
    arrow(ax, 8.2, 4.75, 7.5, 4.75, color='#d97706', lw=2,
          label='AI response text', fontsize=7.5)
    # API → Chat Interface (response back)
    arrow(ax, 4.3, 4.75, 3.4, 4.75, color=C['teal'], lw=2,
          label='JSON response', fontsize=7.5)
    # Chat Interface → User (display)
    arrow(ax, 1.9, 4.4, 1.9, 4.0, color=C['teal'], lw=2, label='')
    rounded_box(ax, 1.9, 3.7, 2.0, 0.44,
                'Response displayed\nin chat panel', C['green_light'], C['green'], fontsize=7.5)
    # API → Chat Logs
    arrow(ax, 8.2, 4.2, 8.75, 2.5, color=C['purple'], lw=1.5,
          label='Log to DB', fontsize=7.5, labelside='right')

    # Example queries box
    eq_box = FancyBboxPatch((8.2, 6.5), 4.5, 1.5,
                            boxstyle="round,pad=0,rounding_size=0.1",
                            facecolor=C['gray_light'], edgecolor=C['gray_border'],
                            linewidth=1.2, zorder=2)
    ax.add_patch(eq_box)
    ax.text(10.45, 7.78, 'Example Queries', ha='center', fontsize=8.5,
            fontweight='bold', color=C['gray_dark'], zorder=3)
    examples = [
        '"What is the status of Room 3?"',
        '"Show recent fire events in the last hour"',
        '"How many network switches are in Warehouse A?"',
        '"Summarize today\'s fire activity"',
    ]
    for i, ex in enumerate(examples):
        ax.text(10.45, 7.52 - i * 0.22, ex, ha='center', fontsize=7,
                color=C['gray_mid'], zorder=3, style='italic')

    save(fig, 'fig_4_13_chatbot_architecture.png')


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  FIGURE 4.14 – Entity-Relationship Diagram                               ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def fig_4_14():
    fig, ax = plt.subplots(figsize=(16, 12))
    ax.set_xlim(0, 16); ax.set_ylim(0, 12)
    ax.axis('off')

    ax.text(8, 11.65, 'TeleStock — Entity Relationship Diagram',
            ha='center', fontsize=14, fontweight='bold', color=C['blue_dark'])
    ax.text(8, 11.35, 'PostgreSQL schema managed via Prisma ORM · 12 tables',
            ha='center', fontsize=8.5, color=C['gray_mid'])

    # ── Helper to draw an entity table ─────────────────────────────────────
    def entity(ax, x, y, title, fields, fc, ec, title_fc=None, w=2.6):
        if title_fc is None:
            title_fc = ec
        row_h = 0.28
        hdr_h = 0.38
        total_h = hdr_h + len(fields) * row_h + 0.1
        # Shadow
        shadow = FancyBboxPatch((x - w/2 + 0.05, y - total_h - 0.05), w, total_h,
                                boxstyle="round,pad=0,rounding_size=0.06",
                                facecolor='#00000015', edgecolor='none', zorder=2)
        ax.add_patch(shadow)
        # Body
        body = FancyBboxPatch((x - w/2, y - total_h), w, total_h,
                              boxstyle="round,pad=0,rounding_size=0.06",
                              facecolor=fc, edgecolor=ec, linewidth=1.8, zorder=3)
        ax.add_patch(body)
        # Header
        hdr = FancyBboxPatch((x - w/2, y - hdr_h), w, hdr_h,
                             boxstyle="round,pad=0,rounding_size=0.06",
                             facecolor=title_fc, edgecolor=ec, linewidth=1.8, zorder=4)
        ax.add_patch(hdr)
        ax.text(x, y - hdr_h/2, title, ha='center', va='center',
                fontsize=8.5, fontweight='bold', color=C['white'], zorder=5)
        # Divider
        ax.plot([x - w/2 + 0.04, x + w/2 - 0.04], [y - hdr_h, y - hdr_h],
                color=ec, linewidth=0.8, zorder=4)
        # Fields
        for i, (fname, ftype, pk, fk) in enumerate(fields):
            fy = y - hdr_h - (i + 0.55) * row_h
            prefix = 'PK ' if pk else ('FK ' if fk else '   ')
            style = 'bold' if pk else 'normal'
            color = '#c2410c' if pk else (C['blue_mid'] if fk else C['gray_dark'])
            ax.text(x - w/2 + 0.15, fy, f"{prefix}{fname}", ha='left', va='center',
                    fontsize=7, fontweight=style, color=color, zorder=5, family='monospace')
            ax.text(x + w/2 - 0.1, fy, ftype, ha='right', va='center',
                    fontsize=6.5, color=C['gray_mid'], zorder=5)
        return (x, y - total_h / 2)  # center for relationship arrows

    # ── Entities ──────────────────────────────────────────────────────────
    # (entity name, fields: [(name, type, isPK, isFK)])

    # User
    entity(ax, 2.5, 11.1, 'USER', [
        ('id',          'cuid()',   True,  False),
        ('name',        'String',  False, False),
        ('email',       'String',  False, False),
        ('password',    'String',  False, False),
        ('role',        'UserRole',False, False),
        ('avatar',      'String?', False, False),
        ('isActive',    'Boolean', False, False),
        ('warehouseId', 'String?', False, True),
        ('createdAt',   'DateTime',False, False),
    ], C['white'], C['blue_mid'], w=2.8)

    # Warehouse
    entity(ax, 7.0, 11.1, 'WAREHOUSE', [
        ('id',           'cuid()',   True,  False),
        ('name',         'String',  False, False),
        ('location',     'String',  False, False),
        ('address',      'String?', False, False),
        ('capacity',     'Int',     False, False),
        ('currentStock', 'Int',     False, False),
        ('status',       'WhStatus',False, False),
        ('managerId',    'String?', False, True),
        ('createdAt',    'DateTime',False, False),
    ], C['white'], C['teal'], w=2.8)

    # Category
    entity(ax, 11.5, 11.1, 'CATEGORY', [
        ('id',          'cuid()',  True,  False),
        ('name',        'String', False, False),
        ('description', 'String?',False, False),
        ('createdAt',   'DateTime',False, False),
    ], C['white'], C['green'], w=2.5)

    # Inventory Item
    entity(ax, 4.0, 7.1, 'INVENTORY_ITEM', [
        ('id',          'cuid()',    True,  False),
        ('name',        'String',   False, False),
        ('sku',         'String',   False, False),
        ('barcode',     'String?',  False, False),
        ('quantity',    'Int',      False, False),
        ('minStock',    'Int',      False, False),
        ('unitPrice',   'Decimal?', False, False),
        ('supplier',    'String?',  False, False),
        ('status',      'ItemStatus',False,False),
        ('categoryId',  'String',   False, True),
        ('warehouseId', 'String',   False, True),
        ('deletedAt',   'DateTime?',False, False),
    ], C['white'], C['teal'], w=2.8)

    # Stock Transfer
    entity(ax, 8.0, 7.5, 'STOCK_TRANSFER', [
        ('id',            'cuid()',     True,  False),
        ('itemId',        'String',     False, True),
        ('quantity',      'Int',        False, False),
        ('fromWarehouse', 'String',     False, True),
        ('toWarehouse',   'String',     False, True),
        ('requestedBy',   'String',     False, True),
        ('approvedBy',    'String?',    False, True),
        ('status',        'TrfStatus',  False, False),
        ('requestedAt',   'DateTime',   False, False),
        ('completedAt',   'DateTime?',  False, False),
    ], C['white'], C['orange'], w=2.8)

    # Audit
    entity(ax, 12.0, 7.5, 'AUDIT', [
        ('id',            'cuid()',    True,  False),
        ('warehouseId',   'String',   False, True),
        ('auditorId',     'String',   False, True),
        ('type',          'AuditType',False, False),
        ('status',        'AuditStat',False, False),
        ('startDate',     'DateTime', False, False),
        ('endDate',       'DateTime?',False, False),
        ('discrepancies', 'Int',      False, False),
    ], C['white'], C['purple'], w=2.8)

    # Audit Item
    entity(ax, 12.0, 4.0, 'AUDIT_ITEM', [
        ('id',          'cuid()',  True,  False),
        ('auditId',     'String', False, True),
        ('itemId',      'String', False, True),
        ('expectedQty', 'Int',    False, False),
        ('actualQty',   'Int',    False, False),
        ('discrepancy', 'Int',    False, False),
        ('notes',       'String?',False, False),
    ], C['white'], C['purple'], w=2.8)

    # Fire Events
    entity(ax, 2.5, 4.5, 'FIRE_EVENT', [
        ('id',           'cuid()',   True,  False),
        ('roomId',       'String',  False, False),
        ('smokeStatus',  'Boolean', False, False),
        ('tempStatus',   'Boolean', False, False),
        ('fireConfirmed','Boolean', False, False),
        ('extinguishing','Boolean', False, False),
        ('acknowledged', 'Boolean', False, False),
        ('acknowledgedBy','String?',False, True),
        ('detectedAt',   'DateTime',False, False),
        ('acknowledgedAt','DateTime?',False,False),
    ], C['white'], C['red'], w=2.9)

    # Chat Logs
    entity(ax, 7.0, 4.1, 'CHAT_LOG', [
        ('id',        'cuid()',  True,  False),
        ('userId',    'String', False, True),
        ('query',     'String', False, False),
        ('response',  'String', False, False),
        ('createdAt', 'DateTime',False,False),
    ], C['white'], C['gray_dark'], w=2.5)

    # Report
    entity(ax, 2.5, 1.3, 'REPORT', [
        ('id',          'cuid()',    True,  False),
        ('name',        'String',   False, False),
        ('type',        'RptType',  False, False),
        ('warehouseId', 'String?',  False, True),
        ('generatedBy', 'String',   False, True),
        ('status',      'RptStatus',False, False),
        ('format',      'String',   False, False),
        ('parameters',  'Json?',    False, False),
    ], C['white'], '#2563eb', w=2.6)

    # User Warning
    entity(ax, 7.0, 1.4, 'USER_WARNING', [
        ('id',          'cuid()',   True,  False),
        ('warehouseId', 'String',  False, True),
        ('managerId',   'String',  False, True),
        ('userId',      'String',  False, True),
        ('message',     'String',  False, False),
        ('level',       'WarnLvl', False, False),
        ('status',      'WarnStat',False, False),
    ], C['white'], C['orange'], w=2.6)

    # Warehouse Image
    entity(ax, 11.0, 1.4, 'WAREHOUSE_IMAGE', [
        ('id',          'cuid()',  True,  False),
        ('warehouseId', 'String', False, True),
        ('url',         'String', False, False),
        ('title',       'String?',False, False),
        ('description', 'String?',False, False),
    ], C['white'], C['teal'], w=2.6)

    # ── Relationship arrows ───────────────────────────────────────────────
    rels = [
        # (x1, y1, x2, y2, label, color)
        (2.5, 10.1, 7.0, 10.1,  'manages',           C['blue_mid']),
        (2.5, 10.1, 4.0,  6.75, 'assigned to',        C['blue_mid']),
        (7.0, 10.1, 4.0,  6.75, 'contains',           C['teal']),
        (7.0, 10.1, 8.0,  7.2,  'from/to',            C['teal']),
        (11.5,10.1, 4.0,  6.75, 'categorizes',        C['green']),
        (4.0,  5.7, 8.0,  6.95, 'transferred',        C['orange']),
        (7.0, 10.1, 12.0, 7.2,  'hosts audit',        C['purple']),
        (2.5, 10.1, 12.0, 7.2,  'conducts audit',     C['purple']),
        (12.0, 6.3, 12.0, 4.65, 'contains',           C['purple']),
        (2.5, 10.1, 2.5,  5.25, 'fire ack by',        C['red']),
        (2.5, 10.1, 7.0,  3.65, 'chat interaction',   C['gray_dark']),
        (7.0,  0.6, 2.5,  0.6,  'report scoped',      '#2563eb'),
        (7.0,  0.6, 7.0,  0.6,  '',                   C['orange']),
    ]
    # Draw relationship lines
    for x1, y1, x2, y2, lbl, col in rels:
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=col, lw=1.2,
                                    connectionstyle='arc3,rad=0.1'),
                    zorder=1)
        mx, my = (x1+x2)/2, (y1+y2)/2
        if lbl:
            ax.text(mx, my, lbl, ha='center', va='center', fontsize=6.5,
                    color=col, zorder=6,
                    bbox=dict(facecolor=C['white'], edgecolor='none', pad=0.8, alpha=0.85))

    # ── Enum legend ─────────────────────────────────────────────────────────
    enums = [
        'UserRole: ADMIN | WAREHOUSE_MANAGER | INVENTORY_CLERK | TECHNICIAN | AUDITOR',
        'ItemStatus: IN_STOCK | LOW_STOCK | OUT_OF_STOCK',
        'TransferStatus: PENDING | APPROVED | IN_TRANSIT | COMPLETED | REJECTED',
        'AuditType: FULL_AUDIT | SPOT_CHECK | CYCLE_COUNT | EMERGENCY_AUDIT',
        'WarehouseStatus: ACTIVE | MAINTENANCE | INACTIVE',
    ]
    ex = FancyBboxPatch((0.2, 0.05), 15.6, 0.5,
                        boxstyle="round,pad=0,rounding_size=0.05",
                        facecolor=C['gray_light'], edgecolor=C['gray_border'],
                        linewidth=1, zorder=2)
    ax.add_patch(ex)
    ax.text(8, 0.31, '  |  '.join(enums[:3]), ha='center', va='center',
            fontsize=6, color=C['gray_dark'], zorder=3)
    ax.text(8, 0.12, '  |  '.join(enums[3:]), ha='center', va='center',
            fontsize=6, color=C['gray_dark'], zorder=3)

    save(fig, 'fig_4_14_entity_relationship.png')


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  FIGURE 4.x – System Flow Chart (User Journey)                           ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def fig_flowchart():
    fig, ax = plt.subplots(figsize=(13, 16))
    ax.set_xlim(0, 13); ax.set_ylim(0, 16)
    ax.axis('off')

    ax.text(6.5, 15.65, 'TeleStock — System Flow Chart',
            ha='center', fontsize=14, fontweight='bold', color=C['blue_dark'])
    ax.text(6.5, 15.32, 'Complete user journey from login to role-based feature access',
            ha='center', fontsize=8.5, color=C['gray_mid'])

    def box(x, y, w, h, text, fc, ec, fs=8.5, fw='normal', tc=C['black']):
        rounded_box(ax, x, y, w, h, text, fc, ec, fontsize=fs, fontweight=fw, textcolor=tc)

    def diamond(x, y, w, h, text, fc, ec):
        hw, hh = w/2, h/2
        xs = [x, x+hw, x, x-hw, x]
        ys = [y+hh, y, y-hh, y, y+hh]
        ax.fill(xs, ys, facecolor=fc, edgecolor=ec, linewidth=1.8, zorder=3)
        ax.text(x, y, text, ha='center', va='center', fontsize=8,
                fontweight='bold', color=ec, zorder=4, multialignment='center')

    def oval(x, y, w, h, text, fc, ec, fs=9):
        ell = mpatches.Ellipse((x, y), w, h, facecolor=fc, edgecolor=ec,
                               linewidth=2.0, zorder=3)
        ax.add_patch(ell)
        ax.text(x, y, text, ha='center', va='center', fontsize=fs,
                fontweight='bold', color=C['white'], zorder=4)

    def ar(x1, y1, x2, y2, lbl='', col=C['gray_dark'], fs=7.5):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=col, lw=1.6,
                                    connectionstyle='arc3,rad=0.0'), zorder=5)
        if lbl:
            mx, my = (x1+x2)/2, (y1+y2)/2
            ax.text(mx+0.05, my, lbl, ha='left', va='center', fontsize=fs,
                    color=col, zorder=6,
                    bbox=dict(facecolor=C['white'], edgecolor='none', pad=0.8))

    # START
    oval(6.5, 15.0, 2.0, 0.52, 'START', C['blue_dark'], C['blue_dark'])
    ar(6.5, 14.74, 6.5, 14.35)

    # Access System
    box(6.5, 14.1, 3.2, 0.45, 'User Accesses TeleStock Platform', C['blue_light'], C['blue_mid'], fw='bold')
    ar(6.5, 13.88, 6.5, 13.48)

    # Login
    box(6.5, 13.22, 3.0, 0.45, 'Enter Email & Password', C['blue_light'], C['blue_mid'])
    ar(6.5, 13.0, 6.5, 12.58)

    # Auth check
    diamond(6.5, 12.2, 3.2, 0.65, 'Credentials\nValid?', C['orange_light'], C['orange'])
    ar(6.5, 11.88, 6.5, 11.45, lbl='Yes', col=C['green'])
    # No branch
    ar(8.1, 12.2, 10.5, 12.2, lbl='No', col=C['red'])
    box(11.5, 12.2, 1.8, 0.45, 'Show Error\nMessage', C['red_light'], C['red'], fs=8)
    ar(10.5, 12.2, 10.5, 13.22)
    ax.plot([10.5, 6.5], [13.22, 13.22], color=C['red'], lw=1.5)

    # JWT issued
    box(6.5, 11.18, 3.2, 0.45, 'JWT Token Issued\n+ User Role Retrieved', C['green_light'], C['green'])
    ar(6.5, 10.96, 6.5, 10.55)

    # Role check
    diamond(6.5, 10.18, 3.2, 0.65, 'Identify\nUser Role', C['blue_light'], C['blue_mid'])

    # 5 role branches
    roles = [
        (1.3,  8.8, 'ADMIN\nDashboard',         C['blue_mid'],  C['blue_dark']),
        (3.5,  8.8, 'MANAGER\nDashboard',        C['teal'],      C['teal']),
        (6.5,  8.8, 'CLERK\nDashboard',          C['green'],     C['green']),
        (9.5,  8.8, 'TECHNICIAN\nDashboard',     C['orange'],    C['orange']),
        (11.7, 8.8, 'AUDITOR\nDashboard',        C['purple'],    C['purple']),
    ]
    role_xs = [r[0] for r in roles]
    for rx, ry, rlbl, rfc, rec in roles:
        ax.plot([6.5, rx], [9.85, 9.85], color=C['gray_border'], lw=1.2, zorder=1)
        ar(rx, 9.85, rx, 9.08, col=rec)
        box(rx, ry, 1.8, 0.45, rlbl, C['white'], rec, fs=7.5, fw='bold', tc=rec)

    ax.plot([6.5, 6.5], [10.5, 9.85], color=C['gray_border'], lw=1.2, zorder=1)

    # Feature boxes per role (y ~ 7.8)
    features = [
        (1.3,  7.55, 'Full CRUD\nAll Entities\nUser Mgmt\nRBAC Config', C['blue_mid']),
        (3.5,  7.55, 'Warehouse Ops\nInventory Mgmt\nTransfer Approval\nWarnings', C['teal']),
        (6.5,  7.55, 'Add/Edit Items\nView Transfers\nStock Alerts\nCategories', C['green']),
        (9.5,  7.55, 'Read-Only\nInventory View\nSystem Reports\nDashboard', C['orange']),
        (11.7, 7.55, 'Conduct Audits\nAudit Reports\nInventory Review\nCompliance', C['purple']),
    ]
    for fx, fy, flbl, fec in features:
        box(fx, fy, 1.85, 1.1, flbl, C['gray_light'], fec, fs=7)
        ar(fx, 8.57, fx, 8.1, col=fec)

    # Converge to shared features
    for rx in role_xs:
        ax.plot([rx, rx], [7.0, 6.6], color=C['gray_border'], lw=1.0, zorder=1)
    ax.plot([role_xs[0], role_xs[-1]], [6.6, 6.6], color=C['gray_border'], lw=1.0, zorder=1)
    ar(6.5, 6.6, 6.5, 6.22, col=C['gray_dark'])

    # Shared features
    shared_box = FancyBboxPatch((0.5, 5.3), 12.0, 0.75,
                                boxstyle="round,pad=0,rounding_size=0.08",
                                facecolor=C['blue_pale'], edgecolor=C['blue_mid'],
                                linewidth=1.5, zorder=3)
    ax.add_patch(shared_box)
    ax.text(6.5, 5.92, 'Shared Platform Features (all roles)', ha='center', fontsize=8.5,
            fontweight='bold', color=C['blue_dark'], zorder=4)
    shared = ['Profile Management', 'AI Chatbot Interface', 'Fire Monitor Panel',
              'Notifications & Alerts', 'Audit Log View']
    for i, s in enumerate(shared):
        ax.text(1.5 + i * 2.3, 5.55, f'• {s}', ha='center', fontsize=7.5,
                color=C['gray_dark'], zorder=4)

    ar(6.5, 5.3, 6.5, 4.88, col=C['gray_dark'])

    # AI Chatbot path
    diamond(6.5, 4.5, 3.0, 0.65, 'User submits\nchatbot query?', C['orange_light'], C['orange'])
    ar(6.5, 4.18, 6.5, 3.72, lbl='Yes', col=C['green'])
    ar(9.0, 4.5, 10.5, 4.5, lbl='No', col=C['gray_mid'])
    box(11.5, 4.5, 1.8, 0.45, 'Continue\nBrowsing', C['gray_light'], C['gray_border'], fs=8)

    box(6.5, 3.45, 3.0, 0.45, 'Query → /api/chatbot\n→ DB Context → Claude AI', C['orange_light'], C['orange'])
    ar(6.5, 3.22, 6.5, 2.82)
    box(6.5, 2.55, 2.8, 0.45, 'Response Displayed in Chat\n+ Logged in chat_logs', C['green_light'], C['green'])
    ar(6.5, 2.32, 6.5, 1.92)

    # Session end
    diamond(6.5, 1.58, 2.8, 0.62, 'Continue\nSession?', C['blue_light'], C['blue_mid'])
    ar(4.1, 1.58, 2.5, 1.58, lbl='No', col=C['red'])
    oval(1.5, 1.58, 1.7, 0.48, 'END', C['blue_dark'], C['blue_dark'], fs=9)

    # Yes → back to dashboard
    ax.annotate('', xy=(6.5, 6.6), xytext=(8.9, 1.58),
                arrowprops=dict(arrowstyle='->', color=C['green'], lw=1.5,
                                connectionstyle='arc3,rad=-0.3'), zorder=5)
    ax.text(10.2, 4.05, 'Yes', fontsize=8, color=C['green'])

    save(fig, 'fig_flowchart_system.png')


# ── Run all ───────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("Generating TeleStock documentation diagrams...")
    print()
    fig_4_11()
    print("  [1/5] Software Architecture done")
    fig_4_12()
    print("  [2/5] Fire Detection Data Flow done")
    fig_4_13()
    print("  [3/5] Chatbot Architecture done")
    fig_4_14()
    print("  [4/5] ER Diagram done")
    fig_flowchart()
    print("  [5/5] System Flow Chart done")
    print()
    print("All diagrams saved to: docs/diagrams/")
