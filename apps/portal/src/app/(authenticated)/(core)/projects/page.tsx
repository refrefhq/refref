"use client";

import { Button } from "@refref/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@refref/ui/components/dialog";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { Textarea } from "@refref/ui/components/textarea";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Plus, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@refref/ui/components/card";
import { Badge } from "@refref/ui/components/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@refref/ui/components/alert-dialog";

export default function ProjectsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const utils = api.useUtils();

  // const { data: projects, isLoading } = api.project.getAll.useQuery();
  const projects: any[] = [];
  const isLoading = false;
  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      setOpen(false);
      setName("");
      // utils.project.getAll.invalidate();
    },
  });

  // const deleteProject = api.project.delete.useMutation({
  //   onSuccess: () => {
  //     setDeleteDialogOpen(false);
  //     // utils.project.getAll.invalidate();
  //   },
  // });
  const deleteProject = {
    mutate: (data: any) => {
      console.log("Delete not implemented", data);
    },
    isPending: false,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({
      name,
      url: `https://example.com/${name.toLowerCase().replace(/\s+/g, "-")}`,
    });
  };

  const handleDelete = () => {
    if (projectToDelete) {
      // deleteProject.mutate({ id: projectToDelete });
      console.log("Delete not implemented");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const breadcrumbs = [{ label: "Projects", href: "/projects" }];

  return (
    <>
      <SiteHeader
        breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />}
        meta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription>
                    Create a new project to organize your referral programs.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Card key={project.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Project Settings</DialogTitle>
                          <DialogDescription>
                            View your project's client ID and secret for JWT
                            generation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="clientId">Client ID</Label>
                            <Input
                              id="clientId"
                              value={project.clientId ?? ""}
                              readOnly
                              className="font-mono"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="clientSecret">Client Secret</Label>
                            <Input
                              id="clientSecret"
                              value={project.clientSecret ?? ""}
                              readOnly
                              className="font-mono"
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setProjectToDelete(project.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
