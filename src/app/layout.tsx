import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

export const metadata: Metadata = {
    title: "QShare",
    description: "端末間でURLをすばやく共有"
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ja">
            <body className="min-h-dvh bg-slate-50 font-sans text-slate-950 antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    )
}
