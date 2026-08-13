import { useState } from "react"
import { LinkIcon } from "./icons"

interface UrlFaviconProps {
    url: string
}

const faviconUrlFor = (url: string): string | null => {
    try {
        return new URL("/favicon.ico", url).toString()
    } catch {
        return null
    }
}

export const UrlFavicon = ({ url }: UrlFaviconProps) => {
    const [failed, setFailed] = useState(false)
    const faviconUrl = faviconUrlFor(url)

    return (
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-slate-100/80 text-slate-500 shadow-inner shadow-slate-950/5">
            {faviconUrl && !failed ? (
                <img
                    src={faviconUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-6 object-contain"
                    onError={() => setFailed(true)}
                />
            ) : (
                <LinkIcon className="size-5" />
            )}
        </span>
    )
}
