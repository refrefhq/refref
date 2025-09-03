"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconListDetails,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@refref/ui/components/command";
import { api } from "@/trpc/react";
import { useDebounce } from "@/lib/hooks/use-debounce";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  const { data: searchResults, isLoading } = api.search.global.useQuery(
    { query: debouncedSearch || "" },
    {
      enabled: Boolean(
        open && debouncedSearch && debouncedSearch.trim().length > 0,
      ),
    },
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const handleSearchClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const searchButton = target.closest("[data-search-trigger]");
      if (searchButton) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("click", handleSearchClick);
    return () => document.removeEventListener("click", handleSearchClick);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    setSearch("");
    router.push(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
      <CommandInput
        placeholder="Search participants, programs, and settings..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!search ? (
          <CommandEmpty>Start typing to search...</CommandEmpty>
        ) : isLoading ? (
          <CommandEmpty>
            <div className="flex items-center justify-center py-6">
              <IconSearch className="mr-2 h-4 w-4 animate-pulse" />
              <span>Searching...</span>
            </div>
          </CommandEmpty>
        ) : searchResults ? (
          <>
            {searchResults.participants.length > 0 && (
              <CommandGroup heading="Participants">
                {searchResults.participants.map((participant) => (
                  <CommandItem
                    key={participant.id}
                    onSelect={() =>
                      handleSelect(`/participants/${participant.id}`)
                    }
                  >
                    <IconUsers className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{participant.email}</span>
                      <span className="text-xs text-muted-foreground">
                        ID: {participant.id}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.programs.length > 0 && (
              <CommandGroup heading="Programs">
                {searchResults.programs.map((program) => (
                  <CommandItem
                    key={program.id}
                    onSelect={() => handleSelect(`/programs/${program.id}`)}
                  >
                    <IconListDetails className="mr-2 h-4 w-4" />
                    <span>{program.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchResults.settingsPages &&
              searchResults.settingsPages.length > 0 && (
                <CommandGroup heading="Settings">
                  {searchResults.settingsPages.map((setting) => (
                    <CommandItem
                      key={setting.id}
                      onSelect={() => handleSelect(setting.href)}
                    >
                      <IconSettings className="mr-2 h-4 w-4" />
                      <span>{setting.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

            {searchResults.participants.length === 0 &&
              searchResults.programs.length === 0 &&
              (!searchResults.settingsPages ||
                searchResults.settingsPages.length === 0) && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
          </>
        ) : (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  );
}
