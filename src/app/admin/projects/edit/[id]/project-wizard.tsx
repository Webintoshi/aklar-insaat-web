"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Copy,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { projectSlugFromName } from "@/lib/projects/slug";

type UnitType = {
  id?: string;
  label: string;
  areaMin: number;
  areaMax: number;
};

type ProjectMedia = {
  id: string;
  objectKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  category: "cover" | "exterior" | "interior" | "location";
  position: number;
  altText: string | null;
};

type InitialProject = {
  id: string;
  name: string;
  slug: string;
  projectType: "housing" | "villa" | "commercial" | "mixed";
  publicationStatus: "draft" | "published" | "archived";
  constructionStage: "ongoing" | "completed" | null;
  shortDescription: string | null;
  longDescription: string | null;
  completionDate: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  address: string | null;
  mapsUrl: string | null;
  videoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  version: number;
  unitTypes: UnitType[];
  features: Array<{ name: string }>;
  media: ProjectMedia[];
};

type ProjectForm = {
  name: string;
  slug: string;
  projectType: InitialProject["projectType"];
  constructionStage: InitialProject["constructionStage"];
  shortDescription: string;
  longDescription: string;
  completionDate: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  mapsUrl: string;
  videoUrl: string;
  seoTitle: string;
  seoDescription: string;
  unitTypes: UnitType[];
  featureNames: string[];
};

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete" | "failed";
  error?: string;
};

const steps = [
  "Proje Türü",
  "Temel Bilgiler",
  "Konum ve Daireler",
  "Fotoğraf ve Medya",
  "Önizleme ve Yayın",
] as const;

const typeOptions = [
  { value: "housing", label: "Konut Projesi" },
  { value: "villa", label: "Villa Projesi" },
  { value: "commercial", label: "Ticari Proje" },
  { value: "mixed", label: "Karma Proje" },
] as const;

const categoryLabels = {
  cover: "Kapak",
  exterior: "Dış Mekân",
  interior: "İç Mekân",
  location: "Konum",
} as const;

function initialForm(project: InitialProject): ProjectForm {
  return {
    name: project.name === "Adsız Proje" ? "" : project.name,
    slug: project.slug,
    projectType: project.projectType,
    constructionStage: project.constructionStage,
    shortDescription: project.shortDescription ?? "",
    longDescription: project.longDescription ?? "",
    completionDate: project.completionDate ?? "",
    city: project.city ?? "",
    district: project.district ?? "",
    neighborhood: project.neighborhood ?? "",
    address: project.address ?? "",
    mapsUrl: project.mapsUrl ?? "",
    videoUrl: project.videoUrl ?? "",
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
    unitTypes: project.unitTypes,
    featureNames: project.features.map((feature) => feature.name),
  };
}

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", contentType);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("R2 yüklemesi tamamlanamadı."));
    });
    request.addEventListener("error", () => reject(new Error("Ağ bağlantısı kesildi.")));
    request.send(file);
  });
}

function fileContentType(file: File) {
  if (file.type) return file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  return "";
}

