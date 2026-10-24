import assert from "node:assert/strict";
import test from "node:test";
import { impactCards } from "../components/home-page";
import { aboutPillars, getAboutPillarBySlug } from "../lib/about-pillars";
import { implementationMeans } from "../lib/about-objectives";
import { convictions, getConvictionByNumber, preambleIntroduction } from "../lib/about-preamble";
import { complementaryCommitments, governanceExplorerItems } from "../lib/about-secondary-sections";
import { governanceOrgans } from "../lib/governance";

test("le préambule conserve les sept convictions détaillées et leurs routes", () => {
  assert.ok(preambleIntroduction.length > 0);
  assert.deepEqual(
    convictions.map(({ number }) => number),
    [1, 2, 3, 4, 5, 6, 7],
  );
  for (const conviction of convictions) {
    assert.ok(conviction.title.length > 0);
    assert.ok(conviction.statement.length > 0);
    assert.ok(conviction.explanation.length > 0);
    assert.ok(conviction.application.length > 0);
    assert.ok(conviction.keywords.length > 0);
    assert.equal(getConvictionByNumber(conviction.number), conviction);
  }
  assert.equal(getConvictionByNumber(8), undefined);
});

test("les quatre orientations institutionnelles possèdent un contenu de détail", () => {
  assert.deepEqual(
    aboutPillars.map(({ slug }) => slug),
    ["vision", "mission", "but", "objectifs"],
  );
  for (const pillar of aboutPillars) {
    assert.ok(pillar.description.length > 0);
    assert.ok(pillar.principles.length > 0);
    assert.ok(pillar.commitments.length > 0);
    assert.ok(pillar.keywords.length > 0);
    assert.equal(getAboutPillarBySlug(pillar.slug), pillar);
  }
  assert.equal(getAboutPillarBySlug("unknown"), undefined);
});

test("les engagements complémentaires et les organes conservent leurs liens de détail", () => {
  assert.equal(complementaryCommitments.length, 6);
  assert.deepEqual(
    complementaryCommitments.map(({ href }) => href),
    [
      "/domaines/education",
      "/domaines/formation-professionnelle",
      "/domaines/entrepreneuriat-autonomisation",
      "/domaines/culture-environnement",
      "/domaines/developpement-durable",
      "/domaines/sante-bien-etre-communautaire",
    ],
  );
  assert.deepEqual(
    governanceExplorerItems.map(({ href }) => href),
    governanceOrgans.map(({ slug }) => `/a-propos/gouvernance/${slug}`),
  );
  for (const item of [...complementaryCommitments, ...governanceExplorerItems]) {
    assert.ok(item.summary.length > 0);
    assert.ok(item.description.length > 0);
    assert.ok(item.keywords.length > 0);
  }
});

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
