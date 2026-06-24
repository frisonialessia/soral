// app/api/employees/route.ts
// Route Handler: listado de empleados filtrable/paginado — la consulta "real".
// Valida la query string con Zod y devuelve una página { rows, total, limit, offset }.
//   GET /api/employees?line=L3&minScore=55&search=E7D9&sort=score&order=desc&limit=10&offset=0
import { listEmployees } from "@/lib/server/data-service";
import { EmployeeListQuery } from "@/lib/server/inputs";
import { ok, run, queryParams } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return run(async () => {
    const query = EmployeeListQuery.parse(queryParams(req));
    return ok(await listEmployees(query));
  });
}
