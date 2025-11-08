import { render } from "@opentui/solid"
import { App } from "./app"
import { ConsolePosition } from "@opentui/core"

void render(() => <App />, {
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.RIGHT,
  },
})
