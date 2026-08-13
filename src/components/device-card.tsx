import type { SubmitEvent } from "react"
import type { Device } from "@/lib/api"
import { PencilIcon } from "./icons"
import { Button, glassPanel, IconButton, inputStyles } from "./ui"

interface DeviceCardProps {
    device: Device
    currentDeviceId: string | null
    editing: boolean
    editingName: string
    saving: boolean
    deleting: boolean
    tokenCopied: boolean
    onEditingNameChange: (name: string) => void
    onStartEditing: () => void
    onCancelEditing: () => void
    onRename: (event: SubmitEvent<HTMLFormElement>) => void
    onDelete: () => void
    onCopyToken: () => void
}

const formatDate = (value: string | null): string => {
    if (!value) return "まだ使用されていません"
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value))
}

export const DeviceCard = ({
    device,
    currentDeviceId,
    editing,
    editingName,
    saving,
    deleting,
    tokenCopied,
    onEditingNameChange,
    onStartEditing,
    onCancelEditing,
    onRename,
    onDelete,
    onCopyToken
}: DeviceCardProps) => {
    const isCurrent = device.id === currentDeviceId

    return (
        <li className={glassPanel({ className: "p-5" })}>
            {editing ? (
                <form onSubmit={onRename}>
                    <label htmlFor={`device-${device.id}`} className="mb-2 block text-sm font-semibold text-slate-700">
                        端末名
                    </label>
                    <input
                        id={`device-${device.id}`}
                        value={editingName}
                        onChange={(event) => onEditingNameChange(event.target.value)}
                        maxLength={64}
                        className={inputStyles()}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button tone="secondary" size="small" onClick={onCancelEditing} disabled={saving}>
                            キャンセル
                        </Button>
                        <Button type="submit" size="small" disabled={saving}>
                            {saving ? "保存中…" : "保存"}
                        </Button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="truncate text-lg font-bold text-slate-950">{device.name}</h2>
                                {isCurrent ? (
                                    <span className="rounded-full border border-sky-100/80 bg-sky-100/70 px-2.5 py-1 text-xs font-bold text-sky-700">
                                        この端末
                                    </span>
                                ) : null}
                            </div>
                            <p className="mt-2 text-xs text-slate-500">最終使用: {formatDate(device.lastUsedAt)}</p>
                            <p className="mt-1 text-xs text-slate-400">登録: {formatDate(device.createdAt)}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            {isCurrent ? (
                                <Button tone="secondary" size="small" onClick={onCopyToken}>
                                    {tokenCopied ? "コピーしました" : "トークンをコピー"}
                                </Button>
                            ) : null}
                            <IconButton label="端末名を編集" onClick={onStartEditing}>
                                <PencilIcon className="size-5" />
                            </IconButton>
                        </div>
                    </div>
                    <div className="mt-5 border-t border-white/70 pt-4">
                        <Button tone="danger" size="small" disabled={deleting} onClick={onDelete}>
                            {deleting ? "削除中…" : "この端末を削除"}
                        </Button>
                    </div>
                </>
            )}
        </li>
    )
}