export function ProjectWizard({ initialProject }: { initialProject: InitialProject }) {
  const [step, setStep] = useState(2);
  const [form, setForm] = useState<ProjectForm>(() => initialForm(initialProject));
  const [media, setMedia] = useState(initialProject.media);
  const [version, setVersion] = useState(initialProject.version);
  const versionRef = useRef(initialProject.version);
  const [revision, setRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "conflict">(
    "saved",
  );
  const [message, setMessage] = useState("");
  const [mediaCategory, setMediaCategory] = useState<ProjectMedia["category"]>("cover");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [publishing, setPublishing] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const enqueueSave = useCallback(
    (snapshot: ProjectForm) => {
      const save = async () => {
        setSaveStatus("saving");
        const response = await fetch("/api/admin/projects/" + initialProject.id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...snapshot,
            name: snapshot.name,
            slug: snapshot.name ? projectSlugFromName(snapshot.name) : snapshot.slug,
            completionDate: snapshot.completionDate || null,
            mapsUrl: snapshot.mapsUrl || null,
            videoUrl: snapshot.videoUrl || null,
            version: versionRef.current,
          }),
        });
        const result = await response.json();
        if (response.status === 409) {
          setSaveStatus("conflict");
          throw new Error(result.error);
        }
        if (!response.ok) {
          setSaveStatus("error");
          throw new Error(result.error || "Taslak kaydedilemedi.");
        }
        versionRef.current = result.project.version;
        setVersion(result.project.version);
        setSaveStatus("saved");
      };

      const queued = saveQueue.current.then(save, save);
      saveQueue.current = queued.catch(() => undefined);
      return queued;
    },
    [initialProject.id],
  );

  useEffect(() => {
    if (revision === 0 || saveStatus === "conflict") return;
    const snapshot = form;
    const timer = window.setTimeout(() => {
      enqueueSave(snapshot).catch((error) => {
        setMessage(error instanceof Error ? error.message : "Taslak kaydedilemedi.");
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [enqueueSave, form, revision, saveStatus]);

  function updateForm<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setRevision((current) => current + 1);
    setMessage("");
  }

  async function saveAndMove(nextStep: number) {
    try {
      await enqueueSave(form);
      setStep(Math.max(1, Math.min(5, nextStep)));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Taslak kaydedilemedi.");
    }
  }

  async function reloadMedia() {
    const response = await fetch("/api/admin/projects/" + initialProject.id);
    if (!response.ok) return;
    const result = await response.json();
    setMedia(result.project.media);
  }

  async function uploadFile(file: File) {
    const uploadId = crypto.randomUUID();
    const contentType = fileContentType(file);
    setUploads((current) => [
      ...current.filter((item) => item.file !== file),
      { id: uploadId, file, progress: 0, status: "uploading" },
    ]);

    try {
      const presignResponse = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: initialProject.id,
          category: mediaCategory,
          contentType,
          fileSize: file.size,
          originalName: file.name,
        }),
      });
      const presign = await presignResponse.json();
      if (!presignResponse.ok) throw new Error(presign.error || "Yükleme başlatılamadı.");

      await uploadWithProgress(presign.uploadUrl, file, contentType, (progress) => {
        setUploads((current) =>
          current.map((item) => (item.id === uploadId ? { ...item, progress } : item)),
        );
      });

      const completeResponse = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: initialProject.id,
          category: mediaCategory,
          objectKey: presign.objectKey,
          originalName: file.name,
        }),
      });
      const completed = await completeResponse.json();
      if (!completeResponse.ok) {
        throw new Error(completed.error || "Yükleme doğrulanamadı.");
      }
      setUploads((current) =>
        current.map((item) =>
          item.id === uploadId ? { ...item, progress: 100, status: "complete" } : item,
        ),
      );
      await reloadMedia();
    } catch (error) {
      setUploads((current) =>
        current.map((item) =>
          item.id === uploadId
            ? {
                ...item,
                status: "failed",
                error: error instanceof Error ? error.message : "Yükleme başarısız.",
              }
            : item,
        ),
      );
    }
  }

  async function manageMedia(item: ProjectMedia, action: "previous" | "next" | "remove") {
    if (action === "remove" && !window.confirm("Bu görsel projeden kaldırılacak. R2 nesnesi Medya Merkezi'nde korunur. Devam edilsin mi?")) return;
    const response = await fetch(`/api/admin/projects/${initialProject.id}/media/${item.id}`, {
      method: action === "remove" ? "DELETE" : "PATCH",
      headers: action === "remove" ? undefined : { "Content-Type": "application/json" },
      body: action === "remove" ? undefined : JSON.stringify({ direction: action === "previous" ? -1 : 1 }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setMessage(result.error || "Medya güncellenemedi.");
      return;
    }
    await reloadMedia();
  }

  async function publish() {
    setPublishing(true);
    setMessage("");
    try {
      await enqueueSave(form);
      const response = await fetch(
        "/api/admin/projects/" + initialProject.id + "/publish",
        { method: "POST" },
      );
      const result = await response.json();
      if (!response.ok) {
        const fieldErrors = result.issues?.fieldErrors;
        const errors = fieldErrors
          ? Object.values(fieldErrors).flat().filter(Boolean).join(" ")
          : result.error;
        throw new Error(errors || "Proje yayınlanamadı.");
      }
      setMessage("Proje başarıyla yayınlandı.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Proje yayınlanamadı.");
    } finally {
      setPublishing(false);
    }
  }

  const publicBase = process.env.NEXT_PUBLIC_SITE_URL || "https://orduaklarinsaat.com";
  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://media.orduaklarinsaat.com";
  const cover = media.find((item) => item.category === "cover");

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-7 flex items-start justify-between gap-5">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Yeni Proje Ekle</h1>
          <p className="mt-1 text-sm text-[#707581]">
            Bilgileriniz 800 ms sonra otomatik olarak taslağa kaydedilir.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {saveStatus === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveStatus === "saved" && <CheckCircle2 className="h-4 w-4 text-[#168343]" />}
          <span className={saveStatus === "conflict" ? "text-red-700" : "text-[#656b76]"}>
            {saveStatus === "saving"
              ? "Taslak kaydediliyor"
              : saveStatus === "saved"
                ? "Taslak kaydedildi"
                : saveStatus === "conflict"
                  ? "Düzenleme çakışması"
                  : "Kayıt hatası"}
          </span>
        </div>
      </div>

      <div className="mb-7 overflow-x-auto border-b border-[#dfe2e6] pb-6">
        <ol className="flex min-w-[780px] items-start">
          {steps.map((label, index) => {
            const number = index + 1;
            const active = number === step;
            const completed = number < step;
            return (
              <li key={label} className="flex flex-1 items-start">
                <button
                  type="button"
                  onClick={() => setStep(number)}
                  className="flex min-w-24 flex-col items-center gap-2 text-center"
                >
                  <span
                    className={
                      active || completed
                        ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#d40000] text-sm font-semibold text-white"
                        : "flex h-10 w-10 items-center justify-center rounded-full border border-[#bfc4cc] bg-white text-sm text-[#555b66]"
                    }
                  >
                    {completed ? <Check className="h-4 w-4" /> : number}
                  </span>
                  <span className="text-xs font-medium text-[#333740]">{number} {label}</span>
                </button>
                {number < 5 && (
                  <span className={completed ? "mt-5 h-[2px] flex-1 bg-[#d40000]" : "mt-5 h-px flex-1 bg-[#cfd3d9]"} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {message && (
        <p
          role="status"
          className="mb-5 rounded-md border border-[#e0e2e6] bg-white p-4 text-sm text-[#5c626d]"
        >
          {message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="min-w-0">
          {step === 1 && (
            <WizardSection
              title="Proje Türü"
              description="İlanınıza en uygun proje türünü seçin."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateForm("projectType", option.value)}
                    className={
                      form.projectType === option.value
                        ? "h-20 rounded-md border border-[#d40000] bg-[#fff8f8] px-5 text-left font-semibold text-[#d40000]"
                        : "h-20 rounded-md border border-[#d7dae0] bg-white px-5 text-left font-semibold text-[#333740]"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </WizardSection>
          )}

          {step === 2 && (
            <WizardSection
              title="Temel Bilgiler"
              description="Bu bilgiler projenizin tanıtımında kullanılacaktır."
            >
              <Field label="Proje Adı" required hint={String(form.name.length) + " / 160"}>
                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="admin-input"
                  maxLength={160}
                />
              </Field>
              <Field label="Proje Durumu" required>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "ongoing", label: "Devam Ediyor" },
                    { value: "completed", label: "Tamamlandı" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        updateForm(
                          "constructionStage",
                          option.value as "ongoing" | "completed",
                        )
                      }
                      className={
                        form.constructionStage === option.value
                          ? "h-12 rounded-md border border-[#d40000] bg-[#fff8f8] px-4 text-left text-sm font-medium"
                          : "h-12 rounded-md border border-[#d5d8de] px-4 text-left text-sm"
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Kısa Açıklama" required hint={String(form.shortDescription.length) + " / 320"}>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) => updateForm("shortDescription", event.target.value)}
                  className="admin-input min-h-24 resize-y py-3"
                  maxLength={320}
                />
              </Field>
              <Field label="Uzun Açıklama" required>
                <textarea
                  value={form.longDescription}
                  onChange={(event) => updateForm("longDescription", event.target.value)}
                  className="admin-input min-h-44 resize-y py-3"
                />
              </Field>
              <Field label="Tamamlanma Tarihi">
                <input
                  type="date"
                  value={form.completionDate}
                  onChange={(event) => updateForm("completionDate", event.target.value)}
                  className="admin-input max-w-72"
                />
              </Field>
            </WizardSection>
          )}

          {step === 3 && (
            <WizardSection
              title="Konum ve Daireler"
              description="Adres ve proje içindeki daire tipi seçeneklerini girin."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="İl" required>
                  <input value={form.city} onChange={(event) => updateForm("city", event.target.value)} className="admin-input" />
                </Field>
                <Field label="İlçe" required>
                  <input value={form.district} onChange={(event) => updateForm("district", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Mahalle" required>
                  <input value={form.neighborhood} onChange={(event) => updateForm("neighborhood", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Google Maps Bağlantısı">
                  <input type="url" value={form.mapsUrl} onChange={(event) => updateForm("mapsUrl", event.target.value)} className="admin-input" placeholder="https://maps.google.com/..." />
                </Field>
              </div>
              <Field label="Açık Adres" required>
                <textarea value={form.address} onChange={(event) => updateForm("address", event.target.value)} className="admin-input min-h-24 py-3" />
              </Field>
              <div className="mt-7 border-t border-[#e2e4e8] pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Daire Tipleri</h3>
                  <button
                    type="button"
                    onClick={() => updateForm("unitTypes", [...form.unitTypes, { label: "", areaMin: 1, areaMax: 1 }])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d40000]"
                  >
                    <Plus className="h-4 w-4" /> Daire Tipi Ekle
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {form.unitTypes.map((unit, index) => (
                    <div key={unit.id || index} className="grid gap-3 rounded-md border border-[#dfe2e6] p-4 sm:grid-cols-[1fr_130px_130px_40px]">
                      <input
                        aria-label="Daire tipi"
                        value={unit.label}
                        onChange={(event) => {
                          const units = [...form.unitTypes];
                          units[index] = { ...unit, label: event.target.value };
                          updateForm("unitTypes", units);
                        }}
                        className="admin-input"
                        placeholder="3+1"
                      />
                      <input
                        aria-label="Minimum metrekare"
                        type="number"
                        min={1}
                        value={unit.areaMin}
                        onChange={(event) => {
                          const units = [...form.unitTypes];
                          units[index] = { ...unit, areaMin: Number(event.target.value) };
                          updateForm("unitTypes", units);
                        }}
                        className="admin-input"
                      />
                      <input
                        aria-label="Maksimum metrekare"
                        type="number"
                        min={1}
                        value={unit.areaMax}
                        onChange={(event) => {
                          const units = [...form.unitTypes];
                          units[index] = { ...unit, areaMax: Number(event.target.value) };
                          updateForm("unitTypes", units);
                        }}
                        className="admin-input"
                      />
                      <button
                        type="button"
                        aria-label="Daire tipini kaldır"
                        onClick={() => updateForm("unitTypes", form.unitTypes.filter((_, itemIndex) => itemIndex !== index))}
                        className="flex h-11 items-center justify-center text-[#777c87] hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {form.unitTypes.length === 0 && (
                    <p className="rounded-md border border-dashed border-[#cfd3d9] p-7 text-center text-sm text-[#7b808b]">
                      Yayınlamak için en az bir daire tipi ekleyin.
                    </p>
                  )}
                </div>
              </div>
            </WizardSection>
          )}

          {step === 4 && (
            <WizardSection
              title="Fotoğraf ve Medya"
              description="Görseller Cloudflare R2’ye doğrudan ve güvenli biçimde yüklenir."
            >
              <div className="grid gap-3 sm:grid-cols-4">
                {(Object.keys(categoryLabels) as ProjectMedia["category"][]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setMediaCategory(category)}
                    className={
                      mediaCategory === category
                        ? "h-11 rounded-md border border-[#d40000] bg-[#fff8f8] text-sm font-semibold text-[#d40000]"
                        : "h-11 rounded-md border border-[#d6d9df] text-sm text-[#555b66]"
                    }
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>
              <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#bfc4cc] bg-[#fcfcfd] px-5 text-center hover:border-[#d40000]">
                <CloudUpload className="h-8 w-8 text-[#d40000]" />
                <span className="mt-3 text-sm font-semibold">Görselleri seçin</span>
                <span className="mt-1 text-xs text-[#777c87]">
                  JPEG, PNG, WebP, HEIC/HEIF · dosya başına en fazla 20 MB
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                  className="sr-only"
                  onChange={(event) => {
                    Array.from(event.target.files ?? []).forEach((file) => uploadFile(file));
                    event.target.value = "";
                  }}
                />
              </label>

              <div className="mt-5 space-y-2">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-3 rounded-md border border-[#e0e2e6] p-3 text-xs">
                    <ImageIcon className="h-4 w-4 text-[#777c87]" />
                    <span className="min-w-0 flex-1 truncate">{upload.file.name}</span>
                    <span>{upload.progress}%</span>
                    {upload.status === "failed" && (
                      <button type="button" onClick={() => uploadFile(upload.file)} className="font-semibold text-[#d40000]">
                        Yeniden dene
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((item) => (
                  <figure key={item.id} className="overflow-hidden rounded-md border border-[#e0e2e6] bg-white">
                    <div className="relative aspect-[4/3] bg-[#f1f2f4]">
                      <Image src={r2Base + "/" + item.objectKey} alt={item.altText || item.originalName} fill className="object-cover" sizes="260px" />
                    </div>
                    <figcaption className="px-3 py-2 text-xs text-[#656b76]">
                      <p className="truncate">{categoryLabels[item.category]} · {item.originalName}</p>
                      <div className="mt-2 flex items-center justify-end gap-1 border-t border-[#eceef1] pt-2">
                        <button type="button" onClick={() => manageMedia(item, "previous")} aria-label="Görseli önceye taşı" className="rounded p-1.5 hover:bg-[#f1f2f4]"><ChevronLeft className="h-4 w-4" /></button>
                        <button type="button" onClick={() => manageMedia(item, "next")} aria-label="Görseli sonraya taşı" className="rounded p-1.5 hover:bg-[#f1f2f4]"><ChevronRight className="h-4 w-4" /></button>
                        <button type="button" onClick={() => manageMedia(item, "remove")} aria-label="Görseli projeden kaldır" className="rounded p-1.5 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <Field label="YouTube veya Vimeo Bağlantısı">
                <input type="url" value={form.videoUrl} onChange={(event) => updateForm("videoUrl", event.target.value)} className="admin-input" placeholder="https://www.youtube.com/watch?v=..." />
              </Field>
            </WizardSection>
          )}

          {step === 5 && (
            <WizardSection
              title="Önizleme ve Yayın"
              description="Masaüstü ve mobil görünümü kontrol edip yayınlayın."
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex rounded-md border border-[#d8dbe0] p-1">
                  <button type="button" onClick={() => setPreviewMode("desktop")} className={previewMode === "desktop" ? "rounded bg-[#ededf0] p-2" : "rounded p-2"}>
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setPreviewMode("mobile")} className={previewMode === "mobile" ? "rounded bg-[#ededf0] p-2" : "rounded p-2"}>
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" onClick={() => navigator.clipboard.writeText(publicBase + "/projeler/" + projectSlugFromName(form.name || "proje"))} className="inline-flex items-center gap-1.5 text-xs text-[#676d78]">
                  <Copy className="h-4 w-4" /> Bağlantıyı Kopyala
                </button>
              </div>
              <div className={previewMode === "mobile" ? "mx-auto max-w-[390px] overflow-hidden rounded-lg border border-[#d9dce1] bg-white" : "overflow-hidden rounded-lg border border-[#d9dce1] bg-white"}>
                {cover ? (
                  <div className="relative aspect-[16/8]">
                    <Image src={r2Base + "/" + cover.objectKey} alt={form.name || "Proje kapağı"} fill className="object-cover" sizes="900px" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/8] items-center justify-center bg-[#f1f2f4] text-sm text-[#777c87]">Kapak görseli bekleniyor</div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{form.name || "Proje adı"}</h3>
                  <p className="mt-2 text-sm text-[#6d727e]">{form.shortDescription || "Kısa proje açıklaması"}</p>
                  <p className="mt-4 text-xs text-[#858a94]">{[form.neighborhood, form.district, form.city].filter(Boolean).join(", ") || "Konum bilgisi"}</p>
                </div>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Field label="SEO Başlığı" hint={String(form.seoTitle.length) + " / 70"}>
                  <input value={form.seoTitle} onChange={(event) => updateForm("seoTitle", event.target.value)} className="admin-input" maxLength={70} />
                </Field>
                <Field label="SEO Açıklaması" hint={String(form.seoDescription.length) + " / 170"}>
                  <textarea value={form.seoDescription} onChange={(event) => updateForm("seoDescription", event.target.value)} className="admin-input min-h-24 py-3" maxLength={170} />
                </Field>
              </div>
              <button type="button" disabled={publishing} onClick={publish} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#d40000] px-6 text-sm font-semibold text-white hover:bg-[#b90000] disabled:opacity-55">
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Projeyi Yayınla
              </button>
            </WizardSection>
          )}
        </section>

        <aside className="self-start rounded-md border border-[#dfe2e6] bg-white p-6 xl:sticky xl:top-[84px]">
          <h2 className="text-lg font-semibold">Proje Özeti</h2>
          <p className="mt-5 text-xs text-[#747a85]">Tamamlanma Oranı</p>
          <div className="mt-2 h-2 overflow-hidden rounded bg-[#e4e6e9]">
            <span className="block h-full bg-[#d40000]" style={{ width: String(step * 20) + "%" }} />
          </div>
          <ol className="mt-6 space-y-4 border-y border-[#e3e5e8] py-5">
            {steps.map((label, index) => (
              <li key={label} className="flex items-center gap-3 text-xs">
                <span className={index + 1 <= step ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#d40000] text-white" : "flex h-6 w-6 items-center justify-center rounded-full border border-[#cbd0d7] text-[#7b808b]"}>
                  {index + 1}
                </span>
                <span className={index + 1 === step ? "font-semibold text-[#d40000]" : "text-[#6d737e]"}>{label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs font-semibold">Proje Linki</p>
          <p className="mt-2 truncate rounded-md border border-[#d9dce1] bg-[#fafafa] px-3 py-3 text-xs text-[#5e646f]">
            {publicBase + "/projeler/" + projectSlugFromName(form.name || "proje")}
          </p>
          <p className="mt-4 text-[11px] leading-5 text-[#7a808b]">Sürüm {version} · Yayınlamadan önce ad, açıklamalar, konum, daire tipi, kapak ve en az üç görsel kontrol edilir.</p>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 mt-7 flex items-center justify-between border-t border-[#dfe2e6] bg-white/95 px-1 py-5 backdrop-blur">
        <button type="button" disabled={step === 1} onClick={() => saveAndMove(step - 1)} className="inline-flex h-11 items-center gap-2 rounded-md border border-[#afb4bd] px-5 text-sm font-semibold disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => enqueueSave(form)} className="hidden h-11 items-center gap-2 rounded-md border border-[#afb4bd] px-5 text-sm font-semibold sm:inline-flex">
            <Save className="h-4 w-4" /> Taslak Olarak Kaydet
          </button>
          {step < 5 && (
            <button type="button" onClick={() => saveAndMove(step + 1)} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d40000] px-6 text-sm font-semibold text-white hover:bg-[#b90000]">
              Kaydet ve Devam Et <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WizardSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-[-0.015em]">{title}</h2>
      <p className="mt-1 text-sm text-[#747a85]">{description}</p>
      <div className="mt-7 space-y-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold text-[#343840]">
        <span>
          {label} {required && <span className="text-[#d40000]">*</span>}
        </span>
        {hint && <span className="text-[11px] font-normal text-[#858a94]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
