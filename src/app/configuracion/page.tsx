import { PageHeader } from "@/components/layout/page-header";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function ConfiguracionPage() {
  await requireOwner();
  return <PageHeader title="Configuración" />;
}
