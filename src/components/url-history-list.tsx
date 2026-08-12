import type { SharedUrl } from "@/lib/api"
import { Button, IconButton } from "./ui"

interface UrlHistoryListProps {
    urls: SharedUrl[]
    loading: boolean
    deletingId: string | null
    nextCursor: string | null
    loadingMore: boolean
    onDelete: (item: SharedUrl) => void
    onLoadMore: () => void
}

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
        new Date(value)
    )

const displayHost = (value: string): string => {
    try {
        return new URL(value).hostname
    } catch {
        return value
    }
}

export const UrlHistoryList = ({
    urls,
    loading,
    deletingId,
    nextCursor,
    loadingMore,
    onDelete,
    onLoadMore
}: UrlHistoryListProps) => {
    if (loading)
        return (
            <output className="block space-y-3" aria-label="URL履歴を読み込み中">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="h-28 animate-pulse rounded-3xl border border-white/70 bg-white/50 shadow-xl shadow-slate-950/5"
                    />
                ))}
            </output>
        )
    if (urls.length === 0)
        return (
            <div className="rounded-3xl border border-dashed border-white/80 bg-white/45 px-6 py-14 text-center shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
                <p className="text-lg font-semibold text-slate-900">まだURLがありません</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">上の入力欄から、最初のURLを共有してみましょう。</p>
            </div>
        )

    return (
        <>
            <ol className="space-y-3">
                {urls.map((item, index) => (
                    <li
                        key={item.id}
                        className="group rounded-3xl border border-white/75 bg-white/55 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-2xl hover:shadow-sky-900/10 sm:p-5"
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
                                        <span className="rounded-full border border-sky-100/80 bg-sky-100/70 px-2.5 py-1 text-xs font-bold text-sky-700">
                                            最新
                                        </span>
                                    ) : null}
                                    <span className="truncate text-xs font-semibold text-slate-500">
                                        {displayHost(item.url)}
                                    </span>
                                </div>
                                <p className="break-all text-base font-medium leading-6 text-slate-900 group-hover:text-sky-700">
                                    {item.url}
                                </p>
                            </a>
                            <IconButton
                                label="URLを削除"
                                tone="danger"
                                disabled={deletingId === item.id}
                                onClick={() => onDelete(item)}
                            >
                                ×
                            </IconButton>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/70 pt-3 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{item.sourceDeviceName}</span>
                            <span>{formatDate(item.createdAt)}</span>
                            <span>期限 {formatDate(item.expiresAt)}</span>
                            <span className="ml-auto text-sky-600">開く ↗</span>
                        </div>
                    </li>
                ))}
            </ol>
            {nextCursor ? (
                <div className="mt-6 flex justify-center">
                    <Button tone="secondary" onClick={onLoadMore} disabled={loadingMore}>
                        {loadingMore ? "読み込み中…" : "さらに読み込む"}
                    </Button>
                </div>
            ) : null}
        </>
    )
}
