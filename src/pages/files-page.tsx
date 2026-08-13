import { useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { FileList } from "@/components/file-list"
import { FileUpload } from "@/components/file-upload"
import { FileUploadList, type UploadingFile } from "@/components/file-upload-list"
import { IconButton } from "@/components/ui"
import { ApiError, deleteFile, downloadFile, listFiles, renameFile, type SharedFile, uploadFile } from "@/lib/api"

const MAX_FILE_SIZE = 100 * 1024 * 1024

const validateFile = (file: File): string | null => {
    if (!file.name || [...file.name].length > 255 || /[\\/\p{C}]/u.test(file.name))
        return "ファイル名は1〜255文字で、/、\\、制御文字は使えません"
    if (file.size > MAX_FILE_SIZE) return "ファイルは100 MiB以下にしてください"
    return null
}

const FileHistory = () => {
    const { token, invalidateToken } = useAuth()
    const [files, setFiles] = useState<SharedFile[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [uploads, setUploads] = useState<UploadingFile[]>([])
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleApiError = useCallback(
        (caught: unknown, fallback: string) => {
            if (caught instanceof ApiError && caught.status === 401) {
                invalidateToken()
                return
            }
            setError(caught instanceof ApiError ? caught.message : fallback)
        },
        [invalidateToken]
    )

    const loadInitial = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError(null)
        try {
            const result = await listFiles(token)
            setFiles(result.files)
            setNextCursor(result.nextCursor)
        } catch (caught) {
            handleApiError(caught, "ファイル一覧を読み込めませんでした")
        } finally {
            setLoading(false)
        }
    }, [handleApiError, token])

    useEffect(() => {
        void loadInitial()
    }, [loadInitial])

    const handleFiles = useCallback(
        (input: File[]) => {
            if (!token) return
            input.forEach((file) => {
                const id = crypto.randomUUID()
                const validationError = validateFile(file)
                setUploads((current) => [
                    ...current,
                    { id, name: file.name || "名前のないファイル", progress: 0, error: validationError }
                ])
                if (validationError) return
                void uploadFile(file, token, (progress) =>
                    setUploads((current) => current.map((item) => (item.id === id ? { ...item, progress } : item)))
                )
                    .then((uploaded) => {
                        setFiles((current) => [uploaded, ...current.filter((item) => item.id !== uploaded.id)])
                        setUploads((current) => current.filter((item) => item.id !== id))
                    })
                    .catch((caught: unknown) => {
                        const message =
                            caught instanceof ApiError ? caught.message : "ファイルをアップロードできませんでした"
                        setUploads((current) =>
                            current.map((item) => (item.id === id ? { ...item, error: message } : item))
                        )
                    })
            })
        },
        [token]
    )

    const handleLoadMore = async () => {
        if (!token || !nextCursor || loadingMore) return
        setLoadingMore(true)
        try {
            const result = await listFiles(token, nextCursor)
            setFiles((current) => [...current, ...result.files])
            setNextCursor(result.nextCursor)
        } catch (caught) {
            handleApiError(caught, "続きのファイルを読み込めませんでした")
        } finally {
            setLoadingMore(false)
        }
    }

    const handleDownload = async (file: SharedFile) => {
        if (!token || downloadingId) return
        setDownloadingId(file.id)
        try {
            await downloadFile(token, file)
        } catch (caught) {
            handleApiError(caught, "ファイルをダウンロードできませんでした")
        } finally {
            setDownloadingId(null)
        }
    }

    const handleRename = async (file: SharedFile, name: string): Promise<boolean> => {
        if (!token || savingId) return false
        const validationError = validateFile(new File([], name))
        if (validationError) {
            setError(validationError)
            return false
        }
        setSavingId(file.id)
        try {
            const updated = await renameFile(token, file.id, name)
            setFiles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            return true
        } catch (caught) {
            handleApiError(caught, "ファイル名を変更できませんでした")
            return false
        } finally {
            setSavingId(null)
        }
    }

    const handleDelete = async (file: SharedFile) => {
        if (!token || deletingId) return
        setDeletingId(file.id)
        try {
            await deleteFile(token, file.id)
            setFiles((current) => current.filter((item) => item.id !== file.id))
        } catch (caught) {
            handleApiError(caught, "ファイルを削除できませんでした")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <AppShell>
            <section className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
                <header className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-sky-600">QShare</p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">ファイル</h1>
                    </div>
                    <IconButton label="ファイル一覧を再読み込み" onClick={() => void loadInitial()} disabled={loading}>
                        ↻
                    </IconButton>
                </header>
                <FileUpload onFiles={handleFiles} />
                <FileUploadList uploads={uploads} />
                {error ? (
                    <div
                        className="mb-5 rounded-2xl border border-rose-100/80 bg-rose-50/70 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-xl"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}
                <FileList
                    files={files}
                    loading={loading}
                    downloadingId={downloadingId}
                    deletingId={deletingId}
                    savingId={savingId}
                    nextCursor={nextCursor}
                    loadingMore={loadingMore}
                    onDownload={(file) => void handleDownload(file)}
                    onRename={handleRename}
                    onDelete={(file) => void handleDelete(file)}
                    onLoadMore={() => void handleLoadMore()}
                />
            </section>
        </AppShell>
    )
}

const FilesPage = () => (
    <AuthGate>
        <FileHistory />
    </AuthGate>
)

export default FilesPage
