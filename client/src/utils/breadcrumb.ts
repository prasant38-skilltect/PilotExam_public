// utils/breadcrumb.ts
export function getStoredBreadcrumb() {
  return JSON.parse(sessionStorage.getItem("breadcrumbTrail") || "[]");
}

export function saveToBreadcrumb(slug: string, name: string) {
  const trail = getStoredBreadcrumb();

  // Remove duplicates if user navigates back or reselects
  const existingIndex = trail.findIndex((t: any) => t.slug === slug);
  let newTrail;
  if (existingIndex !== -1) {
    newTrail = trail.slice(0, existingIndex + 1);
  } else {
    newTrail = [...trail, { slug, name }];
  }

  sessionStorage.setItem("breadcrumbTrail", JSON.stringify(newTrail));
  return newTrail;
}

export function clearBreadcrumb() {
  sessionStorage.removeItem("breadcrumbTrail");
}

export function trimBreadcrumb(slug: string) {
  const trail = getStoredBreadcrumb();

  // Find index of the clicked slug
  const idx = trail.findIndex((t: any) => t.slug === slug);

  if (idx >= 0) {
    // Keep all entries up to the clicked one
    const newTrail = trail.slice(0, idx + 1);

    // Save back to session
    sessionStorage.setItem("breadcrumbTrail", JSON.stringify(newTrail));

    return newTrail;
  }

  // If slug not found, just return original trail
  return trail;
}
