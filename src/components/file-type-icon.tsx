import type { SharedFile } from "@/lib/api"

interface FileTypeIconProps {
    file: SharedFile
}

export type FileKind =
    | "archive"
    | "audio"
    | "code"
    | "document"
    | "executable"
    | "image"
    | "pdf"
    | "sheet"
    | "slides"
    | "text"
    | "video"
    | "generic"

interface FileAppearance {
    background: string
    color: string
    label: string
}

const extension = (name: string): string => name.split(".").at(-1)?.toLowerCase() ?? ""

export const fileKindForFile = (file: SharedFile): FileKind => {
    const type = file.contentType.toLowerCase()
    const suffix = extension(file.name)
    if (type === "application/pdf" || suffix === "pdf") return "pdf"
    if (type.startsWith("image/")) return "image"
    if (type.startsWith("video/")) return "video"
    if (type.startsWith("audio/")) return "audio"
    if (type.startsWith("text/") || ["txt", "md", "rtf", "log"].includes(suffix)) return "text"
    if (["zip", "7z", "rar", "tar", "gz", "bz2", "xz"].includes(suffix)) return "archive"
    if (type.includes("spreadsheet") || ["csv", "tsv", "xls", "xlsx", "ods"].includes(suffix)) return "sheet"
    if (type.includes("presentation") || ["ppt", "pptx", "odp", "key"].includes(suffix)) return "slides"
    if (type.includes("wordprocessing") || ["doc", "docx", "odt", "pages"].includes(suffix)) return "document"
    if (["exe", "msi", "app", "dmg", "apk", "deb", "rpm"].includes(suffix)) return "executable"
    if (
        [
            "c",
            "cpp",
            "cs",
            "css",
            "go",
            "h",
            "html",
            "java",
            "js",
            "json",
            "jsx",
            "kt",
            "py",
            "rb",
            "rs",
            "sh",
            "sql",
            "swift",
            "toml",
            "ts",
            "tsx",
            "xml",
            "yaml",
            "yml"
        ].includes(suffix)
    )
        return "code"
    return "generic"
}

const appearances: Record<FileKind, FileAppearance> = {
    archive: { background: "bg-amber-100", color: "text-amber-700", label: "ZIP" },
    audio: { background: "bg-fuchsia-100", color: "text-fuchsia-700", label: "AUDIO" },
    code: { background: "bg-cyan-100", color: "text-cyan-700", label: "CODE" },
    document: { background: "bg-blue-100", color: "text-blue-700", label: "DOC" },
    executable: { background: "bg-slate-200", color: "text-slate-700", label: "APP" },
    image: { background: "bg-emerald-100", color: "text-emerald-700", label: "IMG" },
    pdf: { background: "bg-rose-100", color: "text-rose-700", label: "PDF" },
    sheet: { background: "bg-green-100", color: "text-green-700", label: "SHEET" },
    slides: { background: "bg-orange-100", color: "text-orange-700", label: "SLIDE" },
    text: { background: "bg-violet-100", color: "text-violet-700", label: "TEXT" },
    video: { background: "bg-indigo-100", color: "text-indigo-700", label: "VIDEO" },
    generic: { background: "bg-slate-100", color: "text-slate-500", label: "FILE" }
}

export const fileAppearanceForFile = (file: SharedFile): FileAppearance => appearances[fileKindForFile(file)]

const DocumentShape = ({ label }: { label: string }) => (
    <>
        <path d="M16 7h22l10 10v40H16Z" fill="currentColor" opacity="0.14" />
        <path
            d="M38 7v11h10M16 7h22l10 10v40H16Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinejoin="round"
        />
        <path
            d="M23 29h18M23 35h18"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
            opacity="0.55"
        />
        <text x="32" y="48" fill="currentColor" fontSize="9" fontWeight="800" textAnchor="middle">
            {label}
        </text>
    </>
)

const Glyph = ({ kind, label }: { kind: FileKind; label: string }) => {
    if (kind === "audio")
        return (
            <>
                <circle cx="32" cy="32" r="21" fill="currentColor" opacity="0.14" />
                <path d="M37 18v26a6 6 0 1 1-4-5.66V24l12-3v19a6 6 0 1 1-4-5.66V18Z" fill="currentColor" />
            </>
        )
    if (kind === "video")
        return (
            <>
                <rect x="10" y="15" width="44" height="34" rx="8" fill="currentColor" opacity="0.16" />
                <rect x="10" y="15" width="44" height="34" rx="8" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path d="m29 24 13 8-13 8Z" fill="currentColor" />
            </>
        )
    if (kind === "archive")
        return (
            <>
                <path d="M12 21h40v29H12Z" fill="currentColor" opacity="0.14" />
                <path
                    d="M12 21h40v29H12ZM10 14h44v9H10Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="3.5"
                />
                <path d="M32 25v21" stroke="currentColor" strokeDasharray="3 3" strokeWidth="3" />
            </>
        )
    if (kind === "code")
        return (
            <>
                <path
                    d="m25 19-11 13 11 13M39 19l11 13-11 13M35 14l-6 36"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
                <text x="32" y="60" fill="currentColor" fontSize="8" fontWeight="800" textAnchor="middle">
                    {label}
                </text>
            </>
        )
    if (kind === "executable")
        return (
            <>
                <rect x="10" y="14" width="44" height="36" rx="7" fill="currentColor" opacity="0.14" />
                <rect x="10" y="14" width="44" height="36" rx="7" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path
                    d="m20 26 7 6-7 6M33 39h11"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3.5"
                />
            </>
        )
    if (kind === "image")
        return (
            <>
                <rect x="10" y="13" width="44" height="38" rx="7" fill="currentColor" opacity="0.14" />
                <rect x="10" y="13" width="44" height="38" rx="7" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <circle cx="40" cy="25" r="4" fill="currentColor" />
                <path
                    d="m16 45 11-11 7 7 6-6 8 10"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3.5"
                />
            </>
        )
    return <DocumentShape label={label} />
}

export const FileTypeIcon = ({ file }: FileTypeIconProps) => {
    const kind = fileKindForFile(file)
    const appearance = appearances[kind]
    return (
        <svg
            viewBox="0 0 64 64"
            role="img"
            aria-label={`${appearance.label} ファイル`}
            className={`size-full ${appearance.color}`}
        >
            <Glyph kind={kind} label={appearance.label} />
        </svg>
    )
}
