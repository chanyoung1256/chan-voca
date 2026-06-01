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
    fetchWords();
  }, [selectedDay]);

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
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#0f172a",
          borderBottom: "0.5px solid #1e293b",
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
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>
            랜덤 단어
          </h1>
        </div>
        <button
          onClick={fetchWords}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#1e293b",
            border: "0.5px solid #2d3f55",
            borderRadius: 20,
            padding: "6px 12px",
            color: "#94a3b8",
            fontSize: 13,
            cursor: "pointer",
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
          borderBottom: "0.5px solid #1e293b",
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
            backgroundColor: selectedDay === "all" ? "#378add" : "#1e293b",
            color: selectedDay === "all" ? "#fff" : "#94a3b8",
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
              backgroundColor: selectedDay === day ? "#378add" : "#1e293b",
              color: selectedDay === day ? "#fff" : "#94a3b8",
            }}
          >
            Day {day}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}
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
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 13, color: "#475569" }}>
              {current + 1} / {words.length}
            </span>
            <div
              style={{
                flex: 1,
                margin: "0 12px",
                backgroundColor: "#1e293b",
                borderRadius: 4,
                height: 4,
              }}
            >
              <div
                style={{
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: "#378add",
                  width: `${((current + 1) / words.length) * 100}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ fontSize: 13, color: "#475569" }}>
              Day {word?.day}
            </span>
          </div>

          {/* 카드 */}
          {word && (
            <div
              onClick={() => setFlipped((f) => !f)}
              style={{
                backgroundColor: "#1e293b",
                border: "0.5px solid #2d3f55",
                borderRadius: 20,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                transition: "background-color 0.15s",
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
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {word.part_of_speech.split("/")[0]}
                    </span>
                  )}
                  <p
                    style={{
                      fontSize: 32,
                      fontWeight: 500,
                      margin: 0,
                      color: "#f1f5f9",
                    }}
                  >
                    {word.word}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#475569",
                      marginTop: 8,
                    }}
                  >
                    <Eye size={14} />
                    <span style={{ fontSize: 13 }}>탭하여 뜻 보기</span>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
                    {word.word}
                  </p>
                  <p
                    style={{
                      fontSize: 24,
                      fontWeight: 500,
                      margin: 0,
                      color: "#f1f5f9",
                      lineHeight: 1.5,
                    }}
                  >
                    {word.meaning}
                  </p>
                  {word.example && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        margin: "8px 0 0",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                      }}
                    >
                      {word.example}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* 이전 / 다음 버튼 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 24,
              gap: 12,
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
                backgroundColor: "#1e293b",
                border: "0.5px solid #2d3f55",
                borderRadius: 12,
                padding: "14px",
                color: "#94a3b8",
                fontSize: 14,
                cursor: "pointer",
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
                backgroundColor: "#378add",
                border: "none",
                borderRadius: 12,
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
        </div>
      )}
    </div>
  );
}
