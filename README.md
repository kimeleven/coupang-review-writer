# coupang-review-writer

쿠팡 인기 상품 리뷰 블로그 작성 및 관리 도구

**Coupang Affiliate Review Blog Post Writer & Manager**

---

## 🚀 주요 기능

- **인기 상품 탐색**: 자주 리뷰되는 카테고리별 인기 상품 빠른 추가
- **상품 관리**: 쿠팡 링크 + 파트너스 링크 함께 관리
- **AI 리뷰 생성**: OpenAI를 활용한 고품질 네이버/티스토리 블로그 리뷰 자동 작성
- **원클릭 복사**: 생성된 글을 네이버 블로그, 티스토리에 바로 붙여넣기 최적화된 형태로 복사
- **리뷰 히스토리**: 작성한 리뷰 보관 및 재사용

## 🛠 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (리뷰 생성)

## 📦 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/kimeleven/coupang-review-writer.git
cd coupang-review-writer
```

### 2. 웹 앱 실행

```bash
cd web
npm install
npm run dev
```

http://localhost:3000 에서 확인하세요.

### 3. OpenAI API Key 설정 (선택, 강력 추천)

1. [OpenAI API Keys](https://platform.openai.com/api-keys) 에서 키 발급
2. 앱 접속 → 설정 메뉴 → OpenAI API Key 입력 및 저장
3. AI 생성 기능이 활성화됩니다. (키가 없으면 기본 템플릿으로도 사용 가능)

## 📋 사용 흐름

1. **상품 추가**
   - "인기 상품" 섹션에서 빠르게 추가하거나
   - 직접 상품명, 가격, 쿠팡 URL, 파트너스 URL 입력

2. **리뷰 작성**
   - 상품 카드에서 "리뷰 작성하기" 클릭
   - 스타일, 키워드, 추가 지시사항 입력
   - AI 생성 또는 템플릿으로 초안 생성

3. **복사 & 게시**
   - 생성된 글을 다듬은 후 "네이버 블로그용 복사" 또는 "티스토리용 복사"
   - 네이버/티스토리 에디터에 붙여넣기

## ⚠️ 주의사항

- 쿠팡 파트너스 링크는 [쿠팡파트너스](https://partners.coupang.com) 대시보드에서 직접 생성해야 합니다. (로그인 필요)
- 이 도구는 **콘텐츠 생성 보조** 도구이며, 최종 글은 반드시 본인이 검토 후 게시하세요.
- 대한민국 전자상거래법 및 표시·광고법에 따라 **광고/제휴 게시물 표시**를 잊지 마세요.

## 📄 라이선스

MIT

---

Made for Korean affiliate bloggers 💰
