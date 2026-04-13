import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type DetailImage = {
  id?: number | string;
  url: string;
};

type PostDetailViewProps = {
  backHref: string;
  backLabel: string;
  sectionLabel: string;
  category?: string;
  title: string;
  createdAt: string;
  contentHtml: string;
  images: DetailImage[];
  isPinned?: boolean;
};

export function PostDetailView({
  backHref,
  backLabel,
  sectionLabel,
  category,
  title,
  createdAt,
  contentHtml,
  images,
  isPinned = false,
}: PostDetailViewProps) {
  const mainImage = images[0];
  const restImages = images.slice(1);

  return (
    <div className="container-page section-space">
      <Link
        href={backHref}
        className="mb-5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-navy"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-6 md:px-8 md:py-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
              {sectionLabel}
            </span>
            {isPinned && (
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                공지
              </span>
            )}
            {category && (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {category}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-snug text-slate-900 md:text-3xl">{title}</h1>
          <p className="mt-2 text-xs text-slate-400 md:text-sm">
            {new Date(createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="px-5 py-6 md:px-8 md:py-8">
          {mainImage && (
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
              <img src={mainImage.url} alt={title} className="w-full object-cover" />
            </div>
          )}
          {restImages.length > 0 && (
            <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
              {restImages.map((img, idx) => (
                <div key={img.id ?? `${img.url}-${idx}`} className="overflow-hidden rounded-lg border border-slate-200">
                  <img src={img.url} alt={`${title} 이미지 ${idx + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml || "<p></p>" }}
          />
        </div>
      </article>
    </div>
  );
}
