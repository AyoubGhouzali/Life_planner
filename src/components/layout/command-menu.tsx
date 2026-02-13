"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  CheckSquare,
  Folder,
  FileText,
  LayoutDashboard,
  Layers
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { search } from "@/actions/search-actions";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ tasks: any[]; projects: any[]; notes: any[] }>({ tasks: [], projects: [], notes: [] });
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

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

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (debouncedQuery.length < 2) {
        setResults({ tasks: [], projects: [], notes: [] });
        return;
    }

    const fetchResults = async () => {
        setLoading(true);
        const data = await search(debouncedQuery);
        setResults(data);
        setLoading(false);
    };

    fetchResults();
  }, [debouncedQuery]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div className="w-full flex justify-center px-4">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
          >
            <span className="hidden lg:inline-flex">Search...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Type a command or search..." 
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {(results.tasks.length > 0 || results.projects.length > 0 || results.notes.length > 0) && (
             <>
                 <CommandGroup heading="Tasks">
                    {results.tasks.map(task => (
                        <CommandItem
                            key={task.id}
                            onSelect={() => runCommand(() => router.push(`/areas/${task.areaId}`))}
                        >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            <span>{task.title}</span>
                             <span className="ml-2 text-xs text-muted-foreground">in {task.projectTitle}</span>
                        </CommandItem>
                    ))}
                 </CommandGroup>
                  <CommandGroup heading="Projects">
                    {results.projects.map(project => (
                        <CommandItem
                            key={project.id}
                            onSelect={() => runCommand(() => router.push(`/areas/${project.areaId}`))}
                        >
                            <Folder className="mr-2 h-4 w-4" />
                            <span>{project.title}</span>
                        </CommandItem>
                    ))}
                 </CommandGroup>
                  <CommandGroup heading="Notes">
                    {results.notes.map(note => (
                        <CommandItem
                            key={note.id}
                            onSelect={() => runCommand(() => router.push(`/areas/${note.areaId}`))}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{note.title}</span>
                             <span className="ml-2 text-xs text-muted-foreground">in {note.projectTitle}</span>
                        </CommandItem>
                    ))}
                 </CommandGroup>
                 <CommandSeparator />
             </>
          )}

          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/areas"))}>
              <Layers className="mr-2 h-4 w-4" />
              <span>Areas</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
