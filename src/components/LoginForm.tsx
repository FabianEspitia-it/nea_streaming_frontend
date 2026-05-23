"use client";

import BrandLogo from "@/components/BrandLogo";
import { FormEvent, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { RotateSpinner } from "react-spinners-kit";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast.success("Sesión iniciada correctamente", { theme: "dark" });
        router.replace("/");
        router.refresh();
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        detail?: string;
        error?: string;
      } | null;

      toast.error(
        data?.detail ?? data?.error ?? "Credenciales inválidas",
        { theme: "dark" }
      );
    } catch (error) {
      console.error(error);
      toast.error("No se pudo iniciar sesión", { theme: "dark" });
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
            Validando credenciales, por favor espera...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <Image
        src="/images/gogo_logo.png"
        alt="Background"
        fill
        style={{ objectFit: "cover" }}
        quality={100}
        className="z-0"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-50" aria-hidden />
      <Fade triggerOnce cascade>
        <section className="flex items-center justify-center min-h-screen relative z-10 px-4">
          <div className="text-center rounded-lg p-10 max-w-md w-full border border-[#00FF00] bg-black">
            <div className="mb-6 flex justify-center">
              <BrandLogo size="login" />
            </div>
            <p className="text-white text-lg mb-6">
              Inicia sesión para acceder a los servicios
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                className="border-2 border-[#00FF00] focus:outline-none bg-black text-white placeholder-gray-400 rounded-lg px-4 py-3 w-full transition"
                type="email"
                placeholder="nea@streaming.com"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <input
                className="border-2 border-[#00FF00] focus:outline-none bg-black text-white placeholder-gray-400 rounded-lg px-4 py-3 w-full transition"
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                className="bg-[#00FF00] hover:bg-green-500 text-black rounded-lg px-6 py-3 font-semibold focus:outline-none w-full transition disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                Iniciar sesión
              </button>
            </form>
          </div>
        </section>
      </Fade>
    </div>
  );
}
