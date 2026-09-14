import { LucideIcon, Puzzle } from "lucide-react";

export type ProjectKind = "experiment" | "project";

export type ProjectEntry = {
  id: string;
  title: string;
  /** i18n key for the (translated) description — see i18n/index.tsx. */
  descriptionKey: string;
  tech: string;
  href: string;
  kind: ProjectKind;
  icon: LucideIcon;
  /** ISO date the project was added — drives the "NEW" badge for one week. */
  addedAt: string;
};

const NEW_BADGE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function isRecentlyAdded(addedAt: string): boolean {
  const added = new Date(addedAt).getTime();
  if (Number.isNaN(added)) return false;
  return Date.now() - added < NEW_BADGE_DURATION_MS;
}

export const PROJECTS: readonly ProjectEntry[] = [
  {
    id: "sliding-puzzle",
    title: "Sliding Puzzle",
    descriptionKey: "projects.slidingPuzzle.description",
    tech: "TypeScript · React · Canvas API",
    href: "/sliding-puzzle",
    kind: "experiment",
    icon: Puzzle,
    addedAt: "2026-09-14",
  },
];
