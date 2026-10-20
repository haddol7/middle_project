# 공통평가 01 요구사항과 제출 증빙

2026년 10월 20일 작업 중 점검. 첨부된 평가서와 기존 최종 양식은 동일하다. 원본 항목 ID 1–14, Upload UI 방식, PythonAnywhere 운영과 Android 동기화를 유지한다. 보고서의 교수님 판정란은 공란이다.

| ID | 필수 내용 | 구현·검증 | 보고서 및 상태 |
| --- | --- | --- | --- |
| 1 | PhotoBlogServer·PhotoViewer·보고서의 루트 구조 | 제출 폴더와 파일 해시 검사 | A13, 지정 폴더 구조 캡처 필요 |
| 2 | GitHub push와 URL 제출 | 컴퓨터공학과 하대진·2020105671·저장소 URL 기입 | 대기, 아직 push·제출하지 않음 |
| 3 | 사진 포함 API POST와 결과 | WSL 실제 HTTP, 운영 HTTPS multipart 201·사진 해시 일치 | A2·A15, 주소창 포함 입력/완료 화면 필요 |
| 4 | Telnet GET 응답 | WSL GNU Telnet 200·JSON 배열, 최신 transcript | A3, 터미널 캡처 필요 |
| 5 | CodeBeautify JSON 검증 | 기본 구현 당시 Valid JSON 원본 화면 보존 | A3, 최신 응답의 서비스 화면 필요 |
| 6 | Python 테스트 엔진과 Coverage HTML | WSL 148개·독립 HTTP 15개, HTML 생성 | A4·A15, 최신 HTML 실제 화면 캡처 필요 |
| 7 | 실제 Android 요청 소켓 수신 | 익명 GET 원문 212B, 인증 헤더·쿠키·본문 없음 | A3, 원문을 연 VS Code 캡처 필요 |
| 8 | localhost 서버 브라우저 | 실제 기존 목록 캡처 | A14 완료 |
| 9 | Android 시작 | 실제 PhotoViewer API35 에뮬레이터 | A5 완료 |
| 10 | Android 로컬 서버 동기화 | WSL 서버 응답·사진 표시·파일 검사 | A5 완료 |
| 11 | MainActivity Upload | UI 방식, OS 사진 선택·입력·multipart 게시 | A5·A6 완료, 하드코딩 방식 선택 안 함 |
| 12 | PythonAnywhere 클라우드 서버 | 공개 HTTPS·모듈·모델 자산, 실제 화면 | A11·A15 완료 |
| 13 | 해당 배포와 Android 동기화 | 평가 앱 사진 3개 수신, URL·완료 화면·API 교차검사 | A12 완료 |
| 14 | 추가 Server/Client 편의 기능 최대 5개 | 사용자 기능 3개를 Client 3·Server 2로 연결 | A6–A10·A13·A15–A17, 등록5개·앱 UX 반영·검색 일치 줄 보완 중 |

## 추가 기능 연결

| 등록 | 구현 | 검사와 증빙 |
| --- | --- | --- |
| E01 Client 얼굴 모자이크 | Android content 패키지, 웹 stage·vision·composer | 기기 얼굴 탐지·픽셀 변경·원본 보존, 직접 보완 UI, A6·A9 |
| E02 Client 테마와 태그 | Android ThemeMapper·ML Kit, 웹 labels·rules | 실제 자동 동물 분류, 추천/수동 교정 구분, A7 |
| E03 Server 분류 저장·조회 | content_rules·content_services·content_api | 저장·필터·권한·버전 409, 운영 HTTP 조건 조회, A7·A15 |
| E04 Client OCR와 위치 | Android VisionEngine·OcrPage·OcrPolicy·PhotoCanvas, 웹 vision·ocr-policy·ocr-page·detail | 한영 OCR·교정·제외·좌표 복원, 웹 배경6조건0·정상14줄 및 Android 별도 표본 결과, A8–A10·A16·A17 |
| E05 Server 사진 문구 검색 | content_api·content_queries·content_services | Unicode 검색·제외·교정·사진 해시·경합, 운영 HTTP 갱신, A8·A15 |

수동 지정 분류값을 자동 분류 성공으로 계산하지 않는다. 모델 사진 검사는 표본 범위에서만 해석한다. Android JVM 38개와 API35 에뮬레이터 통합 테스트 9개는 별도이며, 운영 HTTP 33개는 단일 흐름의 검사항목 수다.

## 현재 실행 근거

- WSL: evidence/content/server/verification.json 및 실제 출력 로그, 148개·HTTP15개.
- Coverage: 총합95.7%·라인97.3%·분기90.2%, PhotoBlogServer/htmlcov/index.html.
- Windows 웹: evidence/mobile-web/unit-verification.json, 67개.
- Windows Android: evidence/content/android/verification.json, 소스/APK 일치는 같은 manifest, 최신 운영 동기화는 evidence/content/android/cloud-sync.json.
- 과거 운영 HTTP: evidence/submission-final/cloud-content-flow.json과 최초 게시 기록 cloud-content-flow-attempt-1.json. 현재 글4번 유지 또는 최신 UI 검사의 근거로 쓰지 않는다.
- Word: evidence/content/report-current-verification.json, 19페이지·내장 이미지20장 내장·전체 렌더 검수.

신원·GitHub 주소는 기입했으며 소스 push·과제 제출과 지정 화면 6종은 미완료다. 현재 기능/UX의 보완 상태는 PROJECT_STATUS.md를 우선한다. 로그와 HTML 원본은 해당 화면 캡처를 대신한 완료 증거로 처리하지 않는다. 물리 iPhone Safari의 전체 작성 과정·제3자 사용성 평가·장기 운영 안정성은 이번 검증 범위에 포함하지 않았다.

1인 운영 전환: 회원가입은 제공된 평가서의 필수 항목이 아니다. 지정 운영자 게시·기존 배열 API·Android Upload·실제 PythonAnywhere 동기화는 유지했다. SINGLE_OWNER_BLOG.md 및 최신 실행 manifest를 기준으로 보고서 수치를 갱신하였다. 작은 화면 UI1개와 운영 읽기 전용1개를 별도 기록하며, E01·E02·E03 완료·E04·E05 부분을 유지한다.

Android 최신 UI·인식 설명과 캡처는 A16·A17에 추가하였다. 지정 화면6종의 미비와 적/부 판정 공란은 유지하며, 보고서가 최신화되었다는 이유로 제출 완료로 표시하지 않는다.
