'use client'

import { useState } from 'react'

type Bulletin = {
  id: number
  title: string
  bulletin_date: string
  image_url_1: string | null
  image_url_2: string | null
  worship_service: string
  church_news: string
  prayer_requests: string
  sermon_notes: string
}

function parseWorshipOrder(text: string): { label: string; value: string }[] {
  const lines = text.split('\n')
  const result: { label: string; value: string }[] = []
  for (const line of lines) {
    if (line.includes('[예배 봉사 일정]')) break
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const label = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim()
    if (label && value) result.push({ label, value })
  }
  return result
}

function parseServiceSchedule(text: string): {
  date: string; pray: string; offering: string
  bible: string; usher: string; guide: string
}[] {
  const scheduleStart = text.indexOf('[예배 봉사 일정]')
  if (scheduleStart === -1) return []
  const lines = text.slice(scheduleStart).split('\n').filter(Boolean)
  const result = []
  for (const line of lines) {
    if (line.startsWith('[')) continue
    const dateMatch = line.match(/^(\d+\.\d+)\s+/)
    if (!dateMatch) continue
    const date = dateMatch[1]
    const rest = line.slice(dateMatch[0].length)
    const parts = rest.split('/').map((s: string) => s.trim())
    const get = (key: string) => {
      const p = parts.find((s: string) => s.startsWith(key))
      return p ? p.slice(key.length).trim() : '—'
    }
    result.push({
      date,
      pray: get('기도:'),
      offering: get('헌금:'),
      bible: get('성경봉독:'),
      usher: get('오병이어:'),
      guide: get('안내:') || '—',
    })
  }
  return result
}

function parseNumberedList(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.replace(/^\d+[.\s]+/, '').trim())
    .filter(Boolean)
}

function parseSermonNote(text: string): {
  title: string; scripture: string; questions: string[]
} {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let title = ''
  let scripture = ''
  const questions: string[] = []
  for (const line of lines) {
    if (line.startsWith('말씀 제목:')) title = line.slice('말씀 제목:'.length).trim()
    else if (line.startsWith('본문:')) scripture = line.slice('본문:'.length).trim()
    else if (/^\d+\s/.test(line)) questions.push(line.replace(/^\d+\s+/, '').trim())
  }
  return { title, scripture, questions }
}

type Tab = 'worship' | 'news' | 'prayer' | 'sermon'

const TABS: { key: Tab; label: string }[] = [
  { key: 'worship', label: '예배 봉사' },
  { key: 'news', label: '교회 소식' },
  { key: 'prayer', label: '함께 나누는 기도' },
  { key: 'sermon', label: '말씀 노트' },
]

export function WeeklyBulletin({ bulletin }: { bulletin: Bulletin }) {
  const [tab, setTab] = useState<Tab>('worship')

  // bulletin_date "YYYY-MM-DD" → "M.D"
  const [, mm, dd] = bulletin.bulletin_date.split('-')
  const thisWeekKey = `${Number(mm)}.${Number(dd)}`

  const worshipOrder = parseWorshipOrder(bulletin.worship_service)
  const serviceSchedule = parseServiceSchedule(bulletin.worship_service)
  const newsList = parseNumberedList(bulletin.church_news)
  const prayerList = parseNumberedList(bulletin.prayer_requests)
  const sermon = parseSermonNote(bulletin.sermon_notes)

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container-page">
        {/* 헤더 */}
        <div className="mb-6 flex items-end justify-between md:mb-8">
          <div>
            <p className="section-title-en">WEEKLY BULLETIN</p>
            <h2 className="section-title-ko">이번주 예배 안내</h2>
          </div>
          <span className="text-sm text-slate-400">{bulletin.title}</span>
        </div>

        {/* 탭 바 */}
        <div className="flex border-b border-slate-200 mb-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors -mb-px border-b-2 ${
                tab === key
                  ? 'text-[#1a2744] border-[#1a2744]'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 1: 예배 봉사 */}
        {tab === 'worship' && (
          <div>
            {/* 이번 주 예배 순서 */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              이번 주 예배 순서
            </p>
            {worshipOrder.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-slate-100 mb-6">
                <table className="w-full">
                  <tbody>
                    {worshipOrder.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-slate-100 last:border-0 ${
                          i % 2 === 1 ? 'bg-[#f8f9fb]' : 'bg-white'
                        }`}
                      >
                        <td className="px-4 py-2.5 text-sm text-slate-400 w-2/5">{row.label}</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-[#1a2744]">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400 mb-6">데이터가 없습니다.</p>
            )}

            {/* 봉사 일정표 */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              봉사 일정표
            </p>
            {serviceSchedule.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="bg-[#1a2744]">
                      {['날짜', '기도', '헌금', '성경봉독', '오병이어', '안내'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-3 py-2.5 text-xs font-semibold text-white ${
                            i === 0 ? 'text-left' : 'text-center'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {serviceSchedule.map((row, i) => {
                      const isThisWeek = row.date === thisWeekKey
                      return (
                        <tr
                          key={i}
                          className={
                            isThisWeek
                              ? 'bg-[#eef2ff]'
                              : i % 2 === 1
                              ? 'bg-[#f8f9fb]'
                              : 'bg-white'
                          }
                        >
                          <td className="px-3 py-2.5 text-xs text-left font-semibold text-[#1a2744]">
                            {row.date}
                            {isThisWeek && (
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-[#f5c842] px-1.5 py-0.5 text-[9px] font-bold text-[#1a2744]">
                                이번주
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-600 text-center">{row.pray}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600 text-center">{row.offering}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600 text-center">{row.bible}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600 text-center">{row.usher}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600 text-center">{row.guide}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">데이터가 없습니다.</p>
            )}
          </div>
        )}

        {/* 탭 2: 교회 소식 */}
        {tab === 'news' && (
          <div>
            {newsList.length > 0 ? (
              <div className="space-y-2">
                {newsList.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-xl border border-slate-100 bg-[#f8f9fb] px-4 py-3">
                    <span className="min-w-[22px] h-[22px] rounded-full bg-[#1a2744] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">데이터가 없습니다.</p>
            )}
          </div>
        )}

        {/* 탭 3: 함께 나누는 기도 */}
        {tab === 'prayer' && (
          <div>
            {prayerList.length > 0 ? (
              <div className="space-y-2.5">
                {prayerList.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-xl bg-[#f8f9fb] px-4 py-3.5 border-l-[3px] border-[#1a2744]">
                    <span className="text-xs font-bold text-[#1a2744] min-w-[16px] mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">데이터가 없습니다.</p>
            )}
          </div>
        )}

        {/* 탭 4: 말씀 노트 */}
        {tab === 'sermon' && (
          <div>
            {(sermon.title || sermon.scripture) && (
              <div className="rounded-xl bg-[#fffbeb] border border-amber-200/60 px-5 py-4 mb-4">
                {sermon.scripture && (
                  <p className="text-xs font-semibold text-amber-600 tracking-wide mb-1">
                    {sermon.scripture}
                  </p>
                )}
                {sermon.title && (
                  <p className="text-lg font-bold text-[#1a2744]">{sermon.title}</p>
                )}
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              말씀 나눔 질문
            </p>
            {sermon.questions.length > 0 ? (
              <div className="space-y-2">
                {sermon.questions.map((q, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-xl border border-slate-100 bg-white px-4 py-3.5">
                    <span className="text-xs font-bold text-amber-600 min-w-[16px] mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">데이터가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
