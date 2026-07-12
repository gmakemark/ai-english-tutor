// api/generate.js

// 1. 모델명 상수화 정의
const MODEL_NAME = "gemini-3.5-flash";

// 2. CommonJS 문법인 module.exports를 적용하여 패키지 설정에 영향받지 않도록 조치
module.exports = async function handler(req, res) {
  
  // CORS Headers 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload } = req.body;

  // 환경 변수가 정상 주입되었는지 즉시 대조
  if (!process.env.GOOGLE_API_KEY) {
    return res.status(500).json({
      error: 'Google API Key가 설정되지 않았습니다. Vercel 환경 변수(GOOGLE_API_KEY) 구성을 마쳐주십시오.'
    });
  }

  try {
    let prompt = '';
    let responseSchema = {};

    if (action === 'generate') {
      const { difficulty, questionType, goal } = payload;
      
      prompt = `
        너는 수능 영어 출제위원(평가원 소속)과 고득점 재수 전문학원의 스타 강사 역할을 동시에 수행한다.
        다음 조건에 완벽하게 부합하며 학술적 완성도와 정밀도가 높은 수능 영어 문항을 1개 출제하라.

        [조건]
        - 난이도: ${difficulty} (쉬움, 보통, 어려움, 평가원 고난도)
        - 문제 유형: ${questionType} (주제 찾기, 제목 추론, 빈칸 추론, 어휘, 문장 삽입, 순서 배열)
        - 학습 목표: ${goal} (독해 연습, 어휘 학습, 실전 훈련)

        [출제 준수 사항]
        1. 지문(passage)은 인문, 사회, 과학기술, 철학, 예술 중 고품격 기사나 대학 학술 교재 수준의 서사 구조를 가질 것 (약 160 ~ 230 단어).
        2. 문제 유형이 '빈칸 추론'일 경우, 빈칸 자리에 반드시 "_______" 을 명확하게 넣어 표시하고, 단락 내부 문맥과 조응하는 선택지들을 배치할 것.
        3. 문제 유형이 '문장 삽입'일 경우, 삽입될 문장을 "제시문: [영어 문장]" 형태로 question 필드에 추가하고, 지문(passage) 곳곳에 [1], [2], [3], [4], [5] 를 적절히 삽입해 둘 것.
        4. 문제 유형이 '순서 배열'일 경우, 주어진 박스 문장을 passage 시작 부위에 넣고 그 뒤를 이어받는 (A), (B), (C) 단락 텍스트 블록을 명확히 정의해서 구성할 것.
        5. 선택지(options)는 5개로 구성하며, 본문 단어 짜깁기 수준의 함정이 아니라, 매력적인 매개 변수를 포함한 수준 높은 오답들로 안배할 것.

        [JSON Schema 스펙 및 반환 규격]
        반드시 다음 구조의 순수 JSON 객체로만 응답해야 한다.
      `;

      responseSchema = {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          passage: { type: "STRING" },
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          correctAnswer: { type: "INTEGER" },
          explanation: { type: "STRING" },
          vocabulary: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                word: { type: "STRING" },
                meaning: { type: "STRING" }
              },
              required: ["word", "meaning"]
            }
          },
          subject: { type: "STRING" },
          summary: { type: "STRING" },
          points: { type: "STRING" }
        },
        required: [
          "title", "passage", "question", "options", "correctAnswer", 
          "explanation", "vocabulary", "subject", "summary", "points"
        ]
      };

    } else if (action === 'analyze') {
      const { passage, question, options, userAnswer, correctAnswer } = payload;
      
      prompt = `
        너는 수능 영어 인지 오답 분석 전문가이다.
        학생이 이 문제를 틀린 것에 관해 인지 심리학과 수능 영어 함정 공식에 기반하여 정밀 진단서를 작성하라.

        [문제 컨텍스트]
        - 영어 지문: ${passage}
        - 발문: ${question}
        - 보기 리스트: ${JSON.stringify(options)}
        - 학생이 잘못 고른 오답: ${userAnswer}번 보기 (${options[userAnswer - 1]})
        - 실제 수능 출제 정답: ${correctAnswer}번 보기 (${options[correctAnswer - 1]})

        [진단 분석 지침]
        1. "왜 매료되었을까?": 학생이 선택한 오답 매커니즘이 지문의 어떤 문장이나 단어 오역, 혹은 평가원의 '선택지 교란 방식(지나친 일반화, 반대 방향의 서술 등)'과 관련되는지 상세히 분석하라 [2, 4].
        2. "향후 독해 처방전": 이 유형의 논리적 허점을 차단하고 구문 구조를 장악하기 위해 이번 주에 꼭 실천해야 하는 수능 영어 피드백 과제를 구체적으로 알려줘라.
        3. "수능 출제 함정 기법": 평가원이 역대 모의고사에서 즐겨 썼던 매력적 오답의 핵심 메커니즘을 규명하고, 실전 대응 규칙을 알려줘라.
      `;

      responseSchema = {
        type: "OBJECT",
        properties: {
          wrongReason: { type: "STRING" },
          studyDirection: { type: "STRING" },
          similarPatterns: { type: "STRING" }
        },
        required: ["wrongReason", "studyDirection", "similarPatterns"]
      };

    } else {
      return res.status(400).json({ error: '유효하지 않은 요청 액션입니다.' });
    }

    // Google Gemini API 동적 주소 설정 (Node 18 이상이므로 fetch 기본 작동)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("Gemini API Error Detail: ", errorDetail);
      return res.status(response.status).json({
        error: 'Google AI API 호출 과정에서 오류가 발생했습니다.',
        details: errorDetail
      });
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // JSON 구조체 이송
    const cleanJson = JSON.parse(generatedText);
    return res.status(200).json(cleanJson);

  } catch (error) {
    console.error("Serverless Process Error: ", error);
    return res.status(500).json({
      error: '서버 내부에서 데이터를 컴파일하는데 실패했습니다.',
      message: error.message
    });
  }
}