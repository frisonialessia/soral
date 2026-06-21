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
    "reports.view", "integrations.view", "integrations.manage",
    "admin.view", "members.manage", "settings.manage", "billing.manage",
  ],
  admin: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
    "reports.view", "integrations.view", "integrations.manage",
    "admin.view", "members.manage", "settings.manage",
  ],
  manager: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
    "reports.view",
  ],
  supervisor: [
    "dashboard.view", "lines.view", "employees.view", "recommendations.assign",
  ],
  viewer: ["dashboard.view", "lines.view", "employees.view"],
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Propietario",
  admin: "Administrador",
  manager: "Gerente",
  supervisor: "Supervisor",
  viewer: "Solo lectura",
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
