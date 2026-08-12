import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { ApiError, listDevices, registerDevice } from "@/lib/api"
import { Button, glassPanel, inputStyles } from "./ui"

const TOKEN_KEY = "qshare.deviceToken"
const DEVICE_ID_KEY = "qshare.deviceId"

function neoShowcaseLoginUrl(): string {
    const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`
    return `/_oauth/login?redirect=${encodeURIComponent(redirect)}`
}

interface AuthContextValue {
    token: string | null
    currentDeviceId: string | null
    saveToken: (token: string, deviceId?: string) => void
    invalidateToken: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null)
    const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setToken(window.localStorage.getItem(TOKEN_KEY))
        setCurrentDeviceId(window.localStorage.getItem(DEVICE_ID_KEY))
        setReady(true)
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            currentDeviceId,
            saveToken: (nextToken, deviceId) => {
                window.localStorage.setItem(TOKEN_KEY, nextToken)
                setToken(nextToken)
                if (deviceId) {
                    window.localStorage.setItem(DEVICE_ID_KEY, deviceId)
                    setCurrentDeviceId(deviceId)
                } else {
                    window.localStorage.removeItem(DEVICE_ID_KEY)
                    setCurrentDeviceId(null)
                }
            },
            invalidateToken: () => {
                window.localStorage.removeItem(TOKEN_KEY)
                window.localStorage.removeItem(DEVICE_ID_KEY)
                setToken(null)
                setCurrentDeviceId(null)
            }
        }),
        [currentDeviceId, token]
    )

    if (!ready) {
        return (
            <main
                className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-100 via-slate-50 to-violet-100"
                aria-label="QShareを読み込み中"
            >
                <div className="size-10 animate-pulse rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30" />
            </main>
        )
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const value = useContext(AuthContext)
    if (!value) throw new Error("useAuth must be used within AuthProvider")
    return value
}

interface RegistrationProps {
    onIssued: (token: string, deviceId: string) => void
    onComplete: (token: string, deviceId?: string) => void
}

function Registration({ onIssued, onComplete }: RegistrationProps) {
    const [mode, setMode] = useState<"register" | "token">("register")
    const [name, setName] = useState("")
    const [tokenInput, setTokenInput] = useState("")
    const [issuedToken, setIssuedToken] = useState<string | null>(null)
    const [issuedDeviceId, setIssuedDeviceId] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
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
            setIssuedToken(result.token)
            setIssuedDeviceId(result.device.id)
        } catch (caught) {
            if (caught instanceof ApiError && caught.code === "TRAQ_AUTH_REQUIRED") {
                window.location.assign(neoShowcaseLoginUrl())
                return
            } else {
                setError(caught instanceof ApiError ? caught.message : "端末を登録できませんでした")
            }
        } finally {
            setSubmitting(false)
        }
    }

    async function handleToken(event: FormEvent<HTMLFormElement>) {
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

    async function handleCopy() {
        if (!issuedToken) return
        try {
            await navigator.clipboard.writeText(issuedToken)
            setCopied(true)
        } catch {
            setError("コピーできませんでした。トークンを選択してコピーしてください。")
        }
    }

    if (issuedToken) {
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
                    {issuedToken}
                </code>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button tone="secondary" className="flex-1" onClick={() => void handleCopy()}>
                        {copied ? "コピーしました" : "トークンをコピー"}
                    </Button>
                    <Button className="flex-1" onClick={() => onComplete(issuedToken, issuedDeviceId ?? undefined)}>
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
                    onClick={() => {
                        setMode("register")
                        setError(null)
                    }}
                    className={
                        mode === "register"
                            ? "rounded-full bg-white/85 px-3 py-2.5 shadow-md shadow-slate-950/10"
                            : "px-3 py-2.5 text-slate-500"
                    }
                >
                    新しく登録
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMode("token")
                        setError(null)
                    }}
                    className={
                        mode === "token"
                            ? "rounded-full bg-white/85 px-3 py-2.5 shadow-md shadow-slate-950/10"
                            : "px-3 py-2.5 text-slate-500"
                    }
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

export function AuthGate({ children }: { children: ReactNode }) {
    const { token, saveToken } = useAuth()
    if (token) return children
    return (
        <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-100 via-slate-50 to-violet-100 px-4 py-10">
            <Registration
                onIssued={(issuedToken, deviceId) => {
                    window.localStorage.setItem(TOKEN_KEY, issuedToken)
                    window.localStorage.setItem(DEVICE_ID_KEY, deviceId)
                }}
                onComplete={saveToken}
            />
        </main>
    )
}
