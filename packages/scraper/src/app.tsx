import { useKeyboard, useRenderer } from "@opentui/solid"

export const App = () => {
  const renderer = useRenderer()

  useKeyboard((event) => {
    if (event.name === "f12") {
      renderer.console.toggle()
    }
  })

  return (
    <box height="100%" border>
      <box flexDirection="row" flexGrow={1}>
        <box border width="50%">
          <text>asd</text>
        </box>
        <box border width="50%"></box>
      </box>
      <box border></box>
    </box>
  )
}
