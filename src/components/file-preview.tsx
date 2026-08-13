import { useEffect, useRef, useState } from "react"
import type { SharedFile } from "@/lib/api"
import { getFileThumbnail } from "@/lib/api"
import { FileTypeIcon, fileAppearanceForFile } from "./file-type-icon"

interface FilePreviewProps {
    file: SharedFile
    token: string | null
}

export const FilePreview = ({ file, token }: FilePreviewProps) => {
    const container = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<string | null>(null)
    const appearance = fileAppearanceForFile(file)

    useEffect(() => {
        const target = container.current
        if (!target || !file.hasThumbnail) return
        if (!("IntersectionObserver" in window)) {
            setVisible(true)
            return
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: "160px" }
        )
        observer.observe(target)
        return () => observer.disconnect()
    }, [file.hasThumbnail])

    useEffect(() => {
        if (!file.hasThumbnail || !token || !visible) return
        let active = true
        let objectUrl: string | null = null
        void getFileThumbnail(token, file.id)
            .then((thumbnail) => {
                if (!active) return
                objectUrl = URL.createObjectURL(thumbnail)
                setSource(objectUrl)
            })
            .catch(() => setSource(null))
        return () => {
            active = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [file.hasThumbnail, file.id, token, visible])

    return (
        <div
            ref={container}
            className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 ${source ? "bg-slate-100" : appearance.background}`}
        >
            {source ? <img src={source} alt="" className="size-full object-cover" /> : <FileTypeIcon file={file} />}
        </div>
    )
}
