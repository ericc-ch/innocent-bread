# OpenTUI Renderables Guide

This guide covers how to create, customize, and extend renderables in OpenTUI for advanced graphics rendering, including custom images, physics engines, pixel manipulation, and native extensions.

## Table of Contents

1. [Understanding Renderables](#understanding-renderables)
2. [Core Renderable Types](#core-renderable-types)
3. [Custom Rendering with FrameBuffers](#custom-rendering-with-framebuffers)
4. [Working with Images and Sprites](#working-with-images-and-sprites)
5. [3D Graphics and Shaders](#3d-graphics-and-shaders)
6. [Physics Integration](#physics-integration)
7. [Pixel Manipulation](#pixel-manipulation)
8. [Extending in React](#extending-in-react)
9. [Native Extensions](#native-extensions)
10. [Performance Optimization](#performance-optimization)

## Understanding Renderables

Renderables are the fundamental building blocks of OpenTUI applications. They represent visual elements that can be positioned, sized, and rendered on the terminal. Every renderable extends the base `Renderable` class and participates in a layout system based on Yoga Layout.

### Basic Renderable Structure

```typescript
import { Renderable, type RenderContext, type RenderableOptions } from "@opentui/core"

class CustomRenderable extends Renderable {
  constructor(ctx: RenderContext, options: RenderableOptions<CustomRenderable>) {
    super(ctx, options)
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    // Custom rendering logic here
  }
}
```

### Key Properties

- **Layout**: Position, size, flexbox properties via Yoga Layout
- **Rendering**: Custom drawing via `renderSelf()` method
- **Events**: Mouse, keyboard, and lifecycle events
- **Hierarchy**: Parent-child relationships for composition
- **Buffering**: Optional frame buffering for performance

## Core Renderable Types

### BoxRenderable

The most common container renderable with layout capabilities:

```typescript
import { BoxRenderable, TextRenderable } from "@opentui/core"

const box = new BoxRenderable(renderer, {
  width: 20,
  height: 10,
  border: true,
  backgroundColor: RGBA.fromInts(50, 50, 100),
  padding: 1,
  flexDirection: "column",
})

box.add(
  new TextRenderable(renderer, {
    content: "Hello World",
    fg: RGBA.fromInts(255, 255, 255),
  }),
)
```

### TextRenderable

For rendering text with styling:

```typescript
const text = new TextRenderable(renderer, {
  content: "Styled Text",
  fg: RGBA.fromInts(255, 100, 100),
  bg: RGBA.fromInts(0, 0, 0),
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
})
```

### FrameBufferRenderable

For custom pixel-level rendering:

```typescript
const framebuffer = new FrameBufferRenderable(renderer, {
  width: 40,
  height: 20,
  respectAlpha: true,
})

// Access the underlying buffer for custom drawing
const buffer = framebuffer.frameBuffer
buffer.fillRect(0, 0, 40, 20, RGBA.fromInts(20, 20, 40))
buffer.drawText("Custom Graphics", 5, 5, RGBA.fromInts(255, 255, 255))
```

## Custom Rendering with FrameBuffers

FrameBuffers give you direct access to pixel-level rendering capabilities. They're perfect for custom graphics, games, and complex visualizations.

### Creating Custom Graphics

```typescript
import { FrameBufferRenderable, RGBA } from "@opentui/core"

class CustomGraphicsRenderable extends FrameBufferRenderable {
  private time: number = 0

  constructor(ctx: RenderContext, options: any) {
    super(ctx, options)
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    this.time += deltaTime / 1000

    // Clear with animated background
    const hue = (this.time * 50) % 360
    const bgColor = RGBA.fromInts(
      Math.floor(128 + 127 * Math.sin((hue * Math.PI) / 180)),
      Math.floor(128 + 127 * Math.sin(((hue + 120) * Math.PI) / 180)),
      Math.floor(128 + 127 * Math.sin(((hue + 240) * Math.PI) / 180)),
    )

    this.frameBuffer.clear(bgColor)

    // Draw animated shapes
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(((Math.sin(this.time + i) + 1) * this.width) / 2)
      const y = Math.floor(((Math.cos(this.time + i) + 1) * this.height) / 2)
      const color = RGBA.fromInts(255, i * 25, 255 - i * 25)

      this.frameBuffer.drawText("●", x, y, color)
    }
  }
}
```

### Advanced Buffer Operations

```typescript
// Partial drawing from another buffer
sourceBuffer.drawFrameBuffer(destX, destY, sourceBuffer, sourceX, sourceY, width, height)

// Alpha blending
buffer.setCellWithAlphaBlending(x, y, "█", fgColor, bgColor, attributes)

// Text with selection
buffer.drawText("Selected text", x, y, fgColor, bgColor, attributes, {
  start: 5,
  end: 10,
  bgColor: RGBA.fromInts(100, 100, 255),
})
```

## Working with Images and Sprites

OpenTUI supports loading and rendering images through Three.js integration and sprite utilities.

### Loading Static Images

```typescript
import { SpriteUtils } from "@opentui/core/3d/SpriteUtils"
import { ThreeCliRenderer } from "@opentui/core/3d/WGPURenderer"

// Load a sprite from file
const sprite = await SpriteUtils.fromFile("./assets/character.png", {
  materialParameters: {
    alphaTest: 0.1,
    depthWrite: false,
  },
})

// Position and scale the sprite
sprite.position.set(x, y, z)
sprite.scale.set(width, height, 1)
```

### Sprite Sheets for Animation

```typescript
import { SpriteUtils, SheetSprite } from "@opentui/core/3d/SpriteUtils"

// Load sprite sheet with multiple frames
const sprite = await SpriteUtils.sheetFromFile("./assets/walk.png", 8)

// Animate through frames
let frameIndex = 0
setInterval(() => {
  frameIndex = (frameIndex + 1) % 8
  sprite.setIndex(frameIndex)
}, 100)
```

### Texture Loading for 3D Objects

```typescript
import { TextureUtils } from "@opentui/core/3d/TextureUtils"

// Load texture for 3D materials
const texture = await TextureUtils.fromFile("./assets/crate.png")
const material = new MeshPhongNodeMaterial({
  map: texture,
  emissiveMap: await TextureUtils.fromFile("./assets/crate_emissive.png"),
  emissive: new Color(0.0, 0.0, 0.0),
  emissiveIntensity: 0.2,
})
```

## 3D Graphics and Shaders

OpenTUI integrates Three.js for advanced 3D graphics rendering in the terminal.

### Setting up 3D Scene

```typescript
import { ThreeCliRenderer } from "@opentui/core/3d/WGPURenderer"
import { Scene, PerspectiveCamera, BoxGeometry, MeshPhongNodeMaterial } from "three"

const engine = new ThreeCliRenderer(renderer, {
  width: terminalWidth,
  height: terminalHeight,
  focalLength: 8,
  backgroundColor: RGBA.fromValues(0.1, 0.1, 0.2, 1.0),
})

await engine.init()

const scene = new Scene()
const camera = new PerspectiveCamera(45, engine.aspectRatio, 0.1, 1000)
camera.position.set(0, 0, 5)
engine.setActiveCamera(camera)
```

### Custom Shaders

```typescript
import { MeshBasicNodeMaterial, Fn, vec3, float, sin, cos } from "three/tsl"

const customMaterial = new MeshBasicNodeMaterial()

const shaderFunction = Fn(() => {
  const time = uniform(0.0)
  const position = screenCoordinate

  // Create animated pattern
  const r = sin(time + position.x * 10.0) * 0.5 + 0.5
  const g = cos(time + position.y * 10.0) * 0.5 + 0.5
  const b = sin(time * 2.0) * 0.5 + 0.5

  return vec3(r, g, b)
})()

customMaterial.colorNode = shaderFunction
```

### Rendering 3D Objects

```typescript
// In your frame callback
renderer.setFrameCallback(async (deltaTime: number) => {
  // Update animations
  mesh.rotation.x += deltaTime * 0.001
  mesh.rotation.y += deltaTime * 0.002

  // Render the scene to framebuffer
  await engine.drawScene(scene, framebuffer, deltaTime)
})
```

## Physics Integration

OpenTUI supports physics engines like Rapier.js for realistic physics simulations.

### Setting up Physics World

```typescript
import RAPIER from "@dimforge/rapier2d-simd-compat"
import { RapierPhysicsWorld } from "@opentui/core/3d/physics/RapierPhysicsAdapter"

await RAPIER.init()

const gravity = { x: 0.0, y: -9.81 }
const world = new RAPIER.World(gravity)

// Create ground
const groundColliderDesc = RAPIER.ColliderDesc.cuboid(15.0, 0.2)
const ground = world.createCollider(groundColliderDesc)
ground.setTranslation({ x: 0.0, y: -8.0 })
```

### Physics Objects with Sprites

```typescript
interface PhysicsBox {
  rigidBody: RAPIER.RigidBody
  sprite: TiledSprite
  width: number
  height: number
}

async function createPhysicsBox(x: number, y: number): Promise<PhysicsBox> {
  // Create physics body
  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y)
  const rigidBody = world.createRigidBody(rigidBodyDesc)

  const colliderDesc = RAPIER.ColliderDesc.cuboid(0.6, 0.6)
  world.createCollider(colliderDesc, rigidBody)

  // Create visual sprite
  const sprite = await spriteAnimator.createSprite(crateDef, materialFactory)
  sprite.setPosition(new THREE.Vector3(x, y, 0))

  return { rigidBody, sprite, width: 1.0, height: 1.0 }
}
```

### Physics Update Loop

```typescript
function updatePhysics(deltaTime: number): void {
  // Step physics simulation
  world.step()

  // Sync visual positions with physics
  for (const box of physicsBoxes) {
    const position = box.rigidBody.translation()
    const rotation = box.rigidBody.rotation()

    box.sprite.setPosition(new THREE.Vector3(position.x, position.y, 0))
    box.sprite.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotation))
  }
}
```

## Pixel Manipulation

OpenTUI provides direct access to terminal cell data for advanced pixel manipulation.

### Direct Buffer Access

```typescript
// Get raw buffer data
const buffers = framebuffer.buffers
const charData = buffers.char
const fgData = buffers.fg
const bgData = buffers.bg
const attrData = buffers.attributes

// Manipulate pixels directly
for (let y = 0; y < framebuffer.height; y++) {
  for (let x = 0; x < framebuffer.width; x++) {
    const index = y * framebuffer.width + x

    // Create gradient effect
    const intensity = (x + y) / (framebuffer.width + framebuffer.height)
    charData[index] = "█".charCodeAt(0)
    fgData[index * 4] = intensity * 255 // R
    fgData[index * 4 + 1] = intensity * 200 // G
    fgData[index * 4 + 2] = intensity * 150 // B
    fgData[index * 4 + 3] = 1.0 // A
  }
}
```

### Custom Drawing Algorithms

```typescript
class MandelbrotRenderable extends FrameBufferRenderable {
  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    const maxIterations = 100

    for (let py = 0; py < this.height; py++) {
      for (let px = 0; px < this.width; px++) {
        // Map pixel to complex plane
        const x0 = (px / this.width) * 3.5 - 2.5
        const y0 = (py / this.height) * 2.0 - 1.0

        let x = 0,
          y = 0
        let iteration = 0

        // Mandelbrot calculation
        while (x * x + y * y <= 4 && iteration < maxIterations) {
          const xtemp = x * x - y * y + x0
          y = 2 * x * y + y0
          x = xtemp
          iteration++
        }

        // Color based on iteration count
        if (iteration === maxIterations) {
          buffer.setCell(px, py, " ", RGBA.black(), RGBA.black())
        } else {
          const hue = (iteration / maxIterations) * 360
          const color = RGBA.fromInts(
            Math.floor(128 + 127 * Math.sin((hue * Math.PI) / 180)),
            Math.floor(128 + 127 * Math.sin(((hue + 120) * Math.PI) / 180)),
            Math.floor(128 + 127 * Math.sin(((hue + 240) * Math.PI) / 180)),
          )
          buffer.setCell(px, py, "▀", color, RGBA.black())
        }
      }
    }
  }
}
```

## Extending in React

OpenTUI React provides seamless integration with custom renderables through the `extend` function.

### Creating Custom React Components

```tsx
import { extend } from "@opentui/react"
import { BoxRenderable, OptimizedBuffer, RGBA, type RenderContext } from "@opentui/core"

class CustomButton extends BoxRenderable {
  public label: string = "Button"
  public isPressed: boolean = false

  constructor(ctx: RenderContext, options: any) {
    super(ctx, options)
    this.height = 3
    this.width = Math.max(this.label.length + 4, 10)
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)

    const bgColor = this.isPressed ? RGBA.fromInts(100, 100, 200) : RGBA.fromInts(50, 50, 150)

    const textColor = RGBA.fromInts(255, 255, 255)
    const centerX = Math.floor(this.width / 2 - this.label.length / 2)
    const centerY = Math.floor(this.height / 2)

    buffer.fillRect(0, 0, this.width, this.height, bgColor)
    buffer.drawText(this.label, centerX, centerY, textColor)
  }

  public press(): void {
    this.isPressed = true
    this.requestRender()
    setTimeout(() => {
      this.isPressed = false
      this.requestRender()
    }, 100)
  }
}

// Declare the component type
declare module "@opentui/react" {
  interface OpenTUIComponents {
    customButton: typeof CustomButton
  }
}

// Extend the component catalog
extend({
  customButton: CustomButton,
})
```

### Using Custom Components in JSX

```tsx
function App() {
  return (
    <box flexDirection="column" padding={2}>
      <text content="Custom Components Demo" attributes={1} />
      <customButton label="Click Me!" onMouseDown={() => console.log("Button pressed!")} />
      <customButton label="Another Button" label="Styled Button" backgroundColor="blue" />
    </box>
  )
}
```

### Advanced React Extensions

```tsx
class ParticleSystem extends BoxRenderable {
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = []

  constructor(ctx: RenderContext, options: any) {
    super(ctx, options)
    this.buffered = true // Enable frame buffering
  }

  protected onUpdate(deltaTime: number): void {
    // Update particle physics
    this.particles = this.particles.filter((p) => {
      p.x += (p.vx * deltaTime) / 1000
      p.y += (p.vy * deltaTime) / 1000
      p.life -= deltaTime / 1000
      return p.life > 0
    })

    // Spawn new particles
    if (Math.random() < 0.1) {
      this.particles.push({
        x: this.width / 2,
        y: this.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 2.0,
      })
    }
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    buffer.clear(RGBA.fromInts(0, 0, 0, 0))

    this.particles.forEach((p) => {
      const intensity = Math.floor(p.life * 255)
      const color = RGBA.fromInts(intensity, intensity, intensity)
      buffer.setCell(Math.floor(p.x), Math.floor(p.y), "•", color)
    })
  }
}
```

## Native Extensions

For maximum performance, you can extend OpenTUI with native code through Zig.

### Creating Native Renderables

```zig
// In your Zig file
const std = @import("std");
const opentui = @import("opentui");

pub const CustomNativeRenderable = struct {
    renderable: opentui.Renderable,
    custom_data: f32,

    pub fn init(ctx: opentui.RenderContext, options: opentui.RenderableOptions) !*@This() {
        const self = try opentui.allocator.create(@This());
        self.* = .{
            .renderable = opentui.Renderable.init(ctx, options),
            .custom_data = 0.0,
        };
        return self;
    }

    pub fn renderSelf(self: *@This(), buffer: opentui.OptimizedBuffer, deltaTime: f32) void {
        // Native rendering logic
        self.custom_data += deltaTime * 0.001;

        // Use native buffer operations
        buffer.clear(opentui.RGBA.init(0.1, 0.1, 0.2, 1.0));

        // Draw custom pattern
        var x: usize = 0;
        while (x < buffer.width) : (x += 1) {
            const y = @as(usize, @intFromFloat(@sin(self.custom_data + @as(f32, @floatFromInt(x)) * 0.1) * 10.0 + @as(f32, @floatFromInt(buffer.height)) * 0.5));
            if (y < buffer.height) {
                buffer.setCell(x, y, "█", opentui.RGBA.init(1.0, 1.0, 1.0, 1.0), opentui.RGBA.init(0.0, 0.0, 0.0, 0.0));
            }
        }
    }
};
```

### Binding Native Code to TypeScript

```typescript
// TypeScript binding
import { resolveRenderLib } from "@opentui/core/zig"

const lib = resolveRenderLib()

export class NativeRenderable extends Renderable {
  private nativePtr: any

  constructor(ctx: RenderContext, options: RenderableOptions) {
    super(ctx, options)
    this.nativePtr = lib.createCustomNativeRenderable(ctx, options)
  }

  protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void {
    lib.customNativeRenderSelf(this.nativePtr, buffer.ptr, deltaTime)
  }

  protected destroySelf(): void {
    lib.destroyCustomNativeRenderable(this.nativePtr)
    super.destroySelf()
  }
}
```

## Performance Optimization

### Buffer Management

```typescript
// Reuse buffers when possible
class EfficientRenderable extends FrameBufferRenderable {
  private static bufferPool: OptimizedBuffer[] = []

  protected createFrameBuffer(): void {
    // Try to reuse from pool
    const pooled = EfficientRenderable.bufferPool.pop()
    if (pooled && pooled.width === this.width && pooled.height === this.height) {
      this.frameBuffer = pooled
      return
    }

    // Create new buffer
    super.createFrameBuffer()
  }

  protected destroySelf(): void {
    // Return to pool instead of destroying
    if (this.frameBuffer && EfficientRenderable.bufferPool.length < 10) {
      EfficientRenderable.bufferPool.push(this.frameBuffer)
      this.frameBuffer = null
    }
    super.destroySelf()
  }
}
```

### Partial Updates

```typescript
// Only update changed regions
class OptimizedRenderable extends FrameBufferRenderable {
  private dirtyRegions: Array<{ x: number; y: number; width: number; height: number }> = []

  public markDirtyRegion(x: number, y: number, width: number, height: number): void {
    this.dirtyRegions.push({ x, y, width, height })
    this.requestRender()
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    // Only clear and redraw dirty regions
    for (const region of this.dirtyRegions) {
      buffer.fillRect(region.x, region.y, region.width, region.height, RGBA.black())
      // Redraw content in this region...
    }

    this.dirtyRegions = []
  }
}
```

### Batching Operations

```typescript
// Batch buffer operations for better performance
class BatchRenderable extends FrameBufferRenderable {
  private drawCommands: Array<() => void> = []

  public queueDraw(operation: () => void): void {
    this.drawCommands.push(operation)
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    // Execute all queued operations
    for (const command of this.drawCommands) {
      command()
    }

    this.drawCommands = []
  }
}
```

## Best Practices

1. **Use Frame Buffers for Complex Graphics**: When you need custom drawing, use `FrameBufferRenderable` for direct pixel access.

2. **Leverage Three.js for 3D**: For 3D graphics, use the integrated Three.js renderer rather than implementing 3D from scratch.

3. **Pool Resources**: Reuse buffers, textures, and other resources to avoid allocation overhead.

4. **Optimize Update Regions**: Only redraw areas that have changed to minimize rendering work.

5. **Use Native Extensions for Performance**: For computationally intensive operations, consider native Zig extensions.

6. **Profile Your Code**: Use the built-in performance monitoring tools to identify bottlenecks.

7. **Consider React Integration**: For UI-heavy applications, use the React integration for better component organization.

8. **Handle Resizing Gracefully**: Always implement proper resize handling for responsive designs.

9. **Manage Memory**: Properly destroy renderables and buffers when they're no longer needed.

10. **Use Appropriate Data Structures**: Choose the right data structures for your use case (arrays for sequential access, maps for lookups, etc.).

This comprehensive guide should help you create advanced, high-performance terminal applications with OpenTUI. The combination of flexible renderables, Three.js integration, physics support, and native extensions provides a powerful platform for creating sophisticated terminal-based applications.
