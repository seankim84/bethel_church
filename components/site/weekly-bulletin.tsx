type Bulletin = {
  id: number;
  title: string;
  bulletin_date: string;
  image_url_1: string | null;
  image_url_2: string | null;
  worship_service: string;
  church_news: string;
  prayer_requests: string;
  sermon_notes: string;
};

export function WeeklyBulletin({ bulletin }: { bulletin: Bulletin }) {
  return (
    <section className="section-space bg-white">
      <div className="container-page">
        <div className="mb-6 flex items-end justify-between md:mb-8">
          <div>
            <p className="section-title-en">WEEKLY BULLETIN</p>
            <h2 className="section-title-ko">이번주 예배 안내</h2>
          </div>
          <span className="text-sm text-slate-400">{bulletin.title}</span>
        </div>

        <div className="space-y-4">
          {/* 예배 봉사 / 교회 소식 */}
          <div className="grid gap-4 md:grid-cols-2">
            {bulletin.worship_service && (
              <div className="rounded-xl border border-slate-100 bg-[#f8f9fb] p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1a2744]">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1a2744] text-[10px] font-bold text-white">봉</span>
                  예배 봉사
                </h3>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {bulletin.worship_service}
                </pre>
              </div>
            )}
            {bulletin.church_news && (
              <div className="rounded-xl border border-slate-100 bg-[#f8f9fb] p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1a2744]">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1a2744] text-[10px] font-bold text-white">소</span>
                  교회 소식
                </h3>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {bulletin.church_news}
                </pre>
              </div>
            )}
          </div>

          {/* 함께 나누는 기도 */}
          {bulletin.prayer_requests && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">기</span>
                함께 나누는 기도
              </h3>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-blue-700">
                {bulletin.prayer_requests}
              </pre>
            </div>
          )}

          {/* 주일말씀 노트 */}
          {bulletin.sermon_notes && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">말</span>
                주일말씀 노트
              </h3>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-amber-800">
                {bulletin.sermon_notes}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
