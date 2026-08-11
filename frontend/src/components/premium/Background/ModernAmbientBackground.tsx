import { useRef } from "react"
import { useShaderCanvas } from "@/hooks/useShaderCanvas"

// Layered sine-wave flow bands blending three colors, darkening to a
// vignette at the edges. Cheap — no noise textures or loops — and bold by
// construction since the three colors are Modern's saturated palette
// (styles/themes/modern.css: --modern-shader-color-1/2/3).
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float t = u_time * 0.15;

  float wave1 = sin(p.x * 2.2 + t * 1.3) * 0.5 + sin(p.y * 3.0 - t) * 0.5;
  float wave2 = sin((p.x + p.y) * 1.6 - t * 0.8) * 0.5 + 0.5;
  float mixAmt = smoothstep(-1.0, 1.0, wave1);

  vec3 base = mix(u_color2, u_color0, smoothstep(0.0, 1.0, uv.y + wave1 * 0.15));
  vec3 flow = mix(base, u_color1, mixAmt * wave2 * 0.6);

  float vignette = 1.0 - smoothstep(0.2, 1.3, length(p));
  vec3 color = mix(u_color2, flow, vignette);

  fragColor = vec4(color, 1.0);
}
`

const COLOR_VARS = ["--modern-shader-color-1", "--modern-shader-color-2", "--modern-shader-color-3"]

/** Modern's signature Hero visual — a live animated WebGL gradient, in place of Luxury's soft static glow. */
export function ModernAmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useShaderCanvas(canvasRef, { fragmentShader: FRAGMENT_SHADER, colorVars: COLOR_VARS })

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ background: "var(--background)" }}
      aria-hidden="true"
    />
  )
}
