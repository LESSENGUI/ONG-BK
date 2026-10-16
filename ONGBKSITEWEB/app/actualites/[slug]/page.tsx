import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { NewsPhotoCarousel } from "@/components/news-photo-carousel";
import { db } from "@/lib/db";
import { equalityArticle, formationIaArticle } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

const displayDate = (date: string | Date | null) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date))
    : "Publication récente";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === formationIaArticle.slug) {
    return (
      <main className="min-h-screen bg-white">
        <article className="mx-auto max-w-[900px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline" href="/actualites"><ArrowLeft size={16} /> Retour aux actualités</Link>
          <NewsPhotoCarousel images={formationIaArticle.images} />
          <header className="mx-auto max-w-[760px] pt-8 sm:pt-10">
            <p className="section-eyebrow">{formationIaArticle.category}</p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{formationIaArticle.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink/65">{formationIaArticle.summary}</p>
            <p className="mt-6 border-y border-ink/10 py-4 text-sm text-ink/55">Source éditoriale : ADIAC-CONGO</p>
          </header>
          <div className="mx-auto mt-8 max-w-[760px]">
            {formationIaArticle.sections.map((section) => (
              <section className="mb-8" key={section.heading}>
                <h2 className="font-display text-2xl font-bold text-forest">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p className="mt-4 text-base leading-8 text-ink/75" key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
            <aside className="mt-10 grid gap-3 rounded-3xl border border-ink/10 bg-[#fbfaf8] p-5 sm:grid-cols-2 sm:p-7">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-5 text-center text-sm font-bold text-white transition hover:bg-forest/90"
                href={formationIaArticle.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Lire l’article original sur ADIAC
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-forest/20 bg-white px-5 text-center text-sm font-bold text-forest transition hover:bg-forest/5"
                href={formationIaArticle.pdfUrl}
                rel="noreferrer"
                target="_blank"
              >
                Consulter le Journal officiel (PDF)
              </a>
            </aside>
            <p className="mt-3 text-xs leading-5 text-ink/45">
              Le document PDF s’ouvre dans un nouvel onglet. Il est également disponible dans les documents de l’ONG-BK.
            </p>
          </div>
        </article>
      </main>
    );
  }

  if (slug === equalityArticle.slug) {
    return (
      <main className="min-h-screen bg-white">
        <article className="mx-auto max-w-[900px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline" href="/actualites"><ArrowLeft size={16} /> Retour aux actualités</Link>
          <div className="mt-8 overflow-hidden rounded-[30px]">
            <div className="relative h-[260px] sm:h-[430px]">
              <Image alt="Jeunes réunis lors d’une activité communautaire" className="object-cover" fill priority sizes="(max-width: 900px) 100vw, 900px" src={equalityArticle.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-forest sm:bottom-7 sm:left-7">{equalityArticle.category}</span>
            </div>
          </div>
          <header className="mx-auto max-w-[760px] pt-8 sm:pt-10">
            <p className="section-eyebrow">Article de sensibilisation</p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{equalityArticle.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink/65">{equalityArticle.summary}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-ink/10 py-4 text-sm text-ink/55">
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{displayDate(equalityArticle.publishedAt)}</span>
              <span className="inline-flex items-center gap-2"><Clock3 size={16} />{equalityArticle.readingTime} de lecture</span>
              <span>ONG-BK · Éditorial de sensibilisation</span>
            </div>
          </header>
          <div className="mx-auto mt-8 max-w-[760px]">
            {equalityArticle.sections.map((section) => (
              <section className="mb-8" key={section.heading}>
                <h2 className="font-display text-2xl font-bold text-forest">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p className="mt-4 text-base leading-8 text-ink/75" key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
            <p className="rounded-2xl border-l-4 border-[#e2be44] bg-[#fbfaf8] p-5 text-base font-medium leading-8 text-ink/75">{equalityArticle.conclusion}</p>
            <div className="mt-10 flex flex-wrap gap-2">
              {equalityArticle.tags.map((tag) => <span className="rounded-full bg-forest/5 px-3 py-1.5 text-xs font-semibold text-forest" key={tag}>#{tag}</span>)}
            </div>
            <p className="mt-8 text-xs leading-5 text-ink/45">Cet article est un contenu de sensibilisation. Il ne remplace pas les textes officiels ni les services spécialisés.</p>
          </div>
        </article>
      </main>
    );
  }

  if (!process.env.DATABASE_URL) notFound();
  const publication = await db.publication.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null, publishedAt: { not: null } },
    select: { title: true, summary: true, body: true, category: true, publishedAt: true, type: true },
  });
  if (!publication) notFound();

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-[900px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline" href="/actualites"><ArrowLeft size={16} /> Retour aux actualités</Link>
        <header className="mt-9">
          <p className="section-eyebrow">{publication.category || publication.type.replaceAll("_", " ")}</p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{publication.title}</h1>
          <p className="mt-5 text-lg leading-8 text-ink/65">{publication.summary}</p>
          <div className="mt-6 flex items-center gap-2 border-y border-ink/10 py-4 text-sm text-ink/55"><CalendarDays size={16} />{displayDate(publication.publishedAt)}</div>
        </header>
        <div className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap leading-8 text-ink/75">{publication.body}</div>
      </article>
    </main>
  );
}
