import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export default async function AnalyticsPage() {
  const programs = await api.program.getAll();

  if (programs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No programs yet</h3>
          <p className="text-muted-foreground mt-1">
            Create your first program to view analytics
          </p>
        </div>
      </div>
    );
  }

  const firstProgram = programs[0];
  if (!firstProgram) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No programs found</h3>
          <p className="text-muted-foreground mt-1">
            Something went wrong loading programs
          </p>
        </div>
      </div>
    );
  }

  redirect(`/analytics/${firstProgram.id}/performance`);
}
