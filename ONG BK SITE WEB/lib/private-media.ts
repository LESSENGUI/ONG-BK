import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

const mediaTypes = {
  "image/jpeg": {
    extension: ".jpg",
    matches: (bytes: Uint8Array) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  "image/png": {
    extension: ".png",
    matches: (bytes: Uint8Array) => bytes.length >= 8 && bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10",
  },
  "video/mp4": {
    extension: ".mp4",
    matches: (bytes: Uint8Array) => bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(4, 8)) === "ftyp",
  },
} as const;

function getMediaDirectory() {
  const configured = process.env.PRIVATE_UPLOADS_DIR;
  if (configured && !isAbsolute(configured)) {
    throw new Error("PRIVATE_UPLOADS_DIR must be an absolute filesystem path.");
  }
  const root = resolve(configured ?? join(process.cwd(), "private-data", "documents"));
  const directory = resolve(root, "media");
  const publicDirectory = resolve(process.cwd(), "public");
  const publicRelative = relative(publicDirectory, directory);
  if (publicRelative === "" || (!publicRelative.startsWith(`..${sep}`) && publicRelative !== "..")) {
    throw new Error("Private media storage must not be inside the public directory.");
  }
  return directory;
}

export async function storePrivateMedia(
  bytes: Uint8Array,
  declaredMediaType: string,
): Promise<{ storageKey: string; mediaType: keyof typeof mediaTypes; fileSize: number }> {
  if (!bytes.length || bytes.length > MAX_MEDIA_BYTES) throw new Error("MEDIA_SIZE_INVALID");
  const detected = Object.entries(mediaTypes).find(([, definition]) => definition.matches(bytes));
  if (!detected || detected[0] !== declaredMediaType) throw new Error("MEDIA_CONTENT_TYPE_INVALID");
  const [mediaType, definition] = detected as [
    keyof typeof mediaTypes,
    (typeof mediaTypes)[keyof typeof mediaTypes],
  ];
  const storageKey = `${randomUUID()}${definition.extension}`;
  const directory = getMediaDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, storageKey), bytes, { flag: "wx", mode: 0o600 });
  return { storageKey, mediaType, fileSize: bytes.length };
}

export async function readPrivateMedia(storageKey: string) {
  if (!/^[a-f\d-]{36}\.(jpg|png|mp4)$/.test(storageKey)) throw new Error("MEDIA_STORAGE_KEY_INVALID");
  return readFile(join(getMediaDirectory(), storageKey));
}

export async function removePrivateMedia(storageKey: string) {
  if (!/^[a-f\d-]{36}\.(jpg|png|mp4)$/.test(storageKey)) throw new Error("MEDIA_STORAGE_KEY_INVALID");
  await unlink(join(getMediaDirectory(), storageKey));
}
