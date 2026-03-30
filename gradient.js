// Animated gradient background — WebGL fragment shader
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

  const fsSource = `
    precision mediump float;
    varying vec2 vUv;
    uniform float iTime;
    uniform vec2 iResolution;

    // Simplex noise
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

    void main() {
      vec2 uv = vUv;
      float aspect = iResolution.x / iResolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = iTime * 0.08;

      // Soft slow-moving blobs using noise-driven positions
      // Blob 1 — deep blue/indigo
      vec2 b1 = vec2(
        aspect * 0.35 + sin(t * 0.7) * 0.25,
        0.6 + cos(t * 0.5) * 0.25
      );
      float d1 = length(p - b1);
      float g1 = exp(-d1 * d1 * 1.8);

      // Blob 2 — purple/violet
      vec2 b2 = vec2(
        aspect * 0.65 + cos(t * 0.6) * 0.3,
        0.35 + sin(t * 0.8) * 0.2
      );
      float d2 = length(p - b2);
      float g2 = exp(-d2 * d2 * 2.0);

      // Blob 3 — dark teal
      vec2 b3 = vec2(
        aspect * 0.5 + sin(t * 0.9 + 2.0) * 0.2,
        0.5 + cos(t * 0.4 + 1.0) * 0.3
      );
      float d3 = length(p - b3);
      float g3 = exp(-d3 * d3 * 2.2);

      // Blob 4 — accent blue (matches site accent)
      vec2 b4 = vec2(
        aspect * 0.3 + cos(t * 0.5 + 3.0) * 0.35,
        0.4 + sin(t * 0.7 + 2.0) * 0.25
      );
      float d4 = length(p - b4);
      float g4 = exp(-d4 * d4 * 2.5);

      // Color for each blob — visible but moody
      vec3 col1 = vec3(0.08, 0.12, 0.35) * g1;  // deep blue
      vec3 col2 = vec3(0.20, 0.06, 0.28) * g2;  // purple
      vec3 col3 = vec3(0.04, 0.14, 0.20) * g3;  // dark teal
      vec3 col4 = vec3(0.12, 0.16, 0.32) * g4;  // accent-ish blue

      // Add subtle noise distortion to make it organic
      float n = snoise(p * 1.5 + t * 0.3) * 0.02;

      vec3 col = col1 + col2 + col3 + col4 + n;

      // Vignette — darken edges
      float vig = 1.0 - 0.5 * length((uv - 0.5) * 2.0);
      vig = max(vig, 0.0);
      col *= vig;

      // Subtle grain
      float grain = fract(sin(dot(uv * iResolution.xy * 0.01 + iTime, vec2(12.9898, 78.233))) * 43758.5453);
      col += grain * 0.015;

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
