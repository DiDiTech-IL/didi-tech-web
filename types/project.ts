/**
 * Project data structure for showcasing portfolio projects
 */
export type ProjectStatus = "live" | "in-development" | "completed" | "paused";

export type ProjectAudience = "developers" | "general";

export type ProjectTrack = "enterprise" | "dev-tools" | "hobby";

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  /** Unique identifier for the project */
  id: string;

  /** Project name */
  name: string;

  /** Optional short tagline (1 line) */
  tagline?: string;

  /** Optional logo image path (e.g. /projects/foo-logo.svg) */
  logoImage?: string;

  /** URL to the live project (if available) */
  url?: string;

  /** Brief description of what the project does */
  description: string;

  /** Project status */
  status: ProjectStatus;

  /** Intended audience: developers or general users */
  audience: ProjectAudience;

  /** Portfolio track: enterprise/orgs vs dev tools */
  track: ProjectTrack;

  /** When the project started (ISO date or YYYY-MM) */
  startedAt?: string;

  /** Number of active users (if applicable) */
  userCount?: number;

  /** Additional structured data */
  stack?: string[];
  highlights?: string[];
  metrics?: ProjectMetric[];
  links?: ProjectLink[];

  /** Longer write-up (optional). Used by the details UI. */
  details?: string;

  /** Optional image URL or path */
  image?: string;

  /** Icon name from lucide-react (optional fallback when no logoImage) */
  icon?: string;

  /** Category for filtering (optional) */
  category?: "web-app" | "mobile-app" | "api" | "integration" | "other";
}
