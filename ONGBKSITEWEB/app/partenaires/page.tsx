import Link from "next/link";
import { ArrowRight, Handshake, Landmark, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";

const partnershipTypes = [
  { icon: Landmark, title: "Partenaires institutionnels", description: "Institutions et acteurs publics qui souhaitent soutenir des initiatives en faveur des communautés." },
  { icon: Wrench, title: "Partenaires techniques", description: "Organisations et spécialistes qui partagent leur expertise et leurs compétences." },
  { icon: Handshake, title: "Partenaires solidaires", description: "Entreprises, associations et personnes engagées qui souhaitent contribuer aux actions." },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero eyebrow="Partenaires" title="L’impact se construit à plusieurs." description="Les partenariats permettent de faire grandir les initiatives et de renforcer les actions au service de la jeunesse." image="/images/action-evenement.jpg" primaryLabel="Proposer un partenariat" primaryHref="#contact" secondaryLabel="Découvrir nos actions" secondaryHref="/actions" />
      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:py-20">
        <div className="max-w-[700px]"><p className="section-eyebrow">Ensemble, plus loin</p><h2 className="section-title mt-3">Des collaborations utiles aux communautés.</h2><p className="mt-4 text-sm leading-7 text-ink/65">ONG BK souhaite développer des relations de confiance avec les partenaires qui partagent son engagement. Les projets et modalités de collaboration sont à discuter directement avec l’équipe.</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{partnershipTypes.map(({ icon: Icon, title, description }) => <Card className="p-6 sm:p-7" key={title}><span className="grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest"><Icon size={22} /></span><h3 className="mt-5 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{description}</p></Card>)}</div>
        <div className="mt-10 rounded-3xl bg-forest p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9" id="contact"><div><h2 className="font-display text-2xl font-bold">Parlons de votre proposition.</h2><p className="mt-2 text-sm leading-6 text-white/75">Présentez votre organisation, vos idées et les objectifs de la collaboration envisagée.</p></div><Button asChild className="mt-6 shrink-0 sm:mt-0"><Link href="/contact">Contacter ONG BK <ArrowRight size={15} /></Link></Button></div>
      </section>
    </main>
  );
}
