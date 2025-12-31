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
      label: "Solicitud de enlace de inicio de sesión (NETFLIX)",
      href: "/new_session",
      id: 6,
    },

    {
      label: "Código de inicio de sesión (PRIME VIDEO)",
      href: "/session_prime",
      id: 7,
    },
    {
      label: "Ayuda con la contraseña (PRIME VIDEO)",
      href: "/password_help_prime",
      id: 8,
    },
    {
      label: "Inicio de sesión (CRUNCHYROLL)",
      href: "/crunchyroll_link",
      id: 9,
    },
    {
      label: "Código de inicio de sesión (HBO MAX)",
      href: "/hbo_session_code",
      id: 10,
    },
    {
      label: "Restablecimiento de contraseña (HBO MAX)",
      href: "/hbo_restor_password",
      id: 11,
    },
  ];

  return (
    <section className="min-h-screen text-white pt-8 pb-28 md:pb-36 relative">
      <div className="container mx-auto px-4 relative z-10">
        <Fade triggerOnce>
          <div className="text-center mb-12">
            <h2 className="md:text-7xl text-5xl font-black italic transform -rotate-2 text-[#00FF00] drop-shadow-[0_0_10px_#00FF00] mt-6">
              Nea Streaming
            </h2>
            <p className="text-lg md:text-xl text-white mt-4">
              Selecciona el servicio que deseas utilizar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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

      <div className="z-20 grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mt-8 md:mt-0 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:transform">
        {/* Telegram */}
        <div className="flex flex-col items-center">
          <a
            href="https://t.me/+3zE-9ONlQEQwNGZh"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#229ED9] relative"
            aria-label="Únete al canal de Telegram"
            title="Únete al canal de Telegram"
          >
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#229ED9] animate-ping"></div>
            <div className="relative z-10">
              <Image
                src="/images/telegram.png"
                alt="Telegram"
                width={32}
                height={32}
              />
            </div>
          </a>
          <p className="text-white text-sm mt-2 text-center">
            Únete al canal de Telegram
          </p>
        </div>

        <div className="flex flex-col items-center">
          <a
            href="https://t.me/Gogoshzx"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#229ED9] relative"
            aria-label="Contactanos por Telegram"
            title="Contactanos por Telegram"
          >
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#229ED9] animate-ping"></div>
            <div className="relative z-10">
              <Image
                src="/images/telegram.png"
                alt="Telegram"
                width={32}
                height={32}
              />
            </div>
          </a>
          <p className="text-white text-sm mt-2 text-center">
            Contáctanos por Telegram
          </p>
        </div>

        <div className="flex flex-col items-center">
          <a
            href="https://whatsapp.com/channel/0029Vb6I4W4FCCoPcCgFaU3o"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#00FF00] relative"
            aria-label="Únete al canal de WhatsApp"
            title="Únete al canal de WhatsApp"
          >
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#00FF00] animate-ping"></div>
            <div className="relative z-10">
              <svg
                fill="#fff"
                height="20px"
                width="20px"
                viewBox="0 0 308.00 308.00"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#fff"
              >
                <path d="M227.904,176.981c-0.6-0.288-23.054-11.345-27.044-12.781c-1.629-0.585-3.374-1.156-5.23-1.156 c-3.032,0-5.579,1.511-7.563,4.479c-2.243,3.334-9.033,11.271-11.131,13.642c-0.274,0.313-0.648,0.687-0.872,0.687 c-0.201,0-3.676-1.431-4.728-1.888c-24.087-10.463-42.37-35.624-44.877-39.867c-0.358-0.61-0.373-0.887-0.376-0.887 c0.088-0.323,0.898-1.135,1.316-1.554c1.223-1.21,2.548-2.805,3.83-4.348c0.607-0.731,1.215-1.463,1.812-2.153 c1.86-2.164,2.688-3.844,3.648-5.79l0.503-1.011c2.344-4.657,0.342-8.587-0.305-9.856c-0.531-1.062-10.012-23.944-11.02-26.348 c-2.424-5.801-5.627-8.502-10.078-8.502c-0.413,0,0,0-1.732,0.073c-2.109,0.089-13.594,1.601-18.672,4.802 c-5.385,3.395-14.495,14.217-14.495,33.249c0,17.129,10.87,33.302,15.537,39.453c0.116,0.155,0.329,0.47,0.638,0.922 c17.873,26.102,40.154,45.446,62.741,54.469c21.745,8.686,32.042,9.69,37.896,9.69c0.001,0,0.001,0,0.001,0 c2.46,0,4.429-0.193,6.166-0.364l1.102-0.105c7.512-0.666,24.02-9.22,27.775-19.655c2.958-8.219,3.738-17.199,1.77-20.458 C233.168,179.508,230.845,178.393,227.904,176.981z" />
                <path d="M156.734,0C73.318,0,5.454,67.354,5.454,150.143c0,26.777,7.166,52.988,20.741,75.928L0.212,302.716 c-0.484,1.429-0.124,3.009,0.933,4.085C1.908,307.58,2.943,308,4,308c0.405,0,0.813-0.061,1.211-0.188l79.92-25.396 c21.87,11.685,46.588,17.853,71.604,17.853C240.143,300.27,308,232.923,308,150.143C308,67.354,240.143,0,156.734,0z M156.734,268.994c-23.539,0-46.338-6.797-65.936-19.657c-0.659-0.433-1.424-0.655-2.194-0.655c-0.407,0-0.815,0.062-1.212,0.188 l-40.035,12.726l12.924-38.129c0.418-1.234,0.209-2.595-0.561-3.647c-14.924-20.392-22.813-44.485-22.813-69.677 c0-65.543,53.754-118.867,119.826-118.867c66.064,0,119.812,53.324,119.812,118.867 C276.546,215.678,222.799,268.994,156.734,268.994z" />
              </svg>
            </div>
          </a>
          <p className="text-white text-sm mt-2 text-center">
            Únete al canal de WhatsApp
          </p>
        </div>

        <div className="flex flex-col items-center">
          <a
            href="https://wa.me/573134489183"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#00FF00] relative"
            aria-label="Contáctanos por WhatsApp"
            title="Contáctanos por WhatsApp"
          >
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#00FF00] animate-ping"></div>
            <div className="relative z-10">
              <svg
                fill="#fff"
                height="20px"
                width="20px"
                viewBox="0 0 308.00 308.00"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#fff"
              >
                <path d="M227.904,176.981c-0.6-0.288-23.054-11.345-27.044-12.781c-1.629-0.585-3.374-1.156-5.23-1.156 c-3.032,0-5.579,1.511-7.563,4.479c-2.243,3.334-9.033,11.271-11.131,13.642c-0.274,0.313-0.648,0.687-0.872,0.687 c-0.201,0-3.676-1.431-4.728-1.888c-24.087-10.463-42.37-35.624-44.877-39.867c-0.358-0.61-0.373-0.887-0.376-0.887 c0.088-0.323,0.898-1.135,1.316-1.554c1.223-1.21,2.548-2.805,3.83-4.348c0.607-0.731,1.215-1.463,1.812-2.153 c1.86-2.164,2.688-3.844,3.648-5.79l0.503-1.011c2.344-4.657,0.342-8.587-0.305-9.856c-0.531-1.062-10.012-23.944-11.02-26.348 c-2.424-5.801-5.627-8.502-10.078-8.502c-0.413,0,0,0-1.732,0.073c-2.109,0.089-13.594,1.601-18.672,4.802 c-5.385,3.395-14.495,14.217-14.495,33.249c0,17.129,10.87,33.302,15.537,39.453c0.116,0.155,0.329,0.47,0.638,0.922 c17.873,26.102,40.154,45.446,62.741,54.469c21.745,8.686,32.042,9.69,37.896,9.69c0.001,0,0.001,0,0.001,0 c2.46,0,4.429-0.193,6.166-0.364l1.102-0.105c7.512-0.666,24.02-9.22,27.775-19.655c2.958-8.219,3.738-17.199,1.77-20.458 C233.168,179.508,230.845,178.393,227.904,176.981z" />
                <path d="M156.734,0C73.318,0,5.454,67.354,5.454,150.143c0,26.777,7.166,52.988,20.741,75.928L0.212,302.716 c-0.484,1.429-0.124,3.009,0.933,4.085C1.908,307.58,2.943,308,4,308c0.405,0,0.813-0.061,1.211-0.188l79.92-25.396 c21.87,11.685,46.588,17.853,71.604,17.853C240.143,300.27,308,232.923,308,150.143C308,67.354,240.143,0,156.734,0z M156.734,268.994c-23.539,0-46.338-6.797-65.936-19.657c-0.659-0.433-1.424-0.655-2.194-0.655c-0.407,0-0.815,0.062-1.212,0.188 l-40.035,12.726l12.924-38.129c0.418-1.234,0.209-2.595-0.561-3.647c-14.924-20.392-22.813-44.485-22.813-69.677 c0-65.543,53.754-118.867,119.826-118.867c66.064,0,119.812,53.324,119.812,118.867 C276.546,215.678,222.799,268.994,156.734,268.994z" />
              </svg>
            </div>
          </a>
          <p className="text-white text-sm mt-2 text-center">
            Contáctanos por WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
}
