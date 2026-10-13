"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";

function MembershipForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "benevole" ? "Bénévole" : "Candidature membre";
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-3xl border border-forest/15 bg-white p-8 text-center shadow-soft sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#edf3e8] text-forest"><CheckCircle2 size={28} /></span>
        <h2 className="mt-5 font-display text-2xl font-bold">Aperçu de votre candidature</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/65">Ce formulaire est une maquette frontend : aucune information n’a été envoyée ni enregistrée. La transmission sera activée lorsque le système de traitement sera mis en place.</p>
        <Button className="mt-7" onClick={() => setSubmitted(false)} variant="outline">Revenir au formulaire</Button>
      </div>
    );
  }

  return (
    <form
      className="rounded-3xl border border-ink/[0.07] bg-white p-6 shadow-soft sm:p-9"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="form-label">Nom <input autoComplete="family-name" className="form-input" name="nom" placeholder="Votre nom" required /></label>
        <label className="form-label">Prénom <input autoComplete="given-name" className="form-input" name="prenom" placeholder="Votre prénom" required /></label>
        <label className="form-label">Adresse e-mail <input autoComplete="email" className="form-input" name="email" placeholder="vous@exemple.com" required type="email" /></label>
        <label className="form-label">Téléphone <input autoComplete="tel" className="form-input" name="telephone" placeholder="+XXX ..." type="tel" /></label>
        <label className="form-label">Votre démarche
          <span className="relative block">
            <select className="form-input appearance-none pr-10" defaultValue={initialType} name="demarche">
              <option>Candidature membre</option><option>Bénévole</option><option>Équipe locale</option><option>Partenariat</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45" size={16} />
          </span>
        </label>
        <label className="form-label">Ville / localité <input autoComplete="address-level2" className="form-input" name="localite" placeholder="Votre localité" /></label>
        <label className="form-label sm:col-span-2">Pourquoi souhaitez-vous rejoindre ONG BK ?
          <textarea className="form-input min-h-32 resize-y" name="motivation" placeholder="Parlez-nous de vos motivations et de vos disponibilités..." required />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-ink/65">
        <input className="mt-0.5 accent-[#155b48]" required type="checkbox" />
        <span>J’accepte que ces informations soient utilisées pour étudier ma candidature.</span>
      </label>
      <p className="mt-5 rounded-2xl bg-[#f7f6f0] p-4 text-xs leading-5 text-ink/65">
        L’envoi d’une candidature ne confère pas automatiquement le statut de membre. L’adhésion suit une procédure de validation distincte par ONG BK.
      </p>
      <Button className="mt-6 w-full sm:w-auto" size="lg" type="submit">Envoyer ma candidature <ArrowRight size={16} /></Button>
    </form>
  );
}

export default function AdhesionPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <PageHero eyebrow="Nous rejoindre" title="Votre engagement peut faire la différence." description="Membre, bénévole ou équipe locale : partagez votre démarche avec ONG BK. Chaque candidature est étudiée selon une procédure d’adhésion distincte." image="/images/action-communaute.jpg" primaryLabel="Remplir ma candidature" primaryHref="#candidature" secondaryLabel="Découvrir nos actions" secondaryHref="/actions" />
      <section className="mx-auto max-w-[850px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8" id="candidature">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf2ec] text-forest"><HeartHandshake size={23} /></span>
          <p className="section-eyebrow mt-6">S’engager à nos côtés</p>
          <h1 className="section-title mt-3">Votre engagement peut faire la différence.</h1>
          <p className="mt-4 max-w-[680px] text-sm leading-7 text-ink/65">Partagez votre démarche avec nous. Les candidatures sont examinées par l’organisation, qui vous indiquera les prochaines étapes d’adhésion ou de participation.</p>
        </div>
        <Suspense fallback={<div className="h-[480px] animate-pulse rounded-3xl bg-white" />}>
          <MembershipForm />
        </Suspense>
        <div className="mt-6 text-center text-xs text-ink/55">Une question ? <Link className="font-semibold text-forest" href="/contact">Contactez l’équipe ONG BK</Link></div>
        <section className="mt-12" id="questions">
          <p className="section-eyebrow">Questions fréquentes</p>
          <div className="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/[0.07] bg-white px-5">
            <details className="py-4">
              <summary className="cursor-pointer text-sm font-semibold">L’envoi d’une demande donne-t-il automatiquement le statut de membre ?</summary>
              <p className="mt-3 text-sm leading-6 text-ink/60">Non. Toute candidature suit une procédure d’examen et d’adhésion distincte. Une demande en ligne ne confère pas le statut de membre.</p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer text-sm font-semibold">Puis-je proposer mon aide comme bénévole ?</summary>
              <p className="mt-3 text-sm leading-6 text-ink/60">Oui. Choisissez « Bénévole » dans le formulaire et indiquez vos disponibilités et motivations.</p>
            </details>
            <details className="py-4">
              <summary className="cursor-pointer text-sm font-semibold">Le formulaire envoie-t-il réellement mes informations ?</summary>
              <p className="mt-3 text-sm leading-6 text-ink/60">Pas encore. Le site est actuellement une maquette frontend et ne dispose pas de système d’envoi ni de stockage.</p>
            </details>
          </div>
        </section>
      </section>
    </main>
  );
}
