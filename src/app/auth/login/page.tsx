"use client";

import { Building2, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/admin",
      });

      if (result.error) {
        setError(
          result.error.status === 429
            ? "Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin."
            : "E-posta veya parola hatalı.",
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Giriş sırasında beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-5 py-12">
      <div className="w-full max-w-[430px]">
        <div className="rounded-lg border border-[#dedfe3] bg-white px-8 py-10 shadow-[0_18px_55px_rgba(20,22,28,0.08)] sm:px-10">
          <div className="mb-9 text-center">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#d40000]">
              <Building2 className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#14151a]">
              Aklar İnşaat
            </h1>
            <p className="mt-2 text-sm text-[#686d78]">Yönetim paneli girişi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#24262d]"
              >
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12 w-full rounded-md border border-[#cfd2d8] bg-white px-3.5 text-[15px] text-[#15171c] outline-none transition focus:border-[#d40000] focus:ring-2 focus:ring-red-100"
                placeholder="yonetim@orduaklarinsaat.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#24262d]"
              >
                Parola
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12 w-full rounded-md border border-[#cfd2d8] bg-white px-3.5 text-[15px] text-[#15171c] outline-none transition focus:border-[#d40000] focus:ring-2 focus:ring-red-100"
                placeholder="Parolanız"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-md bg-[#d40000] px-4 text-sm font-semibold text-white transition hover:bg-[#b90000] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#7a7f89]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Güvenli sahip oturumu · 12 saat
          </p>
        </div>
      </div>
    </main>
  );
}
