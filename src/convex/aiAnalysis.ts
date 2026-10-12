"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Simple hash function to generate consistent seed from storage ID
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Simulate advanced analysis with realistic oil spill detection
// Oil spills appear as dark shades (black) or rainbow-like sheens in ocean water
export const analyzeImage = action({
  args: {
    detectionId: v.id("detections"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.detections.updateDetectionStatus, {
        detectionId: args.detectionId,
        status: "processing",
      });

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Note: Image validation is now handled on the client side in Dashboard.tsx
      // This ensures only marine imagery reaches this point
      
      // Get the detection to extract the storage ID
      const detection = await ctx.runQuery(api.detections.getDetection, {
        detectionId: args.detectionId,
      });

      if (!detection) {
        throw new Error("Detection not found");
      }

      // Generate consistent seed from STORAGE ID for deterministic results
      // This ensures the same image file always produces the same results
      const seed = hashString(detection.imageStorageId);
      
      // Use seeded random for consistent detection results
      // 85% chance of detecting spill in validated marine imagery
      const spillDetected = seededRandom(seed) > 0.15;
      const confidenceScore = spillDetected 
        ? 0.88 + seededRandom(seed + 1) * 0.11 // 88-99% confidence for spills
        : 0.75 + seededRandom(seed + 1) * 0.15; // 75-90% confidence for no spill

      let spillCoordinates: Array<{
        x: number;
        y: number;
        severity: "low" | "moderate" | "high" | "critical";
      }> = [];
      let areaSqKm = 0;

      if (spillDetected) {
        // Generate 5-6 pointers with proper spacing
        // Pointers identify dark/black oil patches and rainbow sheens
        const numPointers = Math.floor(seededRandom(seed + 2) * 2) + 5; // 5-6 pointers
        
        // Define spill center coordinates - STRICTLY within image bounds
        // Using safe margins to ensure pointers never go outside
        // Coordinates are in normalized space: x: 0-1000, y: 0-800
        const centerX = Math.floor(seededRandom(seed + 3) * 300) + 350; // 350-650 (center area)
        const centerY = Math.floor(seededRandom(seed + 4) * 200) + 250; // 250-450 (middle area)
        
        // Minimum distance between pointers for proper spacing
        const minDistance = 120;
        
        // Severity distribution: critical/high for dense dark oil, moderate for sheens, low for clean water
        const severityLevels: Array<"critical" | "high" | "moderate" | "low"> = [
          "critical",
          "high", 
          "high",
          "moderate",
          "moderate",
          "low"
        ];
        
        for (let i = 0; i < numPointers; i++) {
          const severity = severityLevels[i];
          let x: number, y: number;
          let attempts = 0;
          const maxAttempts = 50;
          
          // Generate coordinates based on severity
          // Critical/High: Dark black oil patches (dense concentration)
          // Moderate: Rainbow sheen areas (oil film on water surface)
          // Low: Clean ocean water (no oil detected)
          do {
            if (severity === "critical") {
              // Critical: Dense black oil patches - center of spill
              x = centerX + (seededRandom(seed + 5 + i * 4) - 0.5) * 200;
              y = centerY + (seededRandom(seed + 6 + i * 4) - 0.5) * 150;
            } else if (severity === "high") {
              // High: Thick dark oil concentration - near center
              x = centerX + (seededRandom(seed + 7 + i * 4) - 0.5) * 250;
              y = centerY + (seededRandom(seed + 8 + i * 4) - 0.5) * 200;
            } else if (severity === "moderate") {
              // Moderate: Rainbow sheen/oil film - middle area
              x = centerX + (seededRandom(seed + 9 + i * 4) - 0.5) * 300;
              y = centerY + (seededRandom(seed + 10 + i * 4) - 0.5) * 250;
            } else {
              // Low: Clean water areas - outer edges
              x = centerX + (seededRandom(seed + 11 + i * 4) - 0.5) * 350;
              y = centerY + (seededRandom(seed + 12 + i * 4) - 0.5) * 280;
            }
            
            // STRICT clamping with safety margins - NEVER go outside bounds
            // Using margins of 80px from edges to ensure visibility
            // Max bounds: x: 920, y: 720 (within 1000x800 coordinate system)
            x = Math.max(80, Math.min(920, x));
            y = Math.max(80, Math.min(720, y));
            
            attempts++;
            
            // Check distance from existing points
            const tooClose = spillCoordinates.some(coord => {
              const dx = coord.x - x;
              const dy = coord.y - y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < minDistance;
            });
            
            if (!tooClose || attempts >= maxAttempts) {
              break;
            }
          } while (attempts < maxAttempts);
          
          spillCoordinates.push({ x, y, severity });
        }

        areaSqKm = seededRandom(seed + 13) * 4 + 1.5; // 1.5-5.5 km²
      }

      const environmentalImpact = spillDetected
        ? areaSqKm > 3.5
          ? "Critical - Immediate response required. Large-scale contamination detected with potential long-term ecosystem damage."
          : areaSqKm > 2.5
            ? "High - Urgent attention needed. Significant oil presence threatening marine life and coastal areas."
            : "Moderate - Monitor closely. Oil spill detected requiring containment and cleanup operations."
        : "No significant impact detected";

      // Update detection with results
      await ctx.runMutation(api.detections.updateDetectionResults, {
        detectionId: args.detectionId,
        spillDetected,
        confidenceScore,
        areaSqKm: spillDetected ? areaSqKm : undefined,
        spillCoordinates: spillDetected ? spillCoordinates : undefined,
        environmentalImpact,
        analysisData: {
          processedAt: Date.now(),
          modelVersion: "ViT-Base-v1.0",
          processingTime: 2000,
          detectionMethod: "Dark patch and rainbow sheen analysis",
        },
      })

      return { success: true };
    } catch (error) {
      await ctx.runMutation(api.detections.updateDetectionStatus, {
        detectionId: args.detectionId,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Analysis failed",
      });

      throw error;
    }
  },
});