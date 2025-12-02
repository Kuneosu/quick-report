# QuickReport

마크다운 문법을 사용해 간단히 작성하면 업무 보고 형식으로 자동 변환해주는 웹 애플리케이션입니다.

## 데모

**라이브 데모**: [https://project-qpz74fc1h-kuneosus-projects.vercel.app](https://project-qpz74fc1h-kuneosus-projects.vercel.app)

## 기능

- **마크다운 에디터**: 마크다운 형식으로 텍스트 입력
- **실시간 미리보기**: 입력과 동시에 변환 결과 표시
- **데이터 불러오기**: 기존 보고서 데이터를 마크다운으로 변환
  - `▶/-/+/.` 형식 및 `#/##/###/####` 형식 지원
  - 동일 프로젝트/활동/작업 자동 그룹핑
  - 중복 항목 자동 제거
  - 여러 날의 보고서 한 번에 병합
  - 덮어쓰기/뒤에 추가 옵션 선택
- **클립보드 복사**: 변환 결과를 클립보드로 복사
- **로컬 스토리지 저장**: 작성 중인 내용 자동 저장
- **다크/라이트 모드**: 테마 전환 지원
- **투어 가이드**: 처음 사용자를 위한 단계별 안내
- **반응형 디자인**: 데스크톱/모바일 환경 지원

## 입력 형식

두 가지 입력 형식을 지원합니다:

### 마크다운 형식

```markdown
# 프로젝트명
## 활동명
### 작업내용
#### 세부내용
```

### 기호 형식 (데이터 불러오기용)

```
▶ 프로젝트명
  - 활동명 (2칸 들여쓰기)
    + 작업내용 (4칸 들여쓰기)
      . 세부내용 (6칸 들여쓰기)
```

## 변환 규칙

| 마크다운 입력 | 출력 형식 | 들여쓰기 |
|--------------|----------|---------|
| `# 제목` | `▶ 프로젝트명` | 0칸 |
| `## 제목` | `1. 카테고리` (자동 번호) | 2칸 |
| `### 항목` | `- 세부 항목` | 4칸 |
| `#### 하위` | `+ 하위 세부사항` | 6칸 |

### 예시

**입력**:
```markdown
# 주간 업무 보고
## 회의
### 일시 : 2024-11-27
### 내용 : 프로젝트 킥오프
## 개발
### API 설계
#### 엔드포인트 정의
#### 스키마 작성
```

**출력**:
```
▶ 주간 업무 보고
  1. 회의
    - 일시 : 2024-11-27
    - 내용 : 프로젝트 킥오프
  2. 개발
    - API 설계
      + 엔드포인트 정의
      + 스키마 작성
```

## 데이터 불러오기 사용법

1. 헤더의 **"불러오기"** 버튼 클릭
2. 기존 보고서 데이터를 텍스트 영역에 붙여넣기
3. **"변환 미리보기"** 버튼으로 결과 확인
4. 변환 통계 확인 (프로젝트 수, 그룹핑 건수, 중복 제거 건수)
5. **"덮어쓰기"** 또는 **"뒤에 추가"** 선택하여 적용

## 기술 스택

| 구분 | 기술 | 버전 |
|-----|-----|-----|
| 프론트엔드 | React | 19.x |
| 언어 | TypeScript | 5.9.x |
| 빌드 도구 | Vite | 7.x |
| 테스트 | Vitest + React Testing Library | - |
| 스타일링 | CSS Modules | - |
| 배포 | Vercel | - |

## 시작하기

### 요구 사항

- Node.js 18.x 이상
- npm 9.x 이상

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd quickreport

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 빌드

```bash
npm run build
```

### 테스트

```bash
# 테스트 실행
npm run test

# 테스트 워치 모드
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

### 배포

```bash
vercel --prod
```

## 프로젝트 구조

```
src/
├── components/
│   ├── ConfirmDialog/     # 확인 다이얼로그
│   ├── CopyButton/        # 복사 버튼
│   ├── Editor/            # 마크다운 에디터
│   ├── Footer/            # 푸터
│   ├── GuideModal/        # 문법 가이드 모달
│   ├── Header/            # 헤더
│   ├── ImportModal/       # 데이터 불러오기 모달
│   ├── MobileTabBar/      # 모바일 탭 바
│   ├── NameInputDialog/   # 이름 입력 다이얼로그
│   ├── Preview/           # 변환 결과 미리보기
│   ├── ProductTour/       # 투어 가이드
│   ├── SettingsModal/     # 설정 모달
│   ├── Sidebar/           # 사이드바
│   └── Toast/             # 토스트 알림
├── hooks/
│   ├── useClipboard.ts    # 클립보드 복사 훅
│   ├── useDebounce.ts     # 디바운싱 훅
│   ├── useLocalStorage.ts # 로컬 스토리지 훅
│   ├── useMediaQuery.ts   # 미디어 쿼리 훅
│   └── useTheme.ts        # 테마 전환 훅
├── utils/
│   ├── constants.ts       # 상수 정의
│   └── markdownConverter.ts # 마크다운 변환 로직
├── styles/
│   ├── global.css         # 전역 스타일
│   └── variables.css      # CSS 변수
├── types/                 # TypeScript 타입 정의
├── App.tsx                # 메인 앱 컴포넌트
├── App.module.css         # 앱 스타일
└── main.tsx               # 진입점
```

## 브라우저 지원

| 브라우저 | 최소 버전 |
|---------|----------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

## 라이선스

MIT
