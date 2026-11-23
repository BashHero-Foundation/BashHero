"use client";

import { useEffect } from "react";

type ScreenPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  images?: string[];
};

export default function ScreenPopup({
  isOpen,
  onClose,
  title,
  message,
  images = [],
}: ScreenPopupProps) {
  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    // document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 text-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] max-w-md overflow-y-auto rounded-xl bg-bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-bold text-text-secondary">{title}</h2>

        {images.length > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`${title} – image ${index + 1}`}
                className="w-full rounded-lg object-contain"
              />
            ))}
          </div>
        )}

        <p className="mb-4 text-text-neutral">{message}</p>

        <button
          onClick={onClose}
          className="rounded-lg border-btn-primary-border bg-btn-primary-bg px-6 py-2 text-lg text-white text-btn-primary-text tracking-wider transition hover:bg-btn-primary-bg-hover active:border-b-0"
        >
          Ok
        </button>
      </div>
    </div>
  );
}