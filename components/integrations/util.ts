// components/integrations/util.ts
// Color de estado e icono por categoría de conector. Fuente única para la
// tarjeta y el modal.
import { Users, Banknote, Clock, Fingerprint, Boxes, FileText, type LucideIcon } from "lucide-react";
import type { ConnectorStatus, IntegrationConnector } from "@/types";

export const STATUS_COLOR: Record<ConnectorStatus, string> = {
  connected: "#5B6EF5",
  syncing: "#B49AED",
  error: "#EB4F6C",
  disconnected: "#A9AEC2",
};

export const CAT_ICON: Record<IntegrationConnector["category"], LucideIcon> = {
  hris: Users,
  payroll: Banknote,
  time: Clock,
  biometrics: Fingerprint,
  erp: Boxes,
  files: FileText,
};
