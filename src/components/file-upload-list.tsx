export interface UploadingFile {
    id: string
    name: string
    progress: number
    error: string | null
}

export const FileUploadList = ({ uploads }: { uploads: UploadingFile[] }) => {
    if (uploads.length === 0) return null
    return (
        <section className="mb-6 space-y-3" aria-label="アップロード状況">
            {uploads.map((upload) => (
                <div
                    key={upload.id}
                    className="rounded-3xl border border-white/70 bg-white/55 px-5 py-4 shadow-xl shadow-slate-950/5 backdrop-blur-2xl"
                >
                    <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-800">{upload.name}</span>
                        <span
                            className={`shrink-0 text-sm font-semibold ${upload.error ? "text-rose-600" : "text-sky-700"}`}
                        >
                            {upload.error ? "失敗" : `${upload.progress}%`}
                        </span>
                    </div>
                    {upload.error ? (
                        <p className="mt-2 text-sm text-rose-600">{upload.error}</p>
                    ) : (
                        <progress
                            className="mt-3 h-2 w-full overflow-hidden rounded-full accent-blue-600"
                            max={100}
                            value={upload.progress}
                        />
                    )}
                </div>
            ))}
        </section>
    )
}
