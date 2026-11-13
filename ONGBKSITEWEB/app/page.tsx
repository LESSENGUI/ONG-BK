import { HomePage, type HomeNews, type HomeOpportunity, type HomePartner, type HomeProject } from "@/components/home-page";
import { db } from "@/lib/db";
import { getDomainBySlug } from "@/lib/domains";
import { getApplicationPeriod, languageTrainingOpportunity } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

function getPublicPartnerLogo(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.split("/").includes("..")) {
    return value;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getPublicPartnerWebsite(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  let activitiesUnavailable = false;
  let newsUnavailable = false;
  let projectsUnavailable = false;
  let opportunitiesUnavailable = false;
  let partnersUnavailable = false;
  const activities = process.env.DATABASE_URL
    ? await db.activity.findMany({
      where: { status: "COMPLETED", public: true, archivedAt: null },
      orderBy: [{ eventDate: "desc" }, { updatedAt: "desc" }],
      take: 12,
      select: {
        slug: true,
        title: true,
        description: true,
        domain: true,
        eventDate: true,
        location: true,
      },
    }).catch((error: unknown) => {
      activitiesUnavailable = true;
      console.error("Unable to load public activities for the home page:", error);
      return [];
    })
    : [];

  let news: HomeNews[] = [];
  let projects: HomeProject[] = [];
  let opportunities: HomeOpportunity[] = [];
  let partners: HomePartner[] = [];

  if (process.env.DATABASE_URL) {
    const now = new Date();
    const [publishedNews, publishedProjects, publishedOpportunities, confirmedPartners] = await Promise.all([
      db.publication.findMany({
        where: { type: "NEWS", status: "PUBLISHED", archivedAt: null, publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: {
          slug: true,
          title: true,
          summary: true,
          category: true,
          publishedAt: true,
          coverMedia: { select: { id: true, altText: true, status: true, publishedAt: true, archivedAt: true } },
        },
      }).catch((error: unknown) => {
        newsUnavailable = true;
        console.error("Unable to load published news for the home page:", error);
        return [];
      }),
      db.project.findMany({
        where: { status: "IN_PROGRESS", archivedAt: null, publishedAt: { not: null } },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        take: 3,
        select: {
          slug: true,
          title: true,
          description: true,
          domain: true,
          status: true,
          startDate: true,
          endDate: true,
          media: {
            where: { status: "PUBLISHED", archivedAt: null, publishedAt: { not: null }, mediaType: { startsWith: "image/" } },
            orderBy: { publishedAt: "desc" },
            take: 1,
            select: { id: true, altText: true },
          },
        },
      }).catch((error: unknown) => {
        projectsUnavailable = true;
        console.error("Unable to load published projects for the home page:", error);
        return [];
      }),
      db.publication.findMany({
        where: {
          type: { in: ["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"] },
          status: "PUBLISHED",
          archivedAt: null,
          publishedAt: { not: null },
        },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { slug: true, title: true, summary: true, category: true, type: true, tags: true, publishedAt: true },
      }).catch((error: unknown) => {
        opportunitiesUnavailable = true;
        console.error("Unable to load published opportunities for the home page:", error);
        return [];
      }),
      db.partner.findMany({
        where: {
          status: "ACTIVE",
          showOnPublicSite: true,
          logoPath: { not: null },
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, logoPath: true, website: true },
      }).catch((error: unknown) => {
        partnersUnavailable = true;
        console.error("Unable to load approved public partners for the home page:", error);
        return [];
      }),
    ]);

    news = publishedNews.flatMap((item) => {
      if (!item.publishedAt) return [];
      const coverIsPublic = item.coverMedia?.status === "PUBLISHED" && Boolean(item.coverMedia.publishedAt) && !item.coverMedia.archivedAt;
      return [{
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        category: item.category,
        publishedAt: item.publishedAt.toISOString(),
        coverMediaId: coverIsPublic ? item.coverMedia?.id ?? null : null,
        coverMediaAlt: coverIsPublic ? item.coverMedia?.altText ?? null : null,
      }];
    });

    projects = publishedProjects.map((project) => ({
      slug: project.slug,
      title: project.title,
      description: project.description,
      domain: project.domain,
      status: project.status,
      startDate: project.startDate?.toISOString() ?? null,
      endDate: project.endDate?.toISOString() ?? null,
      coverMediaId: project.media[0]?.id ?? null,
      coverMediaAlt: project.media[0]?.altText ?? null,
    }));

    opportunities = publishedOpportunities.flatMap((opportunity) => {
      if (!opportunity.publishedAt) return [];
      const period = getApplicationPeriod(opportunity.tags);
      return [{
        slug: opportunity.slug,
        title: opportunity.title,
        summary: opportunity.summary,
        category: opportunity.category,
        type: opportunity.type,
        publishedAt: opportunity.publishedAt.toISOString(),
        applicationPeriod: period
          ? { start: period.start.toISOString(), end: period.end.toISOString() }
          : null,
      }];
    });
    partners = confirmedPartners.flatMap((partner) => {
      const logoSrc = getPublicPartnerLogo(partner.logoPath);
      if (!logoSrc) return [];
      return [{
        id: partner.id,
        name: partner.name,
        logoSrc,
        website: getPublicPartnerWebsite(partner.website),
      }];
    });
  } else {
    const period = getApplicationPeriod(languageTrainingOpportunity.tags);
    opportunities = [{
      slug: languageTrainingOpportunity.slug,
      title: languageTrainingOpportunity.title,
      summary: languageTrainingOpportunity.summary,
      category: languageTrainingOpportunity.category,
      type: languageTrainingOpportunity.type,
      publishedAt: null,
      applicationPeriod: period
        ? { start: period.start.toISOString(), end: period.end.toISOString() }
        : null,
    }];
  }

  return (
    <HomePage
      activitiesUnavailable={activitiesUnavailable}
      activities={activities.map((activity) => ({
        ...activity,
        eventDate: activity.eventDate?.toISOString() ?? null,
        coverImage: getDomainBySlug(activity.domain)?.coverImage ?? "/images/action-communaute.jpg",
      }))}
      news={news}
      newsUnavailable={newsUnavailable}
      projects={projects}
      projectsUnavailable={projectsUnavailable}
      opportunities={opportunities}
      opportunitiesUnavailable={opportunitiesUnavailable}
      partners={partners}
      partnersUnavailable={partnersUnavailable}
    />
  );
}
