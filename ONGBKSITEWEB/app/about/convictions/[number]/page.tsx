import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenCheck, Compass, Handshake } from "lucide-react";
import { AboutDetailLayout } from "@/components/about-detail-layout";
import { convictions, getConvictionByNumber } from "@/lib/about-preamble";

type ConvictionPageProps = {
  params: Promise<{ number: string }>;
};

export function generateStaticParams() {
  return convictions.map(({ number }) => ({ number: String(number) }));
}

export async function generateMetadata({ params }: ConvictionPageProps) {
  const { number } = await params;
  const conviction = getConvictionByNumber(Number(number));
  if (!conviction) return {};

  return {
    title: `${conviction.title} | Nos convictions | ONG-BK`,
    description: conviction.statement,
  };
}

export default async function ConvictionPage({ params }: ConvictionPageProps) {
  const { number } = await params;
  const convictionNumber = Number(number);
  if (!Number.isInteger(convictionNumber)) notFound();
  const conviction = getConvictionByNumber(convictionNumber);
  if (!conviction) notFound();

  const previous = convictions.find((item) => item.number === conviction.number - 1);
  const next = convictions.find((item) => item.number === conviction.number + 1);

  return (
    <AboutDetailLayout
      description={conviction.statement}
      eyebrow={`Conviction ${String(conviction.number).padStart(2, "0")}`}
      next={next ? { href: `/about/convictions/${next.number}`, title: next.title } : undefined}
      previous={
        previous
          ? { href: `/about/convictions/${previous.number}`, title: previous.title }
          : undefined
      }
      title={conviction.title}
    >
      <div className="max-w-[820px]">
        <p className="section-eyebrow">La conviction en bref</p>
        <h2 className="section-title mt-3">{conviction.title}</h2>
        <p className="mt-5 text-base font-semibold leading-8 text-[var(--bk-bleu-clair)] sm:text-lg">
          {conviction.statement}
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <section className="rounded-[26px] border border-[rgba(11,90,155,0.08)] bg-[#f8fafb] p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-xl bg-white text-[var(--bk-marine)] shadow-sm">
            <Compass aria-hidden="true" size={23} />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold text-[var(--bk-marine)]">
            Comprendre ce principe
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink/70 sm:text-[15px]">
            {conviction.explanation}
          </p>
          <ul aria-label="Mots-clés" className="mt-5 flex flex-wrap gap-2">
            {conviction.keywords.map((keyword) => (
              <li
                className="rounded-full border border-[rgba(11,90,155,0.08)] bg-white px-3 py-1.5 text-xs font-semibold text-ink/65"
                key={keyword}
              >
                {keyword}
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-[26px] bg-[#f3f0e9] p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-xl bg-white text-[var(--bk-marine)] shadow-sm">
            <BookOpenCheck aria-hidden="true" size={22} />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold text-[var(--bk-marine)]">
            Principe dans l’action
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink/70">{conviction.application}</p>
          <div className="mt-6 flex items-start gap-3 border-t border-[rgba(11,90,155,0.1)] pt-5">
            <Handshake aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--bk-ciel)]" size={19} />
            <p className="text-xs leading-6 text-ink/60">
              Cette piste reprend l’application décrite dans la présentation institutionnelle ;
              elle ne constitue pas une affirmation de réalisation.
            </p>
          </div>
        </aside>
      </div>

      <Link
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--bk-ciel)] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--bk-marine)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2"
        href="/about/preambule"
      >
        Consulter le préambule complet
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </AboutDetailLayout>
  );
}