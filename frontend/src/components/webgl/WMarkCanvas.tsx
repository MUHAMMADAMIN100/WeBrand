'use client'

import { useEffect, useRef } from 'react'

/** The brand's "W", raymarched as an inflated glossy balloon letter.
 *
 *  Raw WebGL on purpose: the whole effect is one fragment shader (~5 KB), where
 *  three.js + a material would cost ~180 KB for the same picture. It is only
 *  ever mounted on devices that pass `useCapabilities().rich && .webgl`, and the
 *  chunk is lazy (see HeroVisual), so none of this is on the critical path.
 *
 *  The letter is four capsules in the logo's italic slant, blended with a
 *  smooth-min so the joints swell like a balloon. `uInflate` grows the tube
 *  radius from a hairline to full on mount — the same "gaining weight" move the
 *  headline makes with its font weight. */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uRot;      // x: yaw, y: pitch (radians)
uniform float uInflate;  // 0..1

const vec3 BLUE = vec3(0.169, 0.369, 0.827); // #2B5ED3
const vec3 LIME = vec3(0.784, 0.945, 0.208); // #C8F135

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float capsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float map(vec3 p) {
  p.xz *= rot(uRot.x);
  p.yz *= rot(uRot.y);
  p.x -= p.y * 0.2; // the logo's italic slant

  float r = mix(0.03, 0.25, uInflate);
  float k = mix(0.02, 0.16, uInflate);

  vec3 a = vec3(-1.08,  0.64, 0.0);
  vec3 b = vec3(-0.56, -0.64, 0.0);
  vec3 c = vec3( 0.00,  0.36, 0.0);
  vec3 d = vec3( 0.56, -0.64, 0.0);
  vec3 e = vec3( 1.08,  0.64, 0.0);

  float w = capsule(p, a, b, r);
  w = smin(w, capsule(p, b, c, r), k);
  w = smin(w, capsule(p, c, d, r), k);
  w = smin(w, capsule(p, d, e, r), k);
  return w;
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0012;
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

float occlusion(vec3 p, vec3 n) {
  float occ = 0.0, scale = 1.0;
  for (int i = 0; i < 4; i++) {
    float h = 0.02 + 0.11 * float(i);
    occ += (h - map(p + n * h)) * scale;
    scale *= 0.7;
  }
  return clamp(1.0 - 1.6 * occ, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);

  vec3 ro = vec3(0.0, 0.0, 4.4);
  vec3 rd = normalize(vec3(uv, -3.3)); // long lens: the letter fills the frame, little distortion

  // Bounding sphere: most pixels never enter the march loop.
  float bb = dot(ro, rd);
  float cc = dot(ro, ro) - 3.1;
  float disc = bb * bb - cc;
  if (disc < 0.0) { gl_FragColor = vec4(0.0); return; }
  float t = max(-bb - sqrt(disc), 0.0);
  float tFar = -bb + sqrt(disc);

  float minD = 1e3;
  bool hit = false;
  for (int i = 0; i < 80; i++) {
    float dist = map(ro + rd * t);
    minD = min(minD, dist);
    if (dist < 0.0012) { hit = true; break; }
    // Near the surface take short steps: the silhouette's antialiasing is built
    // from the closest approach, and coarse steps sample it as a dotted line.
    t += dist * (dist < 0.09 ? 0.45 : 0.92);
    if (t > tFar) break;
  }

  float px = 2.0 / min(uRes.x, uRes.y);
  if (!hit) {
    // Soft silhouette edge from the closest approach — cheap antialiasing.
    float a = 1.0 - smoothstep(0.0, px * 2.4, minD);
    gl_FragColor = vec4(BLUE * 0.8 * a, a);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 n = normalAt(p);
  vec3 v = -rd;

  vec3 keyDir = normalize(vec3(-0.55, 0.85, 0.65));
  vec3 rimDir = normalize(vec3(0.95, 0.15, -0.4));

  float wrap = dot(n, keyDir) * 0.5 + 0.5;
  float ao = occlusion(p, n);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);

  // Studio environment, faked from the reflection vector: a bright ceiling
  // fading to a deep blue floor, plus one long softbox for the wet highlight.
  vec3 rf = reflect(rd, n);
  float sky = smoothstep(-0.35, 0.95, rf.y);
  vec3 env = mix(vec3(0.03, 0.07, 0.24), vec3(0.86, 0.93, 1.0), sky);
  float softbox = smoothstep(0.52, 0.8, rf.y) * (1.0 - smoothstep(0.15, 0.85, abs(rf.x + 0.15)));

  float spec = pow(max(dot(n, normalize(keyDir + v)), 0.0), 110.0);
  float rimSpec = pow(max(dot(n, normalize(rimDir + v)), 0.0), 28.0);
  float rimLit = pow(max(dot(n, rimDir), 0.0), 1.6);

  vec3 col = BLUE * (0.2 + 0.95 * wrap * wrap) * mix(0.55, 1.0, ao);
  col += env * (0.07 + 0.6 * fres);
  col += vec3(1.0) * (spec * 1.1 + softbox * 0.34);
  col += LIME * (rimSpec * 0.5 + rimLit * fres * 0.7);

  col = pow(clamp(col, 0.0, 1.0), vec3(0.92));
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('WMarkCanvas shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function WMarkCanvas({ onReady }: { onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    // One oversized triangle covers the viewport with no diagonal seam.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uRot = gl.getUniformLocation(program, 'uRot')
    const uInflate = gl.getUniformLocation(program, 'uInflate')

    // Resolution scale adapts down if the GPU cannot hold the frame budget.
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.round(width * dpr))
      const h = Math.max(1, Math.round(height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    let visible = true
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    viewObserver.observe(canvas)

    let raf = 0
    let start = 0
    let last = 0
    let slowFrames = 0
    let announced = false
    const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) {
        last = now
        return
      }
      if (!start) start = now
      const time = (now - start) / 1000
      const delta = last ? now - last : 16
      last = now

      // Drop resolution after a sustained run of slow frames; never climb back
      // (that would oscillate). Two steps, then it is what it is.
      if (delta > 26) slowFrames++
      else slowFrames = Math.max(0, slowFrames - 1)
      if (slowFrames > 24 && dpr > 0.75) {
        dpr = dpr > 1 ? 1 : 0.75
        slowFrames = 0
        resize()
      }

      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      const intro = easeOutExpo(Math.min(time / 1.9, 1))
      const yaw = (1 - intro) * -1.5 + pointer.x * 0.55 + Math.sin(time * 0.55) * 0.12
      const pitch = pointer.y * 0.3 + Math.cos(time * 0.4) * 0.06 - 0.08

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, time)
      gl.uniform2f(uRot, yaw, pitch)
      gl.uniform1f(uInflate, intro)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!announced) {
        announced = true
        onReady?.()
      }
    }
    raf = requestAnimationFrame(frame)

    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', onLost)
      window.removeEventListener('pointermove', onPointer)
      resizeObserver.disconnect()
      viewObserver.disconnect()
      // Free what this effect allocated, but do NOT lose the context: a canvas
      // hands back the same context object for its whole life, and React's
      // StrictMode re-runs this effect on the same element — a lost context
      // would make the second run fail to compile its shaders.
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [onReady])

  return <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
}
