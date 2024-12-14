"use client";

import { Fade } from "react-awesome-reveal";
import { FormEvent, useState } from "react";
import { RotateSpinner } from "react-spinners-kit";
import { toast } from "react-toastify";

export default function SessionCode() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  async function sendData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setResponseMessage("");

    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DISNEY}/session_code/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`Código de sesión: ${data.code}`);
        toast.success("Gracias por preferirnos :D", {
          theme: "dark",
        });
      } else {
        toast.error(
          "Algo salió mal, por favor verifica el correo y la contraseña",
          {
            theme: "dark",
          }
        );
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
            Gogo está trayendo el código, por favor espera unos segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <Fade triggerOnce cascade>
      <section className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center rounded-lg p-10 max-w-md w-full border border-[#00FF00]">
          <h1 className="text-[#00FF00] font-bold text-5xl mb-6">
            Nea Streaming
          </h1>
          <p className="text-white text-lg mb-6">
            Por favor digita el correo electrónico de la cuenta y la contraseña
            gogo
          </p>

          {responseMessage && (
            <p className="text-[#00FF00] text-lg my-2">{responseMessage}</p>
          )}

          <form className="space-y-4" onSubmit={sendData}>
            <input
              className="border-2 border-[#00FF00] focus:outline-none bg-black text-white placeholder-gray-400 rounded-lg px-4 py-3 w-full transition"
              type="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              className="border-2 border-[#00FF00] focus:outline-none bg-black text-white placeholder-gray-400 rounded-lg px-4 py-3 w-full transition"
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
