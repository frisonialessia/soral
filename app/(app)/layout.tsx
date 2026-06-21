// app/(app)/layout.tsx
// Layout del área autenticada: envuelve toda la app en el shell (barra lateral +
// cabecera). La landing pública vive fuera de este grupo, así que no lleva shell.
//
// TODO(supabase): este es el ÚNICO punto de guard de auth. Cuando exista la
// sesión real, aquí se lee y, si no hay usuario, redirect("/login"). Cubre todas
// las rutas de la app de una sola vez.
import { AppShell } from "@/components/shell/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
