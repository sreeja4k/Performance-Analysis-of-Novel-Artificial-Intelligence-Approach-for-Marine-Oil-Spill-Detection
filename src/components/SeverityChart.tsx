import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface SeverityChartProps {
  spillCoordinates?: Array<{
    x: number;
    y: number;
    severity: string;
  }>;
}

export default function SeverityChart({ spillCoordinates }: SeverityChartProps) {
  if (!spillCoordinates || spillCoordinates.length === 0) return null;

  const severityCount = spillCoordinates.reduce(
    (acc, coord) => {
      acc[coord.severity] = (acc[coord.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const severityColors = {
    low: { bg: "bg-green-500", text: "text-green-500", label: "Low Risk" },
    moderate: { bg: "bg-yellow-500", text: "text-yellow-500", label: "Moderate Risk" },
    high: { bg: "bg-orange-500", text: "text-orange-500", label: "High Risk" },
    critical: { bg: "bg-red-500", text: "text-red-500", label: "Critical Risk" },
  };

  const total = spillCoordinates.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Severity Distribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(severityCount).map(([severity, count]) => {
              const percentage = (count / total) * 100;
              const colorConfig =
                severityColors[severity as keyof typeof severityColors];

              return (
                <div key={severity} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full ${colorConfig.bg}`}
                      />
                      <span className="font-medium capitalize">
                        {colorConfig.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{count}</span>
                      <span className="text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-3 rounded-full ${colorConfig.bg}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
