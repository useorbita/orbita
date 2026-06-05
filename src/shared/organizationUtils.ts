export function sortOrganizations<T extends { is_personal?: boolean }>(
  orgs: T[],
): T[] {
  return [...orgs].sort((a, b) => {
    if (a.is_personal && !b.is_personal) return -1;
    if (!a.is_personal && b.is_personal) return 1;
    return 0;
  });
}
