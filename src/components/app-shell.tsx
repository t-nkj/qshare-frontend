import type { ReactNode } from "react"
import { tv } from "tailwind-variants"

const navItem = tv({
    base: "flex min-w-24 flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:flex-none",
    variants: {
        active: {
            true: "bg-slate-900/90 text-white shadow-lg shadow-slate-950/20",
            false: "text-slate-500 hover:bg-white/65 hover:text-slate-900"
        }
    }
})

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = window.location.pathname

    return (
        <div className="min-h-dvh bg-gradient-to-br from-sky-100 via-slate-50 to-violet-100 pb-24 sm:pb-28">
            <main>{children}</main>
            <nav
                aria-label="メインナビゲーション"
                className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/60 px-4 pb-4 pt-3 shadow-xl shadow-slate-950/10 backdrop-blur-2xl sm:bottom-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-full sm:border sm:p-1.5"
            >
                <div className="mx-auto flex max-w-md gap-1">
                    <a href="/" className={navItem({ active: pathname === "/" })}>
                        URL履歴
                    </a>
                    <a
                        href="/devices/"
                        className={navItem({ active: pathname === "/devices" || pathname === "/devices/" })}
                    >
                        端末管理
                    </a>
                </div>
            </nav>
        </div>
    )
}
