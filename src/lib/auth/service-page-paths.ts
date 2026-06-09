/** Páginas de códigos/enlaces (requieren sesión iniciada). */
export const SERVICE_PAGE_PATHS = [
  "/",
  "/update_home",
  "/temporal_access",
  "/session_netflix_code",
  "/password_reset",
  "/session_code",
  "/disney_home_code",
  "/new_session",
  "/session_prime",
  "/password_help_prime",
  "/crunchyroll_link",
  "/crunchyroll_password_reset",
  "/hbo_session_code",
  "/hbo_restor_password",
  "/universal_activation_code",
  "/mubi_access_code",
] as const;

export function isServicePagePath(pathname: string): boolean {
  return SERVICE_PAGE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
