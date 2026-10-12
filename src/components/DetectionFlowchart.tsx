import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Upload, Brain, CheckCircle, AlertCircle } from "lucide-react";

interface DetectionFlowchartProps {
  status: string;
  spillDetected: boolean;
}

export default function DetectionFlowchart({ status, spillDetected }: DetectionFlowchartProps) {
  const steps = [
    { icon: Upload, label: "Image Upload", status: "completed", color: "text-blue-500" },
    { icon: Brain, label: "Analysis", status: status === "completed" ? "completed" : "processing", color: "text-purple-500" },
    { icon: spillDetected ? AlertCircle : CheckCircle, label: spillDetected ? "Spill Detected" : "No Spill", status: status === "completed" ? "completed" : "pending", color: spillDetected ? "text-red-500" : "text-green-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Detection Process Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="w-full">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className={`p-3 rounded-full bg-background ${step.color}`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{step.label}</p>
                    <p className="text-sm text-muted-foreground capitalize">{step.status}</p>
                  </div>
                  {step.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {step.status === "processing" && (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}