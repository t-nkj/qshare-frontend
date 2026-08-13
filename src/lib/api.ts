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

export interface SharedMemo {
    id: string
    content: string
    sourceDeviceId: string | null
    sourceDeviceName: string
    createdAt: string
    updatedAt: string
    expiresAt: string
}

const API_BASE_PATH = "/api/v1"

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
    body?: Record<string, string | boolean>
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
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

export const registerDevice = (name: string): Promise<{ device: Device; token: string }> =>
    request(`${API_BASE_PATH}/devices`, { method: "POST", body: { name } })

export const listDevices = async (token: string): Promise<Device[]> => {
    const result = await request<{ devices: Device[] }>(`${API_BASE_PATH}/devices`, { token })
    return result.devices
}

export const renameDevice = async (token: string, deviceId: string, name: string): Promise<Device> => {
    const result = await request<{ device: Device }>(`${API_BASE_PATH}/devices/${deviceId}`, {
        method: "PATCH",
        token,
        body: { name }
    })
    return result.device
}

export const deleteDevice = async (token: string, deviceId: string): Promise<void> => {
    await request<void>(`${API_BASE_PATH}/devices/${deviceId}`, { method: "DELETE", token })
}

export const createUrl = async (token: string, url: string): Promise<SharedUrl> => {
    const result = await request<{ url: SharedUrl }>(`${API_BASE_PATH}/urls`, {
        method: "POST",
        token,
        body: { url }
    })
    return result.url
}

export const getLatestUrl = async (token: string): Promise<SharedUrl> => {
    const result = await request<{ url: SharedUrl }>(`${API_BASE_PATH}/urls/latest`, { token })
    return result.url
}

export const listUrls = async (
    token: string,
    cursor?: string
): Promise<{ urls: SharedUrl[]; nextCursor: string | null }> => {
    const query = new URLSearchParams({ limit: "50" })
    if (cursor) query.set("cursor", cursor)
    return request(`${API_BASE_PATH}/urls?${query.toString()}`, { token })
}

export const deleteUrl = async (token: string, urlId: string): Promise<void> => {
    await request<void>(`${API_BASE_PATH}/urls/${urlId}`, { method: "DELETE", token })
}

export const createMemo = async (token: string, content: string): Promise<SharedMemo> => {
    const result = await request<{ created: Array<{ type: "memo"; memo: SharedMemo }> }>(`${API_BASE_PATH}/memos`, {
        method: "POST",
        token,
        body: { content, autoDetectUrls: false }
    })
    const memo = result.created.find((item) => item.type === "memo")?.memo
    if (!memo) throw new ApiError(500, "MEMO_NOT_CREATED", "メモを作成できませんでした")
    return memo
}

export const listMemos = async (
    token: string,
    cursor?: string
): Promise<{ memos: SharedMemo[]; nextCursor: string | null }> => {
    const query = new URLSearchParams({ limit: "50" })
    if (cursor) query.set("cursor", cursor)
    return request(`${API_BASE_PATH}/memos?${query.toString()}`, { token })
}

export const updateMemo = async (token: string, memoId: string, content: string): Promise<SharedMemo> => {
    const result = await request<{ memo: SharedMemo }>(`${API_BASE_PATH}/memos/${memoId}`, {
        method: "PATCH",
        token,
        body: { content }
    })
    return result.memo
}

export const deleteMemo = async (token: string, memoId: string): Promise<void> => {
    await request<void>(`${API_BASE_PATH}/memos/${memoId}`, { method: "DELETE", token })
}
