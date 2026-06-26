import { TipFlowClient } from "@/components/tip-flow";

export default async function EmployeeTipPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <TipFlowClient mode="employee" code={code} />;
}
