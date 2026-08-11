import { useEffect, type RefObject } from "react"
import { resolveCssColor } from "@/lib/resolveCssColor"

export interface UseShaderCanvasOptions {
  /** GLSL ES 3.00 fragment shader source. Receives `uniform float u_time`,
   * `uniform vec2 u_resolution`, and `uniform vec3 u_color0..u_color{N-1}`
   * (one per entry in `colorVars`, in order). Pass a module-level constant —
   * both this and `colorVars` are effect dependencies, so an inline literal
   * would recompile the shader every render. */
  fragmentShader: string
  /** CSS custom-property names (e.g. "--modern-shader-color-1") sampled once
   * per mount/resize and resolved to RGB for the shader's color uniforms. */
  colorVars: string[]
}

const VERTEX_SHADER = `#version 300 es
const vec2 positions[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[useShaderCanvas] shader compile error:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, fragmentSource: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  if (!vertexShader || !fragmentShader) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[useShaderCanvas] program link error:", gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/**
 * Wires a `<canvas>` up to a compiled fragment shader animated over time —
 * a fullscreen triangle, `u_time`/`u_resolution`/`u_color0..N` uniforms,
 * resize-aware, `prefers-reduced-motion`-aware (renders one static frame
 * instead of animating), and no-ops silently if WebGL2 isn't available.
 */
export function useShaderCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { fragmentShader, colorVars }: UseShaderCanvasOptions,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2")
    if (!gl) return

    const program = createProgram(gl, fragmentShader)
    if (!program) return

    gl.useProgram(program)
    const timeLoc = gl.getUniformLocation(program, "u_time")
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution")
    const colorLocs = colorVars.map((_, i) => gl.getUniformLocation(program, `u_color${i}`))

    const colors = colorVars.map((name) => {
      const [r, g, b] = resolveCssColor(getComputedStyle(canvas).getPropertyValue(name).trim())
      return [r / 255, g / 255, b / 255] as const
    })
    colorLocs.forEach((loc, i) => {
      if (loc) gl.uniform3f(loc, ...colors[i])
    })

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth, clientHeight } = canvas!
      const width = Math.max(1, Math.round(clientWidth * dpr))
      const height = Math.max(1, Math.round(clientHeight * dpr))
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width
        canvas!.height = height
        gl!.viewport(0, 0, width, height)
      }
      if (resolutionLoc) gl!.uniform2f(resolutionLoc, width, height)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let rafId = 0

    function render(timeMs: number) {
      if (timeLoc) gl!.uniform1f(timeLoc, timeMs / 1000)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      if (!reduceMotion) rafId = requestAnimationFrame(render)
    }
    render(0)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      gl.deleteProgram(program)
    }
  }, [canvasRef, fragmentShader, colorVars])
}
