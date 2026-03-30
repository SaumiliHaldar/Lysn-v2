"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UploadZoneProps {
  onSuccess: (audioId: string) => void;
}

export function UploadZone({ onSuccess }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [loadingStage, setLoadingStage] = useState(0);

  const stages = [
    "Scanning Document...",
    "AI Vision Extraction...",
    "Structuring Chapters...",
    "Generating Study Quiz..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "uploading") {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % stages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleUpload = async (fileToUpload: File) => {
    setStatus("uploading");
    setLoadingStage(0);
    try {
      // 1. Initial Upload
      const res = await api.pdf.upload(fileToUpload) as { id: string, status: string, audio_id?: string };
      const metadataId = res.id;

      // 1a. Cache hit? Instant success!
      if (res.status === "completed" && res.audio_id) {
          setStatus("success");
          toast.success("Retrieved from Cache", {
            description: `"${fileToUpload.name}" was previously processed. Reusing audio!`,
          });
          onSuccess(res.audio_id);
          setTimeout(() => {
            setFile(null);
            setStatus("idle");
          }, 2000);
          return;
      }

      // 2. Poll for status (only if it wasn't a cache hit)
      let isCompleted = false;
      let finalAudioId = "";

      while (!isCompleted) {
        // Wait 3 seconds between polls
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const statusRes = await api.audio.getStatus(metadataId) as { status: string, audio_id: string, error?: string };
        
        if (statusRes.status === "completed") {
          isCompleted = true;
          finalAudioId = statusRes.audio_id;
        } else if (statusRes.status === "error") {
          throw new Error(statusRes.error || "Background processing failed");
        }
        // If still processing, loop repeats
      }

      setStatus("success");
      toast.success("Audio Generated!", {
        description: `"${fileToUpload.name}" has been converted to audio successfully.`,
      });
      onSuccess(finalAudioId);
      setTimeout(() => {
        setFile(null);
        setStatus("idle");
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      toast.error("Conversion Failed", {
        description: err.message || "Failed to convert PDF to audio. Please try again.",
      });
      setFile(null);
      setStatus("idle");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      setFile(droppedFile);
      handleUpload(droppedFile); // Start instantly!
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: status === "uploading",
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer overflow-hidden rounded-[2rem] border-2 border-dashed p-6 sm:p-12 transition-all h-[320px] flex items-center justify-center ${
          isDragActive
            ? "border-primary bg-primary/5 ring-8 ring-primary/5"
            : "border-border/30 bg-secondary/10 hover:border-primary/40 hover:bg-secondary/20"
        } ${status === "uploading" ? "cursor-wait border-primary/40" : ""}`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {status === "idle" && !file && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Drop your PDF here</h3>
              <p className="mt-2 text-sm text-muted-foreground/60">
                Conversion starts instantly on drop.
              </p>
            </motion.div>
          )}

          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                   <Loader2 className="h-10 w-10 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-bold animate-pulse text-muted-foreground mb-2">
                {stages[loadingStage]}
              </p>
              <p className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-widest">{file?.name}</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">Extraction Complete</h3>
              <p className="text-xs text-muted-foreground">Adding to your library...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
