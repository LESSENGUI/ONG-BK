import { redirect } from "next/navigation";
import { PublicationManager } from "@/components/admin/publication-manager";
import { getCurrentUser, userCan } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicationsAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const canCreateArticles = userCan(user, "CONTENT_CREATE");
  const canUploadPdf = userCan(user, "DOCUMENTS_CREATE");
  const canRead = userCan(user, "CONTENT_READ");
  const canArchive = userCan(user, "CONTENT_ARCHIVE");
  if (!canCreateArticles && !canUploadPdf && !canRead) redirect("/admin/dashboard");
  return (
    <PublicationManager
      canArchive={canArchive}
      canCreateArticles={canCreateArticles}
      canPublish={userCan(user, "CONTENT_APPROVE")}
      canUploadPdf={canUploadPdf}
      canRead={canRead}
    />
  );
}
