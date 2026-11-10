import { CanvasPage } from '@/features/canvas/components/canvas-page';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  return <CanvasPage projectId={params.project} />;
}

