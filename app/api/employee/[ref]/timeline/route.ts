// app/api/employee/[ref]/timeline/route.ts
// Route Handler: línea de tiempo del expediente 360. 404 si el ref no existe.
import { getEmployeeTimeline } from "@/lib/server/data-service";
import { RefParam } from "@/lib/server/inputs";
import { ok, run, notFound } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  return run(async () => {
    const { ref } = RefParam.parse(await params);
    const timeline = await getEmployeeTimeline(ref);
    if (!timeline) throw notFound(`Empleado '${ref}' no existe`);
    return ok(timeline);
  });
}
