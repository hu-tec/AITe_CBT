const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findUnique({ where: { email: "test" } });
  console.log("User:", user.name, user.email);

  const exam = await prisma.exam.findFirst({
    where: { isPublished: true },
    include: {
      items: { include: { question: true }, orderBy: { order: "asc" } },
    },
  });
  console.log("Exam:", exam.title, "-", exam.items.length, "questions");

  const attempt = await prisma.attempt.create({
    data: { userId: user.id, examId: exam.id },
  });
  console.log("Attempt:", attempt.id);

  // Submit answers (70% correct, 30% wrong)
  for (const item of exam.items) {
    const q = item.question;
    let answer = "";

    if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
      const options = q.options;
      if (Math.random() > 0.3) {
        const correct = options.find((o) => o.isCorrect);
        answer = correct ? correct.label : "A";
      } else {
        const wrong = options.find((o) => !o.isCorrect);
        answer = wrong ? wrong.label : "A";
      }
    } else if (q.type === "MULTIPLE_SELECT") {
      const options = q.options;
      if (Math.random() > 0.3) {
        answer = options
          .filter((o) => o.isCorrect)
          .map((o) => o.label)
          .join(",");
      } else {
        answer = "A";
      }
    } else if (q.type === "SHORT_ANSWER") {
      answer = Math.random() > 0.3 ? q.answer || "" : "wrong";
    }

    await prisma.response.create({
      data: { attemptId: attempt.id, questionId: q.id, answer },
    });
  }
  console.log("Answers submitted");

  // Grade
  const responses = await prisma.response.findMany({
    where: { attemptId: attempt.id },
    include: { question: { include: { category: true } } },
  });

  let totalScore = 0;
  let totalPoints = 0;
  const catScores = {};

  for (const r of responses) {
    const q = r.question;
    totalPoints += q.points;
    const cat = q.category.name;
    if (!catScores[cat]) catScores[cat] = { correct: 0, total: 0 };
    catScores[cat].total++;

    let isCorrect = false;
    if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
      const correct = q.options.find((o) => o.isCorrect);
      isCorrect = r.answer === (correct ? correct.label : "");
    } else if (q.type === "MULTIPLE_SELECT") {
      const cl = q.options
        .filter((o) => o.isCorrect)
        .map((o) => o.label)
        .sort()
        .join(",");
      isCorrect = r.answer.split(",").sort().join(",") === cl;
    } else if (q.type === "SHORT_ANSWER") {
      isCorrect =
        r.answer.trim().toLowerCase() === (q.answer || "").trim().toLowerCase();
    }

    const earned = isCorrect ? q.points : 0;
    totalScore += earned;
    if (isCorrect) catScores[cat].correct++;

    await prisma.response.update({
      where: { id: r.id },
      data: { isCorrect, earnedPoints: earned },
    });

    if (!isCorrect) {
      await prisma.studyRecord.upsert({
        where: {
          userId_questionId: { userId: user.id, questionId: q.id },
        },
        update: {},
        create: { userId: user.id, questionId: q.id },
      });
    }
  }

  const pct = Math.round((totalScore / totalPoints) * 100);
  const passed = pct >= exam.passingScore;

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      score: totalScore,
      totalPoints,
      passed,
      status: "GRADED",
      submittedAt: new Date(),
    },
  });

  console.log("\n=== RESULT ===");
  console.log("Score:", totalScore + "/" + totalPoints, "(" + pct + "%)");
  console.log("Passed:", passed ? "PASS" : "FAIL", "(min:", exam.passingScore + ")");
  console.log("\nCategory breakdown:");
  for (const [cat, s] of Object.entries(catScores)) {
    console.log(
      " ",
      cat + ":",
      s.correct + "/" + s.total,
      "(" + Math.round((s.correct / s.total) * 100) + "%)"
    );
  }

  // Send to work_studio
  try {
    const res = await fetch("http://localhost:3000/api/cbt_results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        examTitle: exam.title,
        score: totalScore,
        totalPoints,
        percentage: pct,
        passed,
        submittedAt: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    console.log("\nwork_studio sent:", JSON.stringify(data));
  } catch (e) {
    console.log("\nwork_studio send failed:", e.message);
  }

  // Verify in work_studio
  try {
    const res2 = await fetch("http://localhost:3000/api/cbt_results");
    const results = await res2.json();
    console.log("work_studio cbt_results count:", results.length);
  } catch (e) {
    console.log("work_studio verify failed:", e.message);
  }

  await prisma.$disconnect();
})();
