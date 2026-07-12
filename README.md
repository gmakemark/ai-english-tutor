# 🎓 AI English Tutor - 수능 영어 AI 학습 도우미

> **고등학교 코딩 동아리 AI 웹 서비스 개발 포트폴리오 프로젝트**  
> Google Gemini API와 Vercel Serverless Functions를 융합하여 구현한 고품질 수능 영어 독해 학습 및 정밀 오답 분석 플랫폼입니다.

---

## 🌟 주요 기능 (Core Features)

1. **맞춤형 수능 지문 생성 (AI 문제 출제)**
   - **난이도 세분화**: 쉬움, 보통, 어려움, 평가원 고난도
   - **6대 수능 평가 유형**: 주제 찾기, 제목 추론, 빈칸 추론, 어휘, 문장 삽입, 순서 배열
   - **학습 목표별 튜닝**: 독해 연습, 어휘 학습, 실전 훈련

2. **실시간 원어민 발음 리스닝 (TTS)**
   - 브라우저 내장 `Web Speech API`를 활용하여 별도의 API 과금 없이 영어 지문 전체 듣기 및 배속 조절 기능(0.8x, 1.0x, 1.2x) 지원

3. **AI 정밀 오답 분석**
   - 오답을 제출한 경우, 학습자가 선택한 보기와 정답 보기를 AI가 비교 분석
   - 인지적 왜곡 원인 분석("왜 매료되었을까?"), 향후 독해 처방전, 평가원의 출제 함정 패턴 기법 제시 [2, 4]

4. **로컬 데이터 대시보드 및 단어장**
   - 브라우저의 `LocalStorage`를 활용한 정답률 추이 기록
   - 취약한 수능 문제 유형 통계 자동 산출
   - 지문에 등장한 핵심 단어를 '나만의 단어장'에 개별 보관 및 원어민 발음 개별 듣기 기능

---

## 🛠 기술 스택 (Tech Stack)

### **Frontend**
- **UI Framework**: HTML5, [Tailwind CSS](https://tailwindcss.com/) (CDN 기반 반응형 그리드 및 세련된 테마)
- **Library**: 
  - [Font Awesome 6](https://fontawesome.com/) (풍부한 벡터 아이콘)
  - [Animate.css](https://animate.style/) (부드러운 모션 효과)
  - [SweetAlert2](https://sweetalert2.github.io/) (고급 모달 얼림창)
- **API 활용**: Browser Web Speech API (`window.speechSynthesis`)

### **Backend**
- **Serverless**: [Vercel Serverless Functions](https://vercel.com/docs/functions) (Node.js 환경)
- **AI Model**: Google Gemini API (`gemini-3.5-flash` 모델) [3]

---

## 📂 프로젝트 구조 (Project Directory Structure)

```text
├── api/
│   └── generate.js    # Vercel Serverless Function (Gemini API 프롬프팅 및 Schema 제어)
├── index.html         # Tailwind 기반 대시보드 UI 및 학습 데이터 클라이언트 로직
├── vercel.json        # Vercel 배포 및 API 라우팅 환경 설정 파일
└── README.md          # 프로젝트 사용 가이드 (본 파일)