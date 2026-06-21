// lib/admin/members.ts
// Seam de miembros del workspace. Hoy datos sembrados; mañana la tabla `members`
// del tenant en Supabase (con RLS por workspace).
// TODO(supabase): reemplazar SEED_MEMBERS por una query a la tabla real.
import type { Role } from "@/lib/auth/roles";

export type MemberStatus = "active" | "invited";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
}

export const SEED_MEMBERS: Member[] = [
  { id: "m1", name: "Demo Admin", email: "admin@soral.app", role: "admin", status: "active" },
  { id: "m2", name: "Marco Bianchi", email: "marco.bianchi@soral.app", role: "owner", status: "active" },
  { id: "m3", name: "Lucía Hernández", email: "lucia.hernandez@soral.app", role: "manager", status: "active" },
  { id: "m4", name: "Diego Ramírez", email: "diego.ramirez@soral.app", role: "supervisor", status: "active" },
  { id: "m5", name: "Sofia Rossi", email: "sofia.rossi@soral.app", role: "supervisor", status: "invited" },
  { id: "m6", name: "Tomás Vega", email: "tomas.vega@soral.app", role: "viewer", status: "active" },
];
