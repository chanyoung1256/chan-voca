"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDB() {
  const [status, setStatus] = useState("확인 중...");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("day", 1)
        .limit(3);

      if (error) {
        setStatus("❌ 연결 실패: " + error.message);
      } else {
        setStatus("✅ 연결 성공! " + data.length + "개 단어 확인");
        setData(data);
      }
    };
    check();
  }, []);

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <h2>{status}</h2>
      <pre style={{ fontSize: 12, color: "#94a3b8" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
