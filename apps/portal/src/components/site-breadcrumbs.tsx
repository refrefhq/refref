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

interface BreadcrumbItem {
  href?: string;
  label: string;
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
                  <BreadcrumbPage className="h1 font-medium">
                    {item.label}
                  </BreadcrumbPage>
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
