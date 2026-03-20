import Link from "next/link";

type Sermon = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

export function SermonGrid({ sermons }: { sermons: Sermon[] }) {
  const main = sermons[0];
  const side = sermons.slice(1, 5);

  if (!main) {
    return <p className="text-sm text-slate-500">표시할 설교 영상이 없습니다.</p>;
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      {/* 대표 영상 */}
      <Link
        href={`https://www.youtube.com/watch?v=${main.id}`}
        target="_blank"
        className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative">
          <img
            src={main.thumbnail}
            alt={main.title}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
            <p className="line-clamp-2 text-base font-semibold leading-snug text-white md:text-xl">
              {main.title}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-slate-600">{formatDate(main.publishedAt)}</span>
          <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white">
            최신 설교
          </span>
        </div>
      </Link>

      {/* 사이드 영상 목록 */}
      <div className="grid grid-cols-2 gap-3">
        {side.map((s) => (
          <Link
            key={s.id}
            href={`https://www.youtube.com/watch?v=${s.id}`}
            target="_blank"
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <img
              src={s.thumbnail}
              alt={s.title}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="flex flex-col gap-1 px-3 py-2">
              <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 sm:text-sm">
                {s.title}
              </p>
              <p className="text-xs text-slate-400">{formatDate(s.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
