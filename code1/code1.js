const canvas = window.canvas;
const gl = canvas.getContext("webgl2");
const dpr = Math.max(0.5, 0.5 * window.devicePixelRatio);
/** @type {Map<string,PointerEvent>} */
const touches = new Map();

const vertexSource = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 position;

void main(void) {
    gl_Position = vec4(position, 0., 1.);
}
`;
const fragmentSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec2 touch;
uniform int pointerCount;
uniform float brightness;

out vec4 fragColor;

#define T (1.0*time)
#define S smoothstep
#define mouse (touch/resolution)
#define LPOS (p-vec3(0,1.5,0))
#define rep(p,n) (mod(p,n)-.5*n)
#define syl(p,s) (length(p)-s)
#define rot(a) mat2(cos(a),sin(a),-sin(a),cos(a))

float rnd(float a) {
  return fract(sin(a*12.783)*78.7599);
}

float curve(float a, float b) {
  a /= b;

  return mix(
    rnd(floor(a)),
    rnd(floor(a)+1.),
    pow(S(.0, 1.,fract(a)), b)
  );
}

float box(vec3 p, vec3 s, float r) {
  p = abs(p)-s;

  return length(max(p,.0))+
  min(.0, max(max(p.x, p.y), p.z))-r;
}

float ftor(vec3 p, vec3 s, float r) {
  vec2 e = vec2(
    abs(length(p.xz)-s.x)-s.z,
    abs(p.y)-s.y
  );

  return length(max(e,.0))+
  min(.0, max(e.x, e.y))-r;
}

float disc(vec3 p, vec2 s, float r) {
  vec2 e = vec2(
    abs(length(p.xz)),
    abs(p.y)
  )-s;

  return length(max(e,.0))+
  min(.0, max(e.x, e.y))-r;
}

float oct(vec3 p, float s) {
  p = abs(p);

  return (p.x+p.y+p.z-s)*(1./sqrt(3.));
}

float mat = .0;
float map(vec3 p) {
  float d = 1e5,
  bx1 = box(p, vec3(.05,1,.05),.05),
  ft1 = ftor(LPOS, vec3(1,.5,.0125),.05),
  dc1 = disc(p+vec3(0, 1.125, 0), vec2(1,.125),.05),
  room = -(oct(p, 12.));

  d = min(d, bx1);
  d = min(d, min(ft1,length(LPOS)-.5));
  d = min(d, dc1);
  d = min(d, room);

  if (d == ft1) {
    mat = 1.;
  } else if (d == room) {
    mat = .2;
  } else mat = .0;

  return d;
}

vec3 norm(vec3 p) {
  vec2 e = vec2(1e-3, 0);
  float d = map(p);
  vec3 n = d-vec3(
    map(p-e.xyy),
    map(p-e.yxy),
    map(p-e.yyx)
  );

  return normalize(n);
}

float blur(float d, float k) {
  float blur = S(.5 - k, .5 + k, d);
  
  return blur;
}

float getao(vec3 p, vec3 n, float dist) {
  return clamp(map(p+n*dist)/dist, .0, 1.);
}

void cam(inout vec3 p) {
  if(pointerCount>0) {
    p.yz*=rot(mouse.y*acos(-1.)-acos(.0));
    p.xz*=rot(mouse.x*acos(-1.)*2.);
  } else {
    p.yz*=rot(sin(T*.5));
    p.xz*=rot(T*.25);
    p.xy*=rot(sin(T*.5)*.5);
  }
}

void main(void) {
  vec3 col = vec3(0);
  const float n=1.;

  for (float dx=.0; dx<n; dx++) {
  for (float dy=.0; dy<n; dy++) {
  vec2 coord=gl_FragCoord.xy+vec2(dx,dy)*.5,
  uv = (
    gl_FragCoord.xy-.5*resolution
  ) / min(resolution.x, resolution.y);

  vec3
  ro = vec3(0, 0, -exp(sin(T))-4.);
  vec3 rd = normalize(vec3(uv, .7)); 

  cam(ro);
  cam(rd);

  vec3 p = ro,
  l = normalize(ro-.1);


  const float steps = 160., maxd=100.;
  float i = .0,
  dd = .0,
  at = .0,
  side = 1., bnz = .0,
  e = .5;

  for (; i < steps; i++) {
    float d = map(p);

    if (d < 1e-3) {
      vec3 n = norm(p),
      lpos=ro-.1,
      l = normalize(lpos);
      if (mat == 1.) {
        if (dot(l, n) < .0) l = -l;
        float diff = max(.0, dot(n, l)),
        fres = max(.0, pow(S(.0, 1.,dot(-rd, n)), 7.)),
        fade=1./dot(LPOS,LPOS)+1./dot(p-lpos,p-lpos);
        col += diff*fres*fade;

        side = -side;
        
        vec3 rdo = refract(rd, n, 1.+side*.45);
        
        if (dot(rdo, rdo) == .0) {
          rdo = reflect(rd, n);
        }
        
        d = 9e-1;
        rd = rdo;

      } else {
        if (bnz++>2.) break;
        vec3 h = normalize(l-reflect(rd, n));
        float ao =
        (getao(p, n, 12.)*.5+.5)*
        (getao(p, n, 1.)*.3+.7)*
        (getao(p, n,.5)*1.+.0);

        float fog = 1.-pow(S(.0, 1.,dd/20.), 2.);
        col += pow(1.-abs(dot(n, rd)), 3.) * ao * vec3(0.5, 0.6, 1.0);

        col = mix(col, vec3(ao), blur(d, 1.5));
        rd=reflect(rd,n);
        d=3e-3;
      }
    }
    if (dd > maxd) {
      dd = maxd;
      break;
    }

    p += rd*d;
    dd += d;
    at += exp(-length(LPOS)*3.5);
  }

  col += vec3(1,.3,.5)*at;
  col *= brightness/n;
  }}
  
  fragColor = vec4(col, 1);
}
`;
let time;
let buffer;
let program;
let touch;
let resolution;
let pointerCount;
let brightness;
let vertices = [];
let touching = false;
let playbackRate = 0.25;

