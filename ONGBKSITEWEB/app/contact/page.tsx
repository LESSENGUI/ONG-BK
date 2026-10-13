"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <PageHero eyebrow="Contact" title="Parlons de vos idées et de vos projets." description="Une question, une proposition de partenariat ou une initiative à partager ? L’équipe ONG BK est à votre écoute." image="/images/action-communaute.jpg" primaryLabel="Écrire à ONG BK" primaryHref="#formulaire" secondaryLabel="Partenaires" secondaryHref="/partenaires" />
      <section className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest"><Mail size={21} /></span>
        <p className="section-eyebrow mt-6">Nous sommes à votre écoute</p>
        <h1 className="section-title mt-3">Contactez ONG BK.</h1>
        <p className="mt-4 max-w-[600px] text-sm leading-7 text-ink/65">Une question, une proposition de partenariat ou un projet à partager ? Écrivez-nous à l’aide du formulaire ci-dessous.</p>
        {submitted ? (
          <div className="mt-8 rounded-3xl border border-forest/15 bg-white p-8 text-center shadow-soft sm:p-12">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#edf3e8] text-forest"><CheckCircle2 size={28} /></span>
            <h2 className="mt-5 font-display text-2xl font-bold">Aperçu de votre message</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/65">Ce formulaire est une maquette frontend : votre message n’a pas été envoyé ni enregistré. Le système de contact sera activé ultérieurement.</p>
            <Button className="mt-7" onClick={() => setSubmitted(false)} variant="outline">Revenir au formulaire</Button>
          </div>
        ) : (
          <form
            className="mt-8 rounded-3xl border border-ink/[0.07] bg-white p-6 shadow-soft sm:p-9"
            id="formulaire"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="form-label">Nom <input autoComplete="family-name" className="form-input" name="nom" placeholder="Votre nom" required /></label>
              <label className="form-label">Prénom <input autoComplete="given-name" className="form-input" name="prenom" placeholder="Votre prénom" required /></label>
              <label className="form-label sm:col-span-2">Adresse e-mail <input autoComplete="email" className="form-input" name="email" placeholder="vous@exemple.com" required type="email" /></label>
              <label className="form-label sm:col-span-2">Objet <input className="form-input" name="objet" placeholder="Le sujet de votre message" required /></label>
              <label className="form-label sm:col-span-2">Votre message <textarea className="form-input min-h-36 resize-y" name="message" placeholder="Comment pouvons-nous vous aider ?" required /></label>
            </div>
            <Button className="mt-6 w-full sm:w-auto" size="lg" type="submit">Prévisualiser mon message <ArrowRight size={16} /></Button>
          </form>
        )}
        <div className="mt-8 rounded-2xl bg-[#f3f1e8] p-5">
          <h2 className="font-display text-sm font-bold">Coordonnées & réseaux sociaux</h2>
          <p className="mt-2 text-xs leading-5 text-ink/60">Les coordonnées, la localisation et les liens des réseaux sociaux officiels sont à renseigner par ONG BK.</p>
        </div>
      </section>
    </main>
  );
}
