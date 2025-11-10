import { ConsolePosition } from "@opentui/core"
import { render } from "@opentui/solid"
import { App } from "./app"

void render(() => <App />, {
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.RIGHT,
  },
})
