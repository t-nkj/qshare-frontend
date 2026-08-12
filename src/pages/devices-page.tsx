import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { DeviceCard } from "@/components/device-card"
import { IconButton } from "@/components/ui"
import { ApiError, type Device, deleteDevice, listDevices, renameDevice } from "@/lib/api"

const DeviceManagement = () => {
    const { token, currentDeviceId, invalidateToken } = useAuth()
    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [tokenCopied, setTokenCopied] = useState(false)

    const handleError = useCallback(
        (caught: unknown, fallback: string) => {
            if (caught instanceof ApiError && caught.status === 401) {
                invalidateToken()
                return
            }
            setError(caught instanceof ApiError ? caught.message : fallback)
        },
        [invalidateToken]
    )

    const load = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError(null)
        try {
            setDevices(await listDevices(token))
        } catch (caught) {
            handleError(caught, "端末一覧を読み込めませんでした")
        } finally {
            setLoading(false)
        }
    }, [handleError, token])

    useEffect(() => {
        void load()
    }, [load])

    const startEditing = (device: Device) => {
        setEditingId(device.id)
        setEditingName(device.name)
        setError(null)
    }

    const handleCopyToken = async () => {
        if (!token) return
        try {
            await navigator.clipboard.writeText(token)
            setTokenCopied(true)
            window.setTimeout(() => setTokenCopied(false), 2500)
        } catch {
            setError("端末トークンをコピーできませんでした")
        }
    }

    const handleRename = async (event: SubmitEvent<HTMLFormElement>, device: Device) => {
        event.preventDefault()
        if (!token || saving) return
        const name = editingName.trim()
        if (!name || [...name].length > 64) {
            setError("端末名は1〜64文字で入力してください")
            return
        }
        setSaving(true)
        setError(null)
        try {
            const updated = await renameDevice(token, device.id, name)
            setDevices((current) => current.map((item) => (item.id === updated.id ? updated : item)))
            setEditingId(null)
        } catch (caught) {
            handleError(caught, "端末名を変更できませんでした")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (device: Device) => {
        if (
            !token ||
            deletingId ||
            !window.confirm(`「${device.name}」を削除しますか？この端末のトークンは失効します。`)
        )
            return
        setDeletingId(device.id)
        setError(null)
        try {
            await deleteDevice(token, device.id)
            if (device.id === currentDeviceId) {
                invalidateToken()
                return
            }
            setDevices((current) => current.filter((item) => item.id !== device.id))
        } catch (caught) {
            handleError(caught, "端末を削除できませんでした")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <AppShell>
            <section className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
                <header className="mb-7 flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-sky-600">QShare</p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">端末管理</h1>
                        <p className="mt-2 text-sm text-slate-500">同じtraQ IDに接続されている端末です。</p>
                    </div>
                    <IconButton label="端末一覧を再読み込み" onClick={() => void load()} disabled={loading}>
                        ↻
                    </IconButton>
                </header>
                {error ? (
                    <div
                        className="mb-5 rounded-2xl border border-rose-100/80 bg-rose-50/70 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-xl"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}
                {loading ? (
                    <div className="space-y-3">
                        {[0, 1].map((item) => (
                            <div
                                key={item}
                                className="h-36 animate-pulse rounded-3xl border border-white/70 bg-white/50 shadow-xl shadow-slate-950/5"
                            />
                        ))}
                    </div>
                ) : devices.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/80 bg-white/45 px-6 py-14 text-center text-slate-500 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
                        登録済みの端末がありません。
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {devices.map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                currentDeviceId={currentDeviceId}
                                editing={editingId === device.id}
                                editingName={editingName}
                                saving={saving}
                                deleting={deletingId === device.id}
                                tokenCopied={tokenCopied}
                                onEditingNameChange={setEditingName}
                                onStartEditing={() => startEditing(device)}
                                onCancelEditing={() => setEditingId(null)}
                                onRename={(event) => void handleRename(event, device)}
                                onDelete={() => void handleDelete(device)}
                                onCopyToken={() => void handleCopyToken()}
                            />
                        ))}
                    </ul>
                )}
            </section>
        </AppShell>
    )
}

const DevicesPage = () => (
    <AuthGate>
        <DeviceManagement />
    </AuthGate>
)

export default DevicesPage
