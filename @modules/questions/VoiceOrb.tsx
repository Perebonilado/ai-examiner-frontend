import React, { FC, useEffect, useRef, useState } from "react";
import cn from "classnames";

/* The examiner's voice orb (WebGL): a shaded sphere with domain-warped light flowing over it,
   a glassy rim and a soft halo. Same shader as the approved mockup (redesign/mockups/assets/orb.js).
   `level` (0–1) drives how lively it is; without it the level is simulated per state. */

export type VoiceOrbState = "idle" | "speaking" | "listening";

interface Props {
  state: VoiceOrbState;
  level?: number;
  className?: string;
}

const MODE: Record<VoiceOrbState, number> = { idle: 0, speaking: 1, listening: 2 };
const REST_LEVEL: Record<VoiceOrbState, number> = { idle: 0.06, speaking: 0.55, listening: 0.25 };

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform float u_level; uniform float u_mode;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float a=0.6, s=0.0; for(int i=0;i<2;i++){ s+=a*snoise(p); p=p*1.9+vec3(1.3,-0.7,0.4); a*=0.45; } return s; }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c); }
void main(){
  float px = 1.0/(0.5*min(u_res.x,u_res.y));
  vec2 uv = (gl_FragCoord.xy-0.5*u_res)*px;
  float t = u_time;
  float lvl = u_level;
  float R = 0.58*(1.0+0.045*lvl);
  float r = length(uv);
  vec3 ink    = vec3(0.10,0.04,0.30);
  vec3 violet = vec3(0.43,0.17,0.92);
  vec3 lilac  = vec3(0.76,0.68,1.00);
  vec3 rose   = vec3(0.96,0.60,0.93);
  vec3 sky    = vec3(0.52,0.76,1.00);
  float listening = step(1.5,u_mode);
  float idle = 1.0-step(0.5,u_mode);
  vec3 col = vec3(0.0); float a = 0.0;
  if (r < R+2.0*px) {
    vec2 p = uv/R;
    float z = sqrt(max(1.0-dot(p,p),0.0));
    vec3 n = vec3(p,z);
    vec3 q = rotY(t*0.10)*rotX(0.30+0.06*sin(t*0.15))*n;
    float sp = 0.07+0.22*lvl;
    vec3 w = q*0.62+vec3(0.0,0.0,t*sp);
    vec3 warp = vec3(fbm(w*0.8+vec3(1.7,9.2,0.21*t)), fbm(w*0.8+vec3(8.3,2.8,-0.19*t)), fbm(w*0.8+vec3(3.1,5.4,0.15*t)));
    float f = fbm(w+1.05*warp);
    float g = fbm(w*0.9-0.8*warp+vec3(0.0,0.12*t,0.0));
    vec3 white = vec3(0.98,0.96,1.0);
    vec3 deep  = vec3(0.30,0.12,0.78);
    vec3 c = mix(violet, lilac, smoothstep(-0.55,0.55,f));
    c = mix(c, white, smoothstep(0.15,0.85,f)*0.7);
    c = mix(c, white, smoothstep(0.9,0.0,length(p-vec2(-0.15,0.2)))*0.18);
    c = mix(c, deep, smoothstep(-0.15,-0.75,f)*0.85);
    c = mix(c, rose, smoothstep(0.05,0.65,g)*(0.42-0.22*listening));
    c = mix(c, sky, smoothstep(0.05,0.65,-g)*(0.30+0.40*listening));
    vec3 L = normalize(vec3(-0.5,0.6,0.65));
    float diff = clamp(dot(n,L),0.0,1.0);
    c *= 0.80+0.30*diff;
    c = mix(c, deep, smoothstep(0.35,1.05,dot(p,vec2(0.45,-0.75)))*0.35);
    float fres = pow(1.0-z,2.6);
    c = mix(c, mix(vec3(0.86,0.80,1.0), vec3(0.78,0.88,1.0), listening), fres*0.75);
    vec3 H = normalize(L+vec3(0.0,0.0,1.0));
    c += pow(clamp(dot(n,H),0.0,1.0),80.0)*0.30;
    c += smoothstep(0.55,0.0,length(p-vec2(-0.30,0.40)))*0.08;
    c = mix(c, vec3(dot(c,vec3(0.33))), idle*0.15);
    a = 1.0-smoothstep(R-1.5*px, R+0.5*px, r);
    col = c*a;
  }
  float win = 1.0-smoothstep(0.72,0.97,r);
  float halo = exp(-max(r-R,0.0)*8.0)*(0.16+0.30*lvl)*(1.0-a)*win;
  float pulse = exp(-abs(r-(R+0.05+0.08*fract(t*0.45)))*60.0)*(0.10*lvl)*(1.0-a)*win;
  vec3 haloCol = mix(vec3(0.49,0.30,0.96), vec3(0.42,0.56,0.98), listening);
  col += haloCol*(halo+pulse)*0.85;
  a += (halo+pulse)*0.85;
  gl_FragColor = vec4(col, clamp(a,0.0,1.0));
}`;

/* Simulated loudness when no real level is passed (same envelope as the mockup). */
const simulatedLevel = (t: number, mode: number) => {
  if (mode === 1) {
    const v =
      0.48 +
      0.26 * Math.sin(t * 6.3) * Math.sin(t * 1.7) +
      0.14 * Math.sin(t * 11.9 + 1.3) +
      0.08 * Math.sin(t * 2.9);
    return Math.min(1, Math.max(0.12, v));
  }
  if (mode === 2) return 0.22 + 0.12 * Math.sin(t * 2.1) * Math.sin(t * 0.7 + 0.4);
  return 0.06;
};

const VoiceOrb: FC<Props> = ({ state, level, className }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const levelRef = useRef<number | undefined>(level);
  const redrawRef = useRef<(() => void) | null>(null);
  const [hasGL, setHasGL] = useState(true);

  stateRef.current = state;
  levelRef.current = level;

  // With reduced motion the orb is drawn once per change instead of animating.
  useEffect(() => {
    redrawRef.current?.();
  }, [state, level]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A fresh canvas per mount: a context lost in cleanup can't be reused on the same element.
    const canvas = document.createElement("canvas");
    canvas.className = "absolute left-[-35%] top-[-35%] w-[170%] h-[170%] pointer-events-none";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        premultipliedAlpha: true,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.remove();
      setHasGL(false);
      return;
    }
    const ctx = gl;

    const shaders: WebGLShader[] = [];
    const compile = (type: number, src: string) => {
      const s = ctx.createShader(type);
      if (!s) throw new Error("orb: createShader failed");
      ctx.shaderSource(s, src);
      ctx.compileShader(s);
      shaders.push(s);
      if (!ctx.getShaderParameter(s, ctx.COMPILE_STATUS)) throw new Error(ctx.getShaderInfoLog(s) || "orb: shader");
      return s;
    };

    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    const release = () => {
      if (buf) ctx.deleteBuffer(buf);
      if (prog) ctx.deleteProgram(prog);
      shaders.forEach((s) => ctx.deleteShader(s));
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };

    try {
      prog = ctx.createProgram();
      if (!prog) throw new Error("orb: createProgram failed");
      ctx.attachShader(prog, compile(ctx.VERTEX_SHADER, VERT));
      ctx.attachShader(prog, compile(ctx.FRAGMENT_SHADER, FRAG));
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) throw new Error(ctx.getProgramInfoLog(prog) || "orb: link");
    } catch (e) {
      console.warn("VoiceOrb: WebGL unavailable", e);
      release();
      setHasGL(false);
      return;
    }

    ctx.useProgram(prog);
    buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), ctx.STATIC_DRAW);
    const loc = ctx.getAttribLocation(prog, "p");
    ctx.enableVertexAttribArray(loc);
    ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
    const uRes = ctx.getUniformLocation(prog, "u_res");
    const uTime = ctx.getUniformLocation(prog, "u_time");
    const uLevel = ctx.getUniformLocation(prog, "u_level");
    const uMode = ctx.getUniformLocation(prog, "u_mode");
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = motionQuery.matches;
    let raf: number | null = null;
    let current = 0.4;
    const t0 = performance.now();
    let last = t0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (now: number) => {
      resize();
      const t = (now - t0) / 1000 + 7.0;
      const mode = MODE[stateRef.current];
      const given = levelRef.current;
      if (reduce) {
        current = given != null ? given : REST_LEVEL[stateRef.current];
      } else {
        const dt = Math.min(0.05, (now - last) / 1000);
        const target = given != null ? Math.min(1, Math.max(0, given)) : simulatedLevel(t, mode);
        current += (target - current) * Math.min(1, dt * 9);
      }
      last = now;
      ctx.clearColor(0, 0, 0, 0);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.uniform2f(uRes, canvas.width, canvas.height);
      ctx.uniform1f(uTime, t);
      ctx.uniform1f(uLevel, current);
      ctx.uniform1f(uMode, mode);
      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now: number) => {
      render(now);
      raf = reduce ? null : requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    redrawRef.current = () => {
      if (reduce) start();
    };
    const onMotionChange = () => {
      reduce = motionQuery.matches;
      start();
    };
    motionQuery.addEventListener?.("change", onMotionChange);

    // Redraw the still frame when the orb changes size (e.g. crossing the phone breakpoint).
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => reduce && start()) : null;
    observer?.observe(canvas);

    start();

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
      redrawRef.current = null;
      motionQuery.removeEventListener?.("change", onMotionChange);
      observer?.disconnect();
      release();
    };
  }, []);

  return (
    <div ref={hostRef} className={cn("relative shrink-0", className)} aria-hidden="true">
      {!hasGL && <span className="absolute inset-0 rounded-full bg-accent" />}
    </div>
  );
};

export default VoiceOrb;
