// Took this code from shadcn blocks
"use client";

import React, { useState, Suspense, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@refref/ui/components/button";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Internal implementation of the login form that uses useSearchParams.
 * Separated from the main export to allow proper Suspense wrapping.
 */
function SignInFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const searchParams = useSearchParams();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsButtonDisabled(true);
      const callbackUrl = searchParams?.get("callbackUrl") ?? "/";

      const { error } = await signIn.magicLink({
        email: email,
        callbackURL: callbackUrl,
      });

      if (error) {
        console.error("Failed to send magic link:", error);
        toast.error("Failed to send magic link. Please try again.", {
          duration: 4000,
        });
        setIsButtonDisabled(false);
        return;
      }

      setMagicLinkSent(true);
      setIsButtonDisabled(false);
      toast.success("Magic link sent successfully. Check your email.", {
        duration: 4000,
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.", {
        duration: 4000,
      });
      setIsButtonDisabled(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign-in to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {magicLinkSent
            ? "Check your email for the magic link to sign in."
            : "Enter your email below to receive a magic link"}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isButtonDisabled}>
          {isButtonDisabled
            ? "Sending magic link..."
            : magicLinkSent
              ? "Resend Magic Link"
              : "Send Magic Link"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={async (e) => {
            e.preventDefault();
            await signIn.social({
              provider: "google",
            });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              fill="currentColor"
            />
          </svg>
          Sign-in with Google
        </Button>
      </div>
    </form>
  );
}

/**
 * Main    export wrapped in Suspense.
 * Next.js requires Suspense boundaries around components using useSearchParams()
 * to handle client-side rendering bailout properly. This ensures the component
 * can safely access URL search parameters while maintaining proper loading states.
 */
export function SignInForm(props: React.ComponentPropsWithoutRef<"form">) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SignInFormContent {...props} />
    </Suspense>
  );
}
