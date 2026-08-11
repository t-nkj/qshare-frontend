export interface Device {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    lastUsedAt: string | null
}

export interface SharedUrl {
    id: string
    url: string
    sourceDeviceId: string | null
    sourceDeviceName: string
    createdAt: string
    expiresAt: string
}

interface ErrorBody {
    error?: {
        code?: string
        message?: string
    }
}

export class ApiError extends Error {
    readonly status: number
    readonly code: string

    constructor(status: number, code: string, message: string) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.code = code
    }
}

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    token?: string
    body?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers({ Accept: "application/json" })
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`)
    if (options.body) headers.set("Content-Type", "application/json")

    const response = await fetch(path, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: "no-store"
    })

    if (!response.ok) {
        let body: ErrorBody = {}
        try {
            body = (await response.json()) as ErrorBody
        } catch {
            // The response may not contain JSON, for example when a proxy fails.
        }
        throw new ApiError(
            response.status,
            body.error?.code ?? "REQUEST_FAILED",
            body.error?.message ?? "リクエストに失敗しました"
        )
    }

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
}

export async function registerDevice(name: string): Promise<{ device: Device; token: string }> {
    return request("/v1/devices", { method: "POST", body: { name } })
}

export async function listDevices(token: string): Promise<Device[]> {
    const result = await request<{ devices: Device[] }>("/v1/devices", { token })
    return result.devices
}

export async function renameDevice(token: string, deviceId: string, name: string): Promise<Device> {
    const result = await request<{ device: Device }>(`/v1/devices/${deviceId}`, {
        method: "PATCH",
        token,
        body: { name }
    })
    return result.device
}

export async function deleteDevice(token: string, deviceId: string): Promise<void> {
    await request<void>(`/v1/devices/${deviceId}`, { method: "DELETE", token })
}

export async function createUrl(token: string, url: string): Promise<SharedUrl> {
    const result = await request<{ url: SharedUrl }>("/v1/urls", {
        method: "POST",
        token,
        body: { url }
    })
    return result.url
}

export async function listUrls(
    token: string,
    cursor?: string
): Promise<{ urls: SharedUrl[]; nextCursor: string | null }> {
    const query = new URLSearchParams({ limit: "50" })
    if (cursor) query.set("cursor", cursor)
    return request(`/v1/urls?${query.toString()}`, { token })
}

export async function deleteUrl(token: string, urlId: string): Promise<void> {
    await request<void>(`/v1/urls/${urlId}`, { method: "DELETE", token })
}
