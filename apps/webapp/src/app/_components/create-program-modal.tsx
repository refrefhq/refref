"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@refref/ui/components/dialog";
import { Button } from "@refref/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@refref/ui/components/tooltip";
import { IconPlus } from "@tabler/icons-react";
import { CheckCircle2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { cn } from "@refref/ui/lib/utils";
import {
  SingleSidedVisual,
  DoubleSidedVisual,
  AffiliateVisual,
} from "@/components/template-visuals";

type Template = {
  id: string;
  templateName: string;
  description: string;
  // Add more fields as needed
};

// Helper function to get the appropriate visual component for a template
function getTemplateVisual(templateName: string) {
  const lowerName = templateName.toLowerCase();

  // Match template names to visual components
  if (lowerName.includes("single") || lowerName.includes("affiliate")) {
    return SingleSidedVisual;
  } else if (lowerName.includes("double") || lowerName.includes("two-sided") || lowerName.includes("standard") || lowerName.includes("referral")) {
    return DoubleSidedVisual;
  } else if (lowerName.includes("partner") || lowerName.includes("commission")) {
    return AffiliateVisual;
  }

  // Default to double-sided for standard referral programs
  return DoubleSidedVisual;
}

export function CreateProgramModalV2() {
  const [open, setOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const router = useRouter();

  const { data: templates } = api.program.listTemplates.useQuery();
  const { data: existingPrograms } = api.program.getAll.useQuery();

  // Create a set of used template IDs for quick lookup
  const usedTemplateIds = new Set(
    existingPrograms?.map((program) => program.programTemplateId) || [],
  );

  const handleTemplateSelect = (template: Template) => {
    // Check if template is already used
    if (usedTemplateIds.has(template.id)) {
      return; // Don't allow selection of already used template
    }

    setSelectedTemplate(template);
    setShowSetup(true);
    setOpen(false);
    router.push(
      `/programs/new?templateId=${template.id}&title=${template.templateName}`,
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <IconPlus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Choose a Program Template</DialogTitle>
          </DialogHeader>
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-4">
              {templates?.map((template) => {
                const isUsed = usedTemplateIds.has(template.id);
                const existingProgram = existingPrograms?.find(
                  (p) => p.programTemplateId === template.id,
                );

                const TemplateVisual = getTemplateVisual(template.templateName);

                const cardContent = (
                  <Card
                    key={template.id}
                    className={cn(
                      "transition-all relative",
                      isUsed
                        ? "opacity-60 cursor-not-allowed border-muted"
                        : "cursor-pointer hover:border-primary hover:shadow-sm",
                    )}
                    onClick={() => !isUsed && handleTemplateSelect(template)}
                  >
                    <CardHeader>
                      <div className="space-y-3">
                        {/* Visual Component */}
                        <div className={cn(
                          "w-full h-24 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 flex items-center justify-center",
                          isUsed && "opacity-50"
                        )}>
                          <TemplateVisual className="w-full h-full" />
                        </div>

                        <div className="flex items-start justify-between">
                          <CardTitle
                            className={cn(isUsed && "text-muted-foreground")}
                          >
                            {template.templateName}
                          </CardTitle>
                          {isUsed && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>In Use</span>
                            </div>
                          )}
                        </div>
                        <CardDescription>
                          {template.description}
                        </CardDescription>
                        {isUsed && existingProgram && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Already created as "{existingProgram.name}"
                          </p>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );

                if (isUsed) {
                  return (
                    <Tooltip key={template.id}>
                      <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
                      <TooltipContent>
                        <p>This template is already in use</p>
                        {existingProgram && (
                          <p className="text-xs opacity-90">
                            Program: {existingProgram.name}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return cardContent;
              })}
            </div>
          </TooltipProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}
