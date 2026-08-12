import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { DeviceRegistration } from "./auth-registration"

const TOKEN_KEY = "qshare.deviceToken"
const DEVICE_ID_KEY = "qshare.deviceId"

interface AuthContextValue {
    token: string | null
    currentDeviceId: string | null
    saveToken: (token: string, deviceId?: string) => void
    invalidateToken: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
                    return
                }
                window.localStorage.removeItem(DEVICE_ID_KEY)
                setCurrentDeviceId(null)
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

    if (!ready)
        return (
            <main
                className="flex min-h-dvh items-center justify-center bg-linear-to-br from-sky-100 via-slate-50 to-violet-100"
                aria-label="QShareを読み込み中"
            >
                <div className="size-10 animate-pulse rounded-full bg-linear-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30" />
            </main>
        )
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
    const value = useContext(AuthContext)
    if (!value) throw new Error("useAuth must be used within AuthProvider")
    return value
}

export const AuthGate = ({ children }: { children: ReactNode }) => {
    const { token, saveToken } = useAuth()
    if (token) return children
    return (
        <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-sky-100 via-slate-50 to-violet-100 px-4 py-10">
            <DeviceRegistration onComplete={saveToken} />
        </main>
    )
}
