import { HomePage } from "@/components/home-page";
import { db } from "@/lib/db";
import { getDomainBySlug } from "@/lib/domains";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    })
    : [];

  return (
    <HomePage
      activities={activities.map((activity) => ({
        ...activity,
        eventDate: activity.eventDate?.toISOString() ?? null,
        coverImage: getDomainBySlug(activity.domain)?.coverImage ?? "/images/action-communaute.jpg",
      }))}
    />
  );
}
