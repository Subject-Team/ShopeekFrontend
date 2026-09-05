import React from 'react';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClick: () => void;
}

/**
 * Shared modal backdrop: dims and blurs the page behind a modal.
 * Consumers render their modal container as children; clicking the
 * backdrop calls `onClick` (typically the modal's close handler).
 */
export const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClick }) => (
  <>
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm h-full"
      onClick={onClick}
    />
    {children}
  </>
);
