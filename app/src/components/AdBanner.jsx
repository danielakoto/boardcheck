// src/components/AdBanner.jsx
import { useEffect, useRef, useState } from "react";

export const AdBanner = ({ slot, format = "auto", style = {} }) => {
  const containerRef = useRef(null);
  const initialized = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setIsVisible(true);
          observer.disconnect();
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || initialized.current) return;
    initialized.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }

    // Check after a short delay if AdSense actually filled the slot
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector("ins.adsbygoogle");
      const filled = ins?.getAttribute("data-ad-status") === "filled";
      setHasAd(filled);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!hasAd) return null; // render nothing if no ad

  return (
    <div style={{
      position: 'fixed',
      bottom: '8px',
      right: '8px',
      zIndex: 999,
      width: '336px',
      background: 'var(--board-bg)',
      borderRadius: '12px',
      padding: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div ref={containerRef} style={{ textAlign: "center", ...style }}>
        {isVisible && (
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5266473855987721"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  );
};