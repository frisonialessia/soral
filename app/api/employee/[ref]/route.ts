// app/api/employee/[ref]/route.ts
// Route Handler: ficha de un empleado. 404 si no existe (el cliente lo mapea a null).
import { getEmployee } from "@/lib/server/data-service";
import { RefParam } from "@/lib/server/inputs";
import { ok, run, notFound } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  return run(async () => {
    const { ref } = RefParam.parse(await params);
    const employee = await getEmployee(ref);
    if (!employee) throw notFound(`Empleado '${ref}' no existe`);
    return ok(employee);
  });
}
