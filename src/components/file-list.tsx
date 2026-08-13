import type { SharedFile } from "@/lib/api"
import { FileCard } from "./file-card"
import { Button } from "./ui"

interface FileListProps {
    files: SharedFile[]
    loading: boolean
    downloadingId: string | null
    deletingId: string | null
    savingId: string | null
    nextCursor: string | null
    loadingMore: boolean
    onDownload: (file: SharedFile) => void
    onRename: (file: SharedFile, name: string) => Promise<boolean>
    onDelete: (file: SharedFile) => void
    onLoadMore: () => void
}

export const FileList = ({
    files,
    loading,
    downloadingId,
    deletingId,
    savingId,
    nextCursor,
    loadingMore,
    onDownload,
    onRename,
    onDelete,
    onLoadMore
}: FileListProps) => {
    if (loading)
        return (
            <output className="block space-y-3" aria-label="ファイルを読み込み中">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="h-32 animate-pulse rounded-3xl border border-white/70 bg-white/50 shadow-xl shadow-slate-950/5"
                    />
                ))}
            </output>
        )
    if (files.length === 0)
        return (
            <div className="rounded-3xl border border-dashed border-white/80 bg-white/45 px-6 py-14 text-center shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
                <p className="text-lg font-semibold text-slate-900">まだファイルがありません</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    上のボタンかドロップで、最初のファイルを共有しましょう。
                </p>
            </div>
        )
    return (
        <>
            <ol className="space-y-3">
                {files.map((file) => (
                    <FileCard
                        key={file.id}
                        file={file}
                        downloading={downloadingId === file.id}
                        deleting={deletingId === file.id}
                        saving={savingId === file.id}
                        onDownload={() => onDownload(file)}
                        onRename={(name) => onRename(file, name)}
                        onDelete={() => onDelete(file)}
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
