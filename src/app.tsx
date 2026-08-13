import { AuthProvider } from "@/components/auth-provider"
import { glassPanel } from "@/components/ui"
import DevicesPage from "@/pages/devices-page"
import HomePage from "@/pages/home-page"
import LatestPage from "@/pages/latest-page"
import MemosPage from "@/pages/memos-page"

const normalizePathname = (pathname: string): string => {
    if (pathname === "/") return pathname
    return pathname.replace(/\/+$/, "")
}

const CurrentPage = () => {
    const pathname = normalizePathname(window.location.pathname)

    if (pathname === "/devices") return <DevicesPage />
    if (pathname === "/urls/latest") return <LatestPage />
    if (pathname === "/urls") return <HomePage />
    if (pathname === "/") return <MemosPage />

    return (
        <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-sky-100 via-slate-50 to-violet-100 px-4">
            <section className={glassPanel({ className: "w-full max-w-md p-8 text-center" })}>
                <p className="text-sm font-semibold text-sky-600">QShare</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">ページが見つかりません</h1>
                <a
                    href="/"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-colors duration-300 hover:bg-blue-700"
                >
                    メモへ戻る
                </a>
            </section>
        </main>
    )
}

export const App = () => {
    return (
        <AuthProvider>
            <CurrentPage />
        </AuthProvider>
    )
}
