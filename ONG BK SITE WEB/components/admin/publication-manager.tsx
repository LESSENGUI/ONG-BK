"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Archive, FilePlus2, FileText, Newspaper, RefreshCw } from "lucide-react";
import { createArticleSlug } from "@/lib/public-articles";

const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest";
const labelClass = "block text-sm font-semibold text-ink";

type PublicationItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: string;
  status: string;
  publishedAt: string | null;
};

type PublicationList = { items: PublicationItem[] };

async function request<T = { title?: string; status?: string }>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers },
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
      ? result.error
      : "Une erreur est survenue. Réessayez.";
    throw new Error(message);
  }
  return result as T;
}

export function PublicationManager({
  canPublish,
  canCreateArticles,
  canUploadPdf,
  canRead,
  canArchive,
}: {
  canPublish: boolean;
  canCreateArticles: boolean;
  canUploadPdf: boolean;
  canRead: boolean;
  canArchive: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [publicationType, setPublicationType] = useState("NEWS");

  const loadPublications = useCallback(async () => {
    if (!canRead) return;
    try {
      const result = await request<PublicationList>("/api/admin/publications?page=1&pageSize=50");
      setPublications(result.items);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible de charger les publications.");
    }
  }, [canRead]);

  useEffect(() => {
    void loadPublications();
  }, [loadPublications]);

  async function archivePublication(publication: PublicationItem) {
    if (!window.confirm(`Retirer « ${publication.title} » du site public ? Cette action l’archive sans supprimer son historique.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await request(`/api/admin/publications/${publication.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "archive" }),
      });
      setMessage("Publication retirée de la vitrine publique et archivée.");
      await loadPublications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible d’archiver cette publication.");
    } finally {
      setBusy(false);
    }
  }

  async function createWrittenArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title") ?? "").trim();
    const slug = createArticleSlug(title);
    const type = String(form.get("type") ?? "NEWS");
    const applicationStart = String(form.get("applicationStart") ?? "");
    const applicationEnd = String(form.get("applicationEnd") ?? "");
    const tags = String(form.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);
    if (["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"].includes(type)) {
      if (Boolean(applicationStart) !== Boolean(applicationEnd)) {
        setError("Renseignez les deux dates de candidature ou laissez-les toutes les deux vides.");
        setBusy(false);
        return;
      }
      if (applicationStart && applicationEnd) {
        if (applicationEnd < applicationStart) {
          setError("La date de clôture doit être égale ou postérieure à la date d’ouverture.");
          setBusy(false);
          return;
        }
        tags.push(`CANDIDATURES:${applicationStart}/${applicationEnd}`);
      }
    }
    try {
      const created = await request("/api/admin/publications", {
        method: "POST",
        body: JSON.stringify({
          type,
          title,
          slug,
          summary: form.get("summary"),
          body: form.get("body"),
          category: form.get("category"),
          tags,
          galleryMediaIds: [],
          action: canPublish ? "publish" : "submit",
        }),
      });
      setMessage(canPublish ? "Article publié." : "Article transmis pour validation.");
      formElement.reset();
      if (created.title) setMessage(`${canPublish ? "Article publié" : "Article transmis pour validation"} : ${created.title}.`);
      await loadPublications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible d’enregistrer l’article.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Sélectionnez un fichier PDF valide.");
      setBusy(false);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Le PDF ne doit pas dépasser 10 Mo.");
      setBusy(false);
      return;
    }
    form.set("metadata", JSON.stringify({
      title: form.get("title"),
      category: "OTHER",
      documentDate: form.get("documentDate") || null,
      version: "1",
      confidentiality: "PUBLIC",
      status: "PENDING_REVIEW",
    }));
    try {
      await request("/api/admin/documents", { method: "POST", body: form });
      setMessage("PDF déposé dans le stockage privé et transmis pour validation avant publication.");
      formElement.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impossible de déposer le PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="section-eyebrow">Espace éditorial</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Articles et publications</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">Rédigez un article ou déposez un document PDF. Seuls les contenus publiés après validation apparaissent sur le site public.</p>
      </header>
      {message && <p className="rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 text-sm font-semibold text-forest" role="status">{message}</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

      {canRead && (
        <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-eyebrow">Suivi et retrait</p>
              <h2 className="mt-2 font-display text-xl font-bold text-ink">Publications et appels en ligne</h2>
              <p className="mt-1 text-sm text-ink/55">Archiver retire le contenu de la vitrine sans effacer son historique.</p>
            </div>
            <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink hover:bg-paper disabled:opacity-50" disabled={busy} onClick={() => void loadPublications()} type="button"><RefreshCw size={15} /> Actualiser</button>
          </div>
          <div className="mt-5 divide-y divide-ink/10">
            {publications.filter((item) => ["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"].includes(item.type)).map((publication) => (
              <article className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" key={publication.id}>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">{publication.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink/60">{publication.summary}</p>
                  <p className="mt-1 text-xs text-ink/45">{publication.type === "TRAINING_CALL" ? "Candidature à une formation" : publication.type === "VOLUNTEER_CALL" ? "Appel à candidature bénévole" : "Appel à projets"} · {publication.status === "PUBLISHED" ? "Publié" : publication.status === "PENDING_REVIEW" ? "En attente de validation" : publication.status}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {publication.status === "PUBLISHED" && <Link className="inline-flex min-h-9 items-center rounded-full border border-ink/15 px-3 text-xs font-semibold text-ink hover:bg-paper" href={["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"].includes(publication.type) ? `/actions/offres/${publication.slug}` : `/actualites/${publication.slug}`} target="_blank">Voir en ligne</Link>}
                  {canArchive && publication.status !== "ARCHIVED" && <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={busy} onClick={() => void archivePublication(publication)} type="button"><Archive size={14} /> Retirer / archiver</button>}
                </div>
              </article>
            ))}
            {!publications.some((item) => ["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"].includes(item.type)) && <p className="py-6 text-sm text-ink/55">Aucun appel à candidature ni appel à projets enregistré.</p>}
          </div>
        </section>
      )}

      {canCreateArticles && (
        <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest"><Newspaper size={20} /></span>
            <div><h2 className="text-xl font-bold text-ink">Rédiger un article</h2><p className="mt-1 text-sm text-ink/55">Le lien de l’article sera créé à partir de son titre.</p></div>
          </div>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(event) => void createWrittenArticle(event)}>
            <label className={`${labelClass} sm:col-span-2`}>Titre<input className={inputClass} maxLength={240} name="title" required /></label>
            <label className={labelClass}>Type<select className={inputClass} name="type" onChange={(event) => setPublicationType(event.target.value)} value={publicationType}><option value="NEWS">Actualité</option><option value="PUBLICATION">Article</option><option value="ANNOUNCEMENT">Communiqué</option><option value="ACTIVITY_REPORT">Rapport d’activité</option><option value="CAMPAIGN">Campagne</option><option value="VOLUNTEER_CALL">Appel à candidature bénévole</option><option value="PROJECT_CALL">Appel à projets</option><option value="TRAINING_CALL">Candidature à une formation</option></select></label>
            <label className={labelClass}>Rubrique<input className={inputClass} maxLength={120} name="category" placeholder="Ex. Éducation, inclusion..." /></label>
            {["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"].includes(publicationType) && (
              <>
                <label className={labelClass}>Ouverture des candidatures<input className={inputClass} name="applicationStart" type="date" /></label>
                <label className={labelClass}>Clôture des candidatures<input className={inputClass} name="applicationEnd" type="date" /></label>
              </>
            )}
            <label className={`${labelClass} sm:col-span-2`}>Résumé<input className={inputClass} maxLength={1000} name="summary" required /></label>
            <label className={`${labelClass} sm:col-span-2`}>Texte et détails<textarea className={`${inputClass} min-h-56 resize-y`} maxLength={50000} name="body" placeholder="Décrivez le contexte, les objectifs, le profil recherché, les missions, les critères, les modalités de candidature et l’échéance lorsqu’elle est connue." required /></label>
            <label className={`${labelClass} sm:col-span-2`}>Mots-clés <span className="font-normal text-ink/45">(séparés par des virgules)</span><input className={inputClass} maxLength={500} name="tags" placeholder="Jeunesse, éducation, solidarité" /></label>
            <div className="sm:col-span-2">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-50" disabled={busy} type="submit">
                <FilePlus2 size={17} />{busy ? "Enregistrement..." : canPublish ? "Enregistrer et publier" : "Transmettre pour validation"}
              </button>
            </div>
          </form>
        </section>
      )}

      {canUploadPdf && (
        <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-magenta/10 text-magenta"><FileText size={20} /></span>
            <div><h2 className="text-xl font-bold text-ink">Ajouter un article en PDF</h2><p className="mt-1 text-sm text-ink/55">Le fichier est contrôlé et stocké hors du dossier public.</p></div>
          </div>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" encType="multipart/form-data" onSubmit={(event) => void uploadPdf(event)}>
            <label className={`${labelClass} sm:col-span-2`}>Titre du document<input className={inputClass} maxLength={240} name="title" required /></label>
            <label className={labelClass}>Date du document<input className={inputClass} name="documentDate" type="date" /></label>
            <label className={labelClass}>Fichier PDF<input accept="application/pdf,.pdf" className={inputClass} name="file" required type="file" /></label>
            <p className="text-xs leading-5 text-ink/55 sm:col-span-2">Maximum 10 Mo. Le document sera marqué public mais restera invisible jusqu’à sa validation par une personne disposant des droits documentaires.</p>
            <div className="sm:col-span-2">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest/20 px-5 text-sm font-semibold text-forest transition hover:bg-forest/5 disabled:opacity-50" disabled={busy} type="submit">
                <FilePlus2 size={17} />{busy ? "Dépôt en cours..." : "Déposer le PDF pour validation"}
              </button>
            </div>
          </form>
        </section>
      )}

      {canUploadPdf && <p className="rounded-2xl bg-[#fbfaf8] p-5 text-sm leading-6 text-ink/65">Pour examiner et publier un PDF après dépôt, ouvrez la <Link className="font-semibold text-forest underline underline-offset-4" href="/admin/institutionnel">gestion des documents</Link>. Le site public ne sert que les documents dont la publication a été approuvée.</p>}
    </div>
  );
}
