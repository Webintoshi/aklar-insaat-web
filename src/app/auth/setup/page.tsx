"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      setSuccess(true);
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Admin Hesabı Oluştur
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Yeni bir admin kullanıcısı oluşturun
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg shadow-gray-200/50 sm:rounded-2xl sm:px-10">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Başarılı!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Admin hesabı oluşturuldu. Şimdi{" "}
                    <Link href="/auth/login" className="font-medium underline">
                      giriş yapabilirsiniz
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Hata</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Adresi
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1E3A5F] focus:border-[#1E3A5F] sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1E3A5F] focus:border-[#1E3A5F] sm:text-sm"
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1E3A5F] focus:border-[#1E3A5F] sm:text-sm"
                placeholder="••••••"
              />
              <p className="mt-1 text-xs text-gray-500">En az 6 karakter olmalıdır</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#152a45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Admin Oluştur"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="font-medium text-[#1E3A5F] hover:text-[#152a45]">
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
