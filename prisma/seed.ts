import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── 사용자 ──
  const adminPw = await bcrypt.hash("admin123", 12);
  const studentPw = await bcrypt.hash("student123", 12);

  await prisma.user.upsert({
    where: { email: "admin@aite.local" },
    update: {},
    create: { email: "admin@aite.local", name: "관리자", password: adminPw, role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "student@aite.local" },
    update: {},
    create: { email: "student@aite.local", name: "테스트 학생", password: studentPw, role: "STUDENT" },
  });

  // ── 카테고리 ──
  const cat1 = await prisma.category.upsert({
    where: { id: "cat-ai-basics" },
    update: {},
    create: { id: "cat-ai-basics", name: "AI 기초" },
  });
  const cat2 = await prisma.category.upsert({
    where: { id: "cat-prompt-eng" },
    update: {},
    create: { id: "cat-prompt-eng", name: "프롬프트 엔지니어링" },
  });
  const cat3 = await prisma.category.upsert({
    where: { id: "cat-data-analysis" },
    update: {},
    create: { id: "cat-data-analysis", name: "데이터 분석 기초" },
  });

  // ── AI 기초 (10문항) ──
  const aiQuestions = [
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "인공지능(AI)의 아버지로 불리는 인물은 누구인가?",
      options: [
        { label: "A", text: "앨런 튜링", isCorrect: true },
        { label: "B", text: "팀 버너스-리", isCorrect: false },
        { label: "C", text: "스티브 잡스", isCorrect: false },
        { label: "D", text: "빌 게이츠", isCorrect: false },
      ],
      explanation: "앨런 튜링은 1950년 'Computing Machinery and Intelligence' 논문에서 기계의 지능을 정의하는 튜링 테스트를 제안하였으며, AI의 선구자로 평가됩니다.",
      difficulty: 1,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "머신러닝과 딥러닝의 관계로 올바른 것은?",
      options: [
        { label: "A", text: "딥러닝은 머신러닝의 하위 분야이다", isCorrect: true },
        { label: "B", text: "머신러닝은 딥러닝의 하위 분야이다", isCorrect: false },
        { label: "C", text: "둘은 완전히 별개의 분야이다", isCorrect: false },
        { label: "D", text: "머신러닝이 딥러닝보다 최신 기술이다", isCorrect: false },
      ],
      explanation: "딥러닝은 인공신경망 기반의 머신러닝 기법으로, 머신러닝의 하위 분야에 해당합니다. AI > 머신러닝 > 딥러닝의 포함 관계를 가집니다.",
      difficulty: 1,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "지도학습(Supervised Learning)에 해당하는 것은?",
      options: [
        { label: "A", text: "K-Means 클러스터링", isCorrect: false },
        { label: "B", text: "이미지 분류 (라벨 데이터 사용)", isCorrect: true },
        { label: "C", text: "강화학습 기반 게임 AI", isCorrect: false },
        { label: "D", text: "차원 축소 (PCA)", isCorrect: false },
      ],
      explanation: "지도학습은 입력 데이터와 정답(라벨)이 쌍으로 주어진 데이터셋으로 모델을 학습시키는 방법입니다. 이미지 분류는 대표적인 지도학습 과제입니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "TRUE_FALSE" as const,
      content: "강화학습(Reinforcement Learning)은 환경과의 상호작용을 통해 보상을 최대화하도록 학습하는 방법이다.",
      options: [
        { label: "O", text: "맞다", isCorrect: true },
        { label: "X", text: "틀리다", isCorrect: false },
      ],
      answer: "O",
      explanation: "강화학습은 에이전트가 환경에서 행동을 취하고, 그 결과로 받는 보상을 최대화하는 방향으로 정책을 학습하는 방법입니다. 대표적으로 AlphaGo가 있습니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "Transformer 모델의 핵심 메커니즘은?",
      options: [
        { label: "A", text: "Self-Attention", isCorrect: true },
        { label: "B", text: "Convolution", isCorrect: false },
        { label: "C", text: "Recurrence (RNN)", isCorrect: false },
        { label: "D", text: "Pooling", isCorrect: false },
      ],
      explanation: "Transformer는 2017년 'Attention is All You Need' 논문에서 제안되었으며, Self-Attention 메커니즘을 통해 시퀀스의 모든 위치 간 관계를 동시에 처리합니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "GPT 모델의 토크나이저로 사용되는 알고리즘은?",
      options: [
        { label: "A", text: "Word2Vec", isCorrect: false },
        { label: "B", text: "BPE (Byte Pair Encoding)", isCorrect: true },
        { label: "C", text: "TF-IDF", isCorrect: false },
        { label: "D", text: "One-Hot Encoding", isCorrect: false },
      ],
      explanation: "GPT 계열 모델은 BPE(Byte Pair Encoding) 기반 토크나이저를 사용합니다. BPE는 빈도 기반으로 서브워드를 병합하여 어휘를 구성합니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "SHORT_ANSWER" as const,
      content: "딥러닝에서 과적합(Overfitting)을 방지하기 위해, 학습 중 무작위로 일부 뉴런을 비활성화하는 기법의 이름은?",
      answer: "드롭아웃",
      explanation: "드롭아웃(Dropout)은 학습 시 무작위로 뉴런을 비활성화하여 모델이 특정 뉴런에 과도하게 의존하는 것을 방지하는 정규화 기법입니다.",
      difficulty: 4,
      points: 15,
    },
    {
      type: "MULTIPLE_SELECT" as const,
      content: "다음 중 비지도학습(Unsupervised Learning) 알고리즘을 모두 고르시오.",
      options: [
        { label: "A", text: "K-Means 클러스터링", isCorrect: true },
        { label: "B", text: "선형 회귀", isCorrect: false },
        { label: "C", text: "PCA (주성분 분석)", isCorrect: true },
        { label: "D", text: "랜덤 포레스트", isCorrect: false },
      ],
      explanation: "K-Means와 PCA는 라벨 없이 데이터의 구조를 파악하는 비지도학습 알고리즘입니다. 선형 회귀와 랜덤 포레스트는 지도학습입니다.",
      difficulty: 4,
      points: 15,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "LLM(Large Language Model)의 '환각(Hallucination)' 현상이란?",
      options: [
        { label: "A", text: "모델이 학습 데이터를 그대로 복사하는 현상", isCorrect: false },
        { label: "B", text: "모델이 사실이 아닌 정보를 그럴듯하게 생성하는 현상", isCorrect: true },
        { label: "C", text: "모델의 응답 속도가 느려지는 현상", isCorrect: false },
        { label: "D", text: "모델이 입력을 이해하지 못하는 현상", isCorrect: false },
      ],
      explanation: "환각(Hallucination)은 LLM이 사실에 기반하지 않은 정보를 마치 사실인 것처럼 자신감 있게 생성하는 현상입니다. RAG 등으로 완화할 수 있습니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "RAG(Retrieval-Augmented Generation)의 주요 목적은?",
      options: [
        { label: "A", text: "모델의 추론 속도 향상", isCorrect: false },
        { label: "B", text: "외부 지식을 검색하여 응답 정확도 향상", isCorrect: true },
        { label: "C", text: "모델 파라미터 수 감소", isCorrect: false },
        { label: "D", text: "학습 데이터의 크기 축소", isCorrect: false },
      ],
      explanation: "RAG는 질문에 관련된 문서를 검색(Retrieval)한 후, 이를 컨텍스트로 활용하여 LLM이 더 정확한 응답을 생성(Generation)하도록 하는 기법입니다.",
      difficulty: 5,
      points: 15,
    },
  ];

  // ── 프롬프트 엔지니어링 (10문항) ──
  const promptQuestions = [
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "프롬프트 엔지니어링에서 'Few-shot Learning'이란?",
      options: [
        { label: "A", text: "모델을 적은 데이터로 재학습시키는 것", isCorrect: false },
        { label: "B", text: "프롬프트에 몇 개의 예시를 포함하여 원하는 출력 형식을 안내하는 것", isCorrect: true },
        { label: "C", text: "모델의 파라미터를 줄이는 기법", isCorrect: false },
        { label: "D", text: "학습률을 낮추는 최적화 기법", isCorrect: false },
      ],
      explanation: "Few-shot Learning은 프롬프트에 소수의 입출력 예시를 제공하여 모델이 패턴을 파악하고 원하는 형태로 응답하도록 유도하는 기법입니다.",
      difficulty: 1,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "다음 중 Zero-shot 프롬프트의 예시는?",
      options: [
        { label: "A", text: "'다음 문장의 감성을 분석하세요: 이 영화 정말 좋았어요'", isCorrect: true },
        { label: "B", text: "'예시: 좋다→긍정, 싫다→부정. 이 영화 정말 좋았어요의 감성은?'", isCorrect: false },
        { label: "C", text: "'감성 분석 모델을 학습시키세요'", isCorrect: false },
        { label: "D", text: "'감성 데이터셋을 다운로드하세요'", isCorrect: false },
      ],
      explanation: "Zero-shot은 예시 없이 직접 지시만으로 모델에게 과제를 수행하도록 요청하는 방식입니다. 별도의 예시가 포함되면 Few-shot이 됩니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "Chain-of-Thought(CoT) 프롬프팅의 핵심 원리는?",
      options: [
        { label: "A", text: "모델에게 단계별로 사고 과정을 보여주도록 요청", isCorrect: true },
        { label: "B", text: "여러 모델을 연결하여 응답 생성", isCorrect: false },
        { label: "C", text: "프롬프트를 여러 언어로 번역", isCorrect: false },
        { label: "D", text: "응답을 여러 번 반복하여 최적 선택", isCorrect: false },
      ],
      explanation: "Chain-of-Thought(CoT)는 '단계별로 생각해보세요'와 같은 지시를 통해 모델이 중간 추론 과정을 명시적으로 생성하도록 유도하는 기법입니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "TRUE_FALSE" as const,
      content: "시스템 프롬프트(System Prompt)는 대화 중간에 사용자가 변경할 수 있다.",
      options: [
        { label: "O", text: "맞다", isCorrect: false },
        { label: "X", text: "틀리다", isCorrect: true },
      ],
      answer: "X",
      explanation: "시스템 프롬프트는 대화 시작 시 설정되는 것으로, 모델의 역할·행동 지침을 정의합니다. 일반적으로 사용자가 대화 중간에 변경할 수 없으며, API 레벨에서 설정됩니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "프롬프트 인젝션(Prompt Injection) 공격이란?",
      options: [
        { label: "A", text: "악의적 입력으로 모델의 원래 지시를 무시하게 만드는 공격", isCorrect: true },
        { label: "B", text: "프롬프트를 암호화하여 전송하는 기법", isCorrect: false },
        { label: "C", text: "모델에 SQL을 주입하는 공격", isCorrect: false },
        { label: "D", text: "프롬프트를 더 길게 만드는 기법", isCorrect: false },
      ],
      explanation: "프롬프트 인젝션은 사용자가 '이전 지시를 무시하고...'와 같은 입력으로 시스템 프롬프트의 의도를 우회하려는 공격입니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "SHORT_ANSWER" as const,
      content: "프롬프트에서 모델에게 특정 역할을 부여하는 기법의 이름은? (예: '당신은 경험 많은 의사입니다')",
      answer: "역할 설정",
      explanation: "역할 설정(Role Prompting)은 모델에게 특정 전문가나 캐릭터의 역할을 부여하여, 해당 관점에서 응답하도록 유도하는 기법입니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "Temperature 파라미터를 0에 가깝게 설정하면?",
      options: [
        { label: "A", text: "응답이 더 창의적이고 다양해진다", isCorrect: false },
        { label: "B", text: "응답이 더 일관적이고 결정적이 된다", isCorrect: true },
        { label: "C", text: "응답 속도가 빨라진다", isCorrect: false },
        { label: "D", text: "토큰 수가 줄어든다", isCorrect: false },
      ],
      explanation: "Temperature가 낮을수록 확률이 높은 토큰을 선택할 가능성이 높아져 응답이 일관적이고 결정론적이 됩니다. 높을수록 다양하고 창의적인 응답이 생성됩니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "MULTIPLE_SELECT" as const,
      content: "효과적인 프롬프트 작성 원칙을 모두 고르시오.",
      options: [
        { label: "A", text: "명확하고 구체적인 지시 제공", isCorrect: true },
        { label: "B", text: "가능한 한 짧게 작성", isCorrect: false },
        { label: "C", text: "원하는 출력 형식 명시", isCorrect: true },
        { label: "D", text: "맥락과 배경 정보 포함", isCorrect: true },
      ],
      explanation: "효과적인 프롬프트는 명확한 지시, 출력 형식 명시, 충분한 맥락 제공이 중요합니다. 단순히 짧게 작성하는 것이 좋은 것은 아닙니다.",
      difficulty: 4,
      points: 15,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "다음 중 'Self-Consistency' 디코딩 전략의 설명은?",
      options: [
        { label: "A", text: "여러 추론 경로를 생성한 후 다수결로 최종 답을 선택", isCorrect: true },
        { label: "B", text: "모델이 자신의 응답을 스스로 평가하는 기법", isCorrect: false },
        { label: "C", text: "이전 대화를 기반으로 일관된 응답 생성", isCorrect: false },
        { label: "D", text: "동일 프롬프트를 반복 실행하여 평균값 계산", isCorrect: false },
      ],
      explanation: "Self-Consistency는 CoT 프롬프팅으로 여러 추론 경로를 샘플링한 후, 가장 많이 나온 답을 최종 답으로 선택하는 전략입니다.",
      difficulty: 5,
      points: 15,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "ReAct(Reasoning + Acting) 프레임워크의 특징은?",
      options: [
        { label: "A", text: "추론과 외부 도구 사용을 번갈아 수행", isCorrect: true },
        { label: "B", text: "감정 분석 전용 프레임워크", isCorrect: false },
        { label: "C", text: "프롬프트 없이 학습하는 방법", isCorrect: false },
        { label: "D", text: "여러 모델을 앙상블하는 기법", isCorrect: false },
      ],
      explanation: "ReAct는 LLM이 '생각(Thought) → 행동(Action) → 관찰(Observation)' 루프를 통해 추론과 도구 사용을 교대로 수행하는 프레임워크입니다.",
      difficulty: 5,
      points: 15,
    },
  ];

  // ── 데이터 분석 기초 (10문항) ──
  const dataQuestions = [
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "데이터 전처리에서 결측값(Missing Value) 처리 방법이 아닌 것은?",
      options: [
        { label: "A", text: "평균값으로 대체", isCorrect: false },
        { label: "B", text: "해당 행 삭제", isCorrect: false },
        { label: "C", text: "중앙값으로 대체", isCorrect: false },
        { label: "D", text: "결측값을 0으로 표시하고 그대로 사용", isCorrect: true },
      ],
      explanation: "결측값을 0으로 표시하고 그대로 사용하면 분석 결과가 왜곡될 수 있습니다. 일반적으로 삭제, 평균/중앙값 대체, 보간법 등을 사용합니다.",
      difficulty: 1,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "평균(Mean)과 중앙값(Median)이 크게 다를 때 추정할 수 있는 것은?",
      options: [
        { label: "A", text: "데이터에 이상치(Outlier)가 존재할 가능성이 높다", isCorrect: true },
        { label: "B", text: "데이터가 정규분포를 따른다", isCorrect: false },
        { label: "C", text: "데이터의 분산이 0이다", isCorrect: false },
        { label: "D", text: "데이터 수가 부족하다", isCorrect: false },
      ],
      explanation: "평균은 이상치에 민감하지만 중앙값은 그렇지 않습니다. 두 값의 차이가 크면 데이터에 극단적인 이상치가 존재할 가능성이 높습니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "TRUE_FALSE" as const,
      content: "상관관계(Correlation)가 높으면 반드시 인과관계(Causation)가 있다.",
      options: [
        { label: "O", text: "맞다", isCorrect: false },
        { label: "X", text: "틀리다", isCorrect: true },
      ],
      answer: "X",
      explanation: "'Correlation does not imply causation.' 상관관계는 두 변수 간의 통계적 연관성을 나타낼 뿐, 하나가 다른 하나의 원인이라는 것을 의미하지 않습니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "혼동행렬(Confusion Matrix)에서 '정밀도(Precision)'의 계산식은?",
      options: [
        { label: "A", text: "TP / (TP + FP)", isCorrect: true },
        { label: "B", text: "TP / (TP + FN)", isCorrect: false },
        { label: "C", text: "(TP + TN) / 전체", isCorrect: false },
        { label: "D", text: "TN / (TN + FP)", isCorrect: false },
      ],
      explanation: "정밀도(Precision) = TP / (TP + FP)로, 모델이 양성으로 예측한 것 중 실제 양성의 비율입니다. 재현율(Recall) = TP / (TP + FN)과 구분해야 합니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "데이터 시각화에서 범주형 데이터의 비율을 나타내기에 가장 적합한 차트는?",
      options: [
        { label: "A", text: "산점도(Scatter Plot)", isCorrect: false },
        { label: "B", text: "히스토그램", isCorrect: false },
        { label: "C", text: "파이 차트(Pie Chart)", isCorrect: true },
        { label: "D", text: "선 그래프(Line Chart)", isCorrect: false },
      ],
      explanation: "파이 차트는 전체 대비 각 범주의 비율을 시각적으로 보여주기에 적합합니다. 단, 범주가 너무 많으면 가독성이 떨어집니다.",
      difficulty: 1,
      points: 10,
    },
    {
      type: "SHORT_ANSWER" as const,
      content: "데이터의 퍼진 정도를 나타내는 통계량으로, 각 데이터 값과 평균의 차이를 제곱한 값의 평균은?",
      answer: "분산",
      explanation: "분산(Variance)은 데이터가 평균으로부터 얼마나 퍼져 있는지를 나타내는 통계량입니다. 분산의 제곱근이 표준편차입니다.",
      difficulty: 2,
      points: 10,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "정규화(Normalization)와 표준화(Standardization)의 차이로 올바른 것은?",
      options: [
        { label: "A", text: "정규화는 0~1 범위로, 표준화는 평균 0·표준편차 1로 변환", isCorrect: true },
        { label: "B", text: "정규화는 이상치 제거, 표준화는 결측값 처리", isCorrect: false },
        { label: "C", text: "둘은 같은 의미이다", isCorrect: false },
        { label: "D", text: "정규화는 범주형, 표준화는 수치형 데이터에 사용", isCorrect: false },
      ],
      explanation: "정규화(Min-Max Normalization)는 값을 0~1 범위로 스케일링하고, 표준화(Z-Score Standardization)는 평균을 0, 표준편차를 1로 변환합니다.",
      difficulty: 3,
      points: 10,
    },
    {
      type: "MULTIPLE_SELECT" as const,
      content: "다음 중 과적합(Overfitting)의 징후를 모두 고르시오.",
      options: [
        { label: "A", text: "학습 데이터 정확도는 높지만 검증 데이터 정확도는 낮다", isCorrect: true },
        { label: "B", text: "학습 데이터와 검증 데이터 모두 정확도가 낮다", isCorrect: false },
        { label: "C", text: "모델이 학습 데이터의 노이즈까지 학습한다", isCorrect: true },
        { label: "D", text: "학습 시간이 매우 짧다", isCorrect: false },
      ],
      explanation: "과적합은 모델이 학습 데이터에 과도하게 맞춰져 새로운 데이터에 일반화하지 못하는 현상입니다. 학습 성능은 높지만 검증 성능이 낮은 것이 대표적 징후입니다.",
      difficulty: 4,
      points: 15,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "교차 검증(Cross-Validation)의 주요 목적은?",
      options: [
        { label: "A", text: "학습 속도 향상", isCorrect: false },
        { label: "B", text: "모델의 일반화 성능 평가", isCorrect: true },
        { label: "C", text: "데이터 증강", isCorrect: false },
        { label: "D", text: "특성 선택", isCorrect: false },
      ],
      explanation: "교차 검증은 데이터를 여러 폴드로 나누어 반복적으로 학습/평가하여, 모델이 특정 데이터 분할에 과적합되지 않도록 일반화 성능을 신뢰성 있게 평가하는 기법입니다.",
      difficulty: 4,
      points: 15,
    },
    {
      type: "MULTIPLE_CHOICE" as const,
      content: "F1 Score의 설명으로 올바른 것은?",
      options: [
        { label: "A", text: "정밀도와 재현율의 조화 평균", isCorrect: true },
        { label: "B", text: "정밀도와 재현율의 산술 평균", isCorrect: false },
        { label: "C", text: "정확도의 다른 이름", isCorrect: false },
        { label: "D", text: "AUC의 역수", isCorrect: false },
      ],
      explanation: "F1 Score = 2 × (Precision × Recall) / (Precision + Recall)로, 정밀도와 재현율의 조화 평균입니다. 불균형 데이터에서 모델 성능 평가에 유용합니다.",
      difficulty: 5,
      points: 15,
    },
  ];

  // ── 문제 삽입 ──
  const allQuestions = [
    ...aiQuestions.map((q) => ({ ...q, categoryId: cat1.id })),
    ...promptQuestions.map((q) => ({ ...q, categoryId: cat2.id })),
    ...dataQuestions.map((q) => ({ ...q, categoryId: cat3.id })),
  ];

  for (const q of allQuestions) {
    await prisma.question.create({
      data: {
        type: q.type,
        content: q.content,
        options: q.options ?? undefined,
        answer: "answer" in q ? (q as { answer: string }).answer : null,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points,
        categoryId: q.categoryId,
      },
    });
  }

  // ── 샘플 시험 생성 ──
  const allQuestionsFromDb = await prisma.question.findMany();
  const exam = await prisma.exam.create({
    data: {
      title: "AITe 모의시험 A",
      description: "AI 기초, 프롬프트 엔지니어링, 데이터 분석 기초 종합 모의시험",
      mode: "MOCK",
      timeLimitMin: 60,
      passingScore: 70,
      shuffleQuestions: true,
      shuffleOptions: true,
      isPublished: true,
      items: {
        create: allQuestionsFromDb.map((q, i) => ({
          questionId: q.id,
          order: i + 1,
        })),
      },
    },
  });

  console.log(`Seed completed!`);
  console.log(`- Users: admin@aite.local / admin123, student@aite.local / student123`);
  console.log(`- Categories: ${cat1.name}, ${cat2.name}, ${cat3.name}`);
  console.log(`- Questions: ${allQuestions.length}`);
  console.log(`- Exam: ${exam.title} (${allQuestionsFromDb.length} questions)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
