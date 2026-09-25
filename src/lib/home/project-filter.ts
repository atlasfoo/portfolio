/**
 * Filter projects by tag, or return all when filterId is 'all'.
 *
 * @param projects - readonly array of project objects with tags
 * @param filterId - tag to filter by, or 'all' to return everything
 * @returns filtered array of projects (same order as input)
 */
export function filterProjects<T extends { tags: string[] }>(
  projects: readonly T[],
  filterId: string,
): T[] {
  if (filterId === 'all') {
    return Array.from(projects);
  }

  return projects.filter((p) => p.tags.includes(filterId));
}
