"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { Button, inputStyles } from "@/components/ui"
import { ApiError, type Device, deleteDevice, listDevices, renameDevice } from "@/lib/api"

function formatDate(value: string | null): string {
    if (!value) return "まだ使用されていません"
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value))
}

function DeviceManagement() {
    const { token, currentDeviceId, invalidateToken } = useAuth()
    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    function startEditing(device: Device) {
        setEditingId(device.id)
        setEditingName(device.name)
        setError(null)
    }

    async function handleRename(event: FormEvent<HTMLFormElement>, device: Device) {
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

    async function handleDelete(device: Device) {
        if (
            !token ||
            deletingId ||
            !window.confirm(`「${device.name}」を削除しますか？この端末のトークンは失効します。`)
        ) {
            return
        }
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
                        <p className="mb-1 text-sm font-semibold text-blue-600">QShare</p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">端末管理</h1>
                        <p className="mt-2 text-sm text-slate-500">同じtraQ IDに接続されている端末です。</p>
                    </div>
                    <Button tone="secondary" size="small" onClick={() => void load()} disabled={loading}>
                        更新
                    </Button>
                </header>

                {error ? (
                    <div
                        className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="space-y-3">
                        {[0, 1].map((item) => (
                            <div key={item} className="h-36 animate-pulse rounded-3xl bg-white shadow-sm" />
                        ))}
                    </div>
                ) : devices.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
                        登録済みの端末がありません。
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {devices.map((device) => (
                            <li key={device.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                {editingId === device.id ? (
                                    <form onSubmit={(event) => void handleRename(event, device)}>
                                        <label
                                            htmlFor={`device-${device.id}`}
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            端末名
                                        </label>
                                        <input
                                            id={`device-${device.id}`}
                                            value={editingName}
                                            onChange={(event) => setEditingName(event.target.value)}
                                            maxLength={64}
                                            className={inputStyles()}
                                        />
                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button
                                                tone="secondary"
                                                size="small"
                                                onClick={() => setEditingId(null)}
                                                disabled={saving}
                                            >
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
                                                    <h2 className="truncate text-lg font-bold text-slate-950">
                                                        {device.name}
                                                    </h2>
                                                    {device.id === currentDeviceId ? (
                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                            この端末
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    最終使用: {formatDate(device.lastUsedAt)}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    登録: {formatDate(device.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <Button
                                                    tone="secondary"
                                                    size="small"
                                                    onClick={() => startEditing(device)}
                                                >
                                                    名前変更
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-5 border-t border-slate-100 pt-4">
                                            <button
                                                type="button"
                                                className="text-sm font-semibold text-rose-600 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500 disabled:opacity-50"
                                                disabled={deletingId === device.id}
                                                onClick={() => void handleDelete(device)}
                                            >
                                                {deletingId === device.id ? "削除中…" : "この端末を削除"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AppShell>
    )
}

export default function DevicesPage() {
    return (
        <AuthGate>
            <DeviceManagement />
        </AuthGate>
    )
}
