import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Gauge } from "lucide-react";

interface DetectionOverviewProps {
  detection: {
    status: string;
    _creationTime: number;
    confidenceScore?: number;
    spillDetected: boolean;
  };
}

export default function DetectionOverview({ detection }: DetectionOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Detection Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">
                {detection.status}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Detection Date
              </p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(detection._creationTime).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Confidence Score
              </p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                {((detection.confidenceScore || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Spill Detected
              </p>
              <p className="text-lg font-semibold">
                {detection.spillDetected ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
