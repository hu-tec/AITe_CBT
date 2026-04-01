"use client";

export function ExamTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 300; // 5분 미만

  return (
    <span
      className={`font-mono text-lg font-bold ${
        isLow ? "text-red-600" : "text-gray-700"
      }`}
    >
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}
