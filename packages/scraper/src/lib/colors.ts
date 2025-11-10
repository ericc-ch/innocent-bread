import { RGBA } from "@opentui/core"

export const colors = {
  // Background colors (dark to light)
  bg1: RGBA.fromValues(0.12, 0.12, 0.12),
  bg2: RGBA.fromValues(0.2, 0.2, 0.2),
  bg3: RGBA.fromValues(0.31, 0.31, 0.31),

  // Foreground colors (light to dark)
  fg1: RGBA.fromValues(0.98, 0.98, 0.98),
  fg2: RGBA.fromValues(0.78, 0.78, 0.78),
  fg3: RGBA.fromValues(0.59, 0.59, 0.59),

  // Primary (accent)
  primary: RGBA.fromValues(0.71, 0.71, 0.71),

  // Secondary (subtle accent)
  secondary: RGBA.fromValues(0.47, 0.47, 0.47),

  // Overlay
  overlay: RGBA.fromValues(0, 0, 0, 0.2),

  transparent: RGBA.fromValues(0, 0, 0, 0),
}