function resize() {
  const { innerWidth: width, innerHeight: height } = window;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  gl.viewport(0, 0, width * dpr, height * dpr);
}

function compile(shader, source) {
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
}

function setup() {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);

  program = gl.createProgram();

  compile(vs, vertexSource);
  compile(fs, fragmentSource);

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }

  vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];

  buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const position = gl.getAttribLocation(program, "position");

  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  time = gl.getUniformLocation(program, "time");
  touch = gl.getUniformLocation(program, "touch");
  pointerCount = gl.getUniformLocation(program, "pointerCount");
  resolution = gl.getUniformLocation(program, "resolution");
  brightness = gl.getUniformLocation(program, "brightness");
}

let passedTime = 0;
function draw() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const t = passedTime;
  gl.uniform1f(time, t);
  gl.uniform1f(brightness, playbackRate);
  gl.uniform2f(touch, ...getTouches());
  gl.uniform1i(pointerCount, touches.size);
  gl.uniform2f(resolution, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length * 0.5);
}

function getTouches() {
  if (!touches.size) {
    return [0, 0];
  }

  for (let [id, t] of touches) {
    const result = [dpr * t.clientX, dpr * (innerHeight - t.clientY)];

    return result;
  }
}

class Player {
  constructor(...urls) {
    this.idx = 0;
    this.urls = urls;
    this.audio = new Audio();
    this.audio.src = urls[this.idx];
    this.audio.crossOrigin = "anonymous";
    this.audio.loop = true;
    this.audio.preservesPitch = false;

    this.initialized = false;
  }
  setup() {
    this.audioCtx = new window.AudioContext();
    this.audioSource = this.audioCtx.createMediaElementSource(this.audio);
    this.audioSource.connect(this.audioCtx.destination);

    this.initialized = true;
  }
  next() {
    this.idx = (this.idx + 1) % this.urls.length;
    this.audio.src = this.urls[this.idx];
    this.audio.play();
  }
  resume() {
    this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
  toggle() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      playbackRate = 0.25;
      this.audio.load();
    }
  }
  speedup(rate) {
    if (!this.audio.paused) {
      playbackRate = Math.max(0.25, Math.min(1, playbackRate + 0.001));
      this.audio.playbackRate = rate * playbackRate;
    }
  }
}

let player;
let then = 0;
let frames = 0;

function loop(now) {
  frames++;

  const elapsed = now - then;
  let rate = 1;

  if (elapsed > 1000) {
    const fps = frames / (elapsed / 1000);
    rate = Math.min(1, 60 / fps);
    then = now;
    frames = 0;
  }

  passedTime += 0.02 * rate * playbackRate;

  if (player) {
    player.speedup(rate);
  }

  draw(now);
  requestAnimationFrame(loop);
}

function init() {
  setup();
  resize();
  loop(0);
}

document.body.onload = init;
window.onresize = resize;
canvas.onpointerdown = (e) => {
  touching = true;
  touches.set(e.pointerId, e);
};
canvas.onpointermove = (e) => {
  if (!touching) return;
  touches.set(e.pointerId, e);
};
canvas.onpointerup = (e) => {
  touching = false;
  touches.clear();
};
canvas.onpointerout = (e) => {
  touching = false;
  touches.clear();
};

window.play.onclick = (e) => {
  if (!player) {
    player = new Player("https://www.maz25.de/artifacts/lullaby.mp3");

    player.setup();
  }

  e.target.closest("div").classList.remove("initial");
  player.toggle();
};
