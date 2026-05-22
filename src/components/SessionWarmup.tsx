"use client";

import { useEffect } from "react";

/**
 * Si hay refresh_token pero no access, renueva sesión al cargar la página
 * (p. ej. formularios de códigos que aún no llaman al backend).
 */
export default function SessionWarmup() {
  useEffect(() => {
    void fetch("/api/auth/access-token", {
      credentials: "include",
      cache: "no-store",
    });
  }, []);

  return null;
}
