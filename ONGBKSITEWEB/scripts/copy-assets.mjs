import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const sourceDirectory = join(process.cwd(), "Img", "Activités");
const heroSourceDirectory = join(process.cwd(), "Img", "heros");
const logoSourceDirectory = join(process.cwd(), "Img", "logo");
const leadershipSourceDirectory = join(process.cwd(), "Img", "Bureau exécutif");
const pdfSourceDirectory = join(process.cwd(), "pdf");
const destinationDirectory = join(process.cwd(), "public", "images");
const leadershipDestinationDirectory = join(destinationDirectory, "bureau-executif");
const pdfDestinationDirectory = join(process.cwd(), "public", "pdf");
const assets = [
  ["IMG-20240930-WA0034.jpg", "action-education.jpg"],
  ["IMG-20241001-WA0277.jpg", "action-solidarite.jpg"],
  ["IMG-20240930-WA0036.jpg", "action-communaute.jpg"],
  ["IMG-20241001-WA0281.jpg", "action-ateliers.jpg"],
  ["IMG-20240930-WA0040.jpg", "action-evenement.jpg"],
  ["photo1.jpeg", "formation-ia-1.jpeg"],
  ["photo2.jpeg", "formation-ia-2.jpeg"],
  ["Photo3.jpeg", "formation-ia-3.jpeg"],
];
const leadershipAssets = [
  ["Un président.jpg", "president.jpg"],
  ["Un vice-président.jpeg", "vice-president.jpeg"],
  ["Un secrétaire général adjoint.jpeg", "secretaire-general-adjoint.jpeg"],
  ["Une trésorier général.jpeg", "tresorier-general.jpeg"],
  [
    "Un secrétaire chargé de l’organisation, de la communication, des relations publiques et des médias.jpeg",
    "secretaire-organisation-communication.jpeg",
  ],
];

mkdirSync(destinationDirectory, { recursive: true });
mkdirSync(leadershipDestinationDirectory, { recursive: true });
mkdirSync(pdfDestinationDirectory, { recursive: true });
for (const [sourceName, destinationName] of assets) {
  copyFileSync(
    join(sourceDirectory, sourceName),
    join(destinationDirectory, destinationName),
  );
}
for (const [sourceName, destinationName] of leadershipAssets) {
  copyFileSync(
    join(leadershipSourceDirectory, sourceName),
    join(leadershipDestinationDirectory, destinationName),
  );
}
copyFileSync(
  join(logoSourceDirectory, "BK ONG logo.jpg"),
  join(destinationDirectory, "logo-ong-bk.jpg"),
);
copyFileSync(
  join(heroSourceDirectory, "accueil.jpg"),
  join(destinationDirectory, "hero-accueil.jpg"),
);
copyFileSync(
  join(pdfSourceDirectory, "Journal officiel du 9 Avril 2025.pdf"),
  join(pdfDestinationDirectory, "journal-officiel-9-avril-2025.pdf"),
);

console.log(
  `Copie de ${assets.length} photos, ${leadershipAssets.length} portraits, du visuel hero, du logo et du PDF dans public/.`,
);
