import { ArrowRight, Building2, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getProjects } from "@/lib/api/frontend-data";

export const metadata = {
  title: "Projeler",
  description:
    "Aklar İnşaat’ın tamamlanan ve devam eden konut, villa, ticari ve karma projelerini keşfedin.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const requestedStatus = (await searchParams).status;
  const status =
    requestedStatus === "completed" || requestedStatus === "ongoing"
      ? requestedStatus
      : undefined;
  const projects = await getProjects({ status });

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[#1E3A5F] py-14 text-white lg:py-20">
        <Image
          src="/images/about-building.jpg"
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
          priority
        />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex gap-2 text-sm text-white/60">
            <Link href="/">Anasayfa</Link><span>/</span><span className="text-white">Projeler</span>
          </nav>
          <h1 className="text-4xl font-bold md:text-5xl">
            {status === "completed"
              ? "Tamamlanan Projeler"
              : status === "ongoing"
                ? "Devam Eden Projeler"
                : "Projelerimiz"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Kaliteli malzeme, çağdaş mimari ve güvenilir uygulamayla hayata geçirdiğimiz yaşam alanları.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-5 sm:px-6 lg:px-8">
          {[
            { label: "Tümü", href: "/projeler", active: !status },
            { label: "Devam Eden", href: "/projeler?status=ongoing", active: status === "ongoing" },
            { label: "Tamamlanan", href: "/projeler?status=completed", active: status === "completed" },
          ].map((filter) => (
            <Link
              key={filter.href}
              href={filter.href}
              className={
                filter.active
                  ? "whitespace-nowrap rounded-full bg-[#CF000C] px-5 py-2.5 text-sm font-semibold text-white"
                  : "whitespace-nowrap rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600"
              }
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <Link href={"/projeler/" + project.slug}>
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {project.featured_image ? (
                    <Image src={project.featured_image} alt={project.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><Building2 className="h-12 w-12 text-slate-300" /></div>
                  )}
                  <span className={project.status === "completed" ? "absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white" : "absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"}>
                    {project.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    {project.status === "completed" ? "Tamamlandı" : "Devam Ediyor"}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-800">{project.title}</h2>
                  {project.location && <p className="mt-2 text-sm text-slate-500">{project.location}</p>}
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{project.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#CF000C]">
                    Projeyi İncele <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
        {projects.length === 0 && (
          <div className="py-20 text-center text-slate-500">Bu durumda yayınlanmış proje bulunmuyor.</div>
        )}
      </section>
    </main>
  );
}
