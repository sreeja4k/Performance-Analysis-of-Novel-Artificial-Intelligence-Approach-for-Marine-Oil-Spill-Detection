import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, MapPin, TrendingUp } from "lucide-react";

interface AnalyticsDashboardProps {
  detection: {
    spillDetected: boolean;
    confidenceScore?: number;
    areaSqKm?: number;
    environmentalImpact?: string;
    spillCoordinates?: Array<{
      x: number;
      y: number;
      severity: string;
    }>;
  };
}

export default function AnalyticsDashboard({
  detection,
}: AnalyticsDashboardProps) {
  const severityCount = detection.spillCoordinates?.reduce(
    (acc, coord) => {
      acc[coord.severity] = (acc[coord.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const stats = [
    {
      title: "Confidence Score",
      value: `${((detection.confidenceScore || 0) * 100).toFixed(1)}%`,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Affected Area",
      value: `${(detection.areaSqKm || 0).toFixed(2)} km²`,
      icon: MapPin,
      color: "text-green-500",
    },
    {
      title: "Detection Points",
      value: detection.spillCoordinates?.length || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "Impact Level",
      value: detection.environmentalImpact?.split(" - ")[0] || "None",
      icon: TrendingUp,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Severity Distribution */}
      {detection.spillDetected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(severityCount).map(([severity, count]) => {
                  const colors = {
                    low: "bg-green-500",
                    moderate: "bg-yellow-500",
                    high: "bg-orange-500",
                    critical: "bg-red-500",
                  };
                  const total = detection.spillCoordinates?.length || 1;
                  const percentage = (count / total) * 100;

                  return (
                    <div key={severity}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {severity}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={`h-2 rounded-full ${colors[severity as keyof typeof colors]}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Environmental Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Environmental Impact Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {detection.environmentalImpact ||
                "No environmental impact detected"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
