import assert from "node:assert/strict";
import test from "node:test";
import { impactCards } from "../components/home-page";
import { implementationMeans } from "../lib/about-objectives";
import { governanceOrgans } from "../lib/governance";

test("la page d’accueil présente exactement six cartes de chiffres", () => {
  assert.equal(impactCards.length, 6);
  const allMetrics = impactCards
    .flatMap(({ figure, label, details }) => [figure, label, ...details])
    .join(" ");
  for (const figure of ["2 300", "800", "120", "10 000", "5 000", "3 000", "50", "15", "20", "100", "30", "500", "1 000", "300", "400", "250", "600", "200", "150", "80 %", "90 %"]) {
    assert.ok(allMetrics.includes(figure), `Le chiffre ${figure} doit être conservé.`);
  }
});

test("chaque moyen d’action possède au moins neuf étapes de détail", () => {
  assert.equal(implementationMeans.length, 4);
  for (const mean of implementationMeans) {
    assert.ok(mean.sections.length >= 9, `${mean.title} doit détailler au moins neuf sections.`);
  }
});

test("les quatre organes de gouvernance disposent d’une page de référence", () => {
  assert.deepEqual(
    governanceOrgans.map(({ slug }) => slug),
    ["assemblee-generale", "bureau-executif", "commission-controle-evaluation", "representants-locaux"],
  );
  for (const organ of governanceOrgans) {
    assert.ok(organ.sections.length >= 9, `${organ.title} doit avoir une présentation structurée.`);
  }
});
