"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Word } from "@/types";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

export default function VocabPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchWords(selectedDay);
  }, [selectedDay]);

  const fetchWords = async (day: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("day", day)
      .order("word_order", { ascending: true });

    if (!error && data) setWords(data);
    setLoading(false);
  };

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
          gap: 12,
        }}
      >
        <Link href="/" style={{ color: "#94a3b8", display: "flex" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>단어장</h1>
      </div>

      {/* Day 선택 탭 */}
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
              transition: "all 0.15s",
            }}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* 단어 목록 */}
      <div style={{ padding: "12px 16px 40px" }}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}
          >
            불러오는 중...
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>
              총 {words.length}개 단어
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {words.map((word, idx) => {
                const isOpen = openId === word.id;
                const posStyle = getPos(word.part_of_speech ?? "");
                return (
                  <div
                    key={word.id}
                    onClick={() => setOpenId(isOpen ? null : word.id)}
                    style={{
                      backgroundColor: "#1e293b",
                      border: "0.5px solid #2d3f55",
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            minWidth: 20,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 500,
                              margin: 0,
                              color: "#f1f5f9",
                            }}
                          >
                            {word.word}
                          </p>
                          {!isOpen && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                margin: "2px 0 0",
                              }}
                            >
                              {word.meaning}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {word.part_of_speech && (
                          <span
                            style={{
                              fontSize: 11,
                              backgroundColor: posStyle.bg,
                              color: posStyle.text,
                              padding: "2px 8px",
                              borderRadius: 20,
                            }}
                          >
                            {word.part_of_speech.split("/")[0]}
                          </span>
                        )}
                        <ChevronDown
                          size={16}
                          color="#475569"
                          style={{
                            transform: isOpen
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        />
                      </div>
                    </div>

                    {/* 펼쳐지는 뜻 영역 */}
                    {isOpen && (
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "0.5px solid #2d3f55",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            color: "#cbd5e1",
                            margin: 0,
                            lineHeight: 1.6,
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
                              lineHeight: 1.6,
                              fontStyle: "italic",
                            }}
                          >
                            {word.example}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
