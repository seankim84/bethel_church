"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Image = { id: number; url: string; order: number };

export function NoticeImageGallery({ images, title }: { images: Image[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const open = (idx: number) => setActiveIdx(idx);
  const close = () => setActiveIdx(null);
  const prev = () => setActiveIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setActiveIdx((i) => (i !== null ? (i + 1) % images.length : null));

  useEffect(() => {
    if (activeIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx]);

  return (
    <>
      {/* 썸네일 그리드 */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => open(idx)}
            className="group relative overflow-hidden rounded-lg focus:outline-none"
          >
            <img
              src={img.url}
              alt={`${title} 이미지 ${idx + 1}`}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
              <span className="scale-90 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                확대보기
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 라이트박스 */}
      {activeIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          {/* 닫기 */}
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 이전 */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* 이미지 */}
          <img
            src={images[activeIdx].url}
            alt={`${title} 이미지 ${activeIdx + 1}`}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 다음 */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* 인디케이터 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIdx ? "w-5 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
