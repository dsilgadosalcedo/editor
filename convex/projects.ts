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
      slug: project.slug,
      data: project.data,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  },
});

// Get a project by slug for the authenticated user
export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) =>
        q.eq("userId", identity.subject).eq("slug", args.slug)
      )
      .first();

    if (!project) {
      return null;
    }

    return {
      id: project._id,
      name: project.name,
      slug: project.slug,
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
    slug: v.string(),
    data: v.object({
      elements: v.array(v.any()),
      artboardDimensions: v.object({
        width: v.number(),
        height: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = new Date().toISOString();

    // Check if slug already exists for this user
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) =>
        q.eq("userId", identity.subject).eq("slug", args.slug)
      )
      .first();

    if (existingProject) {
      throw new Error("A project with this slug already exists");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      slug: args.slug,
      data: args.data,
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: projectId,
      name: args.name,
      slug: args.slug,
      data: args.data,
      createdAt: now,
      updatedAt: now,
    };
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    data: v.optional(
      v.object({
        elements: v.array(v.any()),
        artboardDimensions: v.object({
          width: v.number(),
          height: v.number(),
        }),
      })
    ),
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

    // If updating slug, check for conflicts
    if (args.slug && args.slug !== project.slug) {
      const existingProject = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) =>
          q.eq("userId", identity.subject).eq("slug", args.slug!)
        )
        .first();

      if (existingProject) {
        throw new Error("A project with this slug already exists");
      }
    }

    const now = new Date().toISOString();
    const updateData: any = { updatedAt: now };

    if (args.name !== undefined) {
      updateData.name = args.name;
      // If name is being updated and no explicit slug is provided, generate a new slug
      if (args.slug === undefined) {
        const baseSlug = args.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        let uniqueSlug = baseSlug || "untitled";
        let counter = 1;

        while (true) {
          const existingProject = await ctx.db
            .query("projects")
            .withIndex("by_slug", (q) =>
              q.eq("userId", identity.subject).eq("slug", uniqueSlug)
            )
            .first();

          if (!existingProject || existingProject._id === args.id) {
            break;
          }

          uniqueSlug = `${baseSlug || "untitled"}-${counter}`;
          counter++;
        }

        updateData.slug = uniqueSlug;
      }
    }
    if (args.slug !== undefined) updateData.slug = args.slug;
    if (args.data !== undefined) updateData.data = args.data;

    await ctx.db.patch(args.id, updateData);

    const updatedProject = await ctx.db.get(args.id);
    return {
      id: updatedProject!._id,
      name: updatedProject!.name,
      slug: updatedProject!.slug,
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

// Generate unique slug helper
export const generateUniqueSlug = query({
  args: { baseName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const baseSlug = args.baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let uniqueSlug = baseSlug || "untitled";
    let counter = 1;

    while (true) {
      const existingProject = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) =>
          q.eq("userId", identity.subject).eq("slug", uniqueSlug)
        )
        .first();

      if (!existingProject) {
        break;
      }

      uniqueSlug = `${baseSlug || "untitled"}-${counter}`;
      counter++;
    }

    return uniqueSlug;
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
