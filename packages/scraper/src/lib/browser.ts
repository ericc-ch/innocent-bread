import * as playwright from "playwright"
import path from "node:path"

const getBrowserPath = () =>
  Bun.$`which chromium`.text().then((output) => output.trim())

const USER_DATA_DIR = path.join(process.cwd(), "./.scraper-profile/")

export const createContext = async () =>
  playwright.chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: await getBrowserPath(),
    headless: false,
  })
