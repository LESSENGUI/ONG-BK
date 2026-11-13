"use client";

import CountUp from "react-countup";
import { useLowPower } from "@/lib/motion";

function formatFigure(value: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.floor(value)).replace(/[\u00a0\u202f]/g, " ");
}

export function ImpactCounter({ value, className }: { value: string; className: string }) {
  const lowPower = useLowPower();
  const end = Number(value.replace(/\s/g, ""));

  if (lowPower !== false) {
    return <p className={className}><span className="lining-nums tabular-nums">{value}</span></p>;
  }

  return (
    <p className={className}>
      <CountUp
        duration={1.6}
        enableScrollSpy
        end={end}
        formattingFn={formatFigure}
        scrollSpyOnce
        start={0}
      >
        {({ countUpRef }) => <span className="lining-nums tabular-nums" ref={countUpRef} />}
      </CountUp>
    </p>
  );
}