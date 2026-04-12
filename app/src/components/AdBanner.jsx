// src/components/AdBanner.jsx
import { useEffect, useRef } from "react";

export const AdBanner = ({ slot, format = "auto", style = {} }) => {
  const adRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          zIndex: 999,
          background: 'var(--board-bg)',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
      <div style={{ textAlign: "center", ...style }}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-5266473855987721"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
