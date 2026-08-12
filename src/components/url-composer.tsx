import type { SubmitEvent } from "react"
import { Button, glassPanel, inputStyles } from "./ui"

interface UrlComposerProps {
    draft: string
    error: string | null
    sending: boolean
    onDraftChange: (draft: string) => void
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}

export const UrlComposer = ({ draft, error, sending, onDraftChange, onSubmit }: UrlComposerProps) => (
    <form onSubmit={onSubmit} className={glassPanel({ className: "sticky top-3 z-20 mb-7 p-2" })}>
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
                onChange={(event) => onDraftChange(event.target.value)}
                className={inputStyles({ kind: "composer" })}
                disabled={sending}
            />
            <Button type="submit" size="composer" disabled={sending || draft.trim().length === 0}>
                {sending ? "送信中" : "送信"}
            </Button>
        </div>
        {error ? (
            <p className="px-3 pb-2 pt-1 text-sm font-medium text-rose-600" role="alert">
                {error}
            </p>
        ) : null}
    </form>
)
