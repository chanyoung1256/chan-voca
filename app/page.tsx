import Link from "next/link";
import { BookOpen, PenLine, Shuffle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 히어로 섹션 */}
      <div className="px-5 pt-14 pb-8">
        <span className="inline-block text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full mb-4">
          TOEIC Vocabulary
        </span>
        <h1 className="text-2xl font-medium leading-tight mb-2">
          오늘도 10개
          <br />
          단어 암기했나요?
        </h1>
        <p className="text-slate-400 text-sm mb-6">꾸준함이 점수를 만듭니다</p>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { num: "240", label: "전체 단어" },
            { num: "92", label: "암기 완료" },
            { num: "38%", label: "진행률" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.07] rounded-xl p-3 text-center"
            >
              <p className="text-xl font-medium">{s.num}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="bg-green-500 h-1.5 rounded-full w-[38%]" />
        </div>
      </div>

      {/* 메인 메뉴 */}
      <div className="px-5 mb-6">
        <p className="text-xs text-slate-500 font-medium mb-3 tracking-wide">
          메뉴
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/vocab"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:bg-slate-800 transition-colors"
          >
            <div className="w-9 h-9 bg-blue-500/15 text-blue-400 rounded-xl flex items-center justify-center mb-3">
              <BookOpen size={18} />
            </div>
            <p className="font-medium text-sm mb-1">단어장</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              전체 단어 목록 및 암기 관리
            </p>
          </Link>

          <Link
            href="/test"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:bg-slate-800 transition-colors"
          >
            <div className="w-9 h-9 bg-purple-500/15 text-purple-400 rounded-xl flex items-center justify-center mb-3">
              <PenLine size={18} />
            </div>
            <p className="font-medium text-sm mb-1">테스트</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              직접 타이핑으로 실력 확인
            </p>
          </Link>

          <Link
            href="/random"
            className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:bg-slate-800 transition-colors flex items-center gap-4"
          >
            <div className="w-9 h-9 bg-teal-500/15 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
              <Shuffle size={18} />
            </div>
            <div>
              <p className="font-medium text-sm mb-1">랜덤 단어</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                무작위로 단어 카드를 넘기며 빠르게 복습
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 오늘의 단어 */}
      <div className="px-5 pb-10">
        <p className="text-xs text-slate-500 font-medium mb-3 tracking-wide">
          오늘의 단어
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {[
            { en: "abundant", ko: "풍부한, 많은", pos: "형용사" },
            { en: "negotiate", ko: "협상하다", pos: "동사" },
            { en: "efficient", ko: "효율적인", pos: "형용사" },
          ].map((w) => (
            <div
              key={w.en}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{w.en}</p>
                <p className="text-xs text-slate-400 mt-0.5">{w.ko}</p>
              </div>
              <span className="text-xs bg-purple-500/15 text-purple-400 px-2.5 py-1 rounded-full">
                {w.pos}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
