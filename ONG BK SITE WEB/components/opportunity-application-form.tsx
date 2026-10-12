"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";

type OfferApplicationFormProps = {
  title: string;
  slug: string;
  volunteer: boolean;
  training: boolean;
  isOpen: boolean;
};

export function OpportunityApplicationForm({ title, slug, volunteer, training, isOpen }: OfferApplicationFormProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      type: "APPLICATION",
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      subject: `Candidature – ${title}`.slice(0, 240),
      message: `Offre : ${title}\nRéférence : ${slug}\n\n${String(form.get("message") ?? "")}`,
      organization: String(form.get("organization") ?? ""),
      consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
    };
    try {
      const response = await fetch("/api/public/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: { message?: string; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Votre candidature n’a pas pu être transmise.");
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Une erreur est survenue lors de l’envoi.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-forest/15 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-forest/10 text-forest"><CheckCircle2 size={28} /></span>
        <h2 className="mt-5 font-display text-2xl font-bold text-ink">Votre candidature a été transmise.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/65">La réception de votre demande ne vaut pas acceptation ni attribution automatique d’un statut. L’équipe ONG-BK pourra l’examiner selon la procédure applicable.</p>
        <Link className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest/90" href="/actions">Retour aux actions <ArrowRight size={15} /></Link>
      </div>
    );
  }

  return (
    <form className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-9" onSubmit={(event) => void submit(event)}>
      <div className="mb-6 rounded-2xl bg-[#f7f8f5] p-4">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-forest">Candidature pour</p>
        <p className="mt-1 font-semibold text-ink">{title}</p>
      </div>
      {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="form-label">Nom<input autoComplete="family-name" className="form-input" maxLength={100} name="lastName" required /></label>
        <label className="form-label">Prénom<input autoComplete="given-name" className="form-input" maxLength={100} name="firstName" required /></label>
        <label className="form-label">Adresse e-mail<input autoComplete="email" className="form-input" maxLength={254} name="email" required type="email" /></label>
        <label className="form-label">Téléphone<input autoComplete="tel" className="form-input" maxLength={40} name="phone" type="tel" /></label>
        <label className="form-label sm:col-span-2">Organisation, le cas échéant<input className="form-input" maxLength={240} name="organization" /></label>
        <label className="form-label sm:col-span-2">{training ? "Motivation et parcours d’apprentissage" : volunteer ? "Motivation et disponibilités" : "Présentation de votre proposition"}
          <textarea className="form-input min-h-36 resize-y" maxLength={9800} minLength={10} name="message" placeholder={training ? "Indiquez pourquoi vous souhaitez suivre cette formation, vos objectifs et vos disponibilités..." : "Présentez votre profil, votre motivation ou votre proposition..."} required />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-ink/65">
        <input className="mt-0.5 accent-[#155b48]" name="consent" required type="checkbox" />
        <span>J’accepte que ces informations soient utilisées pour examiner cette demande, conformément à la politique de conservation configurée par l’ONG-BK.</span>
      </label>
      <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden" tabIndex={-1}>
        Site web<input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <p className="mt-5 rounded-2xl bg-[#fbfaf8] p-4 text-xs leading-5 text-ink/60">
        L’envoi de ce formulaire constitue une demande, et non une confirmation d’inscription, de sélection, d’engagement ou d’adhésion. Les fichiers justificatifs éventuels ne sont pas demandés ici.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !isOpen} type="submit">
          <Send size={16} />{busy ? "Envoi..." : isOpen ? "Envoyer ma candidature" : "Candidatures non ouvertes"}
        </button>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink hover:bg-paper" href={`/actions/offres/${slug}`}>
          <ArrowLeft size={15} /> Retour à l’offre
        </Link>
      </div>
    </form>
  );
}
