import type { SharedMemo } from "@/lib/api"
import { MemoCard } from "./memo-card"
import { Button } from "./ui"

interface MemoListProps {
    memos: SharedMemo[]
    loading: boolean
    deletingId: string | null
    updatingId: string | null
    nextCursor: string | null
    loadingMore: boolean
    onCopy: (content: string) => Promise<boolean>
    onUpdate: (memo: SharedMemo, content: string) => Promise<boolean>
    onDelete: (memo: SharedMemo) => void
    onLoadMore: () => void
}

export const MemoList = ({
    memos,
    loading,
    deletingId,
    updatingId,
    nextCursor,
    loadingMore,
    onCopy,
    onUpdate,
    onDelete,
    onLoadMore
}: MemoListProps) => {
    if (loading)
        return (
            <output className="block space-y-3" aria-label="メモを読み込み中">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="h-36 animate-pulse rounded-3xl border border-white/70 bg-white/50 shadow-xl shadow-slate-950/5"
                    />
                ))}
            </output>
        )
    if (memos.length === 0)
        return (
            <div className="rounded-3xl border border-dashed border-white/80 bg-white/45 px-6 py-14 text-center shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
                <p className="text-lg font-semibold text-slate-900">まだメモがありません</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    上の入力欄から、最初のメモを共有してみましょう。
                </p>
            </div>
        )

    const latestMemoId = memos.reduce((latest, memo) =>
        new Date(memo.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? memo : latest
    ).id

    return (
        <>
            <ol className="space-y-3">
                {memos.map((memo) => (
                    <MemoCard
                        key={memo.id}
                        memo={memo}
                        latest={memo.id === latestMemoId}
                        deleting={deletingId === memo.id}
                        updating={updatingId === memo.id}
                        onCopy={onCopy}
                        onUpdate={(content) => onUpdate(memo, content)}
                        onDelete={() => onDelete(memo)}
                    />
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
