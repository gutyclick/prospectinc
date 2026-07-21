import { PageHeader } from "@/components/layout/page-header";
import { DemoImportButton } from "@/components/settings/demo-import-button";
import { requireOwner } from "@/lib/auth/require-owner";

export default async function ConfiguracionPage() {
  await requireOwner();
  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" />
      <DemoImportButton />
    </div>
  );
}
