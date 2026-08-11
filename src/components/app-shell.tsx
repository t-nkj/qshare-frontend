"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { tv } from "tailwind-variants"

const navItem = tv({
    base: "flex min-w-24 flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:flex-none",
    variants: {
        active: {
            true: "bg-slate-950 text-white shadow-sm",
            false: "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }
    }
})

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-dvh bg-slate-50 pb-24 sm:pb-28">
            <main>{children}</main>
            <nav
                aria-label="メインナビゲーション"
                className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-4 pb-4 pt-3 backdrop-blur sm:bottom-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:rounded-full sm:border sm:p-1.5 sm:shadow-lg"
            >
                <div className="mx-auto flex max-w-md gap-1">
                    <Link href="/" className={navItem({ active: pathname === "/" })}>
                        URL履歴
                    </Link>
                    <Link href="/devices" className={navItem({ active: pathname === "/devices" })}>
                        端末管理
                    </Link>
                </div>
            </nav>
        </div>
    )
}
