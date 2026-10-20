# 추가 기능 버전의 실제 검증 증빙

2026-10-20. [구현 기록](../../docs/IMPLEMENTATION_LOG.md)과 [보고서 메모](../../docs/REPORT_NOTES.md)에 연결한다. 로컬 검증이며 PythonAnywhere 배포 완료 증거가 아니다.

## 재현 가능한 검사

| 구분 | 결과 | 실행과 원본 |
| --- | --- | --- |
| WSL Django/서버 전체 | 196개 PASS, check 0, migration 변경 없음 | `python tools/verify_content.py`, [manifest](server/verification.json), [실제 테스트 출력](server/tests-coverage.txt) |
| WSL 독립 실제 HTTP | 20개 PASS | [실제 HTTP 엔진 출력](server/http-api-engine.txt) |
| Coverage | 총합 97.3% · 라인 98.6% · 분기 93.3% | [통계](server/coverage-report.txt), `PhotoBlogServer/htmlcov/index.html`·`coverage.json` |
| Windows Node 모바일웹 | 순수 규칙 유닛 21개 PASS | [검증](../mobile-web/unit-verification.json), [출력](../mobile-web/unit-tests.txt) |
| 실제 Chromium 모바일웹 | 모델·픽셀 9개 및 게시·교정·검색·제외 흐름 PASS | [모델](../mobile-web/browser-models.json), [조작](../mobile-web/browser-ui.json), [저장](../mobile-web/http-initial.json), [제외](../mobile-web/http-excluded.json) |
| Windows Android JVM | 63개 PASS, 기존 45+새 순수 규칙 18 | [manifest](android/verification.json), Gradle XML·HTML 결과는 `PhotoViewer/app/build/reports/tests/testDebugUnitTest` |
| 실제 Android | ContentDevice 6 + ContentUi 1 + LiveRepository 3 = 10개 PASS | API35 에뮬레이터, [manifest](android/verification.json)의 클래스별 결과·private 원본 로그 위치 |
| 비행기 모드 | 최종 APK의 얼굴·모자이크/한영 OCR/자동 동물 분류 3개 재실행 PASS | [검사](android/offline-check.json), [실제 출력](android/offline-models.txt). 고유 테스트 수에 중복 합산하지 않음 |
| 실제 소켓 수신 | 212바이트 익명 GET, 인증 헤더·쿠키·본문 없음 | [검사](android/socket-request-check.json), [수신 원본](android/android-request.bin) |
| 실제 게시 사본 | Android 새 UI 게시 → WSL HTTP 다운로드 → 서버 파일·내용 digest 일치 | [검사](android/ui-uploaded-photo.json), [실제 서버 사진](android/ui-uploaded-photo.jpg) |
| 기존 데이터 보존 | migration 전후 기존 글 29개·이미지 경로·SHA 일치 | [migration 기록](server/migration.json), DB backup은 private 폴더 |

Android manifest가 가리키는 소스/APK SHA-256과 `sourceStable` 결과를 사용한다. 예전 manifest에 적힌 테스트 수·다른 APK·과거 캡처를 최신 결과로 취급하지 않는다. 인식 정확도의 모집단 추정치나 다양한 실기기 성능을 측정한 증빙은 아니다.

[파일 일치 검사](integrity-check.json)에서 현재 소스·APK·원본 화면·배포 ZIP을 실행 manifest와 비교했다. [요구사항 연결](implementation-trace.json)은 21개 설계 요구마다 구현·테스트·증거와 남은 범위를 구분한다. 설계 당시 `acceptance.json`은 구현 전 계획 이력으로 보존한다.

[보고서 작성본](<../../모바일웹서비스 프로젝트 공통평가 01_수행 결과 보고서_작성중.docx>)에는 현재 확인된 내용과 화면을 담았다. [문서 검수 기록](report-draft-verification.json)은 10쪽·원본 이미지 10장·전 페이지 검토·다른 폴더 복사 후 동일 렌더를 확인한 자료다. 최종 제출·실제 클라우드 검증은 별도다.

## 원본 화면

- [새 시작·동기화 화면](android/content-start.png)
- [자동 얼굴 모자이크 미리보기](android/content-face-preview.png)
- [테마·OCR 교정 화면](android/content-classification-ocr.png)
- [실제 게시 후 상세](android/content-published.png)
- [사진 속 글자 검색 결과](android/content-search-results.png)
- [일치한 사진 영역 강조](android/content-match-highlight.png)
- [실제 웹 검색](web/photo-text-search.jpg)
- [모바일웹 게시 사본](../mobile-web/posted-detail.png)
- [모바일웹 일치 문구 강조](../mobile-web/search-highlight.png)
- [모바일웹 문구 제외 후 결과](../mobile-web/search-excluded.png)

Android 경로의 PNG는 실제 에뮬레이터 화면, mobile-web PNG와 web JPG는 실제 Chromium 화면이다. 물리 아이폰 Safari 검증 자료는 아니다. 원본 해상도로 보존하고 보고서에 삽입할 때 이미지를 내장한다. `mosaiced-public-copy.jpg`는 **단일 인물 fixture의 픽셀 검사 사본**, `ui-uploaded-photo.jpg`는 **인물과 표지 문구를 합친 새 UI 게시 사진**이다. 서로 다른 검사 자료를 같은 사진으로 설명하지 않는다.

## 평가 항목 연결과 남은 증거

E01은 얼굴 확인·실제 게시 이미지·원본 보존/픽셀 검사, E02는 추천·교정 및 실제 자동 분류, E03은 분류 저장·권한·재접속·필터, E04는 한영 OCR·교정·제외·일치 영역, E05는 문구 검색·교체 무효화·동시 수정과 연결한다. 서버는 `test_photo_content`, `test_content_http`, `test_content_concurrency`, `test_content_web`, Android는 `ContentRulesTest`, `ContentDeviceTest`, `ContentUiTest`를 참조한다.

기본 7번의 요청 수신 파일은 확보했지만 **VS Code에서 실제로 연 화면 캡처는 별도**다. 기본 3번 등의 주소창 포함 화면·Telnet 터미널·최종 Word 내장 이미지도 지정 방식으로 확인해야 한다. 앱/페이지 본문 캡처나 로그를 주소창·터미널 화면으로 합성하지 않는다.

최신 Coverage HTML은 생성·통계를 검증했지만 새 페이지 화면 캡처는 아직 없다. 현재 브라우저 도구가 `file:` URL을 보안 정책으로 차단했기 때문에, 다른 브라우저 자동화나 파일을 우회 노출하는 방법으로 캡처하지 않았다. 과거 baseline의 97.0% 이미지를 최신 97.3% 이미지로 주장하지 않는다.

PythonAnywhere 기본 12·13 및 새 기능 클라우드 검증은 계정 로그인 후 실제 호스트에서 별도로 확보한다. 제출 시 계정 비밀번호·토큰·CSRF·private config·private 로그를 포함하지 않는다.
