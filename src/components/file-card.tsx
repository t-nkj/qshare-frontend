import { type SubmitEvent, useState } from "react"
import type { SharedFile } from "@/lib/api"
import { FilePreview } from "./file-preview"
import { PencilIcon } from "./icons"
import { Button, glassPanel, IconButton, inputStyles } from "./ui"

interface FileCardProps {
    file: SharedFile
    token: string | null
    downloading: boolean
    deleting: boolean
    saving: boolean
    onDownload: () => void
    onRename: (name: string) => Promise<boolean>
    onDelete: () => void
}

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
        new Date(value)
    )

const formatSize = (value: number): string => {
    if (value < 1024) return `${value} B`
    if (value < 1024 * 1024) return `${Math.round(value / 1024)} KiB`
    return `${(value / (1024 * 1024)).toFixed(1)} MiB`
}

export const FileCard = ({
    file,
    token,
    downloading,
    deleting,
    saving,
    onDownload,
    onRename,
    onDelete
}: FileCardProps) => {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(file.name)

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (await onRename(name)) setEditing(false)
    }

    if (editing)
        return (
            <li className={glassPanel({ className: "p-5" })}>
                <form onSubmit={handleSubmit}>
                    <label htmlFor={`file-${file.id}`} className="mb-2 block text-sm font-semibold text-slate-700">
                        ファイル名
                    </label>
                    <input
                        id={`file-${file.id}`}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={255}
                        className={inputStyles()}
                        disabled={saving}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button tone="secondary" size="small" onClick={() => setEditing(false)} disabled={saving}>
                            キャンセル
                        </Button>
                        <Button type="submit" size="small" disabled={saving || name.length === 0}>
                            {saving ? "保存中…" : "保存"}
                        </Button>
                    </div>
                </form>
            </li>
        )

    return (
        <li
            className={glassPanel({ className: "group relative p-5 transition-colors duration-300 hover:bg-white/75" })}
        >
            <button
                type="button"
                aria-label={`${file.name}をダウンロード`}
                className="absolute inset-0 cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
                onClick={onDownload}
            />
            <div className="pointer-events-none relative flex items-start gap-3">
                <FilePreview file={file} token={token} />
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold text-slate-950">{file.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {file.contentType} ・ {formatSize(file.size)}
                    </p>
                </div>
                <div className="ml-auto flex shrink-0 gap-2">
                    <IconButton
                        label="ファイル名を編集"
                        onClick={() => {
                            setEditing(true)
                        }}
                        className="pointer-events-auto relative z-10"
                    >
                        <PencilIcon className="size-5" />
                    </IconButton>
                    <IconButton
                        label="ファイルを削除"
                        tone="danger"
                        disabled={deleting}
                        onClick={() => {
                            onDelete()
                        }}
                        className="pointer-events-auto relative z-10"
                    >
                        ×
                    </IconButton>
                </div>
            </div>
            <div className="pointer-events-none relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/70 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{file.sourceDeviceName}</span>
                <span>{formatDate(file.createdAt)}</span>
                {file.updatedAt !== file.createdAt ? <span>編集済み</span> : null}
                <span>期限 {formatDate(file.expiresAt)}</span>
                {downloading ? <span className="ml-auto text-sky-700">ダウンロード中…</span> : null}
            </div>
        </li>
    )
}
