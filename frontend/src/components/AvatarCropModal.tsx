"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface AvatarCropModalProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel }: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const handleConfirm = () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const OUTPUT_SIZE = 256;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setIsProcessing(false); return; }

    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Circular clip
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, OUTPUT_SIZE, OUTPUT_SIZE
    );

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
      setIsProcessing(false);
    }, "image/jpeg", 0.92);
  };

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 28px 24px",
        width: "100%", maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0a2c4f" }}>
              <i className="ti ti-crop" style={{ color: "#0f6e99", marginRight: 8 }} />
              Sesuaikan Foto Profil
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7a8a99" }}>
              Geser dan perbesar untuk mengatur posisi foto
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#4d6473", fontSize: 16 }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Crop area */}
        <div style={{
          background: "#0a2c4f", borderRadius: 12, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 300,
        }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
            keepSelection
            style={{ maxHeight: 380 }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: 380, maxWidth: "100%", display: "block" }}
            />
          </ReactCrop>
        </div>

        {/* Preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 12, color: "#7a8a99", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Preview:</span>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            overflow: "hidden", border: "2px solid #e5edf4",
            background: "#f3faff", flexShrink: 0,
          }}>
            {completedCrop && imgRef.current && (
              <CropPreview imgRef={imgRef} crop={completedCrop} />
            )}
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            overflow: "hidden", border: "2px solid #e5edf4",
            background: "#f3faff", flexShrink: 0,
          }}>
            {completedCrop && imgRef.current && (
              <CropPreview imgRef={imgRef} crop={completedCrop} size={36} />
            )}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#7a8a99" }}>Tampilan di profil dan navbar</p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "10px 22px", border: "1px solid #d6e6f2", borderRadius: 10, background: "#fff", color: "#4d6473", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop || isProcessing}
            style={{
              padding: "10px 28px", border: "none", borderRadius: 10,
              background: (!completedCrop || isProcessing) ? "#7a8a99" : "linear-gradient(135deg,#0f6e99,#1198c8)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: (!completedCrop || isProcessing) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 6px 16px rgba(15,110,153,0.25)",
            }}
          >
            <i className={`ti ${isProcessing ? "ti-loader-2" : "ti-check"}`} />
            {isProcessing ? "Memproses..." : "Gunakan Foto Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Small inline preview using canvas
function CropPreview({
  imgRef,
  crop,
  size = 52,
}: {
  imgRef: React.RefObject<HTMLImageElement>;
  crop: PixelCrop;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw on every render (crop changes)
  if (canvasRef.current && imgRef.current && crop.width && crop.height) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        crop.x * scaleX, crop.y * scaleY,
        crop.width * scaleX, crop.height * scaleY,
        0, 0, size, size
      );
    }
  }

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />;
}
