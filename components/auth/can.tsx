// components/auth/can.tsx
"use client";

import type { ReactNode } from "react";
import { useSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/roles";

export function useCan(permission: Permission): boolean {
  const user = useSession();
  return can(user.role, permission);
}

// Gate declarativo: renderiza children solo si el rol actual tiene el permiso.
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useCan(permission) ? <>{children}</> : <>{fallback}</>;
}
