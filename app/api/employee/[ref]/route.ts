// app/api/employee/[ref]/route.ts
// Route Handler: ficha de un empleado. 404 si no existe (el cliente lo mapea a null).
import { NextResponse } from "next/server";
import { getEmployee } from "@/lib/server/data-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const employee = await getEmployee(ref);
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(employee);
}
