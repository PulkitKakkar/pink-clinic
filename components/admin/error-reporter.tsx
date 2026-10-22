"use client";
import { useEffect } from "react";
import { reportClientError } from "@/lib/admin/client-errors";

export function AdminErrorReporter() {
  useEffect(() => {
    const error = () => reportClientError("render");
    const rejection = () => reportClientError("unhandled_rejection");
    window.addEventListener("error", error);
    window.addEventListener("unhandledrejection", rejection);
    return () => {
      window.removeEventListener("error", error);
      window.removeEventListener("unhandledrejection", rejection);
    };
  }, []);
  return null;
}
