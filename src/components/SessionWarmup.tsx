"use client";

import { useEffect } from "react";

/**
 * Si hay refresh_token pero no access, renueva sesión en cookies HttpOnly
 * sin exponer el JWT al cliente.
 */
export default function SessionWarmup() {
  useEffect(() => {
    void fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  }, []);

  return null;
}
