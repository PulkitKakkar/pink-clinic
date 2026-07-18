"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CTA_SELECTOR = [
  "a[href]",
  "button.button-primary",
  "button.button-light",
  "button.button-outline",
  "[data-loading-cta='true']",
].join(",");

export function ActionLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const activeElement = useRef<HTMLElement | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLoading(false);
      activeElement.current?.removeAttribute("aria-busy");
      activeElement.current?.classList.remove("is-loading-cta");
      activeElement.current = null;
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    function stopLoading() {
      setLoading(false);
      activeElement.current?.removeAttribute("aria-busy");
      activeElement.current?.classList.remove("is-loading-cta");
      activeElement.current = null;
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    }

    function startLoading(element: HTMLElement, shortAction = false) {
      if (
        element.getAttribute("aria-disabled") === "true" ||
        (element instanceof HTMLButtonElement && element.disabled)
      ) return;

      activeElement.current?.removeAttribute("aria-busy");
      activeElement.current?.classList.remove("is-loading-cta");
      activeElement.current = element;
      element.setAttribute("aria-busy", "true");
      element.classList.add("is-loading-cta");
      setLoading(true);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      fallbackTimer.current = setTimeout(stopLoading, shortAction ? 650 : 12000);
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(CTA_SELECTOR)
        : null;
      if (!target) return;

      if (target instanceof HTMLAnchorElement) {
        if (
          target.target === "_blank" ||
          target.hasAttribute("download") ||
          target.protocol === "mailto:" ||
          target.protocol === "tel:"
        ) return;
        const destination = new URL(target.href, window.location.href);
        if (
          destination.origin === window.location.origin &&
          destination.pathname === window.location.pathname &&
          destination.search === window.location.search
        ) return;
        startLoading(target);
        return;
      }

      const button = target.closest("button");
      const submitsForm = button?.type === "submit";
      startLoading(target, !submitsForm);
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const submitter = event.submitter instanceof HTMLElement
        ? event.submitter
        : form.querySelector<HTMLElement>("[type='submit']");
      if (!submitter) return;
      startLoading(submitter);
      queueMicrotask(() => {
        if (event.defaultPrevented) {
          if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
          fallbackTimer.current = setTimeout(stopLoading, 650);
        }
      });
    }

    window.addEventListener("pageshow", stopLoading);
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    return () => {
      window.removeEventListener("pageshow", stopLoading);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  if (!loading) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="pointer-events-none fixed inset-x-0 top-0 z-[300]"
    >
      <div className="h-1 w-full overflow-hidden bg-pink-light">
        <span className="action-loader-bar block h-full w-1/3 bg-pink" />
      </div>
      <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-pink shadow-luxe backdrop-blur">
        <span className="action-loader-spinner h-4 w-4 rounded-full border-2 border-pink/20 border-t-pink" />
        Loading…
      </div>
    </div>
  );
}
