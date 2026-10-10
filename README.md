# 🗺️ 지수쌤과 혁명 탐험대 (Revolution Quest)

중학교 2학년 **역사1 · 국민 국가의 형성** 단원을 게임처럼 복습하는 웹앱입니다.
(2022 개정 교육과정 기준)

## 다루는 7개 주제
1. 이탈리아 통일운동
2. 독일 통일운동
3. 아이티 독립운동
4. 미국 남북전쟁
5. 라틴아메리카 독립운동
6. 프랑스 7월혁명·2월혁명
7. 영국 차티스트 운동

## 주요 기능
- **모험 지도형 홈**: 7개 스테이지, 별점·클리어 배지, 전체 진행률
- **스테이지 학습**: 배경→전개→결과 요약, 핵심 인물 카드, 미니 연표
- **복습 퀴즈**: 사지선다 / OX / 순서 맞추기 / 짝 맞추기
- **게임 요소**: 점수, 연속 정답 콤보 보너스, 별 1~3개, 결과 화면
- **세계 지도**: 각 사건이 일어난 지역을 핀으로 표시
- **진도 저장**: 브라우저 localStorage에 자동 저장

## 기술 스택
- React 18 + Vite 5
- React Router 6
- 순수 CSS (게임풍 디자인)

## 실행 방법
```bash
npm install      # 최초 1회
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

## Vercel 배포 (GitHub 연동)
1. 이 폴더를 GitHub 저장소에 올립니다.
2. [Vercel](https://vercel.com)에서 "Add New → Project"로 저장소를 Import 합니다.
3. 프레임워크가 **Vite**로 자동 인식됩니다. (Build: `npm run build`, Output: `dist`)
4. Deploy를 누르면 배포 완료. 이후 GitHub에 push할 때마다 자동 재배포됩니다.

## 폴더 구조
```
src/
├── main.jsx                 # 진입점 (Router + ProgressProvider)
├── App.jsx                  # 라우트 정의
├── ProgressContext.jsx      # 진도 상태 공유
├── data/revolutions.js      # 7개 주제 콘텐츠 + 퀴즈 데이터
├── hooks/useProgress.js     # localStorage 진도 저장
├── components/              # Stars, ProgressBar, 질문 유형 컴포넌트
└── pages/                   # Home, Stage, Quiz, Result, MapView
```

## 콘텐츠 수정하기
문제·설명·연표를 바꾸려면 `src/data/revolutions.js` 한 파일만 편집하면 됩니다.
새 퀴즈를 추가할 때 `type`은 `mcq`, `ox`, `order`, `match` 중 하나를 사용하세요.
