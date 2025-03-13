import { Fade } from "react-awesome-reveal";

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
  ];

  return (
    <section className="min-h-screen text-white pt-8 pb-20 relative">
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

      {/**
       <p className="md:fixed md:bottom-4 md:left-4 text-md text-white opacity-50 md:mt-0 md:ml-0 mt-7 ml-7">
        Desarrollado por{" "}
        <a
          href="https://wa.me/573218544162?text=Holaaa"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold"
        >
          Fabián Espitia
        </a>
      </p>
       
       */}
    </section>
  );
}
