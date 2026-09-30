"use client";

import { useEffect, useState } from "react";

type DestinationGalleryProps = {
  name: string;
  images: string[];
};

export default function DestinationGallery({
  name,
  images,
}: DestinationGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const showPrevious = () => {
    if (selectedIndex === null) return;

    setSelectedIndex(
      selectedIndex === 0
        ? images.length - 1
        : selectedIndex - 1
    );
  };

  const showNext = () => {
    if (selectedIndex === null) return;

    setSelectedIndex(
      selectedIndex === images.length - 1
        ? 0
        : selectedIndex + 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <>
      <div className="destination-gallery-grid">

        {images.map((image, index) => (

          <button
            type="button"
            key={`${image}-${index}`}
            className={
              index === 0
                ? "gallery-item gallery-item-large"
                : "gallery-item"
            }
            onClick={() => setSelectedIndex(index)}
            aria-label={`View ${name} photo ${index + 1}`}
          >

            <img
              src={image}
              alt={`${name} - Photo ${index + 1}`}
            />

            <div className="gallery-overlay">

              <span>
                View Photo ↗
              </span>

            </div>

          </button>

        ))}

      </div>


      {selectedIndex !== null && (

        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo gallery`}
          onClick={closeLightbox}
        >

          <button
            type="button"
            className="gallery-close"
            onClick={closeLightbox}
            aria-label="Close gallery"
          >
            ×
          </button>


          <button
            type="button"
            className="gallery-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous photo"
          >
            ←
          </button>


          <div
            className="gallery-lightbox-content"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >

            <img
              src={images[selectedIndex]}
              alt={`${name} - Photo ${selectedIndex + 1}`}
            />

            <div className="gallery-counter">

              {String(selectedIndex + 1).padStart(2, "0")}

              {" / "}

              {String(images.length).padStart(2, "0")}

            </div>

          </div>


          <button
            type="button"
            className="gallery-next"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
          >
            →
          </button>

        </div>

      )}

    </>
  );
}