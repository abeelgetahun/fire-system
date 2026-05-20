class ApiClient {
  private baseURL: string

  constructor(baseURL = "/api") {
    this.baseURL = baseURL
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const token = localStorage.getItem("token")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Merge any incoming headers (normalize to key/value pairs)
    if (options.headers) {
      if (Array.isArray(options.headers)) {
        for (const [k, v] of options.headers) headers[k] = v as string
      } else if (options.headers instanceof Headers) {
        options.headers.forEach((v, k) => (headers[k] = v))
      } else {
        Object.assign(headers, options.headers as Record<string, string>)
      }
    }

    // Send Authorization header for all tokens, including manual tokens
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: headers as HeadersInit,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      // Auto-logout on auth failures so the app can recover consistently
      if (response.status === 401 || response.status === 403) {
        try {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        } catch {}
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }

      const errorBody = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(errorBody.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json().catch(() => ({}))
    return data as T
  }

  // Auth endpoints
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Specific API methods
  async getDashboardStats() {
    return this.get("/dashboard/stats")
  }

  async getFireDetectionStats() {
    return this.get("/fire-detection/stats")
  }

  async getWarehouses() {
    return this.get("/warehouse")
  }

  async createWarehouse(data: any) {
    return this.post("/warehouse", data)
  }

  async updateWarehouse(id: string, data: any) {
    return this.put(`/warehouse/${id}`, data)
  }

  async deleteWarehouse(id: string) {
    return this.delete(`/warehouse/${id}`)
  }

  async getInventory(params?: any) {
    const query = params ? "?" + new URLSearchParams(params).toString() : ""
    return this.get(`/inventory${query}`)
  }

  async createInventoryItem(data: any) {
    return this.post("/inventory", data)
  }

  async updateInventoryItem(id: string, data: any) {
    return this.put(`/inventory/${id}`, data)
  }

  async deleteInventoryItem(id: string) {
    return this.delete(`/inventory/${id}`)
  }

  async getTransfers(params?: any) {
    const query = params ? "?" + new URLSearchParams(params).toString() : ""
    return this.get(`/transfer${query}`)
  }

  async createTransfer(data: any) {
    return this.post("/transfer", data)
  }

  async approveTransfer(id: string) {
    return this.post(`/transfer/${id}/approve`)
  }

  async getCategories() {
    return this.get("/categories")
  }

  async createCategory(data: any) {
    return this.post("/categories", data)
  }

  async getUsers(params?: any) {
    const query = params ? "?" + new URLSearchParams(params).toString() : ""
    return this.get(`/users${query}`)
  }

  async createUser(data: any) {
    return this.post("/users", data)
  }

  async updateUser(id: string, data: any) {
    return this.put(`/users/${id}`, data)
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`)
  }

  // Warehouse images endpoints
  async getWarehouseImages(params?: any) {
    const query = params ? "?" + new URLSearchParams(params).toString() : ""
    return this.get(`/warehouse-images${query}`)
  }

  async createWarehouseImage(data: any) {
    return this.post(`/warehouse-images`, data)
  }

  async updateWarehouseImage(id: string, data: any) {
    return this.put(`/warehouse-images`, { id, ...data })
  }

  async deleteWarehouseImage(id: string) {
    return this.delete(`/warehouse-images?id=${encodeURIComponent(id)}`)
  }

  // Profile endpoints
  async getProfile() {
    return this.get("/profile")
  }

  async updateProfile(data: any) {
    return this.put("/profile", data)
  }
}

export const apiClient = new ApiClient()
