import * as playwright from "playwright"
import path from "node:path"

// Does this even work lmao
const getBrowserPath = () => Bun.which("chromium") ?? "chromium"

const USER_DATA_DIR = path.join(process.cwd(), "./.scraper-profile/")

export const browserContext = await playwright.chromium.launchPersistentContext(
  USER_DATA_DIR,
  {
    executablePath: getBrowserPath(),
    headless: false,
  },
)
