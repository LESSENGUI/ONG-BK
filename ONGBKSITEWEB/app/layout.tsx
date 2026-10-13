import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "ONG BK | Agir aujourd'hui, bâtir demain",
  description:
    "ONG BK accompagne les communautés à travers l'éducation, la formation, l'entrepreneuriat, la culture, l'environnement et la santé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
