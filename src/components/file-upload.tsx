import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { Button, glassPanel } from "./ui"

interface FileUploadProps {
    onFiles: (files: File[]) => void
}

export const FileUpload = ({ onFiles }: FileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const dragDepth = useRef(0)

    useEffect(() => {
        const handleDragEnter = (event: DragEvent) => {
            if (!event.dataTransfer?.types.includes("Files")) return
            dragDepth.current += 1
            setDragging(true)
        }
        const handleDragLeave = (event: DragEvent) => {
            if (!event.dataTransfer?.types.includes("Files")) return
            dragDepth.current -= 1
            if (dragDepth.current <= 0) {
                dragDepth.current = 0
                setDragging(false)
            }
        }
        const handleDragOver = (event: DragEvent) => {
            if (event.dataTransfer?.types.includes("Files")) event.preventDefault()
        }
        const handleDrop = (event: DragEvent) => {
            if (!event.dataTransfer?.files.length) return
            event.preventDefault()
            dragDepth.current = 0
            setDragging(false)
            onFiles(Array.from(event.dataTransfer.files))
        }
        document.addEventListener("dragenter", handleDragEnter)
        document.addEventListener("dragleave", handleDragLeave)
        document.addEventListener("dragover", handleDragOver)
        document.addEventListener("drop", handleDrop)
        return () => {
            document.removeEventListener("dragenter", handleDragEnter)
            document.removeEventListener("dragleave", handleDragLeave)
            document.removeEventListener("dragover", handleDragOver)
            document.removeEventListener("drop", handleDrop)
        }
    }, [onFiles])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) onFiles(Array.from(event.target.files))
        event.target.value = ""
    }

    return (
        <>
            <section className={glassPanel({ className: "mb-7 flex flex-col items-center px-6 py-8 text-center" })}>
                <p className="text-lg font-bold text-slate-950">ファイルを共有</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    ここをクリックするか、画面のどこかへドロップしてください。最大100 MiB。
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                    サーバー再起動時や、保存量が1 GiBを超えた場合はファイルが自動的に削除されることがあります。
                </p>
                <input ref={inputRef} type="file" multiple className="sr-only" onChange={handleChange} />
                <Button className="mt-5" onClick={() => inputRef.current?.click()}>
                    ファイルを選択
                </Button>
            </section>
            {dragging ? (
                <div className="pointer-events-none fixed inset-4 z-50 flex items-center justify-center rounded-3xl border-4 border-dashed border-sky-400 bg-sky-100/80 text-center text-lg font-bold text-sky-800 backdrop-blur">
                    <span>ここにドロップしてアップロード</span>
                </div>
            ) : null}
        </>
    )
}
