import { useEffect, useRef, useState } from "react";

import { createLazyFileRoute } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { SProjectMetadata } from "@/types";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const [projects, setProjects] = useState<SProjectMetadata[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const getProjects = async () => {
    const projects = await window.strella.getProjects();
    setProjects(projects);
  };

  const createProject = async () => {
    const projectName = inputRef.current?.value;
    if (projectName) {
      const projectId = uuidv4();
      await window.strella.createProject(projectId, projectName);
      void window.strella.openProject(projectId);
    }
  };

  const deleteAllProjects = async () => {
    projects.forEach((project) => {
      window.strella.deleteProject(project.id);
    });
    void getProjects();
  };

  useEffect(() => {
    void getProjects();
  }, []);

  useEffect(() => {
    console.log(projects);
  }, [projects]);

  const projectsSortedByRecent = projects.sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  });

  return (
    <div className="p-2 flex flex-col items-center justify-center size-full">
      <div className="flex flex-col gap-6 max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Create a new project to get started. You can also open an existing
              project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <Input ref={inputRef} placeholder="Project name" />
              <Button onClick={createProject}>Create Project</Button>
            </div>
          </CardContent>
        </Card>
        {projectsSortedByRecent.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-sm">Open recent project</div>
            <div className="flex flex-col gap-2 items-center">
              {projectsSortedByRecent.map((project) => (
                <div
                  key={project.name}
                  className="flex w-full text-left gap-2 border border-black/10 rounded-md shadow items-center justify-between p-2 hover:bg-neutral-100"
                >
                  <div>{project.name}</div>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => window.strella.openProject(project.name)}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="destructive" onClick={deleteAllProjects}>
              nuke all projects
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
