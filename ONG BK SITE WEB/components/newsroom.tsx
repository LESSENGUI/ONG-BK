"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowRight, CalendarDays, FileText, Search } from "lucide-react";
import type { EqualityArticle } from "@/lib/public-articles";

type PublicationItem = {
  slug: string;
  type: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string | null;
  coverMedia: { id: string; mediaType: string } | null;
};

type PdfItem = {
  id: string;
  title: string;
  category: string;
  documentDate: string | null;
  createdAt: string;
};

const formatDate = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date))
    : "Publication récente";

const articleTypes = new Set(["PUBLICATION"]);
const reportTypes = new Set(["REPORT", "ACTIVITY_REPORT"]);

function kindOf(type: string): "Article" | "Actualité" | "Rapport" {
  if (articleTypes.has(type)) return "Article";
  if (reportTypes.has(type)) return "Rapport";
  return "Actualité";
}

export function Newsroom({
  equalityArticle,
  publications,
  pdfDocuments,
}: {
  equalityArticle: EqualityArticle;
  publications: PublicationItem[];
  pdfDocuments: PdfItem[];
}) {
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const items = [
      {
        slug: equalityArticle.slug,
        type: "Article",
        title: equalityArticle.title,
        summary: equalityArticle.summary,
        category: equalityArticle.category,
        publishedAt: equalityArticle.publishedAt,
        image: equalityArticle.image,
      },
      ...publications.map((item) => ({
        ...item,
        type: kindOf(item.type),
        image: item.coverMedia ? `/api/media/${item.coverMedia.id}` : "/images/action-communaute.jpg",
      })),
    ];
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return items.filter((item) => {
      const matchesFilter = activeFilter === "Tout" || item.type === activeFilter;
      const matchesQuery = !normalizedQuery ||
        `${item.title} ${item.summary} ${item.category}`.toLocaleLowerCase("fr").includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, equalityArticle, publications, query]);

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="section-eyebrow">Le journal de l’ONG-BK</p>
          <h2 className="section-title mt-3">Actualités, articles et ressources.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65">
            Des nouvelles de nos actions et des contenus pour mieux comprendre les enjeux de nos communautés.
          </p>
        </div>
        <a href="#documents-pdf" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-forest/15 px-5 text-sm font-semibold text-forest transition hover:bg-forest/5">
          <FileText size={17} /> Voir les documents PDF
        </a>
      </div>

      <div className="mt-9 flex flex-col gap-4 rounded-3xl border border-ink/10 bg-[#fbfaf8] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div aria-label="Filtrer les publications" className="flex flex-wrap gap-2">
          {["Tout", "Actualité", "Article", "Rapport"].map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${activeFilter === filter ? "bg-forest text-white shadow-sm" : "bg-white text-ink/65 hover:bg-forest/5"}`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <label className="flex min-h-11 w-full items-center gap-2 rounded-full border border-ink/10 bg-white px-4 sm:max-w-[320px]">
          <Search aria-hidden="true" className="shrink-0 text-ink/40" size={17} />
          <span className="sr-only">Rechercher une publication</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un sujet..."
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3" id="publications">
        {filtered.map((item, index) => (
          <article className={`group overflow-hidden rounded-[26px] border border-ink/[0.09] bg-white shadow-[0_12px_40px_-32px_rgba(17,39,33,.32)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_-34px_rgba(17,39,33,.42)] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`} key={item.slug}>
            <Link aria-label={`Lire : ${item.title}`} className="grid h-full md:grid-cols-[.88fr_1fr]" href={`/actualites/${item.slug}`}>
              <div className="relative min-h-[230px] overflow-hidden">
                <Image alt="" className="object-cover transition duration-700 group-hover:scale-[1.04]" fill sizes="(max-width: 768px) 100vw, 50vw" src={item.image} />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-forest">{item.type}</span>
              </div>
              <div className="flex flex-col p-5 sm:p-7">
                <span className="text-xs font-semibold uppercase tracking-[.12em] text-magenta">{item.category || "ONG-BK"}</span>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">{item.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">{item.summary}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-ink/55">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(item.publishedAt)}</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-forest">Lire le détail <ArrowRight size={15} /></span>
                </div>
              </div>
            </Link>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-12 text-center md:col-span-2 xl:col-span-3">
            <p className="font-semibold text-ink">Aucun contenu ne correspond à votre recherche.</p>
            <button className="mt-3 text-sm font-semibold text-forest underline underline-offset-4" onClick={() => { setQuery(""); setActiveFilter("Tout"); }} type="button">Effacer les filtres</button>
          </div>
        )}
      </div>

      <section className="mt-16 border-t border-ink/10 pt-12" id="documents-pdf">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="section-eyebrow">À consulter et télécharger</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">Publications en PDF</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/60">Seuls les documents expressément publiés et classés publics sont disponibles ici.</p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {pdfDocuments.map((document) => (
            <article className="flex flex-col justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-5 sm:flex-row sm:items-center" key={document.id}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-magenta/10 text-magenta"><FileText size={20} /></span>
                <div>
                  <h3 className="font-semibold text-ink">{document.title}</h3>
                  <p className="mt-1 text-xs text-ink/55">{document.category.replaceAll("_", " ")} · {formatDate(document.documentDate ?? document.createdAt)}</p>
                </div>
              </div>
              <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest/90" href={`/api/documents/${document.id}`} rel="noreferrer" target="_blank">
                <ArrowDownToLine size={16} /> Ouvrir le PDF
              </a>
            </article>
          ))}
          {pdfDocuments.length === 0 && <p className="rounded-2xl bg-[#fbfaf8] px-5 py-6 text-sm text-ink/60 md:col-span-2">Aucun document PDF public n’est disponible pour le moment.</p>}
        </div>
      </section>
    </section>
  );
}
