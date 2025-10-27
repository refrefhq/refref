import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import Image from "next/image";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthView
          path={path}
          cardHeader={
            <div className="mb-8 flex flex-col items-center gap-4">
              <Image
                src="/logo.svg"
                alt="RefRef"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Welcome to RefRef
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Manage your referral programs with ease
                </p>
              </div>
            </div>
          }
          className="w-full border shadow-lg p-8"
        />
      </div>
    </main>
  );
}
