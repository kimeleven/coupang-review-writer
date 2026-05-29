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

## 📋 사용 흐름 (사용자가 요청하신 정확한 플로우)

1. **인기상품 검색 / 선정**
   - 대시보드에서 "인기 상품 빠른 추가" 카드 클릭 (실제 인기 많은 제품 10종 제공)
   - 또는 "상품 관리" → 직접 추가 (쿠팡 URL + 파트너스 링크 입력)

2. **쿠팡 파트너스 링크 확인하기**
   - 상품 카드에서 "파트너스 링크 도우미" 버튼 클릭
   - 실제 링크는 https://partners.coupang.com 에서 직접 생성 후 붙여넣기

3. **상품 선정 후 리뷰글 작성**
   - "리뷰 작성하기" 클릭 → 왼쪽에서 옵션 선택
     - 플랫폼 (네이버 / 티스토리)
     - 스타일 (솔직후기, 가성비, 비교분석 등)
     - 키워드, 타겟 독자, 추가 지시사항
   - "AI로 고품질 리뷰 생성" 또는 템플릿 버튼 클릭

4. **복사해서 붙여넣기**
   - 생성 후 "네이버용 복사" 또는 "티스토리용 복사" 버튼
   - 네이버 블로그 / 티스토리 에디터에 그대로 붙여넣기
   - 필요시 오른쪽 미리보기에서 확인하면서 편집 가능

## ✨ 핵심 특징

- **OpenAI 연동**: API 키만 넣으면 GPT-4o 수준의 자연스러운 한국어 리뷰 생성
- **키 없어도 OK**: 강력한 템플릿 엔진 내장 (광고 문구 자동 포함)
- **영구 저장 (Neon Postgres)**: 상품과 리뷰가 DB에 안전하게 저장됩니다 (로컬스토리지 → Neon 마이그레이션 완료)
- **실전 최적화**: 실제 블로거들이 쓰는 스타일과 문장 패턴 반영

## ⚠️ 주의사항

- 쿠팡 파트너스 링크는 [쿠팡파트너스](https://partners.coupang.com) 대시보드에서 직접 생성해야 합니다. (로그인 필요)
- 이 도구는 **콘텐츠 생성 보조** 도구이며, 최종 글은 반드시 본인이 검토 후 게시하세요.
- 대한민국 전자상거래법 및 표시·광고법에 따라 **광고/제휴 게시물 표시**를 잊지 마세요.

## 🗄️ 데이터베이스 + 배포 (Neon + Vercel)

이 프로젝트는 **Neon Postgres** + **Vercel** 배포를 기준으로 설계되었습니다.

### 1. Neon DB 생성

1. [Neon](https://neon.tech) 가입 후 새 프로젝트 생성
2. 생성된 **Connection string** 복사 (postgresql:// 로 시작하는 URL)

### 2. 로컬에서 테스트

```bash
cd web
cp .env.example .env
# .env 파일에 DATABASE_URL 붙여넣기
```

```bash
npm run dev
```

### 3. Prisma 마이그레이션 (최초 1회)

```bash
cd web
npx prisma migrate dev --name init
```

### 4. Vercel 배포

1. GitHub에 푸시되어 있는 상태여야 함
2. [Vercel](https://vercel.com)에서 **New Project** → 이 저장소 선택
3. **Environment Variables**에 추가:
   - `DATABASE_URL` = Neon에서 복사한 전체 연결 문자열
4. Deploy

Vercel은 빌드 시 자동으로 `prisma generate`를 실행합니다.

### 5. 데이터베이스 마이그레이션 (Vercel 배포 후)

Vercel 배포 후에도 스키마를 변경했다면 로컬에서:

```bash
npx prisma migrate deploy
```

또는 Vercel에 별도의 "Prisma Migrate" 스크립트를 추가할 수 있습니다.

## 📄 라이선스

MIT

---

Made for Korean affiliate bloggers 💰
