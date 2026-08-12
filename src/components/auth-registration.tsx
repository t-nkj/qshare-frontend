import { type SubmitEvent, useState } from "react"
import { ApiError, listDevices, registerDevice } from "@/lib/api"
import { Button, glassPanel, inputStyles } from "./ui"

interface RegistrationProps {
    onIssued: (token: string, deviceId: string) => void
    onComplete: (token: string, deviceId?: string) => void
}

const neoShowcaseLoginUrl = (): string => {
    const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`
    return `/_oauth/login?redirect=${encodeURIComponent(redirect)}`
}

const IssuedToken = ({
    token,
    deviceId,
    onComplete
}: {
    token: string
    deviceId: string | null
    onComplete: RegistrationProps["onComplete"]
}) => {
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(token)
            setCopied(true)
        } catch {
            setError("コピーできませんでした。トークンを選択してコピーしてください。")
        }
    }

    return (
        <div className={glassPanel({ className: "w-full max-w-lg p-6 sm:p-8" })}>
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-2xl text-emerald-700 shadow-lg shadow-emerald-500/10">
                ✓
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">端末を登録しました</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
                このトークンは今だけ表示されます。ショートカットや拡張機能で使う場合はコピーしてください。
            </p>
            <code className="mt-5 block select-all break-all rounded-2xl border border-white/70 bg-white/50 p-4 text-sm leading-6 text-slate-800 shadow-inner shadow-slate-950/5">
                {token}
            </code>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button tone="secondary" className="flex-1" onClick={() => void handleCopy()}>
                    {copied ? "コピーしました" : "トークンをコピー"}
                </Button>
                <Button className="flex-1" onClick={() => onComplete(token, deviceId ?? undefined)}>
                    QShareを開く
                </Button>
            </div>
            {error ? (
                <p className="mt-4 text-sm font-medium text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    )
}

const RegistrationForm = ({ onIssued, onComplete }: RegistrationProps) => {
    const [mode, setMode] = useState<"register" | "token">("register")
    const [name, setName] = useState("")
    const [tokenInput, setTokenInput] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName || [...trimmedName].length > 64) {
            setError("端末名は1〜64文字で入力してください")
            return
        }
        setSubmitting(true)
        setError(null)
        try {
            const result = await registerDevice(trimmedName)
            onIssued(result.token, result.device.id)
        } catch (caught) {
            if (caught instanceof ApiError && caught.code === "TRAQ_AUTH_REQUIRED") {
                window.location.assign(neoShowcaseLoginUrl())
                return
            }
            setError(caught instanceof ApiError ? caught.message : "端末を登録できませんでした")
        } finally {
            setSubmitting(false)
        }
    }

    const handleToken = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const value = tokenInput.trim()
        if (!value) return
        setSubmitting(true)
        setError(null)
        try {
            await listDevices(value)
            onComplete(value)
        } catch (caught) {
            setError(caught instanceof ApiError ? "トークンを確認できませんでした" : "APIへ接続できませんでした")
        } finally {
            setSubmitting(false)
        }
    }

    const selectMode = (nextMode: "register" | "token") => {
        setMode(nextMode)
        setError(null)
    }

    return (
        <div className={glassPanel({ className: "w-full max-w-lg p-6 sm:p-8" })}>
            <div className="mb-7">
                <p className="mb-1 text-sm font-semibold text-sky-600">QShare</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">この端末を接続</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">同じtraQ IDの端末間でURLを共有できます。</p>
            </div>
            <div className="mb-6 grid grid-cols-2 rounded-full border border-white/70 bg-slate-100/55 p-1 text-sm font-semibold shadow-inner shadow-slate-950/5">
                <button
                    type="button"
                    onClick={() => selectMode("register")}
                    className={`cursor-pointer ${
                        mode === "register"
                            ? "rounded-full bg-white/85 px-3 py-2.5 shadow-md shadow-slate-950/10"
                            : "px-3 py-2.5 text-slate-500"
                    }`}
                >
                    新しく登録
                </button>
                <button
                    type="button"
                    onClick={() => selectMode("token")}
                    className={`cursor-pointer ${
                        mode === "token"
                            ? "rounded-full bg-white/85 px-3 py-2.5 shadow-md shadow-slate-950/10"
                            : "px-3 py-2.5 text-slate-500"
                    }`}
                >
                    トークンを入力
                </button>
            </div>
            {mode === "register" ? (
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label htmlFor="device-name" className="mb-2 block text-sm font-semibold text-slate-700">
                            端末名
                        </label>
                        <input
                            id="device-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={64}
                            placeholder="このコンピューター"
                            className={inputStyles()}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "登録中…" : "端末を登録"}
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleToken} className="space-y-5">
                    <div>
                        <label htmlFor="device-token" className="mb-2 block text-sm font-semibold text-slate-700">
                            端末トークン
                        </label>
                        <input
                            id="device-token"
                            type="password"
                            value={tokenInput}
                            onChange={(event) => setTokenInput(event.target.value)}
                            placeholder="qsh_..."
                            className={inputStyles()}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting || tokenInput.trim().length === 0}>
                        {submitting ? "確認中…" : "トークンで接続"}
                    </Button>
                </form>
            )}
            {error ? (
                <p
                    className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-700"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </div>
    )
}

export const DeviceRegistration = ({ onComplete }: Pick<RegistrationProps, "onComplete">) => {
    const [issued, setIssued] = useState<{ token: string; deviceId: string } | null>(null)

    if (issued) return <IssuedToken token={issued.token} deviceId={issued.deviceId} onComplete={onComplete} />
    return <RegistrationForm onIssued={(token, deviceId) => setIssued({ token, deviceId })} onComplete={onComplete} />
}
