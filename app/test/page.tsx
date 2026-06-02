"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Word } from "@/types";
import Link from "next/link";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";

type Status = "idle" | "correct" | "wrong";
type Mode = "en-to-ko" | "ko-to-en";

export default function TestPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<Mode>("en-to-ko");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setInput("");
      setStatus("idle");
      setCurrent(0);
      setScore({ correct: 0, wrong: 0 });
      setFinished(false);
      setWrongWords([]);

      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("day", selectedDay)
        .order("word_order", { ascending: true });

      if (!error && data) setWords(data);
      setLoading(false);
    };

    fetchWords();
  }, [selectedDay]);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, current]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInput("");
    setStatus("idle");
    setCurrent(0);
    setScore({ correct: 0, wrong: 0 });
    setFinished(false);
    setWrongWords([]);
  };

  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, " ");

  const handleSubmit = () => {
    if (!input.trim() || status !== "idle") return;
    const word = words[current];

    let isCorrect = false;
    if (mode === "en-to-ko") {
      isCorrect =
        normalize(input) === normalize(word.meaning) ||
        word.meaning
          .split(";")
          .some((m) => normalize(input) === normalize(m.trim())) ||
        word.meaning
          .split(",")
          .some((m) => normalize(input) === normalize(m.trim()));
    } else {
      isCorrect = normalize(input) === normalize(word.word);
    }

    if (isCorrect) {
      setStatus("correct");
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setStatus("wrong");
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
      setWrongWords((prev) => [...prev, word]);
    }
  };

  const handleNext = () => {
    if (current + 1 >= words.length) {
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    setInput("");
    setStatus("idle");
  };

  const handleRetry = () => {
    setInput("");
    setStatus("idle");
    setCurrent(0);
    setScore({ correct: 0, wrong: 0 });
    setFinished(false);
    setWrongWords([]);
  };

  const handleRetryWrong = () => {
    setWords(wrongWords);
    setInput("");
    setStatus("idle");
    setCurrent(0);
    setScore({ correct: 0, wrong: 0 });
    setFinished(false);
    setWrongWords([]);
  };

  const word = words[current];
  const progress = words.length > 0 ? ((current + 1) / words.length) * 100 : 0;
  const borderColor =
    status === "correct"
      ? "#22c55e"
      : status === "wrong"
        ? "#ef4444"
        : "#e2e8f0";

  const questionText = mode === "en-to-ko" ? word?.word : word?.meaning;
  const answerText = mode === "en-to-ko" ? word?.meaning : word?.word;
  const placeholder =
    mode === "en-to-ko" ? "한글로 뜻을 입력하세요" : "영어 단어를 입력하세요";
  const questionLabel =
    mode === "en-to-ko" ? "이 단어의 뜻은?" : "이 뜻에 해당하는 영어 단어는?";

  if (finished) {
    const total = score.correct + score.wrong;
    const rate = Math.round((score.correct / total) * 100);
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          padding: "40px 16px",
        }}
      >
        <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 48, margin: "0 0 8px" }}>
            {rate >= 80 ? "🎉" : rate >= 50 ? "💪" : "📚"}
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 500,
              margin: "0 0 4px",
              color: "#0f172a",
            }}
          >
            테스트 완료!
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 32 }}>
            Day {selectedDay} ·{" "}
            {mode === "en-to-ko" ? "영어 → 한글" : "한글 → 영어"}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 32,
            }}
          >
            {[
              { label: "정답", value: score.correct, color: "#22c55e" },
              { label: "오답", value: score.wrong, color: "#ef4444" },
              { label: "정답률", value: rate + "%", color: "#3b82f6" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  backgroundColor: "#fff",
                  border: "0.5px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "16px 8px",
                }}
              >
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color: s.color,
                    margin: 0,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {wrongWords.length > 0 && (
            <div style={{ marginBottom: 32, textAlign: "left" }}>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
                틀린 단어
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {wrongWords.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      backgroundColor: "#fff",
                      border: "0.5px solid #fecaca",
                      borderRadius: 12,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {w.word}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        textAlign: "right",
                      }}
                    >
                      {w.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {wrongWords.length > 0 && (
              <button
                onClick={handleRetryWrong}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#fef2f2",
                  border: "0.5px solid #fecaca",
                  borderRadius: 12,
                  color: "#ef4444",
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                틀린 단어만 다시 풀기
              </button>
            )}
            <button
              onClick={handleRetry}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#3b82f6",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <RotateCcw size={16} />
              처음부터 다시
            </button>
            <Link
              href="/"
              style={{
                display: "block",
                width: "100%",
                padding: "14px",
                backgroundColor: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: 12,
                color: "#64748b",
                fontSize: 14,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          테스트
        </h1>
        <div
          style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 13 }}
        >
          <span style={{ color: "#22c55e", fontWeight: 500 }}>
            ✓ {score.correct}
          </span>
          <span style={{ color: "#ef4444", fontWeight: 500 }}>
            ✗ {score.wrong}
          </span>
        </div>
      </div>

      {/* 모드 선택 */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderBottom: "0.5px solid #e2e8f0",
        }}
      >
        {[
          { value: "en-to-ko" as Mode, label: "영어 → 한글" },
          { value: "ko-to-en" as Mode, label: "한글 → 영어" },
        ].map((m) => (
          <button
            key={m.value}
            onClick={() => handleModeChange(m.value)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: mode === m.value ? 500 : 400,
              backgroundColor: mode === m.value ? "#eff6ff" : "#f8fafc",
              color: mode === m.value ? "#3b82f6" : "#94a3b8",
              transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Day 선택 탭 */}
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
          {/* 진행률 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {current + 1} / {words.length}
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Day {selectedDay}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#f1f5f9",
              borderRadius: 4,
              height: 6,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 4,
                backgroundColor: "#3b82f6",
                width: `${progress}%`,
                transition: "width 0.3s",
              }}
            />
          </div>

          {/* 문제 카드 */}
          {word && (
            <div
              style={{
                backgroundColor: "#fff",
                border: `0.5px solid ${borderColor}`,
                borderRadius: 20,
                padding: "40px 24px",
                textAlign: "center",
                marginBottom: 24,
                transition: "border-color 0.2s",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              }}
            >
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>
                {questionLabel}
              </p>
              <p
                style={{
                  fontSize: mode === "en-to-ko" ? 36 : 20,
                  fontWeight: 500,
                  margin: 0,
                  color: "#0f172a",
                  lineHeight: 1.5,
                }}
              >
                {questionText}
              </p>
              {mode === "en-to-ko" && word.part_of_speech && (
                <p
                  style={{ fontSize: 12, color: "#cbd5e1", margin: "8px 0 0" }}
                >
                  {word.part_of_speech}
                </p>
              )}

              {status !== "idle" && (
                <div
                  style={{
                    marginTop: 20,
                    padding: "14px 16px",
                    backgroundColor:
                      status === "correct" ? "#f0fdf4" : "#fef2f2",
                    borderRadius: 12,
                  }}
                >
                  {status === "correct" ? (
                    <p
                      style={{
                        color: "#16a34a",
                        fontSize: 14,
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontWeight: 500,
                      }}
                    >
                      <Check size={16} /> 정답!
                    </p>
                  ) : (
                    <div>
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: 14,
                          margin: "0 0 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          fontWeight: 500,
                        }}
                      >
                        <X size={16} /> 오답
                      </p>
                      <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                        정답: {answerText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 입력창 */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (status === "idle") handleSubmit();
                else handleNext();
              }
            }}
            placeholder={placeholder}
            disabled={status !== "idle"}
            style={{
              width: "100%",
              backgroundColor: status !== "idle" ? "#f8fafc" : "#fff",
              border: `0.5px solid ${borderColor}`,
              borderRadius: 12,
              padding: "14px 16px",
              color: "#0f172a",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              marginBottom: 12,
            }}
          />

          {/* 버튼 */}
          {status === "idle" ? (
            <button
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#3b82f6",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              확인
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: 12,
                color: "#0f172a",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {current + 1 >= words.length ? "결과 보기" : "다음 →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
