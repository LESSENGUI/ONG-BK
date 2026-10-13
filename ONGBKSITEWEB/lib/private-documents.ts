import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import type { AuthenticatedUser } from "@/lib/auth";
import type { DocumentConfidentiality } from "@prisma/client";

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

const allowedTypes = {
  "application/pdf": { extension: ".pdf", signature: (bytes: Uint8Array) =>
    bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-" },
  "image/jpeg": { extension: ".jpg", signature: (bytes: Uint8Array) =>
    bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: ".png", signature: (bytes: Uint8Array) =>
    bytes.length >= 8 && bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10" },
} as const;

export function canReadDocument(
  user: AuthenticatedUser | null,
  confidentiality: DocumentConfidentiality,
): boolean {
  if (confidentiality === "PUBLIC") return true;
  if (!user || !user.permissions.includes("DOCUMENTS_READ")) return false;
  if (confidentiality === "INTERNAL") return true;
  if (confidentiality === "EXECUTIVE_BOARD") {
    return user.roleCode.startsWith("BE_") ||
      user.roleCode === "SECRETARY_GENERAL" ||
      user.roleCode === "DEPUTY_SECRETARY_GENERAL" ||
      user.roleCode === "ORGANISATION_COMMUNICATION_SECRETARY";
  }
  if (confidentiality === "CONTROL_COMMISSION") {
    return user.roleCode === "CCE_PRESIDENT" || user.roleCode === "CCE_MEMBER";
  }
  return user.roleCode === "BE_PRESIDENT" || user.roleCode === "CCE_PRESIDENT";
}

function getStorageDirectory(): string {
  const configuredDirectory = process.env.PRIVATE_UPLOADS_DIR;
  if (configuredDirectory && !isAbsolute(configuredDirectory)) {
    throw new Error("PRIVATE_UPLOADS_DIR must be an absolute filesystem path.");
  }
  const directory = resolve(configuredDirectory ?? join(process.cwd(), "private-data", "documents"));
  const publicDirectory = resolve(process.cwd(), "public");
  const publicRelative = relative(publicDirectory, directory);
  if (publicRelative === "" || (!publicRelative.startsWith(`..${sep}`) && publicRelative !== "..")) {
    throw new Error("Private documents storage must not be inside the public directory.");
  }
  return directory;
}

export async function storePrivateDocument(
  bytes: Uint8Array,
  declaredMediaType: string,
): Promise<{ storageKey: string; mediaType: keyof typeof allowedTypes; fileSize: number }> {
  if (bytes.length === 0 || bytes.length > MAX_DOCUMENT_BYTES) {
    throw new Error("DOCUMENT_SIZE_INVALID");
  }
  const detected = Object.entries(allowedTypes).find(
    ([, definition]) => definition.signature(bytes),
  );
  if (!detected || detected[0] !== declaredMediaType) {
    throw new Error("DOCUMENT_CONTENT_TYPE_INVALID");
  }
  const [mediaType, definition] = detected as [
    keyof typeof allowedTypes,
    (typeof allowedTypes)[keyof typeof allowedTypes],
  ];
  const storageKey = `${randomUUID()}${definition.extension}`;
  const directory = getStorageDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, storageKey), bytes, { flag: "wx", mode: 0o600 });
  return { storageKey, mediaType, fileSize: bytes.length };
}

export async function readPrivateDocument(storageKey: string): Promise<Buffer> {
  if (!/^[a-f\d-]{36}\.(pdf|jpg|png)$/.test(storageKey)) {
    throw new Error("DOCUMENT_STORAGE_KEY_INVALID");
  }
  return readFile(join(getStorageDirectory(), storageKey));
}

export async function removePrivateDocument(storageKey: string): Promise<void> {
  if (!/^[a-f\d-]{36}\.(pdf|jpg|png)$/.test(storageKey)) {
    throw new Error("DOCUMENT_STORAGE_KEY_INVALID");
  }
  await unlink(join(getStorageDirectory(), storageKey));
}
