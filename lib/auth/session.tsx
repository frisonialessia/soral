// lib/auth/session.tsx
// SEAM de sesión. Hoy devuelve un usuario stub; el día de Supabase Auth este es
// el ÚNICO archivo que cambia (leer la sesión real). La UI y los <Can> no se tocan.
//
// Extra de DEMO: el rol es conmutable en vivo (useSetRole) para mostrar el RBAC —
// el sidebar, el panel de admin y los <Can> reaccionan al instante. La elección se
// guarda en el navegador (localStorage), así sobrevive a la navegación y al refresh.
// No es una frontera de seguridad (la auth es un stub); es una herramienta de demo.
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLES, type Role } from "./roles";

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
const BASE_USER: Omit<SessionUser, "role"> = {
  id: "stub-admin",
  name: "Demo Admin",
  email: "admin@soral.app",
  tenantName: "Planta demo",
  lineScope: null,
};

const DEFAULT_ROLE: Role = "admin";
const ROLE_KEY = "soral_demo_role";
const isRole = (v: string | null): v is Role => !!v && (ROLES as readonly string[]).includes(v);

const SessionContext = createContext<SessionUser>({ ...BASE_USER, role: DEFAULT_ROLE });
const SetRoleContext = createContext<(role: Role) => void>(() => {});

export function SessionProvider({ children }: { children: ReactNode }) {
  // TODO(supabase): provider real con estado de carga / refresh de sesión.
  // Arranca en el rol por defecto (coincide en server y cliente → sin mismatch de
  // hidratación); tras montar, restaura el rol de demo guardado.
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROLE_KEY);
      if (isRole(stored) && stored !== role) setRole(stored);
    } catch {
      /* sin storage → rol por defecto */
    }
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeRole(r: Role) {
    setRole(r);
    try {
      localStorage.setItem(ROLE_KEY, r);
    } catch {
      /* sin storage → solo dura la sesión */
    }
  }

  const user: SessionUser = { ...BASE_USER, role };
  return (
    <SessionContext.Provider value={user}>
      <SetRoleContext.Provider value={changeRole}>{children}</SetRoleContext.Provider>
    </SessionContext.Provider>
  );
}

export function useSession(): SessionUser {
  return useContext(SessionContext);
}

// Cambia el rol del usuario de demo (para mostrar el RBAC en vivo).
export function useSetRole(): (role: Role) => void {
  return useContext(SetRoleContext);
}

// Cierra la sesión y devuelve a la landing pública. Hoy es un stub: como no hay
// sesión real que invalidar, basta con navegar a "/" con recarga completa (limpia
// el estado de cliente y el caché de React Query).
// TODO(supabase): await supabase.auth.signOut() ANTES de redirigir.
export function signOut() {
  if (typeof window !== "undefined") {
    window.location.assign("/");
  }
}
