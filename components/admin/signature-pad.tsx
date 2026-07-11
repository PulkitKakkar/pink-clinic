"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
export function SignaturePad({ name = "signatureData" }: { name?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [value, setValue] = useState("");
  function prepare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const saved = value;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.lineWidth = 2.25;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#210013";
    context.fillStyle = "#fff";
    context.fillRect(0, 0, rect.width, rect.height);
    if (saved) {
      const image = new Image();
      image.onload = () =>
        context.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = saved;
    }
  }
  useEffect(() => {
    prepare();
    const resize = () => prepare();
    const form = canvasRef.current?.closest("form");
    const reset = () => {
      setValue("");
      window.requestAnimationFrame(prepare);
    };
    window.addEventListener("resize", resize);
    form?.addEventListener("reset", reset);
    return () => {
      window.removeEventListener("resize", resize);
      form?.removeEventListener("reset", reset);
    };
    // The canvas is intentionally initialised once; current signature state is persisted separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext("2d");
    const p = point(event);
    context?.beginPath();
    context?.moveTo(p.x, p.y);
  }
  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    event.preventDefault();
    const context = event.currentTarget.getContext("2d");
    const p = point(event);
    context?.lineTo(p.x, p.y);
    context?.stroke();
  }
  function finish(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    event.currentTarget.getContext("2d")?.closePath();
    setValue(event.currentTarget.toDataURL("image/png"));
  }
  function clear() {
    setValue("");
    requestAnimationFrame(prepare);
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Customer signature</h2>
          <p className="mt-1 text-xs text-black/45">
            Sign inside the box using a finger, stylus, mouse or trackpad.
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-bold"
        >
          <RotateCcw size={13} /> Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="mt-4 h-48 w-full touch-none rounded-xl border-2 border-dashed border-black/15 bg-white"
        aria-label="Customer signature pad"
      />
      <input
        name={name}
        value={value}
        onChange={() => {}}
        required
        className="sr-only"
        aria-label="Customer signature data"
      />
      {!value && (
        <p className="mt-2 text-[10px] text-black/40">
          A signature is required before the consultation can be saved.
        </p>
      )}
    </div>
  );
}
