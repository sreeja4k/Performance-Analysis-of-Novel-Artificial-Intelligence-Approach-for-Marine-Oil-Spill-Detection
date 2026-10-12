import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Waves } from "lucide-react";

interface SpillAreaChartProps {
  areaSqKm?: number;
  spillCoordinates?: Array<{
    x: number;
    y: number;
    severity: string;
  }>;
}

export default function SpillAreaChart({ areaSqKm, spillCoordinates }: SpillAreaChartProps) {
  if (!areaSqKm || !spillCoordinates) return null;

  const severityAreas = spillCoordinates.reduce((acc, coord) => {
    const areaPerPoint = areaSqKm / spillCoordinates.length;
    acc[coord.severity] = (acc[coord.severity] || 0) + areaPerPoint;
    return acc;
  }, {} as Record<string, number>);

  const severityColors = {
    critical: { color: "bg-red-500", label: "Critical" },
    high: { color: "bg-orange-500", label: "High" },
    moderate: { color: "bg-yellow-500", label: "Moderate" },
    low: { color: "bg-green-500", label: "Low" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Affected Area Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Waves className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Affected Area</p>
                  <p className="text-2xl font-bold">{areaSqKm.toFixed(2)} km²</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(severityAreas).map(([severity, area], index) => {
                const config = severityColors[severity as keyof typeof severityColors];
                const percentage = (area / areaSqKm) * 100;

                return (
                  <motion.div
                    key={severity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                        <span className="text-sm font-medium">{config.label} Severity</span>
                      </div>
                      <span className="text-sm font-bold">{area.toFixed(2)} km²</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                        className={`h-2 rounded-full ${config.color}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
