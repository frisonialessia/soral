// app/linea/[id]/page.tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { useLineDetail } from "@/lib/queries";
import { RiskTable } from "@/components/risk-table";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function LinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch, isFetching } = useLineDetail(id);

  if (isLoading) return <LoadingState label={`Cargando línea ${id}…`} />;
  if (isError || !data) {
    return (
      <ErrorState
        title={`No pudimos cargar la línea ${id}`}
        detail="Revisa tu conexión e inténtalo de nuevo."
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <div className="animate-fade pb-12">
      <div className="flex items-center gap-2 pt-5 pb-0.5 text-[13px] text-ink-3">
        <Link href="/" className="text-ink-2 hover:text-risk-sol">
          Planta
        </Link>
        <span>/</span>
        <span>Línea {data.id}</span>
      </div>

      <div className="py-4">
        <h1 className="text-[27px] font-semibold tracking-tight">Línea {data.id}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {data.employees.length} empleados en riesgo · turno {data.shift}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-3 gap-3.5">
        <DetStat label="Rotación 90 días" value={data.turnover90d} note="Vs promedio de planta (9%)" color="#EB4F6C" />
        <DetStat label="Productividad agregada" value={data.productivity} note="Desviación vs línea base" color="#E59BB0" />
        <DetStat label="Efecto supervisor" value={data.supervisorEffect} note="Driver de línea detectado" color="#F56C89" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">Empleados en esta línea</h2>
        <span className="text-[12.5px] text-ink-3">Filtrado a riesgo medio-alto y alto</span>
      </div>
      <RiskTable
        rows={data.employees}
        showLine={false}
        emptyLabel="Sin empleados en riesgo medio-alto en esta línea."
      />
    </div>
  );
}

function DetStat({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <Card className="px-5 py-[18px]">
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{label}</div>
      <div className="mt-1.5 font-mono text-[28px] font-semibold tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-ink-3">{note}</div>
    </Card>
  );
}
