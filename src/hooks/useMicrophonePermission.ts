import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

type PermissionState = "prompt" | "granted" | "denied" | "unknown";

interface UseMicrophonePermissionReturn {
  permissionState: PermissionState;
  requestPermission: () => Promise<boolean>;
  isChecking: boolean;
}

export const useMicrophonePermission = (): UseMicrophonePermissionReturn => {
  const [permissionState, setPermissionState] = useState<PermissionState>("unknown");
  const [isChecking, setIsChecking] = useState(true);

  // Request permission by triggering getUserMedia
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      // On native platforms, we need to actually request the stream to trigger the permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState("granted");
      setIsChecking(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.log("Permission request failed:", error.message);
      
      if (error.name === "NotAllowedError" || 
          error.message.includes("Permission") || 
          error.message.includes("denied")) {
        setPermissionState("denied");
      } else {
        setPermissionState("unknown");
      }
      
      setIsChecking(false);
      return false;
    }
  }, []);

  // Check initial permission state on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // On native Android, we need to request immediately to trigger the system dialog
        if (Capacitor.isNativePlatform()) {
          // On native platforms, request permission immediately on app launch
          await requestPermission();
          return;
        }

        // On web, we can check the permission state without triggering a request
        if (navigator.permissions) {
          const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
          setPermissionState(status.state as PermissionState);
          
          // Listen for permission changes
          status.onchange = () => {
            setPermissionState(status.state as PermissionState);
          };
        } else {
          setPermissionState("prompt");
        }
      } catch (err) {
        console.log("Permission check error:", err);
        setPermissionState("prompt");
      }
      
      setIsChecking(false);
    };

    checkPermission();
  }, [requestPermission]);

  return {
    permissionState,
    requestPermission,
    isChecking,
  };
};
