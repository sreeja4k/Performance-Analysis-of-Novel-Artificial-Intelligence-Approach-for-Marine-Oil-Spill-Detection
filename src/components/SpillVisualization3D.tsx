import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpillCoordinate {
  x: number;
  y: number;
  severity: "low" | "moderate" | "high" | "critical";
}

interface SpillVisualization3DProps {
  imageUrl: string;
  spillCoordinates: SpillCoordinate[];
  onClose: () => void;
}

export default function SpillVisualization3D({
  imageUrl,
  spillCoordinates,
  onClose,
}: SpillVisualization3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const markersRef = useRef<THREE.Mesh[]>([]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 5);
    scene.add(directionalLight);

    // Load image as blob first to avoid CORS issues with Convex storage
    const loadImageAsTexture = async () => {
      try {
        console.log("Loading image from URL:", imageUrl);
        
        // Fetch the image as a blob
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Create image element from blob
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          console.log("Image loaded successfully:", img.width, "x", img.height);
          
          // Create texture from loaded image
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          
          const aspect = img.width / img.height;
          const planeWidth = 8 * aspect;
          const planeHeight = 8;
          
          const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.DoubleSide
          });
          const plane = new THREE.Mesh(geometry, material);
          scene.add(plane);

          // Add spill markers
          spillCoordinates.forEach((coord) => {
            const marker = createMarker(coord.severity);
            
            // Convert normalized coordinates (0-1000, 0-800) to 3D space
            const normalizedX = (coord.x / 1000) - 0.5;
            const normalizedY = 0.5 - (coord.y / 800);
            
            const x = normalizedX * planeWidth;
            const y = normalizedY * planeHeight;
            
            marker.position.set(x, y, 0.2);
            scene.add(marker);
            markersRef.current.push(marker);
          });
          
          // Clean up blob URL
          URL.revokeObjectURL(objectUrl);
        };
        
        img.onerror = (error) => {
          console.error("Error loading image element:", error);
          createFallbackPlane();
          URL.revokeObjectURL(objectUrl);
        };
        
        img.src = objectUrl;
        
      } catch (error) {
        console.error("Error fetching image:", error);
        createFallbackPlane();
      }
    };
    
    const createFallbackPlane = () => {
      console.log("Creating fallback plane");
      // Create a fallback plane with ocean-like color
      const geometry = new THREE.PlaneGeometry(10, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x1a4d6d,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
      
      // Still add markers even if image fails
      spillCoordinates.forEach((coord) => {
        const marker = createMarker(coord.severity);
        const normalizedX = (coord.x / 1000) - 0.5;
        const normalizedY = 0.5 - (coord.y / 800);
        marker.position.set(normalizedX * 10, normalizedY * 8, 0.2);
        scene.add(marker);
        markersRef.current.push(marker);
      });
    };
    
    loadImageAsTexture();

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Animate markers with pulsing effect
      const time = Date.now() * 0.001;
      markersRef.current.forEach((marker, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.5) * 0.3;
        marker.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl, spillCoordinates]);

  const createMarker = (severity: string): THREE.Mesh => {
    // Color based on severity
    const colors = {
      low: 0x4ade80,
      moderate: 0xfbbf24,
      high: 0xf97316,
      critical: 0xef4444,
    };
    const color = colors[severity as keyof typeof colors] || 0xef4444;

    // Create a sphere geometry for the marker
    const geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    
    // Add a ring around the marker
    const ringGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    sphere.add(ring);

    return sphere;
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(2, cameraRef.current.position.z - 0.5);
      setZoom((z) => Math.min(3, z + 0.2));
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(10, cameraRef.current.position.z + 0.5);
      setZoom((z) => Math.max(0.5, z - 0.2));
    }
  };

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = 5;
      setZoom(1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
    >
      <div className="relative w-full h-full">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            className="shadow-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            className="shadow-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="shadow-lg"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
          <h3 className="font-semibold mb-2">Severity Levels</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Critical</span>
            </div>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}