export const SUBMISSION_MATERIALS_BUCKET = "submission-materials";

export function materialPathFromUrlOrPath(value: string) {
  const raw = value.trim();
  if (!raw) return null;

  let candidate = raw;
  try {
    const url = new URL(raw);
    const segments = url.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf(SUBMISSION_MATERIALS_BUCKET);
    if (bucketIndex < 0) return null;
    candidate = segments.slice(bucketIndex + 1).join("/");
  } catch {
    // Treat non-URL values as storage object paths.
  }

  const path = decodeURIComponent(candidate)
    .split("/")
    .filter(Boolean)
    .join("/");
  if (!path || path.startsWith("/") || path.includes("..")) return null;
  return path;
}

export function isOwnedSubmissionMaterialPath(
  path: string,
  userId: string,
  type?: string,
  id?: string
) {
  const prefix =
    type && id
      ? `${userId}/submission-materials/${type}/${id}/`
      : `${userId}/`;
  return path.startsWith(prefix);
}
