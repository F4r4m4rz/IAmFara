import { LucideIcon, Puzzle } from "lucide-react";

export type ProjectKind = "experiment" | "project";

export type ProjectEntry = {
  id: string;
  title: string;
  description: string;
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
    description:
      "A responsive image puzzle built with TypeScript and the Canvas API. It uses a testable game engine separated from rendering and input, and supports both built-in images and local image uploads.",
    tech: "TypeScript · React · Canvas API",
    href: "/sliding-puzzle",
    kind: "experiment",
    icon: Puzzle,
    addedAt: "2026-09-14",
  },
];
