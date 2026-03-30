// Animated Blur Gradient — Aurora style (12 orbs, heavy blur)
(function() {
  const container = document.querySelector('.gradient-bg');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 vUv;
    void main() {
      vUv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // 12 orbs, heavy gaussian blur, Aurora palette
  const fsSource = `
    precision mediump float;
    varying vec2 vUv;
    uniform float iTime;
    uniform vec2 iResolution;

    // Simplex noise for organic movement
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Soft orb — large gaussian with heavy blur (blur ≈ 116)
    float orb(vec2 p, vec2 center, float size) {
      float d = length(p - center);
      return exp(-d * d / (size * size));
    }

    void main() {
      vec2 uv = vUv;
      float aspect = iResolution.x / iResolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = iTime * 0.12; // faster — orbs visibly drifting

      // Noise offsets for organic drift
      float n1 = snoise(vec2(t * 0.3, 0.0));
      float n2 = snoise(vec2(0.0, t * 0.3));

      // ── 12 Aurora orbs — darker palette, wider movement ──
      // Deep indigo
      vec3 c1 = vec3(0.03, 0.02, 0.14);
      vec2 p1 = vec2(aspect * 0.2 + sin(t * 0.7) * 0.45, 0.8 + cos(t * 0.5) * 0.35);
      float g1 = orb(p, p1, 0.5);

      // Dark plum
      vec3 c2 = vec3(0.10, 0.02, 0.16);
      vec2 p2 = vec2(aspect * 0.5 + cos(t * 0.6) * 0.4, 0.65 + sin(t * 0.8) * 0.35);
      float g2 = orb(p, p2, 0.55);

      // Navy
      vec3 c3 = vec3(0.02, 0.05, 0.18);
      vec2 p3 = vec2(aspect * 0.75 + sin(t * 0.9 + 1.5) * 0.35, 0.3 + cos(t * 0.4) * 0.4);
      float g3 = orb(p, p3, 0.45);

      // Dark teal
      vec3 c4 = vec3(0.01, 0.08, 0.10);
      vec2 p4 = vec2(aspect * 0.85 + cos(t * 0.5 + 2.0) * 0.35, 0.7 + sin(t * 0.6 + 1.0) * 0.35);
      float g4 = orb(p, p4, 0.45);

      // Deep violet
      vec3 c5 = vec3(0.08, 0.01, 0.14);
      vec2 p5 = vec2(aspect * 0.35 + sin(t * 0.8 + 3.0) * 0.5, 0.25 + cos(t * 0.7 + 2.0) * 0.4);
      float g5 = orb(p, p5, 0.4);

      // Abyss blue
      vec3 c6 = vec3(0.02, 0.04, 0.16);
      vec2 p6 = vec2(aspect * 0.6 + cos(t * 0.4 + 1.0) * 0.45, 0.5 + sin(t * 0.5 + 3.0) * 0.45);
      float g6 = orb(p, p6, 0.55);

      // Blackberry
      vec3 c7 = vec3(0.09, 0.01, 0.11);
      vec2 p7 = vec2(aspect * 0.15 + sin(t * 0.6 + 4.0) * 0.4, 0.45 + cos(t * 0.9 + 1.5) * 0.4);
      float g7 = orb(p, p7, 0.38);

      // Deep ocean
      vec3 c8 = vec3(0.01, 0.06, 0.14);
      vec2 p8 = vec2(aspect * 0.9 + cos(t * 0.7 + 2.5) * 0.3, 0.15 + sin(t * 0.3 + 4.0) * 0.4);
      float g8 = orb(p, p8, 0.45);

      // Muted purple
      vec3 c9 = vec3(0.07, 0.03, 0.15);
      vec2 p9 = vec2(aspect * 0.45 + sin(t * 0.5 + 5.0) * 0.4, 0.85 + cos(t * 0.6 + 3.0) * 0.3);
      float g9 = orb(p, p9, 0.45);

      // Shadow teal
      vec3 c10 = vec3(0.01, 0.06, 0.08);
      vec2 p10 = vec2(aspect * 0.3 + cos(t * 0.8 + 1.0) * 0.45, 0.1 + sin(t * 0.7 + 5.0) * 0.35);
      float g10 = orb(p, p10, 0.4);

      // Midnight
      vec3 c11 = vec3(0.02, 0.03, 0.12);
      vec2 p11 = vec2(aspect * 0.7 + sin(t * 0.3 + 6.0) * 0.35, 0.9 + cos(t * 0.5 + 4.0) * 0.3);
      float g11 = orb(p, p11, 0.5);

      // Dark wine
      vec3 c12 = vec3(0.10, 0.02, 0.10);
      vec2 p12 = vec2(aspect * 0.55 + cos(t * 0.9 + 3.5) * 0.4, 0.4 + sin(t * 0.4 + 6.0) * 0.45);
      float g12 = orb(p, p12, 0.42);

      // Combine all orbs
      vec3 col = vec3(0.0);
      col += c1 * g1;
      col += c2 * g2;
      col += c3 * g3;
      col += c4 * g4;
      col += c5 * g5;
      col += c6 * g6;
      col += c7 * g7;
      col += c8 * g8;
      col += c9 * g9;
      col += c10 * g10;
      col += c11 * g11;
      col += c12 * g12;

      // Subtle noise distortion for organic feel
      float n = snoise(p * 1.2 + t * 0.5) * 0.015;
      col += n;

      // Gentle boost — keep it moody
      col *= 1.3;

      // Soft vignette
      float vig = 1.0 - 0.4 * pow(length((uv - 0.5) * 1.8), 2.0);
      col *= max(vig, 0.0);

      // Very subtle film grain
      float grain = fract(sin(dot(uv * iResolution.xy * 0.01 + iTime, vec2(12.9898, 78.233))) * 43758.5453);
      col += grain * 0.012;

      // Dark base tint so background never goes pure black
      col += vec3(0.02, 0.02, 0.05);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'iTime');
  const uRes = gl.getUniformLocation(program, 'iResolution');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  resize();

  const startTime = performance.now();

  function render() {
    const t = (performance.now() - startTime) * 0.001;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  render();
})();
