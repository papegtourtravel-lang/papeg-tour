
"use client";

import { useState } from "react";

type DestinationGalleryProps = {
  name: string;
  images: string[];
};

export default function DestinationGallery({
  name,
  images,
}: DestinationGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "20px",
        width: "100%",
      }}
    >
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          style={{
            width: "100%",
            height: index === 0 ? "500px" : "350px",
            overflow: "hidden",
            background: "#eeeeee",
            cursor: "pointer",
          }}
          onClick={() => setSelectedImage(image)}
        >
          <img
            src={image}
            alt={`${name} photo ${index + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      ))}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "25px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "40px",
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt={`${name} enlarged`}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
