import { copyFile, mkdir } from "node:fs/promises"

const routes = ["devices", "files", "urls", "urls/latest"]

await Promise.all(
    routes.map(async (route) => {
        const directory = new URL(`../dist/${route}/`, import.meta.url)
        await mkdir(directory, { recursive: true })
        await copyFile(new URL("../dist/index.html", import.meta.url), new URL("index.html", directory))
    })
)
