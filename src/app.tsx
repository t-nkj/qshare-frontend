import { AuthProvider } from "@/components/auth-provider"
import { glassPanel } from "@/components/ui"
import DevicesPage from "@/pages/devices-page"
import HomePage from "@/pages/home-page"
import LatestPage from "@/pages/latest-page"

function normalizePathname(pathname: string): string {
    if (pathname === "/") return pathname
    return pathname.replace(/\/+$/, "")
}

function CurrentPage() {
    const pathname = normalizePathname(window.location.pathname)

    if (pathname === "/devices") return <DevicesPage />
    if (pathname === "/latest") return <LatestPage />
    if (pathname === "/") return <HomePage />

    return (
        <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-100 via-slate-50 to-violet-100 px-4">
            <section className={glassPanel({ className: "w-full max-w-md p-8 text-center" })}>
                <p className="text-sm font-semibold text-sky-600">QShare</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">ページが見つかりません</h1>
                <a
                    href="/"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition duration-300 hover:scale-105 hover:from-sky-400 hover:to-blue-500"
                >
                    URL履歴へ戻る
                </a>
            </section>
        </main>
    )
}

export function App() {
    return (
        <AuthProvider>
            <CurrentPage />
        </AuthProvider>
    )
}
