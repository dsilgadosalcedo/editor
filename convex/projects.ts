import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all projects for the authenticated user
export const getProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_updated", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return projects.map((project) => ({
      id: project._id,
      name: project.name,
      data: project.data,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  },
});

// Get a project by id for the authenticated user
export const getProjectById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) {
      return null;
    }

    return {
      id: project._id,
      name: project.name,
      data: project.data,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  },
});

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    data: v.object({
      elements: v.array(v.any()),
      artboardDimensions: v.object({
        width: v.float64(),
        height: v.float64(),
      }),
    }),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const serverNow = new Date().toISOString();
    const finalCreatedAt = args.createdAt || serverNow;
    const finalUpdatedAt = args.updatedAt || serverNow;

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      data: args.data,
      userId: identity.subject,
      createdAt: finalCreatedAt,
      updatedAt: finalUpdatedAt,
    });

    return {
      id: projectId,
      name: args.name,
      data: args.data,
      createdAt: finalCreatedAt,
      updatedAt: finalUpdatedAt,
    };
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    data: v.optional(
      v.object({
        elements: v.array(v.any()),
        artboardDimensions: v.object({
          width: v.float64(),
          height: v.float64(),
        }),
      })
    ),
    updatedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Not authorized to update this project");
    }

    const serverNow = new Date().toISOString();
    const finalUpdatedAt = args.updatedAt || serverNow;

    const updateData: any = { updatedAt: finalUpdatedAt };

    if (args.name !== undefined) {
      updateData.name = args.name;
    }
    if (args.data !== undefined) updateData.data = args.data;

    await ctx.db.patch(args.id, updateData);

    const updatedProject = await ctx.db.get(args.id);
    return {
      id: updatedProject!._id,
      name: updatedProject!.name,
      data: updatedProject!.data,
      createdAt: updatedProject!.createdAt,
      updatedAt: updatedProject!.updatedAt,
    };
  },
});

// Delete a project
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== identity.subject) {
      throw new Error("Not authorized to delete this project");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Generate unique project name helper
export const generateUniqueProjectName = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    let counter = 1;
    let name = "Untitled Project";

    while (true) {
      const existingProject = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.eq(q.field("name"), name))
        .first();

      if (!existingProject) {
        break;
      }

      name = `Untitled Project ${counter}`;
      counter++;
    }

    return name;
  },
});
