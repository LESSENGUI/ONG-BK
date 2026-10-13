type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 };

export async function readJsonBody(
  request: Request,
  maximumBytes = 8_192,
): Promise<JsonBodyResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && !/^\d+$/.test(contentLength)) {
    return { ok: false, status: 400 };
  }
  if (contentLength && Number(contentLength) > maximumBytes) {
    return { ok: false, status: 413 };
  }
  if (!request.body) return { ok: false, status: 400 };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown,
    };
  } catch {
    return { ok: false, status: 400 };
  }
}
