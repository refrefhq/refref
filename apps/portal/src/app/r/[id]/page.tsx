import { redirect } from "next/navigation";
import { use } from "react";

// Server component that redirects /r/:id to /api/r/:id
export default function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  redirect(`/api/r/${id}`);
  return null;
}
