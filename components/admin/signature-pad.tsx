"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
export function SignaturePad({
  name = "signatureData",
  defaultValue = "",
}: {
  name?: string;
  defaultValue?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [value, setValue] = useState(defaultValue);
  const valueRef = useRef(defaultValue);
  const redrawVersion = useRef(0);
  const replaceOnDraw = useRef(false);
  const [locked, setLocked] = useState(Boolean(defaultValue));
  function updateValue(next: string) {
    valueRef.current = next;
    setValue(next);
  }
  function prepare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const saved = valueRef.current;
    const version = ++redrawVersion.current;
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
      image.onload = () => {
        if (version === redrawVersion.current) {
          context.drawImage(image, 0, 0, rect.width, rect.height);
        }
      };
      image.src = saved;
    }
  }
  useEffect(() => {
    prepare();
    const resize = () => prepare();
    const form = canvasRef.current?.closest("form");
    const reset = () => {
      drawing.current = false;
      replaceOnDraw.current = false;
      setLocked(false);
      updateValue("");
      prepare();
    };
    window.addEventListener("resize", resize);
    form?.addEventListener("reset", reset);
    return () => {
      window.removeEventListener("resize", resize);
      form?.removeEventListener("reset", reset);
    };
  }, []);
  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (locked) return;
    event.preventDefault();
    if (replaceOnDraw.current) {
      replaceOnDraw.current = false;
      updateValue("");
      prepare();
    }
    ++redrawVersion.current;
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
    updateValue(event.currentTarget.toDataURL("image/png"));
  }
  function confirmUpdate() {
    return window.confirm("Update the customer signature? The existing signature will be replaced when you sign again.");
  }
  function unlock() {
    if (!confirmUpdate()) return;
    replaceOnDraw.current = true;
    setLocked(false);
  }
  function clear() {
    if (valueRef.current && !window.confirm("Clear the customer signature? This will remove the existing signature.")) return;
    drawing.current = false;
    replaceOnDraw.current = false;
    setLocked(false);
    updateValue("");
    prepare();
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Customer signature</h2>
          <p className="mt-1 text-xs text-black/45">
            {locked
              ? "Signature saved. Tap the box to update it."
              : "Sign inside the box using a finger, stylus, mouse or trackpad."}
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
      <div className="relative mt-4">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          className={`block h-48 w-full rounded-xl border-2 border-dashed border-black/15 bg-white ${locked ? "touch-pan-y" : "touch-none"}`}
          aria-label="Customer signature pad"
        />
        {locked && (
          <button
            type="button"
            onClick={unlock}
            aria-label="Update customer signature"
            className="absolute inset-0 touch-pan-y rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          />
        )}
      </div>
      <input
        name={name}
        value={value}
        onChange={() => {}}
        className="sr-only"
        aria-label="Customer signature data"
      />
      {!value && (
        <p className="mt-2 text-[10px] text-black/40">
          A signature can be added now or when the consultation is updated.
        </p>
      )}
    </div>
  );
}
