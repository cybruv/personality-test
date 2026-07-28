"use client";

import { useEffect } from "react";
import TestFlow from "./components/TestFlow";

interface ResultData {
  id: string;
}

export default function TestApp() {
  async function onFinish(answers: number[]) {
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (typeof window !== "undefined") {
        localStorage.setItem("test_session_id", json.id);
      }
      // Always route to the paywalled results page.
      // The 4-letter type is hidden until payment.
      window.location.href = `/results?session=${json.id}`;
    } catch (e: any) {
      alert("Scoring failed — " + (e?.message || "please try again."));
    }
  }

  return <TestFlow onStart={onFinish} />;
}
