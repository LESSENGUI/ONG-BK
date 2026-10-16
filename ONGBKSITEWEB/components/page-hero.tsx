import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  primaryLabel = "Découvrir nos actions",
  primaryHref = "/actions",
  secondaryLabel = "Nous rejoindre",
  secondaryHref = "/adhesion",
}: PageHeroProps) {
  return (
    <section className="relative isolate flex min-h-[390px] items-end overflow-hidden bg-ink sm:min-h-[440px]">
      <Image alt="" className="object-cover" fill priority sizes="100vw" src={image} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#10243d]/90 via-[#10243d]/65 to-[#10243d]/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#10243d]/35 to-transparent" />
      <div className="page-hero-content relative z-10 mx-auto w-full max-w-[1320px] px-6 pb-12 pt-24 sm:px-10 sm:pb-16 lg:px-12">
        <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f3ce6e]">
          <span className="h-px w-7 bg-[#f3ce6e]" />{eyebrow}
        </p>
        <h1 className="mt-4 max-w-[850px] font-display text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-5 max-w-[650px] text-sm leading-7 text-white/80 sm:text-base">{description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href={primaryHref}>{primaryLabel}<ArrowRight size={15} /></Link></Button>
          <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20"><Link href={secondaryHref}>{secondaryLabel}</Link></Button>
        </div>
      </div>
    </section>
  );
}
