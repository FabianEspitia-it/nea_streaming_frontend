"use client";

import { Fade } from "react-awesome-reveal";
import { FormEvent, useState } from "react";
import { RotateSpinner } from "react-spinners-kit";

import { toast } from "react-toastify";

export default function UpdateHome() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<null | string>(null);

  async function sendData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const data = {
      email: email,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NETFLIX}/home_code/${data.email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(data.link);
        toast.success("Gracias por preferirnos :D", {
          theme: "dark",
        });
      } else {
        toast.error("Algo salio mal, por favor verifica el correo", {
          theme: "dark",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-black h-screen w-full">
        <div className="text-center">
          <div className="flex justify-center">
            <RotateSpinner color="#00FF00" size={55} />
          </div>
          <p className="pt-4 font-semibold text-white">
            Gogo está trayendo el link para actualizar hogar, por favor espera
            unos segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <Fade triggerOnce cascade>
      <section className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center rounded-lg p-10 max-w-md w-full border border-[#00FF00]">
          <h1 className="text-[#00FF00] font-black italic transform -rotate-2 text-5xl mb-6">
            Nea Streaming
          </h1>
          <p className="text-white text-lg mb-6">
            Por favor digita el correo electrónico de la cuenta
          </p>

          {responseMessage && (
            <p className="text-white text-lg mb-5">
              Link para obtener el código:
              <a
                className="text-[#00FF00] underline block"
                rel="noopener noreferrer"
                target="_blank"
                href={responseMessage}
              >
                Nealink
              </a>
            </p>
          )}

          <form className="space-y-4" onSubmit={sendData}>
            <input
              className="border-2 border-[#00FF00] focus:outline-none bg-black text-white placeholder-gray-400 rounded-lg px-4 py-3 w-full transition"
              type="email"
              placeholder="nea@streaming.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <button
              className="bg-[#00FF00] hover:bg-green-500 text-black rounded-lg px-6 py-3 font-semibold focus:outline-none w-full transition"
              type="submit"
            >
              Enviar
            </button>

            <a
              href="/"
              className="block border-2 border-[#00FF00] text-[#00FF00] rounded-lg px-6 py-3 font-semibold text-center hover:bg-[#00FF00] hover:text-black w-full transition"
            >
              Inicio
            </a>
          </form>
        </div>
      </section>
    </Fade>
  );
}
