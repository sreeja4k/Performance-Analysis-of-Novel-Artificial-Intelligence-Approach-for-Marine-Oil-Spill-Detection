import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

interface ConfidenceGaugeProps {
  confidenceScore: number;
}

export default function ConfidenceGauge({ confidenceScore }: ConfidenceGaugeProps) {
  const percentage = confidenceScore * 100;
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Confidence Meter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 mb-4">
              {/* Gauge background */}
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  className="text-muted"
                />
                <motion.path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="20"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={
                    percentage >= 90
                      ? "text-green-500"
                      : percentage >= 70
                        ? "text-yellow-500"
                        : "text-red-500"
                  }
                />
                {/* Needle */}
                <motion.line
                  x1="100"
                  y1="80"
                  x2="100"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-foreground"
                  initial={{ rotate: -90 }}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ transformOrigin: "100px 80px" }}
                />
                <circle cx="100" cy="80" r="8" fill="currentColor" className="text-foreground" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Detection Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
