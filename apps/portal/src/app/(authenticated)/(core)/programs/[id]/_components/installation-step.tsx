import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";

interface InstallationStepProps {
  step: number;
  title: string;
  description: string;
  docsUrl?: string;
  docsLabel?: string;
  className?: string;
  children?: React.ReactNode; // Allow content like code snippets
}

/**
 * Renders a single step in an installation or setup guide,
 * optionally providing documentation links and content.
 */
export function InstallationStep({
  step,
  title,
  description,
  docsUrl,
  docsLabel = "View documentation",
  className,
  children,
}: InstallationStepProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium flex-shrink-0">
              {step}
            </span>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
          {docsUrl && (
            <Link
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1"
            >
              {docsLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
