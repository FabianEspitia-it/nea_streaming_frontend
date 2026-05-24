import BrandLogo from "@/components/BrandLogo";
import CommunicationChannels from "@/components/CommunicationChannels";
import { Fade } from "react-awesome-reveal";
import Image from "next/image";

export default function Hero() {
  const services = [
    { label: "Actualiza hogar (NETFLIX)", href: "/update_home", id: 1 },
    {
      label: "Código temporal (estoy de viaje) (NETFLIX)",
      href: "/temporal_access",
      id: 2,
    },
    {
      label: "Código de inicio de sesión (NETFLIX)",
      href: "/session_netflix_code",
      id: 3,
    },
    {
      label: "Restablecimiento de contraseña (NETFLIX)",
      href: "/password_reset",
      id: 4,
    },
    {
      label: "Código de inicio de sesión (DISNEY+)",
      href: "/session_code",
      id: 5,
    },
    {
      label: "Código de hogar (DISNEY+)",
      href: "/disney_home_code",
      id: 6,
    },
    {
      label: "Solicitud de enlace de inicio de sesión (NETFLIX)",
      href: "/new_session",
      id: 7,
    },

    {
      label: "Código de inicio de sesión (PRIME VIDEO)",
      href: "/session_prime",
      id: 8,
    },
    {
      label: "Ayuda con la contraseña (PRIME VIDEO)",
      href: "/password_help_prime",
      id: 9,
    },
    {
      label: "Inicio de sesión (CRUNCHYROLL)",
      href: "/crunchyroll_link",
      id: 10,
    },
    {
      label: "Restablecer contraseña (CRUNCHYROLL)",
      href: "/crunchyroll_password_reset",
      id: 13,
    },
    {
      label: "Código de inicio de sesión (HBO MAX)",
      href: "/hbo_session_code",
      id: 11,
    },
    {
      label: "Restablecimiento de contraseña (HBO MAX)",
      href: "/hbo_restor_password",
      id: 12,
    },
    {
      label: "Código de activacion (UNIVERSAL+)",
      href: "/universal_activation_code",
      id: 14,
    },
  ];

  return (
    <section className="min-h-screen text-white pt-8 pb-28 md:pb-36 relative">
      <div className="container mx-auto px-4 relative z-10">
        <Fade triggerOnce>
          <div className="text-center mb-6">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/sign-in";
                }}
                className="text-sm border border-[#00FF00] text-[#00FF00] rounded-lg px-4 py-2 hover:bg-[#00FF00] hover:text-black transition"
              >
                Cerrar sesión
              </button>
            </div>
            <div className="flex justify-center">
              <BrandLogo size="lg" />
            </div>
            <p className="text-lg md:text-xl text-white mt-2">
              Selecciona el servicio que deseas utilizar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {services.map((service) => (
              <section
                key={service.id}
                className="group relative overflow-hidden bg-gray-900/90 border-2 border-[#00FF00] rounded-lg shadow-lg shadow-[#00FF00]/30 hover:shadow-[#00FF00]/80 transition-all duration-300"
              >
                <a
                  href={service.href}
                  className="block p-6 h-full"
                  aria-label={service.label}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <h3 className="text-lg font-semibold text-white drop-shadow-[0_0_5px_#00FF00]">
                      {service.label}
                    </h3>
                  </div>
                </a>
              </section>
            ))}
          </div>
        </Fade>
      </div>

      <CommunicationChannels className="z-20 grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mt-8 md:mt-0 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:transform" />
    </section>
  );
}
