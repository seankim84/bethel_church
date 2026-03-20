"use client";

import { useEffect, useState } from "react";

type Banner = {
  id: number;
  image_url: string;
};

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <section className="relative h-[42vh] min-h-[275px] w-full overflow-hidden bg-black">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {/* blurred background for letterbox areas */}
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center blur-xl brightness-50"
            style={{ backgroundImage: `url(${b.image_url})` }}
          />
          <img
            src={b.image_url}
            alt="배너"
            className="relative h-full w-full object-contain object-center"
          />
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
