import { useEffect, useRef } from "react";
import { fitCanvas, lineState, pathShape, pointAt, runWhileVisible } from "@/lib/hero-lines";

// Segments per drawn line. 96 keeps these gentle curves smooth at full-screen width; 240 (one per sample) cost
// ~6 ms per canvas per frame on a 4×-throttled CPU, for no visible gain.
const DRAW_STEPS = 96;

// Hero line field. The curves started as 21st.dev's "background paths"; the motion is ours. The <path>s stay as
// static, unstroked geometry and the moving lines are drawn on a canvas: animating the stroke of 72 SVG paths repainted
// the whole full-screen SVG every frame (~23 fps), which made the hero stutter and the fixed header and sections blink.

export function FloatingPaths({ position }: { position: number }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    }));

    useEffect(() => {
        const canvas = ref.current;
        const svg = canvas?.previousElementSibling as SVGSVGElement | null;
        if (!canvas || !svg || typeof svg.getScreenCTM !== "function") return; // no SVG layout (e.g. jsdom)
        const context = canvas.getContext("2d");
        if (!context) return;
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        const lines = [...svg.querySelectorAll("path")];
        const color = getComputedStyle(canvas).color;

        const draw = (now: number) => {
            const box = canvas.getBoundingClientRect();
            const m = svg.getScreenCTM();
            context.clearRect(0, 0, box.width, box.height);
            if (!m) return;
            context.strokeStyle = color;
            context.lineCap = "round";
            const scale = Math.hypot(m.a, m.b);
            lines.forEach((path, id) => {
                const { from, length, opacity } = lineState(id, position, now, reduce);
                if (length < 0.002) return;
                const { points } = pathShape(path);
                context.globalAlpha = Math.min(1, 0.1 + id * 0.03) * opacity;
                context.lineWidth = (0.5 + id * 0.03) * scale;
                context.beginPath();
                const steps = Math.max(2, Math.ceil(length * DRAW_STEPS));
                for (let s = 0; s <= steps; s++) {
                    const [px, py] = pointAt(points, from + (length * s) / steps);
                    const x = m.a * px + m.c * py + m.e - box.left, y = m.b * px + m.d * py + m.f - box.top;
                    if (s) context.lineTo(x, y); else context.moveTo(x, y);
                }
                context.stroke();
            });
            context.globalAlpha = 1;
        };

        const unfit = fitCanvas(canvas, context, () => draw(performance.now()));
        if (reduce) return unfit;
        const stop = runWhileVisible(canvas, draw);
        return () => { stop(); unfit(); };
    }, [position]);

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Static geometry only: nothing here is stroked or animated, so the SVG never repaints. */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 696 316" fill="none" aria-hidden="true">
                {paths.map((path) => <path key={path.id} d={path.d} stroke="none" data-line={path.id} data-position={position} />)}
            </svg>
            <canvas ref={ref} className="absolute inset-0 w-full h-full text-red-dark" aria-hidden="true" />
        </div>
    );
}
