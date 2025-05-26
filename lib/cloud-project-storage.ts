import { api } from "@/convex/_generated/api";
import { ConvexReactClient } from "convex/react";
import { CanvasElementData } from "@/features/canvas/store/useCanvasStore";
import { Id } from "@/convex/_generated/dataModel";

export interface CloudProject {
  id: string;
  name: string;
  slug: string;
  data: {
    elements: CanvasElementData[];
    artboardDimensions: { width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

export class CloudProjectStorage {
  constructor(private convexClient: ConvexReactClient) {}

  // Get all projects for the authenticated user
  async getProjects(): Promise<CloudProject[]> {
    try {
      return await this.convexClient.query(api.projects.getProjects);
    } catch (error) {
      console.error("Error fetching projects from cloud:", error);
      return [];
    }
  }

  // Get a project by slug
  async getProjectBySlug(slug: string): Promise<CloudProject | null> {
    try {
      return await this.convexClient.query(api.projects.getProjectBySlug, {
        slug,
      });
    } catch (error) {
      console.error("Error fetching project by slug from cloud:", error);
      return null;
    }
  }

  // Create a new project
  async createProject(
    name?: string,
    data?: {
      elements: CanvasElementData[];
      artboardDimensions: { width: number; height: number };
    }
  ): Promise<CloudProject> {
    const projectName = name || (await this.generateProjectName());
    const slug = await this.generateSlug(projectName);

    return await this.convexClient.mutation(api.projects.createProject, {
      name: projectName,
      slug,
      data: data || {
        elements: [],
        artboardDimensions: { width: 1024, height: 576 },
      },
    });
  }

  // Update a project
  async updateProject(
    id: string,
    updates: {
      name?: string;
      data?: {
        elements: CanvasElementData[];
        artboardDimensions: { width: number; height: number };
      };
    }
  ): Promise<CloudProject | null> {
    try {
      const updateData: {
        name?: string;
        slug?: string;
        data?: {
          elements: CanvasElementData[];
          artboardDimensions: { width: number; height: number };
        };
      } = {};

      if (updates.name !== undefined) {
        updateData.name = updates.name;
        updateData.slug = await this.generateSlug(updates.name);
      }

      if (updates.data !== undefined) {
        updateData.data = updates.data;
      }

      return await this.convexClient.mutation(api.projects.updateProject, {
        id: id as Id<"projects">,
        ...updateData,
      });
    } catch (error) {
      console.error("Error updating project in cloud:", error);
      return null;
    }
  }

  // Delete a project
  async deleteProject(id: string): Promise<boolean> {
    try {
      await this.convexClient.mutation(api.projects.deleteProject, {
        id: id as Id<"projects">,
      });
      return true;
    } catch (error) {
      console.error("Error deleting project from cloud:", error);
      return false;
    }
  }

  // Update project name and regenerate slug
  async updateProjectName(
    id: string,
    newName: string
  ): Promise<CloudProject | null> {
    return this.updateProject(id, { name: newName });
  }

  // Generate unique slug
  private async generateSlug(name: string): Promise<string> {
    try {
      return await this.convexClient.query(api.projects.generateUniqueSlug, {
        baseName: name,
      });
    } catch (error) {
      console.error("Error generating slug:", error);
      // Fallback to local generation
      return (
        name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || "untitled"
      );
    }
  }

  // Generate unique project name
  private async generateProjectName(): Promise<string> {
    try {
      return await this.convexClient.query(
        api.projects.generateUniqueProjectName
      );
    } catch (error) {
      console.error("Error generating project name:", error);
      return "Untitled Project";
    }
  }
}
