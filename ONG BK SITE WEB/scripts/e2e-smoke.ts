import assert from "node:assert/strict";

async function main() {
  const baseUrl = process.env.E2E_BASE_URL;
  if (!baseUrl) {
    throw new Error("Définissez E2E_BASE_URL vers un serveur de test avant npm run test:e2e.");
  }

  const origin = new URL(baseUrl);
  if (origin.protocol !== "http:" && origin.protocol !== "https:") {
    throw new Error("E2E_BASE_URL doit utiliser HTTP ou HTTPS.");
  }

  for (const path of [
    "/",
    "/a-propos",
    "/domaines",
    "/actions",
    "/actions/offres/formation-langues-etrangeres",
    "/actions/offres/formation-langues-etrangeres/candidature",
    "/actualites",
    "/contact",
  ]) {
    const response = await fetch(new URL(path, origin), { redirect: "manual" });
    assert.equal(response.status, 200, `La page publique ${path} doit répondre 200.`);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    if (path === "/a-propos") {
      const page = await response.text();
      assert.match(page, /ONG Borja Kouila/);
      assert.match(page, /Éducation/);
      assert.match(page, /Amour, Solidarité, Fraternité/);
      assert.doesNotMatch(page, /La base de données n’est pas configurée/);
    } else if (path === "/") {
      const page = await response.text();
      assert.equal((page.match(/<footer\b/g) ?? []).length, 1, "L’accueil doit utiliser le footer commun une seule fois.");
      for (const social of ["Facebook", "WhatsApp", "TikTok", "LinkedIn"]) {
        assert.match(page, new RegExp(`ONG-BK sur ${social}`));
      }
      assert.match(page, /Donnons de la joie à la jeunesse/);
    } else if (path === "/actions") {
      const page = await response.text();
      assert.match(page, /Candidatures – Formation en langues étrangères/);
      assert.match(page, /1 novembre 2026/);
      assert.match(page, /20 juin 2027/);
      assert.match(page, /Lire les détails/);
    } else if (path === "/actions/offres/formation-langues-etrangeres") {
      const page = await response.text();
      assert.match(page, /Candidatures du/);
      assert.match(page, /1 novembre 2026 au 20 juin 2027/);
      assert.match(page, /Les langues effectivement ouvertes/);
    } else if (path === "/actions/offres/formation-langues-etrangeres/candidature") {
      const page = await response.text();
      assert.match(page, /Candidater à la formation/);
      assert.match(page, /Candidatures non ouvertes/);
    }
  }

  const protectedPage = await fetch(new URL("/admin/finance", origin), { redirect: "manual" });
  assert.ok([301, 302, 303, 307, 308].includes(protectedPage.status), "L’espace finance doit rediriger un visiteur non authentifié.");
  assert.equal(new URL(protectedPage.headers.get("location") ?? "/", origin).pathname, "/admin/login");

  for (const format of ["json", "csv", "xlsx", "pdf"]) {
    const api = await fetch(new URL(`/api/admin/finance${format === "json" ? "" : `?format=${format}`}`, origin), {
      redirect: "manual",
    });
    assert.equal(api.status, 401, `L’API finance (${format}) doit refuser un visiteur non authentifié.`);
    assert.match(api.headers.get("content-type") ?? "", /application\/json/);
  }

  console.info("E2E HTTP : pages publiques, appel de formation, candidature, redirection admin et exports financiers vérifiés.");
}

main().catch((error: unknown) => {
  console.error("Échec du smoke test E2E.", error);
  process.exitCode = 1;
});
