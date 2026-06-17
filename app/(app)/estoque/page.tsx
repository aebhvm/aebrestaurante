import { Boxes, CheckCircle2, History, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StockTable } from "@/components/stock-table";
import { getStockRequests } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function StockDashboard() {
  const session = (await getSession())!;
  const requests = await getStockRequests(session);
  return (
    <>
      <PageHeader title="Dashboard do estoquista" description="Fila de separacao, entregas e historico de movimentacoes." />
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pendentes" value={requests.filter((item) => item.status === "solicitado").length} icon={Boxes} tone="amber" />
        <StatCard label="Separados" value={requests.filter((item) => item.status === "separado").length} icon={PackageCheck} />
        <StatCard label="Entregues" value={requests.filter((item) => item.status === "entregue").length} icon={CheckCircle2} tone="green" />
        <StatCard label="Historico" value={requests.length} icon={History} />
      </section>
      <div className="mt-6">
        <StockTable requests={requests} canUpdate />
      </div>
    </>
  );
}
