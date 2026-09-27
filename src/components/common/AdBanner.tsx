import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { Advertisement, AdPosition } from '../../types';

interface AdBannerProps {
  position: AdPosition;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, className = '' }) => {
  const [ad, setAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    let mounted = true;
    dbService.getAdvertisements(position).then((ads) => {
      if (mounted && ads.length > 0) {
        // Pick active ad
        const active = ads.find((a) => a.isActive);
        if (active) setAd(active);
      }
    });
    return () => {
      mounted = false;
    };
  }, [position]);

  if (!ad) {
    // Elegant fallback sponsorship container
    return (
      <div
        id={`ad-placeholder-${position}`}
        className={`bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 rounded-lg p-3 text-center text-xs text-neutral-500 my-4 ${className}`}
      >
        <div className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400 mb-1">विज्ञापन (Advertisement)</div>
        <div className="py-2 text-neutral-400">
          <span className="font-medium text-red-600 dark:text-red-400">गैजेट ग्लो</span> पर विज्ञापन देने के लिए संपर्क करें: ads@gadgetglow.com
        </div>
      </div>
    );
  }

  return (
    <div id={`ad-${ad.id}`} className={`my-4 text-center overflow-hidden rounded-lg ${className}`}>
      <div className="text-[9px] tracking-widest uppercase font-semibold text-neutral-400 mb-1 text-left px-1">
        विज्ञापन (SPONSORED)
      </div>
      {ad.type === 'image' && ad.imageUrl ? (
        <a
          href={ad.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block group overflow-hidden rounded border border-neutral-200 dark:border-neutral-700"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full max-h-36 object-cover object-center group-hover:opacity-95 transition-opacity"
          />
        </a>
      ) : ad.htmlCode ? (
        <div
          className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded p-2 bg-white"
          dangerouslySetInnerHTML={{ __html: ad.htmlCode }}
        />
      ) : null}
    </div>
  );
};
