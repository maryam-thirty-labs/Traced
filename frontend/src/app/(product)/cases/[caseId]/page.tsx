export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  return (
    <div className="flex items-center justify-center h-full text-text-secondary">
      Case {caseId}
    </div>
  );
}
