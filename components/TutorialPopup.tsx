"use client";

import { useEffect, useState } from "react";

type TutorialPopupProps = {
  storageKey: string;
  title: string;
  message: string;
};

export default function TutorialPopup({
  storageKey,
  title,
  message,
}: TutorialPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 text-center">
      <div className="max-w-md rounded-xl bg-bg-surface p-6 shadow-xl">
        <h2 className="mb-3 text-xl font-bold text-text-secondary">{title}</h2>

        <p className="mb-4 text-text-neutral">{message}</p>

        <button
          onClick={handleClose}
          className="rounded-lg border-btn-primary-border bg-btn-primary-bg px-4 py-2 text-white text-lg 
          text-btn-primary-text tracking-wider transition hover:bg-btn-primary-bg-hover px-6 active:border-b-0"
        >
          Ok
        </button>
      </div>
    </div>
  );
}