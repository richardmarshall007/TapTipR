import { TipFlowClient } from "@/components/tip-flow";

export default async function BusinessTipPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <TipFlowClient mode="business" code={code} />;
}
