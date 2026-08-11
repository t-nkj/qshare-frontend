"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { Button, IconButton, inputStyles } from "@/components/ui"
import { ApiError, createUrl, deleteUrl, listUrls, type SharedUrl } from "@/lib/api"

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("ja-JP", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value))
}

function displayHost(value: string): string {
    try {
        return new URL(value).hostname
    } catch {
        return value
    }
}

function UrlHistory() {
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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
            if (caught instanceof ApiError && caught.status === 401) {
                invalidateToken()
            } else {
                setComposerError(caught instanceof ApiError ? caught.message : "URLを共有できませんでした")
            }
        } finally {
            setSending(false)
        }
    }

    async function handleLoadMore() {
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

    async function handleDelete(item: SharedUrl) {
        if (!token || deletingId || !window.confirm("このURLを履歴から削除しますか？")) return
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

    async function copyLatestLink() {
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
                        <p className="mb-1 text-sm font-semibold text-blue-600">QShare</p>
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

                <form
                    onSubmit={handleSubmit}
                    className="sticky top-3 z-20 mb-7 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-lg shadow-slate-200/60 backdrop-blur"
                >
                    <div className="flex items-center gap-2">
                        <label htmlFor="shared-url" className="sr-only">
                            共有するURL
                        </label>
                        <input
                            id="shared-url"
                            type="url"
                            inputMode="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="URLを貼り付けて共有…"
                            value={draft}
                            onChange={(event) => {
                                setDraft(event.target.value)
                                setComposerError(null)
                            }}
                            className={inputStyles({ kind: "composer" })}
                            disabled={sending}
                        />
                        <Button type="submit" size="composer" disabled={sending || draft.trim().length === 0}>
                            {sending ? "送信中" : "送信"}
                        </Button>
                    </div>
                    {composerError ? (
                        <p className="px-3 pb-2 pt-1 text-sm font-medium text-rose-600" role="alert">
                            {composerError}
                        </p>
                    ) : null}
                </form>

                {error ? (
                    <div
                        className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <output className="block space-y-3" aria-label="URL履歴を読み込み中">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="h-28 animate-pulse rounded-3xl bg-white shadow-sm" />
                        ))}
                    </output>
                ) : urls.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                        <p className="text-lg font-semibold text-slate-900">まだURLがありません</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            上の入力欄から、最初のURLを共有してみましょう。
                        </p>
                    </div>
                ) : (
                    <ol className="space-y-3">
                        {urls.map((item, index) => (
                            <li
                                key={item.id}
                                className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                            >
                                <div className="flex gap-3">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="min-w-0 flex-1 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            {index === 0 ? (
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                    最新
                                                </span>
                                            ) : null}
                                            <span className="truncate text-xs font-semibold text-slate-500">
                                                {displayHost(item.url)}
                                            </span>
                                        </div>
                                        <p className="break-all text-[15px] font-medium leading-6 text-slate-900 group-hover:text-blue-700">
                                            {item.url}
                                        </p>
                                    </a>
                                    <IconButton
                                        label="URLを削除"
                                        tone="danger"
                                        disabled={deletingId === item.id}
                                        onClick={() => void handleDelete(item)}
                                    >
                                        ×
                                    </IconButton>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                    <span className="font-semibold text-slate-700">{item.sourceDeviceName}</span>
                                    <span>{formatDate(item.createdAt)}</span>
                                    <span>期限 {formatDate(item.expiresAt)}</span>
                                    <span className="ml-auto text-blue-600">開く ↗</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}

                {nextCursor ? (
                    <div className="mt-6 flex justify-center">
                        <Button tone="secondary" onClick={() => void handleLoadMore()} disabled={loadingMore}>
                            {loadingMore ? "読み込み中…" : "さらに読み込む"}
                        </Button>
                    </div>
                ) : null}
            </section>
        </AppShell>
    )
}

export default function Home() {
    return (
        <AuthGate>
            <UrlHistory />
        </AuthGate>
    )
}
