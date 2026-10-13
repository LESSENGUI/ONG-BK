import { DomainSelector } from "@/app/domaines/domain-selector";
import { DomainHero } from "@/app/domaines/domain-hero";

export const metadata = {
  title: "Nos domaines d’intervention | ONG BK",
  description:
    "Explorez les six domaines d’intervention de ONG BK : éducation, formation, entrepreneuriat, culture, santé et développement durable.",
};

export default function DomainsPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <DomainHero />
      <DomainSelector />
    </main>
  );
}
