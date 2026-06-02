"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { Word } from "@/types";
import { BookOpen, PenLine, Shuffle } from "lucide-react";

export default function HomePage() {
  const [totalWords, setTotalWords] = useState(0);
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [todayWords, setTodayWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const deviceId = getDeviceId();

      // 전체 단어 수
      const { count: total } = await supabase
        .from("words")
        .select("*", { count: "exact", head: true });

      // 암기 완료 수
      const { count: memorized } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("device_id", deviceId)
        .eq("is_memorized", true);

      // 오늘의 단어 5개 랜덤
      const { data: allWords } = await supabase.from("words").select("*");

      if (allWords) {
        const shuffled = [...allWords]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        setTodayWords(shuffled);
      }

      setTotalWords(total ?? 0);
      setMemorizedCount(memorized ?? 0);
      setLoading(false);
    };

    fetchData();
  }, []);

  const progress =
    totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0;

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
      {/* 히어로 섹션 */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          padding: "56px 20px 32px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: 20,
            marginBottom: 12,
            letterSpacing: "0.05em",
          }}
        >
          TOEIC Vocabulary
        </span>
        <h1
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.35,
            margin: "0 0 6px",
          }}
        >
          오늘도 단어
          <br />
          암기했나요?
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            margin: "0 0 24px",
          }}
        >
          꾸준함이 점수를 만듭니다
        </p>

        {/* 통계 */}
        {loading ? (
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            불러오는 중...
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                { num: totalWords.toLocaleString(), label: "전체 단어" },
                { num: memorizedCount.toLocaleString(), label: "암기 완료" },
                { num: progress + "%", label: "진행률" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    padding: "12px 8px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {s.num}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      margin: "4px 0 0",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* 진행률 바 */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                height: 6,
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  height: 6,
                  borderRadius: 8,
                  width: `${progress}%`,
                  transition: "width 0.5s",
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* 메뉴 */}
      <div style={{ padding: "24px 16px 0" }}>
        <p
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontWeight: 500,
            marginBottom: 12,
            letterSpacing: "0.04em",
          }}
        >
          메뉴
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 12,
          }}
        >
          <Link
            href="/vocab"
            style={{
              backgroundColor: "#fff",
              border: "0.5px solid #e2e8f0",
              borderRadius: 16,
              padding: "18px 16px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                backgroundColor: "#eff6ff",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <BookOpen size={18} color="#3b82f6" />
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#0f172a",
                margin: "0 0 4px",
              }}
            >
              단어장
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              전체 단어 목록 및 암기 관리
            </p>
          </Link>

          <Link
            href="/test"
            style={{
              backgroundColor: "#fff",
              border: "0.5px solid #e2e8f0",
              borderRadius: 16,
              padding: "18px 16px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                backgroundColor: "#f5f3ff",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <PenLine size={18} color="#7c3aed" />
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#0f172a",
                margin: "0 0 4px",
              }}
            >
              테스트
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              직접 타이핑으로 실력 확인
            </p>
          </Link>

          <Link
            href="/random"
            style={{
              gridColumn: "span 2",
              backgroundColor: "#fff",
              border: "0.5px solid #e2e8f0",
              borderRadius: 16,
              padding: "18px 16px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                backgroundColor: "#f0fdf4",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shuffle size={18} color="#16a34a" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#0f172a",
                  margin: "0 0 4px",
                }}
              >
                랜덤 단어
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                무작위로 단어 카드를 넘기며 빠르게 복습
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 오늘의 단어 */}
      <div style={{ padding: "24px 16px 40px" }}>
        <p
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontWeight: 500,
            marginBottom: 12,
            letterSpacing: "0.04em",
          }}
        >
          오늘의 단어
        </p>

        {loading ? (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#cbd5e1" }}
          >
            불러오는 중...
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#fff",
              border: "0.5px solid #e2e8f0",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {todayWords.map((word, i) => {
              const posStyle = getPos(word.part_of_speech ?? "");
              return (
                <div
                  key={word.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderTop: i === 0 ? "none" : "0.5px solid #f1f5f9",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {word.word}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        margin: "3px 0 0",
                      }}
                    >
                      {word.meaning}
                    </p>
                  </div>
                  {word.part_of_speech && (
                    <span
                      style={{
                        fontSize: 11,
                        backgroundColor: posStyle.bg,
                        color: posStyle.text,
                        padding: "3px 10px",
                        borderRadius: 20,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {word.part_of_speech.split("/")[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
