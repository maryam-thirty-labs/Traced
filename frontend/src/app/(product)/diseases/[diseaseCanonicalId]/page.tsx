import { DiseasePageClient } from "@/features/disease/components/DiseasePageClient";

type PageProps = {
  params: Promise<{ diseaseCanonicalId: string }>;
};

export default async function DiseasePage({ params }: PageProps) {
  const { diseaseCanonicalId } = await params;
  return <DiseasePageClient diseaseCanonicalId={diseaseCanonicalId} />;
}
