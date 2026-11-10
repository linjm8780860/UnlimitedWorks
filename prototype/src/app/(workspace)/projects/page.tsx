import { ProjectsPage } from '@/components/projects/projects-page';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const params = await searchParams;
  return <ProjectsPage startCreating={params.create === '1'} />;
}

