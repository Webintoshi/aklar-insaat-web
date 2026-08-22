import { notFound } from "next/navigation";
import { z } from "zod";

import { requireOwnerPage } from "@/lib/auth/dal";
import { getAdminProject, ProjectNotFoundError } from "@/lib/projects/repository";

import { ProjectWizard } from "./project-wizard";

export const dynamic = "force-dynamic";

export default async function ProjectWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerPage();
  const id = z.uuid().parse((await params).id);

  let project;
  try {
    project = await getAdminProject(id);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) notFound();
    throw error;
  }

  return <ProjectWizard initialProject={JSON.parse(JSON.stringify(project))} />;
}
