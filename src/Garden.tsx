import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './garden.css';

type GardenProps = { moving: boolean; active: string | null };

// Coordinates on the 1586 × 932 painting, measured from the upper left.
const entrances: Record<string, [number, number]> = {
  markets: [0.385, 0.145], media: [0.394, 0.408],
  floor: [0.775, 0.11], history: [0.812, 0.409],
};

const vertexShader = `
  varying vec2 artUV;
  void main() {
    artUV = vec2(uv.x, 1.0 - uv.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D painting;
  uniform float time;
  uniform float selectionTime;
  uniform vec2 pointer;
  uniform vec2 crop;
  uniform vec2 focus;
  uniform vec2 selected;
  varying vec2 artUV;
  const float aspect = 1.7017;

  float ellipse(vec2 pos, vec2 center, vec2 radius) {
    return 1.0 - smoothstep(0.60, 1.05, length((pos - center) / radius));
  }
  float orbitalLight(vec2 uv, float radius, float phase) {
    float angle = time * 0.24 + phase;
    vec2 path = radius * vec2(cos(angle), sin(angle));
    vec2 delta = (uv - vec2(0.619, 0.310)) * vec2(aspect, 1.0) - path;
    float d = length(delta);
    return exp(-d * d * 280000.0) + 0.35 * exp(-d * 230.0);
  }
  void main() {
    vec2 uv = artUV * crop + (1.0 - crop) * focus;
    vec2 haloCenter = vec2(0.619, 0.310);
    float foreground = smoothstep(0.65, 1.0, uv.y);
    float face = ellipse(uv, vec2(0.625, 0.36), vec2(0.12, 0.29));
    float distanceLayer = 0.25 + foreground * 0.95 + face * 0.55;
    vec2 drift = pointer * vec2(0.0027, 0.0021) + vec2(sin(time * 0.21), cos(time * 0.16)) * 0.0012;
    float edge = smoothstep(0.0, 0.04, min(min(uv.x, 1.0-uv.x), min(uv.y, 1.0-uv.y)));
    uv += edge * drift * distanceLayer;

    // Small independent movements in the waterfall ribbons and near foliage.
    float water = ellipse(uv, vec2(0.358, 0.687), vec2(0.022, 0.083))
                + ellipse(uv, vec2(0.885, 0.295), vec2(0.009, 0.071));
    uv.y += water * 0.0028 * sin(uv.y * 180.0 - time * 3.5);
    uv.x += foreground * edge * 0.0018 * sin(uv.x * 15.0 + time * 0.67 + uv.y * 5.0);
    vec3 color = texture2D(painting, vec2(uv.x, 1.0 - uv.y)).rgb;

    // Illuminate the gold already painted into the ring and root network.
    float gold = smoothstep(0.18, 0.62, color.r-color.b) * smoothstep(0.41, 0.84, color.r);
    vec2 radial = (uv - haloCenter) * vec2(aspect, 1.0);
    float sweep = pow(0.5 + 0.5 * cos(atan(radial.y,radial.x) - time * 0.65), 15.0);
    float wave = 0.5 + 0.5 * sin(length(radial) * 73.0 - time * 3.6);
    float signal = length((uv - selected) * vec2(aspect, 1.0));
    float ripple = exp(-90.0 * abs(signal - selectionTime * 0.40)) * exp(-selectionTime * 1.5);
    float light = gold * (1.0 - face) * (0.28 * sweep + 0.12 * wave + ripple * 0.90);
    color += vec3(1.0, 0.73, 0.19) * light;
    float sparks = orbitalLight(uv, 0.292, 0.8) + orbitalLight(uv, 0.322, 3.5)
                 + orbitalLight(uv, 0.349, 5.2) + orbitalLight(uv, 0.377, 2.1);
    color += vec3(1.0, 0.78, 0.28) * sparks * (1.0-face);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Garden({ moving, active }: GardenProps) {
  const host = useRef<HTMLDivElement>(null);
  const motion = useRef(moving);
  const selection = useRef(active);
  const redraw = useRef<() => void>(() => {});

  useEffect(() => { motion.current = moving; redraw.current(); }, [moving]);
  useEffect(() => { selection.current = active; redraw.current(); }, [active]);

  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    } catch { return; } // The same painting is the first frame and static fallback.
    const canvas = renderer.domElement;
    element.append(canvas);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      painting: { value: null as THREE.Texture | null },
      time: { value: 0 }, selectionTime: { value: 4 },
      pointer: { value: new THREE.Vector2() }, crop: { value: new THREE.Vector2(1, 1) },
      focus: { value: new THREE.Vector2(0.62, 0.46) }, selected: { value: new THREE.Vector2() },
    };
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false,
    }));
    surface.frustumCulled = false;
    scene.add(surface);
    let disposed = false, visible = true, loaded = false, frame = 0, previous = 0;
    let lastSelection = selection.current;
    const targetPointer = new THREE.Vector2();

    function schedule() {
      if (!disposed && loaded && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    }
    function draw(now: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const dt = previous ? Math.min((now-previous)/1000, 0.06) : 0;
      previous = now;
      const location = entrances[selection.current || 'history'] || entrances.history;
      uniforms.selected.value.set(...location);
      if (selection.current !== lastSelection) {
        uniforms.selectionTime.value = motion.current ? 0 : 4;
        lastSelection = selection.current;
      }
      if (motion.current) {
        uniforms.time.value += dt;
        uniforms.selectionTime.value += dt;
        uniforms.pointer.value.lerp(targetPointer, 1 - Math.exp(-dt * 5));
      }
      renderer.render(scene, camera);
      canvas.style.opacity = '1';
      if (motion.current) schedule();
    }
    function resize() {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      if (window.matchMedia('(max-width: 800px)').matches) {
        const ratio = (width / height) / (1586 / 932);
        uniforms.crop.value.set(Math.min(1, ratio), Math.min(1, 1/ratio));
      } else uniforms.crop.value.set(1,1);
      schedule();
    }
    function point(event: PointerEvent) {
      if (!motion.current || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      targetPointer.set((event.clientX - rect.left)/rect.width * 2 - 1, (event.clientY - rect.top)/rect.height * 2 - 1);
    }
    function center() { targetPointer.set(0,0); }
    function visibility() { previous = 0; schedule(); }
    function loseContext(event: Event) { event.preventDefault(); canvas.style.opacity = '0'; loaded = false; }
    function restoreContext() { loaded = true; resize(); }
    const texture = new THREE.TextureLoader().load('/eden.jpg', () => {
      if (disposed) return;
      uniforms.painting.value = texture;
      loaded = true;
      resize();
    });
    const resizer = new ResizeObserver(resize);
    resizer.observe(element);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); });
    observer.observe(element);
    const stage = element.parentElement!;
    stage.addEventListener('pointermove', point);
    stage.addEventListener('pointerleave', center);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', loseContext);
    canvas.addEventListener('webglcontextrestored', restoreContext);
    redraw.current = schedule;
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      redraw.current = () => {};
      observer.disconnect(); resizer.disconnect();
      stage.removeEventListener('pointermove', point);
      stage.removeEventListener('pointerleave', center);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', loseContext);
      canvas.removeEventListener('webglcontextrestored', restoreContext);
      texture.dispose(); surface.geometry.dispose(); surface.material.dispose();
      renderer.dispose(); canvas.remove();
    };
  }, []);

  return <div className="eden-scene" ref={host} aria-hidden="true"><img src="/eden.jpg" alt="" fetchPriority="high" /></div>;
}
