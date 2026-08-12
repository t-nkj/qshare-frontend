import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss"

const devTraqId = "local-dev"

export default defineConfig({
    plugins: [pluginReact(), pluginTailwindcss()],
    source: {
        entry: {
            index: "./src/main.tsx"
        }
    },
    html: {
        title: "QShare",
        meta: {
            description: "端末間でURLをすばやく共有"
        },
        favicon: "./src/assets/favicon.png"
    },
    server: {
        port: 3001,
        strictPort: true,
        historyApiFallback: true,
        setup: ({ action, server }) => {
            if (action !== "dev") {
                return
            }

            server.middlewares.use("/_oauth/login", (request, response) => {
                const requestedRedirect = new URL(request.url ?? "/", "http://localhost").searchParams.get("redirect")
                const redirect =
                    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/"

                response.writeHead(302, { Location: redirect })
                response.end()
            })
        },
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                pathRewrite: { "^/api": "" },
                headers: {
                    "X-Forwarded-User": devTraqId
                }
            }
        }
    }
})
