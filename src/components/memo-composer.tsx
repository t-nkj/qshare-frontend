import type { SubmitEvent } from "react"
import { Button, glassPanel } from "./ui"

interface MemoComposerProps {
    draft: string
    error: string | null
    sending: boolean
    onDraftChange: (draft: string) => void
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}

export const MemoComposer = ({ draft, error, sending, onDraftChange, onSubmit }: MemoComposerProps) => (
    <form onSubmit={onSubmit} className={glassPanel({ className: "sticky top-3 z-20 mb-7 p-3" })}>
        <label htmlFor="shared-memo" className="sr-only">
            共有するメモ
        </label>
        <textarea
            id="shared-memo"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="メモを入力…"
            maxLength={10000}
            rows={4}
            className="w-full resize-y rounded-2xl border border-white/70 bg-white/40 px-4 py-3 text-sm leading-6 text-slate-950 shadow-inner shadow-slate-950/5 outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-sky-300 focus:bg-white/65 focus:ring-4 focus:ring-sky-200/50 disabled:bg-slate-100 disabled:text-slate-500"
            disabled={sending}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{draft.length.toLocaleString()} / 10,000</span>
            <Button type="submit" disabled={sending || draft.trim().length === 0}>
                {sending ? "共有中…" : "共有"}
            </Button>
        </div>
        {error ? (
            <p className="px-1 pt-3 text-sm font-medium text-rose-600" role="alert">
                {error}
            </p>
        ) : null}
    </form>
)
