import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const stats = useQuery(api.detections.getDetectionStats);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createDetection = useMutation(api.detections.createDetection);
  const analyzeImage = useAction(api.aiAnalysis.analyzeImage);

  // STRICT marine image validation - blocks animations, cartoons, and non-marine content
  const validateMarineImage = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        // Create canvas to analyze image colors
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(false);
          return;
        }
        
        // Sample the image at reduced resolution for performance
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;
        
        let blueishPixels = 0;
        let totalPixels = sampleSize * sampleSize;
        let skinTonePixels = 0;
        let medicalImageryPixels = 0;
        let grayishPixels = 0;
        let highSaturationPixels = 0;
        let vividColorPixels = 0;
        let artificialColorPixels = 0;
        let cartoonColorPixels = 0;
        let edgePixels = 0;
        
        // Analyze color distribution with STRICT cartoon/animation detection
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Calculate saturation and brightness
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const brightness = max / 255;
          
          // Check for blue/cyan tones (water/ocean)
          if (b > r && b > g && b > 80) {
            blueishPixels++;
          }
          
          // Check for skin tones (to reject human photos)
          if (r > 95 && g > 40 && b > 20 && 
              r > g && g > b && 
              Math.abs(r - g) > 15) {
            skinTonePixels++;
          }
          
          // Check for medical imagery colors (very bright reds/pinks)
          if (r > 200 && g < 100 && b < 100) {
            medicalImageryPixels++;
          }
          
          // Check for grayish/white backgrounds (medical/artificial)
          if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20 && r > 180) {
            grayishPixels++;
          }
          
          // Check for highly saturated colors (animations/cartoons)
          if (saturation > 0.7 && brightness > 0.5) {
            highSaturationPixels++;
          }
          
          // STRICT: Check for vivid, unnatural colors (bright reds, greens, yellows in animations)
          if ((r > 200 && g < 100 && b < 100) || // Vivid red
              (g > 200 && r < 100 && b < 100) || // Vivid green
              (r > 200 && g > 200 && b < 100)) { // Vivid yellow
            vividColorPixels++;
          }
          
          // STRICT: Check for artificial/cartoon colors - very pure colors with high saturation
          if (saturation > 0.8 && brightness > 0.4) {
            const isPureRed = r > 180 && g < 80 && b < 80;
            const isPureGreen = g > 180 && r < 80 && b < 80;
            const isPureBlue = b > 180 && r < 80 && g < 80;
            const isPureYellow = r > 180 && g > 180 && b < 80;
            const isPureOrange = r > 200 && g > 100 && g < 180 && b < 80;
            
            if (isPureRed || isPureGreen || isPureBlue || isPureYellow || isPureOrange) {
              artificialColorPixels++;
            }
          }
          
          // NEW: Detect cartoon-style colors (bright, saturated, uniform)
          // Cartoons have very uniform, bright colors with high saturation
          if (saturation > 0.6 && brightness > 0.6) {
            // Check for typical cartoon colors
            const isCartoonRed = r > 150 && g < 120 && b < 120;
            const isCartoonGreen = g > 150 && r < 120 && b < 120;
            const isCartoonBlue = b > 150 && r < 120 && g < 120;
            const isCartoonYellow = r > 150 && g > 150 && b < 120;
            const isCartoonOrange = r > 180 && g > 80 && g < 150 && b < 100;
            
            if (isCartoonRed || isCartoonGreen || isCartoonBlue || isCartoonYellow || isCartoonOrange) {
              cartoonColorPixels++;
            }
          }
          
          // NEW: Detect sharp edges (common in animations/cartoons)
          // Check color difference with next pixel
          if (i < pixels.length - 4) {
            const nextR = pixels[i + 4];
            const nextG = pixels[i + 5];
            const nextB = pixels[i + 6];
            const colorDiff = Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
            
            // Sharp edges indicate cartoon/animation
            if (colorDiff > 150) {
              edgePixels++;
            }
          }
        }
        
        const bluePercentage = (blueishPixels / totalPixels) * 100;
        const skinPercentage = (skinTonePixels / totalPixels) * 100;
        const medicalPercentage = (medicalImageryPixels / totalPixels) * 100;
        const grayPercentage = (grayishPixels / totalPixels) * 100;
        const saturationPercentage = (highSaturationPixels / totalPixels) * 100;
        const vividPercentage = (vividColorPixels / totalPixels) * 100;
        const artificialPercentage = (artificialColorPixels / totalPixels) * 100;
        const cartoonPercentage = (cartoonColorPixels / totalPixels) * 100;
        const edgePercentage = (edgePixels / totalPixels) * 100;
        
        // ULTRA STRICT Marine image validation:
        // - Must have significant blue content (at least 15%)
        // - Minimal skin tones (less than 20%)
        // - Minimal medical imagery colors (less than 15%)
        // - Not too much gray/white background (less than 50%)
        // - Not too many highly saturated colors (less than 25% - STRICTER)
        // - Not too many vivid, unnatural colors (less than 8% - STRICTER)
        // - Not too many artificial/pure colors (less than 3% - MUCH STRICTER)
        // - Not too many cartoon colors (less than 15% - NEW)
        // - Not too many sharp edges (less than 20% - NEW, blocks animations)
        const isLikelyMarine = 
          bluePercentage > 15 && 
          skinPercentage < 20 && 
          medicalPercentage < 15 &&
          grayPercentage < 50 &&
          saturationPercentage < 25 &&
          vividPercentage < 8 &&
          artificialPercentage < 3 &&
          cartoonPercentage < 15 &&
          edgePercentage < 20;
        
        console.log('STRICT Image validation results:', {
          bluePercentage,
          skinPercentage,
          medicalPercentage,
          grayPercentage,
          saturationPercentage,
          vividPercentage,
          artificialPercentage,
          cartoonPercentage,
          edgePercentage,
          isLikelyMarine
        });
        
        resolve(isLikelyMarine);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };
      
      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enhanced image validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check minimum dimensions
      if (img.width < 100 || img.height < 100) {
        toast.error("Image dimensions too small. Please upload a larger image.");
        return;
      }

      // Validate if image appears to be marine imagery
      toast.info("Validating image content...");
      const isMarineImage = await validateMarineImage(file);
      
      if (!isMarineImage) {
        toast.error("This doesn't appear to be marine/ocean/satellite imagery. Please upload images of water bodies, oceans, or satellite views.");
        return;
      }

      // Proceed with upload
      await performUpload(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Invalid image file. Please upload a valid image.");
    };

    img.src = objectUrl;
  };

  const performUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Get the proper image URL from Convex storage
      const imageUrl = `${import.meta.env.VITE_CONVEX_URL}/api/storage/${storageId}`;

      const detectionId = await createDetection({
        imageStorageId: storageId,
        imageUrl,
      });

      toast.success("Image uploaded successfully");

      // Start analysis in background
      analyzeImage({ detectionId, imageUrl })
        .then(() => {
          toast.success("Analysis completed!");
        })
        .catch((error) => {
          toast.error("Analysis failed: " + error.message);
        });

      // Navigate to results page immediately after upload
      navigate(`/detection/${detectionId}`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-xl font-bold">Oil Spill Detection Using Vision Transformer</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Total Detections
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.totalDetections}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Spills Detected
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.spillsDetected}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Total Area</p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.totalArea.toFixed(2)} km²
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Avg Confidence
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {(stats.averageConfidence * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Upload Section with Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Upload Satellite/Drone Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strict Upload Warning */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-2">
                      ⚠️ Strict Upload Warning
                    </h3>
                    <div className="text-sm text-orange-800 dark:text-orange-300 space-y-2">
                      <p className="font-semibold">Upload Policy:</p>
                      <p>Only upload images related to the sea or ocean — such as:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Satellite images of the sea or ocean</li>
                        <li>Ships or boats on the ocean</li>
                        <li>Oil spills or marine regions</li>
                      </ul>
                      <p className="font-semibold mt-2">
                        🚫 All other images will be blocked automatically.
                      </p>
                      <p className="text-xs mt-2 italic">
                        Please ensure your image clearly shows marine or oceanic content before uploading.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upload Area */}
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  )}
                  <p className="text-lg font-medium mb-2">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports satellite and drone imagery
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}