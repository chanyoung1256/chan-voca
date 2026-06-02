"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Word } from "@/types";
import Link from "next/link";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";

type Status = "idle" | "correct" | "wrong";

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

  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, " ");

  const handleSubmit = () => {
    if (!input.trim() || status !== "idle") return;
    const word = words[current];

    const isCorrect =
      normalize(input) === normalize(word.meaning) ||
      word.meaning
        .split(";")
        .some((m) => normalize(input) === normalize(m.trim())) ||
      word.meaning
        .split(",")
        .some((m) => normalize(input) === normalize(m.trim()));

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
      ? "#1d9e75"
      : status === "wrong"
        ? "#e24b4a"
        : "#2d3f55";

  if (finished) {
    const total = score.correct + score.wrong;
    const rate = Math.round((score.correct / total) * 100);
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#f1f5f9",
          padding: "40px 16px",
        }}
      >
        <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 40, margin: "0 0 8px" }}>
            {rate >= 80 ? "🎉" : rate >= 50 ? "💪" : "📚"}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>
            테스트 완료!
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
            Day {selectedDay} 결과
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
              { label: "정답", value: score.correct, color: "#1d9e75" },
              { label: "오답", value: score.wrong, color: "#e24b4a" },
              { label: "정답률", value: rate + "%", color: "#378add" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  backgroundColor: "#1e293b",
                  border: "0.5px solid #2d3f55",
                  borderRadius: 12,
                  padding: "16px 8px",
                }}
              >
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: s.color,
                    margin: 0,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {wrongWords.length > 0 && (
            <div style={{ marginBottom: 32, textAlign: "left" }}>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                틀린 단어
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {wrongWords.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      backgroundColor: "#1e293b",
                      border: "0.5px solid #e24b4a40",
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {w.word}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
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
                  backgroundColor: "#e24b4a20",
                  border: "0.5px solid #e24b4a60",
                  borderRadius: 12,
                  color: "#e24b4a",
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
                backgroundColor: "#378add",
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
                backgroundColor: "#1e293b",
                border: "0.5px solid #2d3f55",
                borderRadius: 12,
                color: "#94a3b8",
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
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
      }}
    >
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
        <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>테스트</h1>
        <div
          style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 13 }}
        >
          <span style={{ color: "#1d9e75" }}>✓ {score.correct}</span>
          <span style={{ color: "#e24b4a" }}>✗ {score.wrong}</span>
        </div>
      </div>

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#475569" }}>
              {current + 1} / {words.length}
            </span>
            <span style={{ fontSize: 12, color: "#475569" }}>
              Day {selectedDay}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: 4,
              height: 4,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                height: 4,
                borderRadius: 4,
                backgroundColor: "#378add",
                width: `${progress}%`,
                transition: "width 0.3s",
              }}
            />
          </div>

          {word && (
            <div
              style={{
                backgroundColor: "#1e293b",
                border: `0.5px solid ${borderColor}`,
                borderRadius: 20,
                padding: "40px 24px",
                textAlign: "center",
                marginBottom: 24,
                transition: "border-color 0.2s",
              }}
            >
              <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px" }}>
                이 단어의 뜻은?
              </p>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 500,
                  margin: 0,
                  color: "#f1f5f9",
                }}
              >
                {word.word}
              </p>
              {word.part_of_speech && (
                <p
                  style={{ fontSize: 12, color: "#475569", margin: "8px 0 0" }}
                >
                  {word.part_of_speech}
                </p>
              )}

              {status !== "idle" && (
                <div
                  style={{
                    marginTop: 20,
                    padding: "12px 16px",
                    backgroundColor:
                      status === "correct" ? "#1d9e7520" : "#e24b4a20",
                    borderRadius: 10,
                  }}
                >
                  {status === "correct" ? (
                    <p
                      style={{
                        color: "#1d9e75",
                        fontSize: 14,
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Check size={16} /> 정답!
                    </p>
                  ) : (
                    <div>
                      <p
                        style={{
                          color: "#e24b4a",
                          fontSize: 14,
                          margin: "0 0 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <X size={16} /> 오답
                      </p>
                      <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                        정답: {word.meaning}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            placeholder="한글로 뜻을 입력하세요"
            disabled={status !== "idle"}
            style={{
              width: "100%",
              backgroundColor: "#1e293b",
              border: `0.5px solid ${borderColor}`,
              borderRadius: 12,
              padding: "14px 16px",
              color: "#f1f5f9",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              marginBottom: 12,
            }}
          />

          {status === "idle" ? (
            <button
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#378add",
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
                backgroundColor: "#1e293b",
                border: "0.5px solid #2d3f55",
                borderRadius: 12,
                color: "#f1f5f9",
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
