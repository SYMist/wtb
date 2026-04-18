# 할 일 목록

미팅 결론과 논의 내용을 기반으로 정리한 향후 작업 목록입니다.

---

## SEO (미팅 #06 기반)

### Phase A — 즉시 실행

- [x] 가이드 콘텐츠 확충: 각 계산기별 500~1,000자 상세 가이드 작성
- [x] 카테고리 페이지에 서술형 설명 콘텐츠 추가 (thin content 해소)
- [x] JSON-LD FAQ를 계산기당 3~5개로 확장
- [x] Google Search Console 등록 + 사이트맵 제출 (tooly.deluxo.co.kr URL 접두어 속성, sitemap.xml 성공)
- [x] Google Search Console에서 주요 페이지 인덱싱 요청 (URL 검사 도구)
- [x] 네이버 서치어드바이저 등록 + 사이트맵 제출 + 주요 페이지 수집 요청 (24개 URL)
- [x] Google Analytics 연동

### Phase B — 1~2주 내

- [x] 킬러 계산기 서버/클라이언트 분리 리팩토링 (대출, 복리 — 연봉은 완료)
- [x] Pretendard 웹폰트 명시적 로딩 설정 (CLS 방지)
- [ ] Core Web Vitals 점검 (특히 Recharts 차트의 LCP 영향)
- [x] OG 이미지 자동 생성 (`opengraph-image.tsx` + @vercel/og)
- [x] 구조화 데이터 확장 (SoftwareApplication / WebApplication 스키마)

### Phase C — 3~4주 내

- [x] 프로그래매틱 SEO: 연봉 구간별 사전 계산 페이지 (20개)
- [x] 프로그래매틱 SEO: 대출 금액별 사전 계산 페이지 (15개)
- [x] 각 프로그래매틱 페이지에 구간별 맥락 콘텐츠 차별화 (doorway page 방지)
- [x] sitemap.ts에 프로그래매틱 페이지 동적 추가
- [x] canonical 태그 관리 (메인 계산기 페이지와 중복 방지)
- [x] 네이버 블로그 운영 플레이북 작성 (`marketing/naver-blog-playbook.md`)
- [ ] 네이버 블로그 포스팅 5~10개 발행 (백링크 확보, 플레이북 기반)

---

## 콘텐츠 (미팅 #06 기반)

- [ ] 블로그/콘텐츠 허브 구축 — 질문형 검색 대응 ("전세 vs 월세 뭐가 유리한가" 등)
- [ ] 계산기별 대표 일러스트 추가 (이미지 검색 유입)
- [ ] 네이버향 키워드를 description/가이드에 자연스럽게 반영

---

## 인프라 / 배포

- [x] Cloudflare Workers 배포 (https://wtb.mmist0226.workers.dev)
- [x] 커스텀 도메인 연결 (https://tooly.deluxo.co.kr)
- [x] AdSense 등록 및 pub ID 업데이트 (pub-5716436301710258, auto ads 활성)
- [ ] AdSense 개별 광고 슬롯 ID 연결 (AdSlot.tsx `data-ad-slot`)

---

## 기술 부채

- [ ] 2026년 공휴일 데이터 하드코딩 → 향후 연도 대응 방안 (API 또는 연도별 추가)
- [ ] 환율/금리 데이터 fetch 스크립트의 실제 API 키 설정 및 자동화
- [ ] interest-rates.json, exchange-rates.json fallback 데이터 주기적 업데이트

---

## Phase 2 (미팅 #01~#03 기반)

- [ ] 크롤링 데이터 기반 콘텐츠 (공공 API 데이터 활용)
- [ ] 추가 계산기 검토 (검색 트래픽 분석 후 결정)
