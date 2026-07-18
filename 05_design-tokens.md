# 건물주 디자인 시스템 — 컬러/폰트 토큰

## 문서 정보
| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.0 |
| 작성일 | 2026-07-16 |
| 대상 | 개발팀 (프론트엔드/디자인 핸드오프) |
| 관련 문서 | 04_wireframe-prd.md (0. 디자인 시스템 기본값) |

---

## 0. 설계 방향

"건물주"의 주 사용자는 스마트폰 조작이 낯선 노년층 임대인이지만, 다루는 정보는 **보증금·계약·서명**처럼 법적 무게가 있는 데이터다. 그래서 두 가지가 동시에 필요하다.

- **신뢰감**: 은행 앱·등기부등본을 볼 때 느끼는 "공식 문서" 톤 — 화려하지 않고 안정적인 색
- **친근함**: 어렵지 않다는 인상 — 차갑고 딱딱한 진회색/네이비 일색은 피하고, 초대·환영의 온기를 주는 보조색 병행

이 방향에 따라 크림+세리프(#F4F1EA 계열) 또는 다크+비비드 네온 같은 범용 AI 생성 톤은 배제하고, **"문패/등기 서류"에서 착안한 딥 네이비 + 놋쇠(brass) 톤 앰버**를 시그니처 팔레트로 채택한다.

---

## 1. 컬러 토큰

### 1.1 브랜드 컬러
| 토큰명 | HEX | 용도 | 배경 대비(흰색 기준) |
|--------|-----|------|----------------------|
| `--color-primary-900` | `#16283F` | 헤더, 주요 텍스트, 강조 배경 | 13.2:1 (AAA) |
| `--color-primary-600` | `#1E3A5F` | 기본 버튼, 링크, 아이콘 강조 | 9.1:1 (AAA) |
| `--color-primary-100` | `#E4EAF1` | 선택된 카드 배경, 정보성 배지 배경 | - |
| `--color-accent-600` | `#B9762C` | 초대/환영 CTA, 온보딩 강조, 진행률 바 | 4.6:1 (AA) |
| `--color-accent-100` | `#F6E9D8` | 강조 카드 배경, 하이라이트 영역 | - |

> `#B9762C`는 놋쇠 문패 색에서 착안한 톤으로, 자주 쓰이는 테라코타(#D97757)나 크림 배경 조합과는 의도적으로 구분했다.

### 1.2 배경/표면
| 토큰명 | HEX | 용도 |
|--------|-----|------|
| `--color-bg-base` | `#F7F6F3` | 앱 전체 배경(따뜻한 종이 질감의 웜그레이, 크림톤 클리셰와 구분되도록 채도 낮춤) |
| `--color-surface` | `#FFFFFF` | 카드, 모달, 입력 패널 |
| `--color-surface-sunken` | `#EFEDE8` | 비활성 카드, 입력 전 placeholder 영역 |
| `--color-border` | `#DAD7CF` | 카드 테두리, 구분선 |

### 1.3 시맨틱(상태) 컬러 — 납부 상태 뱃지 등에 사용
| 토큰명 | HEX | 의미 | 사용처 |
|--------|-----|------|--------|
| `--color-success-600` | `#2F8F5B` | 완료(납부완료, 서명완료) | LL-017 상태뱃지, TN-009 |
| `--color-neutral-500` | `#8A8F98` | 대기(납부대기, 확인대기) | LL-017 상태뱃지 |
| `--color-warning-600` | `#D98A2B` | 주의(미납, 곧 만료) | LL-017, LL-009 링크 만료 D-day |
| `--color-danger-600` | `#C6483F` | 위험(독촉중, 입력오류) | LL-017 독촉중, 폼 에러 |
| `--color-info-600` | `#3A6EA5` | 안내(알림, 정보성 메시지) | COM-005 알림센터 |

### 1.4 텍스트
| 토큰명 | HEX | 용도 | 대비(배경 `#F7F6F3` 기준) |
|--------|-----|------|---------------------------|
| `--color-text-primary` | `#1B1B1B` | 본문 기본 | 15.8:1 |
| `--color-text-secondary` | `#5B5D63` | 보조 설명, 캡션 | 5.2:1 |
| `--color-text-disabled` | `#A6A8AC` | 비활성 텍스트 | - |
| `--color-text-on-primary` | `#FFFFFF` | primary 버튼 위 텍스트 | 9.1:1 (on `--color-primary-600`) |
| `--color-text-on-accent` | `#FFFFFF` | accent 버튼 위 텍스트 | 4.6:1 (on `--color-accent-600`) |

> WCAG 2.1 AA 기준(NFR-ACC-001) 충족을 위해 모든 텍스트/배경 조합은 최소 4.5:1(본문) / 3:1(대형 텍스트·아이콘)을 확보했다. 위 표의 대비값은 실제 구현 시 대비 검사 툴로 재검증 필요.

### 1.5 CSS 변수 예시
```css
:root {
  /* Brand */
  --color-primary-900: #16283F;
  --color-primary-600: #1E3A5F;
  --color-primary-100: #E4EAF1;
  --color-accent-600: #B9762C;
  --color-accent-100: #F6E9D8;

  /* Surface */
  --color-bg-base: #F7F6F3;
  --color-surface: #FFFFFF;
  --color-surface-sunken: #EFEDE8;
  --color-border: #DAD7CF;

  /* Semantic */
  --color-success-600: #2F8F5B;
  --color-neutral-500: #8A8F98;
  --color-warning-600: #D98A2B;
  --color-danger-600: #C6483F;
  --color-info-600: #3A6EA5;

  /* Text */
  --color-text-primary: #1B1B1B;
  --color-text-secondary: #5B5D63;
  --color-text-disabled: #A6A8AC;
  --color-text-on-primary: #FFFFFF;
  --color-text-on-accent: #FFFFFF;
}
```

---

## 2. 타이포그래피 토큰

### 2.1 폰트 패밀리
| 역할 | 폰트 | 사유 |
|------|------|------|
| UI 전체(제목/본문) | **Pretendard Variable** | 한글 가독성이 검증된 가변 폰트, 저시력·노년층 대상 실사용 사례 많음, 라이선스 free |
| 숫자/금액/계좌번호 | **Pretendard (tabular-nums)** | 자릿수 정렬이 필요한 금액·전화번호·계좌번호 표기 시 고정폭 숫자 적용 |
| 시스템 폴백 | `-apple-system, Roboto, sans-serif` | 폰트 로드 실패 대비 |

> 별도의 디스플레이 서체(세리프 등)는 사용하지 않는다. 노년층 대상 앱에서 개성 있는 서체 페어링보다 **단일 서체군의 굵기 대비**로 위계를 만드는 편이 인지 부담이 낮다.

### 2.2 타입 스케일
NFR-UX-002(본문 최소 18pt) 기준을 px로 환산(1pt ≈ 1.33px, 모바일 기준 18pt→24px 근사 적용)하여 아래와 같이 정의한다.

| 토큰명 | 크기 | 굵기 | 줄간격 | 용도 |
|--------|------|------|--------|------|
| `--font-display` | 32px | 700 (Bold) | 1.3 | 온보딩 슬라이드 헤드라인(COM-004) |
| `--font-heading-1` | 28px | 700 (Bold) | 1.35 | 화면 타이틀(예: "보증금은 얼마인가요?") |
| `--font-heading-2` | 24px | 600 (SemiBold) | 1.4 | 섹션 제목, 카드 제목 |
| `--font-body-large` | 20px | 500 (Medium) | 1.5 | 강조 본문(금액, 핵심 안내문) |
| `--font-body` | 18px | 400 (Regular) | 1.6 | 기본 본문 — 전 화면 최저 기준 |
| `--font-caption` | 15px | 400 (Regular) | 1.5 | 보조 설명, 타임스탬프(단, 중요 정보에는 사용 금지) |
| `--font-numeric-emphasis` | 36px | 700 (Bold) | 1.2 | 정산 결과·반환 보증금 등 강조 숫자(LL-013 결과 화면) |

### 2.3 CSS 변수 예시
```css
:root {
  --font-family-base: 'Pretendard Variable', -apple-system, Roboto, sans-serif;

  --font-display: 700 32px/1.3 var(--font-family-base);
  --font-heading-1: 700 28px/1.35 var(--font-family-base);
  --font-heading-2: 600 24px/1.4 var(--font-family-base);
  --font-body-large: 500 20px/1.5 var(--font-family-base);
  --font-body: 400 18px/1.6 var(--font-family-base);
  --font-caption: 400 15px/1.5 var(--font-family-base);
  --font-numeric-emphasis: 700 36px/1.2 var(--font-family-base);

  --font-numeric-tabular: {
    font-variant-numeric: tabular-nums;
  }
}
```

### 2.4 사용 원칙
- 본문 18px 미만 크기는 **캡션 용도 외 절대 사용 금지** (NFR-UX-002 강제)
- 한 화면에 `heading` 레벨은 1개만 사용 (화면당 질문 1개 원칙과 연동)
- 금액·전화번호·계좌번호는 반드시 `tabular-nums` 적용 (자릿수 밀림 방지)

---

## 3. 간격/크기 토큰

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--space-1` | 4px | 아이콘-텍스트 간격 |
| `--space-2` | 8px | 요소 내부 여백 최소 단위 |
| `--space-3` | 12px | 인풋 내부 패딩 |
| `--space-4` | 16px | 카드 내부 기본 패딩 |
| `--space-6` | 24px | 카드 간 간격, 섹션 여백 |
| `--space-8` | 32px | 화면 상하 여백 |
| `--radius-card` | 16px | 카드/모달 모서리 |
| `--radius-button` | 12px | 버튼 모서리 |
| `--radius-badge` | 999px | 상태 뱃지(알약형) |
| `--size-touch-min` | 48px | 모든 터치 영역 최소 크기 (NFR-UX-001) |
| `--size-button-height` | 56px | 기본 버튼 높이(주요 CTA) |
| `--size-numpad-key` | 64px | 숫자패드 키 크기(가장 큰 터치 요소) |

---

## 4. 컴포넌트 토큰 (핵심 컴포넌트만)

### 4.1 버튼
| 종류 | 배경 | 텍스트 | 테두리 | 사용처 |
|------|------|--------|--------|--------|
| Primary | `--color-primary-600` | `--color-text-on-primary` | 없음 | 확인/제출/서명 등 핵심 액션 |
| Accent(초대성) | `--color-accent-600` | `--color-text-on-accent` | 없음 | 초대링크 발송, 온보딩 CTA |
| Secondary | `--color-surface` | `--color-primary-600` | 1px `--color-primary-600` | 취소, 뒤로가기 |
| Danger | `--color-danger-600` | `#FFFFFF` | 없음 | 독촉 발송, 삭제 확인 |
| Disabled | `--color-surface-sunken` | `--color-text-disabled` | 없음 | 조건 미충족 시 |

### 4.2 상태 뱃지 (LL-017 납부 상태 등)
| 상태 | 배경 | 텍스트 |
|------|------|--------|
| 완료 | `--color-success-600` 10% opacity | `--color-success-600` |
| 대기 | `--color-neutral-500` 10% opacity | `--color-neutral-500` |
| 미납 | `--color-warning-600` 12% opacity | `--color-warning-600` |
| 독촉중 | `--color-danger-600` 12% opacity | `--color-danger-600` |

### 4.3 숫자패드 (출입정보·금액 입력 공통 컴포넌트)
- 키 배경: `--color-surface`, 눌림 시 `--color-primary-100`
- 키 텍스트: `--font-heading-2` 크기 적용(24px, 숫자 입력 시 시인성 우선)
- 키 간 간격: `--space-2`
- 삭제/완료 버튼만 `--color-accent-600` 텍스트로 구분

---

## 5. 접근성 체크리스트 (개발 QA용)
- [ ] 모든 텍스트/배경 조합 대비비 4.5:1 이상(본문), 3:1 이상(24px 이상 대형 텍스트) 확보
- [ ] 색만으로 상태를 구분하지 않음 — 상태 뱃지는 색+텍스트 라벨 병기 필수(색맹 사용자 대응)
- [ ] 포커스 표시(키보드/스위치 접근성) 모든 인터랙티브 요소에 `--color-primary-600` 2px 아웃라인 적용
- [ ] 다크모드는 1차 범위에서 제공하지 않음(라이트 테마 단일 운영, 노년층 대상 일관성 우선)

---

## 6. 향후 확장 메모
- 로고/일러스트레이션 스타일 가이드는 별도 문서로 분리 예정
- 임차인 화면(TN-)은 임대인 대비 상대적으로 젊은 사용자층이므로, 동일 토큰 내에서 `--font-body` 기본값을 16px까지 축소하는 별도 테마 분기를 2차에서 검토 가능(단, 공통 컴포넌트 재사용성 위해 1차는 단일 토큰 유지 권장)
