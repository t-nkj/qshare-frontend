import { useEffect, useState } from "react"
import { AuthGate, useAuth } from "@/components/auth-provider"
import { glassPanel } from "@/components/ui"
import { ApiError, getLatestUrl } from "@/lib/api"

const LatestRedirect = () => {
    const { token, invalidateToken } = useAuth()
    const [message, setMessage] = useState("最新のURLを取得しています…")
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        const activeToken = token
        if (!activeToken) return
        const bearerToken: string = activeToken

        let active = true
        const redirect = async () => {
            try {
                const latestUrl = await getLatestUrl(bearerToken)
                if (active) window.location.replace(latestUrl.url)
            } catch (caught) {
                if (!active) return
                if (caught instanceof ApiError && caught.status === 401) {
                    invalidateToken()
                    return
                }
                if (caught instanceof ApiError && caught.status === 404) {
                    setMessage("まだ共有されたURLがありません")
                } else {
                    setMessage("最新のURLを取得できませんでした")
                }
                setFailed(true)
            }
        }

        void redirect()
        return () => {
            active = false
        }
    }, [invalidateToken, token])

    return (
        <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-sky-100 via-slate-50 to-violet-100 px-4">
            <section className={glassPanel({ className: "w-full max-w-md p-8 text-center" })}>
                <div
                    className={
                        failed
                            ? "mx-auto size-12 rounded-full bg-amber-100"
                            : "mx-auto size-12 animate-pulse rounded-full bg-linear-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30"
                    }
                />
                <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-950">QShare</h1>
                <output className="mt-2 block text-sm leading-6 text-slate-600">{message}</output>
                {failed ? (
                    <div className="mt-6">
                        <a
                            href="/"
                            className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition duration-300 hover:scale-105 hover:from-sky-400 hover:to-blue-500 active:scale-100"
                        >
                            URL履歴を開く
                        </a>
                    </div>
                ) : null}
            </section>
        </main>
    )
}

const LatestPage = () => {
    return (
        <AuthGate>
            <LatestRedirect />
        </AuthGate>
    )
}

export default LatestPage
