// Centralized alert types and mappings for future backend integration

export type BackendStatus = "atraso" | "erro" | "atualizacao";

// Variants used by ScheduleAlert visual component
export type BannerAlertVariant = "atraso" | "erro" | "atualizacao";

// Variants used by LateBadge visual component
export type BadgeVariant = "atraso" | "erro";

export interface ComponentItem {
  id: number;
  name: string;
  dueDate: string; // ISO date in production
  status: BackendStatus;
  daysLate: number;
}

export function mapStatusToVariants(status: BackendStatus): {
  schedule?: BannerAlertVariant;
  badge?: BadgeVariant;
} {
  switch (status) {
    case "atraso":
      return { schedule: "atraso", badge: "atraso" };
    case "erro":
      return { schedule: "erro", badge: "erro" };
    case "atualizacao":
      return { schedule: "atualizacao" };
    default:
      return {};
  }
}
