"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { Word } from "@/types";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";

interface Progress {
  word_id: string;
  is_memorized: boolean;
}

export default function VocabPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"all" | "review">("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const deviceId = getDeviceId();

      const { data: wordData } = await supabase
        .from("words")
        .select("*")
        .eq("day", selectedDay)
        .order("word_order", { ascending: true });

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("word_id, is_memorized")
        .eq("device_id", deviceId);

      if (wordData) setWords(wordData);

      if (progressData) {
        const map: Record<string, boolean> = {};
        progressData.forEach((p: Progress) => {
          map[p.word_id] = p.is_memorized;
        });
        setProgress(map);
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedDay]);

  const toggleMemorized = async (wordId: string) => {
    const deviceId = getDeviceId();
    const current = progress[wordId] ?? false;
    const next = !current;

    setProgress((prev) => ({ ...prev, [wordId]: next }));

    const { data: existing } = await supabase
      .from("user_progress")
      .select("id")
      .eq("device_id", deviceId)
      .eq("word_id", wordId)
      .single();

    if (existing) {
      await supabase
        .from("user_progress")
        .update({ is_memorized: next, updated_at: new Date().toISOString() })
        .eq("device_id", deviceId)
        .eq("word_id", wordId);
    } else {
      await supabase
        .from("user_progress")
        .insert({ device_id: deviceId, word_id: wordId, is_memorized: next });
    }
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

  const memorizedWords = words.filter((w) => progress[w.id] === true);
  const reviewWords = words.filter((w) => !progress[w.id]);
  const displayWords = tab === "all" ? words : reviewWords;
  const memorizedCount = memorizedWords.length;

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
          gap: 12,
        }}
      >
        <Link href="/" style={{ color: "#94a3b8", display: "flex" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1
          style={{ fontSize: 16, fontWeight: 500, margin: 0, color: "#0f172a" }}
        >
          단어장
        </h1>
        {!loading && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {memorizedCount} / {words.length} 암기
          </span>
        )}
      </div>

      {/* Day 탭 */}
      <div
        style={{
          overflowX: "auto",
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          borderBottom: "0.5px solid #e2e8f0",
          backgroundColor: "#fff",
          scrollbarWidth: "none",
        }}
      >
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => {
              setSelectedDay(day);
              setTab("all");
            }}
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

      {/* 진행률 바 */}
      {!loading && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "12px 16px",
            borderBottom: "0.5px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Day {selectedDay} 진행률
            </span>
            <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 500 }}>
              {words.length > 0
                ? Math.round((memorizedCount / words.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div
            style={{ backgroundColor: "#f1f5f9", borderRadius: 8, height: 6 }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 8,
                backgroundColor: "#3b82f6",
                width: `${words.length > 0 ? (memorizedCount / words.length) * 100 : 0}%`,
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>
      )}

      {/* all / 복습 탭 */}
      {!loading && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px",
            backgroundColor: "#fff",
            borderBottom: "0.5px solid #e2e8f0",
          }}
        >
          {(
            [
              { value: "all", label: `전체 ${words.length}` },
              { value: "review", label: `복습 필요 ${reviewWords.length}` },
            ] as { value: "all" | "review"; label: string }[]
          ).map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === t.value ? 500 : 400,
                backgroundColor: tab === t.value ? "#eff6ff" : "#f8fafc",
                color: tab === t.value ? "#3b82f6" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* 단어 목록 */}
      <div style={{ padding: "12px 16px 40px" }}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#cbd5e1" }}
          >
            불러오는 중...
          </div>
        ) : displayWords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>🎉</p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#0f172a",
                margin: "0 0 6px",
              }}
            >
              Day {selectedDay} 모두 암기 완료!
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              다음 Day로 넘어가볼까요?
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayWords.map((word, idx) => {
              const isOpen = openId === word.id;
              const isMemorized = progress[word.id] ?? false;
              const posStyle = getPos(word.part_of_speech ?? "");
              return (
                <div
                  key={word.id}
                  style={{
                    backgroundColor: isMemorized ? "#f0fdf4" : "#fff",
                    border: `0.5px solid ${isMemorized ? "#bbf7d0" : "#e2e8f0"}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {/* 암기 체크 버튼 */}
                    <button
                      onClick={() => toggleMemorized(word.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isMemorized ? "#22c55e" : "#f1f5f9",
                        transition: "all 0.2s",
                      }}
                    >
                      <Check
                        size={14}
                        color={isMemorized ? "#fff" : "#cbd5e1"}
                      />
                    </button>

                    {/* 단어 클릭 영역 */}
                    <div
                      onClick={() => setOpenId(isOpen ? null : word.id)}
                      style={{ flex: 1, cursor: "pointer" }}
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
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#cbd5e1",
                              minWidth: 18,
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
                                color: isMemorized ? "#15803d" : "#0f172a",
                                textDecoration: isMemorized
                                  ? "line-through"
                                  : "none",
                                opacity: isMemorized ? 0.7 : 1,
                              }}
                            >
                              {word.word}
                            </p>
                            {!isOpen && (
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#94a3b8",
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
                            color="#cbd5e1"
                            style={{
                              transform: isOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </div>
                      </div>

                      {isOpen && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "0.5px solid #f1f5f9",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 14,
                              color: "#334155",
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
                                color: "#94a3b8",
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
