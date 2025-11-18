"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@refref/ui/components/card";
import { Label } from "@refref/ui/components/label";
import { Separator } from "@refref/ui/components/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";
import { Button } from "@refref/ui/components/button";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme-switcher";

export default function AppearanceSettings() {
  const { theme = "system", setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Sync local state with next-themes once mounted to avoid hydration mismatch
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  function handleThemeChange(value: string) {
    setCurrentTheme(value);
    setTheme(value);
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalise how RefRef looks on this device
        </p>
      </div>

      <Separator />

      <div>
        {/* Theme selector */}
        <Card>
          <CardContent className="space-y-4 flex justify-between items-center">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Theme
              </Label>
              <p className="text-xs text-muted-foreground">
                Select a colour scheme that suits you best.
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-36 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 capitalize">
                    {currentTheme === "light" && <Sun className="size-4" />}
                    {currentTheme === "dark" && <Moon className="size-4" />}
                    {currentTheme === "system" && (
                      <Monitor className="size-4" />
                    )}
                    {currentTheme === "system" ? "System" : currentTheme}
                  </span>
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                  <Monitor className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>

      {/* Floating dev-only theme switcher. Keeps existing behaviour */}
      <ThemeSwitcher />
    </div>
  );
}
