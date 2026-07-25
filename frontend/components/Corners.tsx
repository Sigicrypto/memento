"use client";

import React from 'react';

/**
 * Corners — the viewfinder / reticle bracket motif used throughout Memento's UI.
 * Drop inside any `position: relative` container to give it a HUD "in-frame" feel.
 * Opacity + reach animate up on hover via the `.viewfinder` parent class (see theme.css).
 */
const Corners: React.FC<{ className?: string }> = ({ className = '' }) => (
  <>
    <span className={`vf-corner vf-corner-tl ${className}`} />
    <span className={`vf-corner vf-corner-tr ${className}`} />
    <span className={`vf-corner vf-corner-bl ${className}`} />
    <span className={`vf-corner vf-corner-br ${className}`} />
  </>
);

export default Corners;
