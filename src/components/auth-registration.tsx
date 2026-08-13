import { type SubmitEvent, useState } from "react"
import { ApiError, listDevices, registerDevice } from "@/lib/api"
import { Button, glassPanel, inputStyles } from "./ui"

interface RegistrationProps {
    onComplete: (token: string, deviceId?: string) => void
}

const neoShowcaseLoginUrl = (): string => {
    const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`
    return `/_oauth/login?redirect=${encodeURIComponent(redirect)}`
}

const RegistrationForm = ({ onComplete }: RegistrationProps) => {
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
            onComplete(result.token, result.device.id)
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
    return <RegistrationForm onComplete={onComplete} />
}
