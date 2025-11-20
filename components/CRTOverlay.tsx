import React from 'react';

const CRTOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-sm">
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,0.3)_100%)] z-20"></div>
      {/* Pixel Grid (subtle) */}
      <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38gYGAEESAAEGAAasgJOgzOKCoAAAAASUVORK5CYII=')] opacity-20 z-25"></div>
      {/* Screen curvature reflection */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/5 to-transparent z-30"></div>
    </div>
  );
};

export default CRTOverlay;