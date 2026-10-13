import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const sourceDirectory = join(process.cwd(), "Img", "Activités");
const logoSourceDirectory = join(process.cwd(), "Img", "logo");
const destinationDirectory = join(process.cwd(), "public", "images");
const assets = [
  ["IMG-20240930-WA0034.jpg", "action-education.jpg"],
  ["IMG-20241001-WA0277.jpg", "action-solidarite.jpg"],
  ["IMG-20240930-WA0036.jpg", "action-communaute.jpg"],
  ["IMG-20241001-WA0281.jpg", "action-ateliers.jpg"],
  ["IMG-20240930-WA0040.jpg", "action-evenement.jpg"],
];

mkdirSync(destinationDirectory, { recursive: true });
for (const [sourceName, destinationName] of assets) {
  copyFileSync(
    join(sourceDirectory, sourceName),
    join(destinationDirectory, destinationName),
  );
}
copyFileSync(
  join(logoSourceDirectory, "BK ONG logo.jpg"),
  join(destinationDirectory, "logo-ong-bk.jpg"),
);

console.log(`Copie de ${assets.length} photos et du logo dans public/images.`);
