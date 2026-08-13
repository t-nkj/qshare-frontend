import { type SubmitEvent, useEffect, useRef, useState } from "react"
import type { SharedMemo } from "@/lib/api"
import { CheckIcon, CopyIcon, PencilIcon } from "./icons"
import { Button, glassPanel, IconButton, inputStyles } from "./ui"

interface MemoCardProps {
    memo: SharedMemo
    latest: boolean
    deleting: boolean
    updating: boolean
    onCopy: (content: string) => Promise<boolean>
    onUpdate: (content: string) => Promise<boolean>
    onDelete: () => void
}

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
        new Date(value)
    )

const MemoEditor = ({
    memoId,
    content,
    saving,
    onCancel,
    onSave
}: {
    memoId: string
    content: string
    saving: boolean
    onCancel: () => void
    onSave: (content: string) => Promise<boolean>
}) => {
    const [draft, setDraft] = useState(content)
    const editorRef = useRef<HTMLFormElement>(null)

    useEffect(() => setDraft(content), [content])

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (await onSave(draft)) onCancel()
    }

    useEffect(() => {
        const handleOutsideClick = (event: PointerEvent) => {
            if (editorRef.current?.contains(event.target as Node)) return
            if (draft === content) {
                onCancel()
                return
            }
            void onSave(draft).then((saved) => {
                if (saved) onCancel()
            })
        }
        document.addEventListener("pointerdown", handleOutsideClick)
        return () => document.removeEventListener("pointerdown", handleOutsideClick)
    }, [content, draft, onCancel, onSave])

    return (
        <form ref={editorRef} onSubmit={handleSubmit}>
            <label htmlFor={`memo-${memoId}`} className="sr-only">
                メモ本文
            </label>
            <textarea
                id={`memo-${memoId}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={10000}
                rows={4}
                className={`${inputStyles()} h-auto resize-y py-3 leading-6`}
                disabled={saving}
            />
            <div className="mt-4 flex justify-end gap-2">
                <Button tone="secondary" size="small" onClick={onCancel} disabled={saving}>
                    キャンセル
                </Button>
                <Button type="submit" size="small" disabled={saving || draft.trim().length === 0}>
                    {saving ? "保存中…" : "保存"}
                </Button>
            </div>
        </form>
    )
}

export const MemoCard = ({ memo, latest, deleting, updating, onCopy, onUpdate, onDelete }: MemoCardProps) => {
    const [editing, setEditing] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!(await onCopy(memo.content))) return
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1000)
    }

    if (editing) {
        return (
            <li className={glassPanel({ className: "p-5" })}>
                <MemoEditor
                    memoId={memo.id}
                    content={memo.content}
                    saving={updating}
                    onCancel={() => setEditing(false)}
                    onSave={onUpdate}
                />
            </li>
        )
    }

    return (
        <li className={glassPanel({ className: "p-5" })}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    {latest ? (
                        <span className="mb-2 inline-block rounded-full border border-sky-100/80 bg-sky-100/70 px-2.5 py-1 text-xs font-bold text-sky-700">
                            最新
                        </span>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-900">{memo.content}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <IconButton label={copied ? "コピーしました" : "メモをコピー"} onClick={() => void handleCopy()}>
                        {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
                    </IconButton>
                    <IconButton label="メモを編集" onClick={() => setEditing(true)}>
                        <PencilIcon className="size-5" />
                    </IconButton>
                    <IconButton label="メモを削除" tone="danger" disabled={deleting} onClick={onDelete}>
                        ×
                    </IconButton>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/70 pt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{memo.sourceDeviceName}</span>
                <span>{formatDate(memo.createdAt)}</span>
                {memo.updatedAt !== memo.createdAt ? <span>編集済み</span> : null}
                <span>期限 {formatDate(memo.expiresAt)}</span>
            </div>
        </li>
    )
}
