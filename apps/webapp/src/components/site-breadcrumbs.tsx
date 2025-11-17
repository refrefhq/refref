import * as React from "react";
import { HomeIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@refref/ui/components/breadcrumb";
import { EditableBreadcrumb } from "./editable-breadcrumb";

interface BreadcrumbItem {
  href?: string;
  label: string;
  editable?: boolean;
  onEdit?: (newValue: string) => Promise<void>;
}

interface SiteBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function SiteBreadcrumbs({ items }: SiteBreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              <BreadcrumbItem>
                {isLast ? (
                  item.editable && item.onEdit ? (
                    <BreadcrumbPage className="h1">
                      <EditableBreadcrumb
                        value={item.label}
                        onSave={item.onEdit}
                      />
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbPage className="h1 font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  )
                ) : (
                  <BreadcrumbLink href={item.href} className="h1 font-medium">
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
