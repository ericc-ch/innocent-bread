import path from "node:path"

const LINKS_PATH = path.join(import.meta.dir, "../links.txt")

export const readLinks = async () => {
  const content = await Bun.file(LINKS_PATH).text()
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
