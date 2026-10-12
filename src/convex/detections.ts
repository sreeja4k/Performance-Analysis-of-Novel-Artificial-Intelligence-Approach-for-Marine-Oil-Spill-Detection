import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all detections for current user (including anonymous)
export const getUserDetections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    // If not authenticated, get all detections (for demo purposes)
    // In production, you might want to use session-based tracking
    let detections;
    if (userId) {
      detections = await ctx.db
        .query("detections")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    } else {
      // For anonymous users, show all recent detections
      detections = await ctx.db
        .query("detections")
        .order("desc")
        .take(20);
    }

    // Get proper storage URLs for all detections
    const detectionsWithUrls = await Promise.all(
      detections.map(async (detection) => {
        const imageUrl = await ctx.storage.getUrl(detection.imageStorageId);
        return {
          ...detection,
          imageUrl: imageUrl || detection.imageUrl,
        };
      })
    );

    return detectionsWithUrls;
  },
});

// Get single detection by ID
export const getDetection = query({
  args: { detectionId: v.id("detections") },
  handler: async (ctx, args) => {
    const detection = await ctx.db.get(args.detectionId);
    if (!detection) {
      return null;
    }

    // Get the proper storage URL
    const imageUrl = await ctx.storage.getUrl(detection.imageStorageId);
    
    return {
      ...detection,
      imageUrl: imageUrl || detection.imageUrl,
    };
  },
});

// Create new detection
export const createDetection = mutation({
  args: {
    imageStorageId: v.id("_storage"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Remove authentication requirement for public access
    // Create a default user ID for anonymous uploads
    const userId = "anonymous" as any;

    const detectionId = await ctx.db.insert("detections", {
      userId,
      imageStorageId: args.imageStorageId,
      imageUrl: args.imageUrl,
      status: "pending",
      spillDetected: false,
    });

    return detectionId;
  },
});

// Delete detection
export const deleteDetection = mutation({
  args: {
    detectionId: v.id("detections"),
  },
  handler: async (ctx, args) => {
    const detection = await ctx.db.get(args.detectionId);
    if (!detection) {
      throw new Error("Detection not found");
    }

    // For authenticated users, verify ownership
    const userId = await getAuthUserId(ctx);
    if (userId && detection.userId !== userId && detection.userId !== "anonymous") {
      throw new Error("Unauthorized");
    }

    // Delete the detection
    await ctx.db.delete(args.detectionId);

    // Optionally delete the associated image from storage
    try {
      await ctx.storage.delete(detection.imageStorageId);
    } catch (error) {
      // Storage deletion might fail if file doesn't exist, continue anyway
      console.log("Storage deletion failed:", error);
    }
  },
});

// Update detection with AI results
export const updateDetectionResults = mutation({
  args: {
    detectionId: v.id("detections"),
    spillDetected: v.boolean(),
    confidenceScore: v.number(),
    areaSqKm: v.optional(v.number()),
    spillCoordinates: v.optional(
      v.array(
        v.object({
          x: v.number(),
          y: v.number(),
          severity: v.union(
            v.literal("low"),
            v.literal("moderate"),
            v.literal("high"),
            v.literal("critical")
          ),
        })
      )
    ),
    environmentalImpact: v.optional(v.string()),
    analysisData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { detectionId, ...updateData } = args;

    await ctx.db.patch(detectionId, {
      ...updateData,
      status: "completed",
    });

    return detectionId;
  },
});

// Update detection status
export const updateDetectionStatus = mutation({
  args: {
    detectionId: v.id("detections"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { detectionId, status, errorMessage } = args;

    await ctx.db.patch(detectionId, {
      status,
      ...(errorMessage && { errorMessage }),
    });
  },
});

// Get detection statistics (including anonymous)
export const getDetectionStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    // Get detections based on authentication status
    let detections;
    if (userId) {
      detections = await ctx.db
        .query("detections")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    } else {
      // For anonymous users, show stats for all recent detections
      detections = await ctx.db
        .query("detections")
        .order("desc")
        .take(20);
    }

    const totalDetections = detections.length;
    const spillsDetected = detections.filter((d) => d.spillDetected).length;
    const totalArea = detections.reduce(
      (sum, d) => sum + (d.areaSqKm || 0),
      0
    );

    return {
      totalDetections,
      spillsDetected,
      totalArea,
      averageConfidence:
        detections.reduce((sum, d) => sum + (d.confidenceScore || 0), 0) /
        (totalDetections || 1),
    };
  },
});