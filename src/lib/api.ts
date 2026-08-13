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

export interface SharedFile {
    id: string
    name: string
    contentType: string
    size: number
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
    const result = await request<{ type: "url"; url: SharedUrl }>(`${API_BASE_PATH}/latest/u`, { token })
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

export const listFiles = async (
    token: string,
    cursor?: string
): Promise<{ files: SharedFile[]; nextCursor: string | null }> => {
    const query = new URLSearchParams({ limit: "50" })
    if (cursor) query.set("cursor", cursor)
    return request(`${API_BASE_PATH}/files?${query.toString()}`, { token })
}

export const uploadFile = (file: File, token: string, onProgress: (progress: number) => void): Promise<SharedFile> =>
    new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open("POST", `${API_BASE_PATH}/files`)
        request.setRequestHeader("Authorization", `Bearer ${token}`)
        request.setRequestHeader("Accept", "application/json")
        request.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
        })
        request.addEventListener("load", () => {
            let body: { file?: SharedFile; error?: { code?: string; message?: string } } = {}
            try {
                body = JSON.parse(request.responseText) as typeof body
            } catch {
                // A proxy failure may return a non-JSON response.
            }
            if (request.status >= 200 && request.status < 300 && body.file) {
                resolve(body.file)
                return
            }
            reject(
                new ApiError(
                    request.status || 0,
                    body.error?.code ?? "REQUEST_FAILED",
                    body.error?.message ?? "ファイルをアップロードできませんでした"
                )
            )
        })
        request.addEventListener("error", () => reject(new ApiError(0, "NETWORK_ERROR", "APIへ接続できませんでした")))
        const body = new FormData()
        body.append("file", file)
        request.send(body)
    })

export const renameFile = async (token: string, fileId: string, name: string): Promise<SharedFile> => {
    const result = await request<{ file: SharedFile }>(`${API_BASE_PATH}/files/${fileId}`, {
        method: "PATCH",
        token,
        body: { name }
    })
    return result.file
}

export const deleteFile = async (token: string, fileId: string): Promise<void> => {
    await request<void>(`${API_BASE_PATH}/files/${fileId}`, { method: "DELETE", token })
}

export const downloadFile = async (token: string, file: SharedFile): Promise<void> => {
    const response = await fetch(`${API_BASE_PATH}/files/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
    })
    if (!response.ok) {
        let body: ErrorBody = {}
        try {
            body = (await response.json()) as ErrorBody
        } catch {
            // A proxy failure may return a non-JSON response.
        }
        throw new ApiError(
            response.status,
            body.error?.code ?? "REQUEST_FAILED",
            body.error?.message ?? "ファイルをダウンロードできませんでした"
        )
    }
    const objectUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = file.name
    link.click()
    URL.revokeObjectURL(objectUrl)
}
