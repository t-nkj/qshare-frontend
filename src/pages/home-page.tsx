import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { Button, IconButton } from "@/components/ui"
import { UrlComposer } from "@/components/url-composer"
import { UrlHistoryList } from "@/components/url-history-list"
import { ApiError, createUrl, deleteUrl, listUrls, type SharedUrl } from "@/lib/api"

const UrlHistory = () => {
    const { token, invalidateToken } = useAuth()
    const [urls, setUrls] = useState<SharedUrl[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [draft, setDraft] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [sending, setSending] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [composerError, setComposerError] = useState<string | null>(null)
    const [latestLinkCopied, setLatestLinkCopied] = useState(false)

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
            const result = await listUrls(token)
            setUrls(result.urls)
            setNextCursor(result.nextCursor)
        } catch (caught) {
            handleApiError(caught, "URL履歴を読み込めませんでした")
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
        const value = draft.trim()
        try {
            const parsed = new URL(value)
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("invalid protocol")
        } catch {
            setComposerError("http:// または https:// から始まるURLを入力してください")
            return
        }
        setSending(true)
        setComposerError(null)
        try {
            const sharedUrl = await createUrl(token, value)
            setUrls((current) => [sharedUrl, ...current.filter((item) => item.id !== sharedUrl.id)])
            setDraft("")
            window.scrollTo({ top: 0, behavior: "smooth" })
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 401) invalidateToken()
            else setComposerError(caught instanceof ApiError ? caught.message : "URLを共有できませんでした")
        } finally {
            setSending(false)
        }
    }

    const handleLoadMore = async () => {
        if (!token || !nextCursor || loadingMore) return
        setLoadingMore(true)
        setError(null)
        try {
            const result = await listUrls(token, nextCursor)
            setUrls((current) => [...current, ...result.urls])
            setNextCursor(result.nextCursor)
        } catch (caught) {
            handleApiError(caught, "続きの履歴を読み込めませんでした")
        } finally {
            setLoadingMore(false)
        }
    }

    const handleDelete = async (item: SharedUrl) => {
        if (!token || deletingId) return
        setDeletingId(item.id)
        setError(null)
        try {
            await deleteUrl(token, item.id)
            setUrls((current) => current.filter((url) => url.id !== item.id))
        } catch (caught) {
            handleApiError(caught, "URLを削除できませんでした")
        } finally {
            setDeletingId(null)
        }
    }

    const copyLatestLink = async () => {
        try {
            await navigator.clipboard.writeText(new URL("/latest/", window.location.origin).toString())
            setLatestLinkCopied(true)
            window.setTimeout(() => setLatestLinkCopied(false), 2500)
        } catch {
            setError("最新URLページのリンクをコピーできませんでした")
        }
    }

    return (
        <AppShell>
            <section className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
                <header className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-sky-600">QShare</p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">共有URL</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button tone="secondary" size="small" onClick={() => void copyLatestLink()}>
                            {latestLinkCopied ? "コピーしました" : "最新URL用リンクをコピー"}
                        </Button>
                        <IconButton label="履歴を再読み込み" onClick={() => void loadInitial()} disabled={loading}>
                            ↻
                        </IconButton>
                    </div>
                </header>
                <UrlComposer
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
                <UrlHistoryList
                    urls={urls}
                    loading={loading}
                    deletingId={deletingId}
                    nextCursor={nextCursor}
                    loadingMore={loadingMore}
                    onDelete={(item) => void handleDelete(item)}
                    onLoadMore={() => void handleLoadMore()}
                />
            </section>
        </AppShell>
    )
}

const HomePage = () => (
    <AuthGate>
        <UrlHistory />
    </AuthGate>
)

export default HomePage
