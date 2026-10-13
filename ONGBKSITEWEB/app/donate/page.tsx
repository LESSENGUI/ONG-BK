import Link from "next/link";
import { ArrowRight, Heart, HandHeart, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";

const waysToHelp = [
  { icon: Heart, title: "Soutenir une action", description: "Échangez avec ONG BK pour découvrir les besoins et les initiatives en cours." },
  { icon: HandHeart, title: "Offrir vos compétences", description: "Mettez votre expérience au service d’un projet ou d’une activité." },
  { icon: PackageOpen, title: "Proposer un don en nature", description: "Contactez l’équipe pour vérifier les besoins et organiser votre contribution." },
];

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero eyebrow="Soutenir ONG BK" title="Chaque geste peut apporter de la joie à la jeunesse." description="Votre soutien peut contribuer à faire grandir les initiatives de ONG BK. Prenons contact pour échanger sur les besoins et les modalités de participation." image="/images/action-solidarite.jpg" primaryLabel="Proposer mon soutien" primaryHref="/contact" secondaryLabel="Devenir bénévole" secondaryHref="/adhesion?type=benevole" />
      <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10 lg:py-20">
        <div className="max-w-[700px]"><p className="section-eyebrow">Comment contribuer ?</p><h2 className="section-title mt-3">Un soutien adapté, discuté ensemble.</h2><p className="mt-4 text-sm leading-7 text-ink/65">Les moyens de contribution et les éventuelles modalités de don doivent être confirmés avec ONG BK. Cette page ne collecte aucun paiement.</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{waysToHelp.map(({ icon: Icon, title, description }) => <Card className="p-6 sm:p-7" key={title}><span className="grid size-12 place-items-center rounded-2xl bg-[#f7f0df] text-[#a77a20]"><Icon size={22} /></span><h3 className="mt-5 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{description}</p></Card>)}</div>
        <div className="mt-10 flex flex-col gap-5 rounded-3xl bg-paper p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9"><div><h2 className="font-display text-xl font-bold">Vous souhaitez apporter votre soutien ?</h2><p className="mt-2 text-sm leading-6 text-ink/60">Écrivez-nous avant tout don pour connaître les besoins et modalités actuels.</p></div><Button asChild><Link href="/contact">Contacter ONG BK <ArrowRight size={15} /></Link></Button></div>
      </section>
    </main>
  );
}
