// lib/auth/roles.ts
// RBAC de Soral — fuente única de roles y permisos. Hoy el usuario actual sale de
// un stub (lib/auth/session); mañana de Supabase Auth. Cambiar la fuente NO toca
// este archivo ni los <Can> de la UI.

export type Role = "owner" | "admin" | "manager" | "supervisor" | "viewer";

export type Permission =
  | "dashboard.view"
  | "lines.view"
  | "employees.view"
  | "recommendations.assign"
  | "reports.view"
  | "hiring.view"
  | "integrations.view"
  | "integrations.manage"
  | "admin.view"
  | "members.manage"
  | "settings.manage"
  | "billing.manage";

// Permisos por rol. De facto jerárquico: owner ⊇ admin ⊇ manager ⊇ supervisor ⊇ viewer.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
    "reports.view", "hiring.view", "integrations.view", "integrations.manage",
    "admin.view", "members.manage", "settings.manage", "billing.manage",
  ],
  admin: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
    "reports.view", "hiring.view", "integrations.view", "integrations.manage",
    "admin.view", "members.manage", "settings.manage",
  ],
  manager: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
    "reports.view", "hiring.view",
  ],
  supervisor: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
  ],
  viewer: ["dashboard.view", "lines.view", "employees.view"],
};

// Las etiquetas de rol viven en el catálogo i18n (messages/*.json → "roles").

// Listas ordenadas para recorrer en la UI (p. ej. la matriz de permisos de Admin).
export const ROLES: readonly Role[] = ["owner", "admin", "manager", "supervisor", "viewer"];

export const PERMISSIONS: readonly Permission[] = [
  "dashboard.view",
  "lines.view",
  "employees.view",
  "recommendations.assign",
  "reports.view",
  "hiring.view",
  "integrations.view",
  "integrations.manage",
  "admin.view",
  "members.manage",
  "settings.manage",
  "billing.manage",
];

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
