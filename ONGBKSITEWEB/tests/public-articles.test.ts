import assert from "node:assert/strict";
import test from "node:test";
import { createArticleSlug, equalityArticle, formationIaArticle, getApplicationPeriod, languageTrainingOpportunity } from "../lib/public-articles";
import { publicSubmissionSchema, publicationSchema } from "../lib/operations-validation";

test("creates stable URL slugs from French titles", () => {
  assert.equal(createArticleSlug("Égalité entre les femmes & les hommes"), "egalite-entre-les-femmes-et-les-hommes");
});

test("the public equality article contains complete, non-empty editorial sections", () => {
  assert.equal(equalityArticle.slug, "egalite-hommes-femmes");
  assert.ok(equalityArticle.sections.length >= 4);
  assert.ok(equalityArticle.sections.every((section) => section.heading.length > 0 && section.paragraphs.every((paragraph) => paragraph.length > 100)));
  assert.ok(equalityArticle.conclusion.length > 100);
});

test("the AI training article links its source and PDF and includes three photos", () => {
  assert.match(formationIaArticle.title, /intelligence artificielle/);
  assert.equal(formationIaArticle.images.length, 3);
  assert.equal(
    formationIaArticle.sourceUrl,
    "https://www.adiac-congo.com/content/formation-long-bk-invite-les-jeunes-se-lancer-dans-les-metiers-de-lintelligence-artificielle",
  );
  assert.equal(formationIaArticle.pdfUrl, "/pdf/journal-officiel-9-avril-2025.pdf");
  assert.ok(formationIaArticle.sections.length > 0);
});

test("the foreign-language training offer uses the requested inclusive application dates", () => {
  const period = getApplicationPeriod(languageTrainingOpportunity.tags);
  assert.ok(period);
  assert.equal(period.start.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(period.end.toISOString(), "2027-06-20T23:59:59.999Z");
  assert.match(languageTrainingOpportunity.body, /Les candidatures sont reçues du 1er novembre 2026 au 20 juin 2027 inclus/);
});

test("application period metadata rejects malformed and reversed intervals", () => {
  assert.equal(getApplicationPeriod(["CANDIDATURES:2026-13-01/2027-06-20"]), null);
  assert.equal(getApplicationPeriod(["CANDIDATURES:2026-02-30/2027-06-20"]), null);
  assert.equal(getApplicationPeriod(["CANDIDATURES:2027-06-20/2026-11-01"]), null);
  assert.equal(getApplicationPeriod([]), null);
});

test("training applications use an explicit application request type", () => {
  const result = publicSubmissionSchema.safeParse({
    type: "APPLICATION",
    firstName: "Amina",
    lastName: "Test",
    email: "amina@example.org",
    subject: "Candidature – Formation en langues étrangères",
    message: "Référence : formation-langues-etrangeres\n\nJe souhaite candidater à cette formation.",
    consent: true,
  });
  assert.equal(result.success, true);
});

test("the language training call is a first-class publication type", () => {
  const result = publicationSchema.safeParse({
    type: "TRAINING_CALL",
    title: languageTrainingOpportunity.title,
    slug: languageTrainingOpportunity.slug,
    summary: languageTrainingOpportunity.summary,
    body: languageTrainingOpportunity.body,
    category: languageTrainingOpportunity.category,
    tags: [...languageTrainingOpportunity.tags],
    galleryMediaIds: [],
    action: "publish",
  });
  assert.equal(result.success, true);
});
