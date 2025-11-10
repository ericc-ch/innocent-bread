import { useKeyboard, useRenderer } from "@opentui/solid"
import { createSignal, For, onMount, Show } from "solid-js"
import { colors } from "./lib/colors"
import { browserContext } from "./lib/browser"

const commands = [
  {
    name: "open-browser",
    label: "Open Browser",
    action: () => {},
  },
]

export const App = () => {
  const renderer = useRenderer()

  const [modalOpen, setModalOpen] = createSignal(false)
  const [selectedCommand, setSelectedCommand] = createSignal(0)

  onMount(() => {
    console.log(`Using browser version: ${browserContext.browser()?.version()}`)
  })

  useKeyboard((event) => {
    if (event.name === "f12") {
      renderer.console.toggle()
    } else if (event.name === "q") {
      process.exit(0)
    } else if (event.name === "p") {
      setModalOpen(!modalOpen())
    } else if (event.name === "escape") {
      setModalOpen(false)
    }
  })

  return (
    <box height="100%" backgroundColor={colors.bg1}>
      <box flexDirection="row" flexGrow={1}></box>

      <box backgroundColor={colors.bg2} paddingLeft={1} paddingRight={1}>
        <text fg={colors.fg1}>Exit: q | Command palette: p</text>
      </box>

      <Show when={modalOpen()}>
        <box
          position="absolute"
          width="100%"
          height="100%"
          backgroundColor={colors.overlay}
          alignItems="center"
          justifyContent="center"
        >
          <box
            backgroundColor={colors.bg2}
            paddingLeft={2}
            paddingRight={2}
            paddingTop={1}
            paddingBottom={1}
          >
            <text fg={colors.fg1}>Close: Esc | Toggle command palette: p</text>

            <box border={["top"]}></box>

            <For each={commands}>
              {(command, index) => (
                <box
                  paddingLeft={1}
                  paddingRight={1}
                  backgroundColor={
                    selectedCommand() === index() ?
                      colors.primary
                    : colors.transparent
                  }
                >
                  <text fg={colors.bg1}>{command.label}</text>
                </box>
              )}
            </For>
          </box>
        </box>
      </Show>
    </box>
  )
}
