// lib/auth/session.tsx
// SEAM de sesión. Hoy devuelve un usuario stub; el día de Supabase Auth este es
// el ÚNICO archivo que cambia (leer la sesión real). La UI y los <Can> no se tocan.
"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "./roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantName: string;
  // Para supervisores: líneas a las que está limitado. null = todas.
  lineScope: string[] | null;
}

// TODO(supabase): reemplazar por la sesión real (supabase.auth.getUser()).
const STUB_USER: SessionUser = {
  id: "stub-admin",
  name: "Demo Admin",
  email: "admin@soral.app",
  role: "admin",
  tenantName: "Planta Tijuana Norte",
  lineScope: null,
};

const SessionContext = createContext<SessionUser>(STUB_USER);

export function SessionProvider({ children }: { children: ReactNode }) {
  // TODO(supabase): provider real con estado de carga / refresh de sesión.
  return <SessionContext.Provider value={STUB_USER}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionUser {
  return useContext(SessionContext);
}

// TODO(supabase): supabase.auth.signOut(). Stub por ahora.
export function signOut() {
  if (typeof window !== "undefined") {
    console.info("[soral] signOut (stub) — se cableará con Supabase Auth");
  }
}
