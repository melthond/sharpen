// Shared timing and geometry for the hero lines (FloatingPaths draws them, AsciiGlitch glitches them).

export const SAMPLES = 240;
const shapes = new WeakMap<SVGPathElement, { total: number; points: Float32Array }>();

const DENSE = 64; // Bézier steps per cubic before resampling by arc length

/**
 * Samples an "M x y C x1 y1 x2 y2 x y C …" path (the only form the hero uses) into SAMPLES+1 points spaced evenly by
 * arc length, the same points getPointAtLength gives. Done in plain math: 72 paths × 241 getPointAtLength calls took
 * ~5.8 s of main thread on a 4×-throttled CPU and held back the sections below the hero.
 */
export function shapeFromD(d: string) {
    const n = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
    const xs = [n[0]], ys = [n[1]], lengths = [0];
    for (let c = 2; c + 5 < n.length; c += 6) {
        const x0 = xs[xs.length - 1], y0 = ys[ys.length - 1];
        const [x1, y1, x2, y2, x3, y3] = n.slice(c, c + 6);
        for (let s = 1; s <= DENSE; s++) {
            const t = s / DENSE, u = 1 - t, a = u * u * u, b = 3 * u * u * t, e = 3 * u * t * t, f = t * t * t;
            const x = a * x0 + b * x1 + e * x2 + f * x3, y = a * y0 + b * y1 + e * y2 + f * y3;
            lengths.push(lengths[lengths.length - 1] + Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]));
            xs.push(x); ys.push(y);
        }
    }
    const total = lengths[lengths.length - 1];
    const points = new Float32Array((SAMPLES + 1) * 2);
    for (let i = 0, j = 0; i <= SAMPLES; i++) {
        const target = (i / SAMPLES) * total;
        while (j < lengths.length - 2 && lengths[j + 1] < target) j++;
        const span = lengths[j + 1] - lengths[j], t = span > 0 ? (target - lengths[j]) / span : 0;
        points[i * 2] = xs[j] + (xs[j + 1] - xs[j]) * t;
        points[i * 2 + 1] = ys[j] + (ys[j + 1] - ys[j]) * t;
    }
    return { total, points };
}

/** A path's curve sampled once into a polyline in SVG units (the shapes never change, only the drawn stretch moves). */
export function pathShape(path: SVGPathElement) {
    let shape = shapes.get(path);
    if (!shape) {
        shape = shapeFromD(path.getAttribute("d") ?? "");
        shapes.set(path, shape);
    }
    return shape;
}

/** Point at fraction `at` (0-1) of a sampled curve, in SVG units. */
export function pointAt(points: Float32Array, at: number): [number, number] {
    const f = Math.min(Math.max(at, 0), 1) * SAMPLES, i = Math.min(f | 0, SAMPLES - 1), t = f - i;
    return [
        points[i * 2] + (points[i * 2 + 2] - points[i * 2]) * t,
        points[i * 2 + 1] + (points[i * 2 + 3] - points[i * 2 + 1]) * t,
    ];
}

/**
 * The drawn stretch of line `id` at time `ms`, as [start, length] in 0-1 of the path, plus its opacity.
 * Each line grows from 0.3 to the full path while sliding off the end, then reverses, over 20-29s; the start of the
 * cycle is spread per line so they never all move together. `reduce` freezes every line at its resting state.
 */
export function lineState(id: number, position: number, ms: number, reduce = false) {
    const duration = 20 + ((id * 7) % 10);
    const delay = (id * 37 + (position > 0 ? 0 : 13)) % 29;
    const p = reduce ? 0 : (((ms / 1000 + delay) % duration) + duration) % duration / duration;
    const u = p < 0.5 ? p * 2 : (1 - p) * 2; // 0 -> 1 -> 0, so the loop never snaps
    const from = u, length = 0.3 + 0.7 * u;
    return { from, length: Math.max(0, Math.min(1, from + length) - from), opacity: 0.3 + 0.3 * u };
}

/** Runs `draw(now)` every animation frame while `host` is on screen and the tab is visible. Returns the cleanup. */
export function runWhileVisible(host: Element, draw: (now: number) => void) {
    let frame = 0, visible = true;
    const loop = (now: number) => { draw(now); frame = requestAnimationFrame(loop); };
    const start = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop(); });
    const onVisibility = () => (document.hidden ? stop() : start());
    observer.observe(host);
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => { stop(); observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
}

/** Sizes a canvas to its parent at up to 1.5x pixel ratio and keeps it sized; calls `onResize` after each change. */
export function fitCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, onResize?: () => void) {
    const host = canvas.parentElement!;
    const resize = () => {
        const ratio = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.round(host.clientWidth * ratio));
        canvas.height = Math.max(1, Math.round(host.clientHeight * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        onResize?.();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    return () => observer.disconnect();
}
