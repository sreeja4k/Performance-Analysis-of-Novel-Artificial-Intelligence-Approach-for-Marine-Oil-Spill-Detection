import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import DetectionOverview from "@/components/DetectionOverview";
import SeverityChart from "@/components/SeverityChart";
import DetectionFlowchart from "@/components/DetectionFlowchart";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import SpillAreaChart from "@/components/SpillAreaChart";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function DetectionResults() {
  const navigate = useNavigate();
  const { detectionId } = useParams<{ detectionId: string }>();

  const detection = useQuery(
    api.detections.getDetection,
    detectionId ? { detectionId: detectionId as Id<"detections"> } : "skip"
  );

  useEffect(() => {
    if (detection === null) {
      navigate("/dashboard");
    }
  }, [detection, navigate]);

  if (!detection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure we have a valid image URL
  if (!detection.imageUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg">Image not available</p>
        </div>
      </div>
    );
  }

  const impactLevel = detection.environmentalImpact?.split(" - ")[0] || "None";
  const impactDescription = detection.environmentalImpact?.split(" - ")[1] || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b shadow-sm bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Detection Analysis</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Image Display */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative w-full">
                    <img
                      src={detection.imageUrl}
                      alt="Detection Analysis"
                      className="w-full h-auto object-contain bg-black"
                      style={{ display: 'block' }}
                    />
                    {detection.status === "processing" && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        CHECKING...
                      </div>
                    )}
                    {detection.status === "completed" && detection.spillDetected && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                        SPILL DETECTED
                      </div>
                    )}
                    {detection.status === "completed" && !detection.spillDetected && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                        NO SPILL DETECTED
                      </div>
                    )}
                    
                    {/* 3D Animated Spill Markers Overlay */}
                    {detection.spillDetected && detection.spillCoordinates && (
                      <>
                        {detection.spillCoordinates.map((coord, index) => {
                          const severityConfig = {
                            low: { 
                              bg: "bg-green-500", 
                              border: "border-green-400",
                              shadow: "shadow-green-500/50",
                              glow: "0 0 20px rgba(34, 197, 94, 0.6)"
                            },
                            moderate: { 
                              bg: "bg-yellow-500", 
                              border: "border-yellow-400",
                              shadow: "shadow-yellow-500/50",
                              glow: "0 0 20px rgba(234, 179, 8, 0.6)"
                            },
                            high: { 
                              bg: "bg-orange-500", 
                              border: "border-orange-400",
                              shadow: "shadow-orange-500/50",
                              glow: "0 0 20px rgba(249, 115, 22, 0.6)"
                            },
                            critical: { 
                              bg: "bg-red-500", 
                              border: "border-red-400",
                              shadow: "shadow-red-500/50",
                              glow: "0 0 20px rgba(239, 68, 68, 0.6)"
                            },
                          };
                          const config = severityConfig[coord.severity];
                          
                          // Convert normalized coordinates to percentage positions
                          // Coordinates are in range 0-1000 (x) and 0-800 (y)
                          const leftPercent = (coord.x / 1000) * 100;
                          const topPercent = (coord.y / 800) * 100;
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, opacity: 0, y: -50 }}
                              animate={{ 
                                scale: 1, 
                                opacity: 1, 
                                y: 0,
                              }}
                              transition={{ 
                                delay: index * 0.15, 
                                duration: 0.5,
                                type: "spring",
                                stiffness: 200
                              }}
                              className="absolute pointer-events-none"
                              style={{
                                left: `${leftPercent}%`,
                                top: `${topPercent}%`,
                                transform: "translate(-50%, -50%)",
                                zIndex: 10,
                              }}
                            >
                              {/* Main marker with floating animation */}
                              <motion.div
                                animate={{
                                  y: [0, -8, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: index * 0.2
                                }}
                                className={`relative w-8 h-8 rounded-full ${config.bg} ${config.border} border-2 flex items-center justify-center`}
                              >
                                {/* Inner dot */}
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </motion.div>
                              
                              {/* Severity label */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15 + 0.3 }}
                                className={`absolute top-10 left-1/2 transform -translate-x-1/2 ${config.bg} ${config.border} border-2 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-bold`}
                              >
                                {coord.severity.toUpperCase()}
                              </motion.div>
                            </motion.div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <DetectionOverview detection={detection} />
            {detection.spillDetected && (
              <SeverityChart spillCoordinates={detection.spillCoordinates} />
            )}
          </div>

          {/* Right Column - Analytics & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {detection.confidenceScore && (
              <ConfidenceGauge confidenceScore={detection.confidenceScore} />
            )}
            
            <DetectionFlowchart 
              status={detection.status} 
              spillDetected={detection.spillDetected} 
            />

            {detection.spillDetected && (
              <SpillAreaChart 
                areaSqKm={detection.areaSqKm}
                spillCoordinates={detection.spillCoordinates}
              />
            )}

            {/* Environmental Impact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-lg ${
                        detection.spillDetected
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-green-500/10 border border-green-500/20"
                      }`}
                    >
                      <p className="font-semibold mb-2">{impactLevel}</p>
                      <p className="text-sm text-muted-foreground">
                        {impactDescription || detection.environmentalImpact}
                      </p>
                    </div>

                    {detection.spillDetected && (
                      <div className="space-y-2 pt-2">
                        <p className="text-sm font-semibold">
                          Recommended Actions:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Deploy containment booms immediately</li>
                          <li>Alert environmental response teams</li>
                          <li>Monitor weather conditions</li>
                          <li>Document spill progression</li>
                          <li>Coordinate with maritime authorities</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analysis Details */}
            {detection.analysisData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Analysis Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Model Version
                        </span>
                        <span className="font-medium">
                          {detection.analysisData.modelVersion}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Processing Time
                        </span>
                        <span className="font-medium">
                          {(detection.analysisData.processingTime / 1000).toFixed(
                            1
                          )}
                          s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Processed At
                        </span>
                        <span className="font-medium">
                          {new Date(
                            detection.analysisData.processedAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}