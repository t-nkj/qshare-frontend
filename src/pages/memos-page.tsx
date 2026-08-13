import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { MemoComposer } from "@/components/memo-composer"
import { MemoList } from "@/components/memo-list"
import { IconButton } from "@/components/ui"
import { ApiError, createMemo, deleteMemo, listMemos, type SharedMemo, updateMemo } from "@/lib/api"

const MemoHistory = () => {
    const { token, invalidateToken } = useAuth()
    const [memos, setMemos] = useState<SharedMemo[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [draft, setDraft] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [sending, setSending] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [composerError, setComposerError] = useState<string | null>(null)

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
            const result = await listMemos(token)
            setMemos(result.memos)
            setNextCursor(result.nextCursor)
        } catch (caught) {
            handleApiError(caught, "メモ一覧を読み込めませんでした")
        } finally {
            setLoading(false)
        }
    }, [handleApiError, token])

    useEffect(() => {
        void loadInitial()
    }, [loadInitial])

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!token || sending) return
        const content = draft.trim()
        if (!content || [...content].length > 10000) {
            setComposerError("メモは1〜10,000文字で入力してください")
            return
        }
        setSending(true)
        setComposerError(null)
        try {
            const memo = await createMemo(token, content)
            setMemos((current) => [memo, ...current.filter((item) => item.id !== memo.id)])
            setDraft("")
            window.scrollTo({ top: 0, behavior: "smooth" })
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 401) invalidateToken()
            else setComposerError(caught instanceof ApiError ? caught.message : "メモを共有できませんでした")
        } finally {
            setSending(false)
        }
    }

    const handleLoadMore = async () => {
        if (!token || !nextCursor || loadingMore) return
        setLoadingMore(true)
        setError(null)
        try {
            const result = await listMemos(token, nextCursor)
            setMemos((current) => [...current, ...result.memos])
            setNextCursor(result.nextCursor)
        } catch (caught) {
            handleApiError(caught, "続きのメモを読み込めませんでした")
        } finally {
            setLoadingMore(false)
        }
    }

    const handleCopy = async (content: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(content)
            return true
        } catch {
            setError("メモをコピーできませんでした")
            return false
        }
    }

    const handleUpdate = async (memo: SharedMemo, content: string): Promise<boolean> => {
        if (!token || updatingId) return false
        const trimmedContent = content.trim()
        if (!trimmedContent || [...trimmedContent].length > 10000) {
            setError("メモは1〜10,000文字で入力してください")
            return false
        }
        setUpdatingId(memo.id)
        setError(null)
        try {
            const updated = await updateMemo(token, memo.id, trimmedContent)
            setMemos((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            return true
        } catch (caught) {
            handleApiError(caught, "メモを編集できませんでした")
            return false
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDelete = async (memo: SharedMemo) => {
        if (!token || deletingId) return
        setDeletingId(memo.id)
        setError(null)
        try {
            await deleteMemo(token, memo.id)
            setMemos((current) => current.filter((item) => item.id !== memo.id))
        } catch (caught) {
            handleApiError(caught, "メモを削除できませんでした")
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
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">メモ</h1>
                    </div>
                    <IconButton label="メモ一覧を再読み込み" onClick={() => void loadInitial()} disabled={loading}>
                        ↻
                    </IconButton>
                </header>
                <MemoComposer
                    draft={draft}
                    error={composerError}
                    sending={sending}
                    onDraftChange={(value) => {
                        setDraft(value)
                        setComposerError(null)
                    }}
                    onSubmit={(event) => void handleSubmit(event)}
                />
                {error ? (
                    <div
                        className="mb-5 rounded-2xl border border-rose-100/80 bg-rose-50/70 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-xl"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}
                <MemoList
                    memos={memos}
                    loading={loading}
                    deletingId={deletingId}
                    updatingId={updatingId}
                    nextCursor={nextCursor}
                    loadingMore={loadingMore}
                    onCopy={handleCopy}
                    onUpdate={handleUpdate}
                    onDelete={(memo) => void handleDelete(memo)}
                    onLoadMore={() => void handleLoadMore()}
                />
            </section>
        </AppShell>
    )
}

const MemosPage = () => (
    <AuthGate>
        <MemoHistory />
    </AuthGate>
)

export default MemosPage
