"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Word } from "@/types";
import Link from "next/link";
import {
  ArrowLeft,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function RandomPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setFlipped(false);
      setCurrent(0);

      let query = supabase.from("words").select("*");
      if (selectedDay !== "all") {
        query = query.eq("day", selectedDay);
      }

      const { data, error } = await query;
      if (!error && data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setWords(shuffled);
      }
      setLoading(false);
    };

    fetchWords();
  }, [selectedDay]);

  const shuffle = () => {
    setWords((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0);
    setFlipped(false);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrent((p) => (p === 0 ? words.length - 1 : p - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrent((p) => (p === words.length - 1 ? 0 : p + 1));
  };

  const word = words[current];

  const posColor: Record<string, { bg: string; text: string }> = {
    동사: { bg: "#EEEDFE", text: "#534AB7" },
    명사: { bg: "#E6F1FB", text: "#185FA5" },
    형용사: { bg: "#E1F5EE", text: "#0F6E56" },
    부사: { bg: "#FAEEDA", text: "#854F0B" },
    숙어: { bg: "#FAECE7", text: "#993C1D" },
    전치사: { bg: "#FBEAF0", text: "#993556" },
  };

  const getPos = (pos: string) => {
    const key = Object.keys(posColor).find((k) => pos.startsWith(k));
    return key ? posColor[key] : { bg: "#F1EFE8", text: "#5F5E5A" };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          borderBottom: "0.5px solid #e2e8f0",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ color: "#94a3b8", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <h1
            style={{
              fontSize: 16,
              fontWeight: 500,
              margin: 0,
              color: "#0f172a",
            }}
          >
            랜덤 단어
          </h1>
        </div>
        <button
          onClick={shuffle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#eff6ff",
            border: "0.5px solid #bfdbfe",
            borderRadius: 20,
            padding: "6px 14px",
            color: "#3b82f6",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <Shuffle size={14} />
          셔플
        </button>
      </div>

      {/* Day 필터 */}
      <div
        style={{
          overflowX: "auto",
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderBottom: "0.5px solid #e2e8f0",
          scrollbarWidth: "none",
        }}
      >
        <button
          onClick={() => setSelectedDay("all")}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 20,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: selectedDay === "all" ? 500 : 400,
            backgroundColor: selectedDay === "all" ? "#3b82f6" : "#f1f5f9",
            color: selectedDay === "all" ? "#fff" : "#64748b",
            transition: "all 0.15s",
          }}
        >
          전체
        </button>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: selectedDay === day ? 500 : 400,
              backgroundColor: selectedDay === day ? "#3b82f6" : "#f1f5f9",
              color: selectedDay === day ? "#fff" : "#64748b",
              transition: "all 0.15s",
            }}
          >
            Day {day}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#cbd5e1" }}
        >
          불러오는 중...
        </div>
      ) : (
        <div style={{ padding: "24px 16px 40px" }}>
          {/* 진행 표시 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {current + 1} / {words.length}
            </span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              Day {word?.day}
            </span>
          </div>

          {/* 진행률 바 */}
          <div
            style={{
              backgroundColor: "#f1f5f9",
              borderRadius: 4,
              height: 6,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 4,
                backgroundColor: "#3b82f6",
                width: `${((current + 1) / words.length) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </div>

          {/* 카드 */}
          {word && (
            <div
              onClick={() => setFlipped((f) => !f)}
              style={{
                backgroundColor: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: 24,
                padding: "52px 28px",
                textAlign: "center",
                cursor: "pointer",
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.2s",
              }}
            >
              {!flipped ? (
                <>
                  {word.part_of_speech && (
                    <span
                      style={{
                        fontSize: 11,
                        backgroundColor: getPos(word.part_of_speech).bg,
                        color: getPos(word.part_of_speech).text,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontWeight: 500,
                      }}
                    >
                      {word.part_of_speech.split("/")[0]}
                    </span>
                  )}
                  <p
                    style={{
                      fontSize: 38,
                      fontWeight: 500,
                      margin: 0,
                      color: "#0f172a",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {word.word}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#cbd5e1",
                      marginTop: 4,
                    }}
                  >
                    <Eye size={15} />
                    <span style={{ fontSize: 13 }}>탭하여 뜻 보기</span>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                    {word.word}
                  </p>
                  <p
                    style={{
                      fontSize: 24,
                      fontWeight: 500,
                      margin: 0,
                      color: "#0f172a",
                      lineHeight: 1.6,
                    }}
                  >
                    {word.meaning}
                  </p>
                  {word.example && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#94a3b8",
                        margin: "4px 0 0",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                      }}
                    >
                      {word.example}
                    </p>
                  )}
                  {word.part_of_speech && (
                    <span
                      style={{
                        fontSize: 11,
                        backgroundColor: getPos(word.part_of_speech).bg,
                        color: getPos(word.part_of_speech).text,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontWeight: 500,
                        marginTop: 4,
                      }}
                    >
                      {word.part_of_speech.split("/")[0]}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* 이전 / 다음 버튼 */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 24,
            }}
          >
            <button
              onClick={handlePrev}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: 14,
                padding: "14px",
                color: "#64748b",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <ChevronLeft size={18} />
              이전
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#3b82f6",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              다음
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 카드 힌트 */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#cbd5e1",
              marginTop: 20,
            }}
          >
            카드를 탭하면 뜻이 보입니다
          </p>
        </div>
      )}
    </div>
  );
}
