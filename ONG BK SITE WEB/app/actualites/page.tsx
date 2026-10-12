import { PageHero } from "@/components/page-hero";
import { Newsroom } from "@/components/newsroom";
import { db } from "@/lib/db";
import { equalityArticle } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [publications, pdfDocuments] = process.env.DATABASE_URL
    ? await Promise.all([
      db.publication.findMany({
        where: { status: "PUBLISHED", archivedAt: null, publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 48,
        select: {
          slug: true,
          type: true,
          title: true,
          summary: true,
          category: true,
          publishedAt: true,
          coverMedia: { select: { id: true, mediaType: true } },
        },
      }),
      db.officialDocument.findMany({
        where: {
          status: "PUBLISHED",
          archivedAt: null,
          confidentiality: "PUBLIC",
          category: "OTHER",
          mediaType: "application/pdf",
        },
        orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
        take: 48,
        select: { id: true, title: true, category: true, documentDate: true, createdAt: true },
      }),
    ])
    : [[], []];

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        eyebrow="Actualités & médias"
        title="Les nouvelles qui font avancer nos communautés."
        description="Articles, actualités et documents de l’ONG-BK : retrouvez les initiatives, les idées et les ressources qui nourrissent l’engagement."
        image="/images/action-communaute.jpg"
        primaryLabel="Explorer les publications"
        primaryHref="#publications"
        secondaryLabel="Nous contacter"
        secondaryHref="/contact"
      />
      <Newsroom
        equalityArticle={equalityArticle}
        publications={publications.map((item) => ({
          ...item,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          coverMedia: item.coverMedia?.mediaType.startsWith("image/") ? item.coverMedia : null,
        }))}
        pdfDocuments={pdfDocuments.map((item) => ({
          ...item,
          documentDate: item.documentDate?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
