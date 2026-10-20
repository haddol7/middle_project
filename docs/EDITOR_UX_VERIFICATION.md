# 한 화면 모자이크 편집 UX — 준비·검증 상태

2026-10-20. 사용자 iPhone 캡처에서 사진이 화면 대부분을 차지해 아래 도구를 스크롤해야 하는 문제에 대해 화면 구조를 수정했다. **코드·기본 검사·실제 운영 배포 및 후속 Android WebView 배치 검사 완료 / 물리 Safari는 별도**다. 현재 UX 릴리스는 전체 모바일 페이지 정리까지 반영한 `20261020082900cbea43`이다. 아래의 브라우저 미실시 문구는 각 시점의 이력이며 마지막 Android 감사가 현재 상태를 갱신한다. 최초 구조 변경은 이전 릴리스 `202610200709276f1421`의 기록이다. 과거 화면을 최신 UX 증거로 재사용하지 않는다.

## 수정한 동작

- 얼굴 확인 단계만 화면 전체를 사용하는 편집 화면으로 전환한다. 사진은 남은 높이에 맞추고 도구는 한 묶음으로 유지한다. 가로·데스크톱에서는 도구를 사진 옆에 둔다.
- 사진 변경·얼굴 다시 찾기, 이동/선택/그리기, 취소/초기화/전체, 영역 선택·추가·가림 전환·삭제, 강도, 위치/크기 4개 입력, 확대, 완료 버튼을 편집 화면에 배치했다. 숫자 위치 입력은 접힌 details에서 꺼냈다.
- 짧은 화면은 간격·도구 높이를 줄인다. visualViewport 높이 변화와 offset을 반영하며, 웹페이지 자체 확대 시 축소된 viewport에 편집기 크기를 맞추지 않는다. 사진 확대·pinch·전체 초기화 시 확대 슬라이더와 배율 표시를 동기화한다.
- 편집 중 페이지 스크롤을 잠그고 뒤의 header/footer를 inert로 처리한다. 다음 단계나 사진 변경으로 나가면 잠금과 inert를 해제한다. 작업 상태·중단은 편집기 안에서 제공한다.
- 숫자 입력을 비웠거나 잘못 입력했을 때 가림 위치를 0으로 옮기지 않고 기존 값을 복원한다. 위치·크기는 사진 범위 안으로 제한한다. 기본 업로드 폼과 얼굴 인식 모델은 변경하지 않는다.

## 현재 완료한 검사

- Windows Node `tools/local/verify-mobile-web.mjs`: 46개 PASS. viewport fallback·확대·소수 높이와 잘못된 좌표·경계·크기 처리 7개를 추가했다. composer/stage 구문 검사도 통과했다.
- WSL 프로젝트 venv에서 `tools/local/render_editor_fixture.py`: 실제 Django 템플릿 렌더링 통과. 계정 생성·로그인·DB 쓰기 없음.
- `deploy-pythonanywhere.ps1 -PrepareOnly`: 웹 유닛과 WSL `python tools/verify_content.py`의 Django196개·HTTP20개 PASS, check 오류0·migration 변경 없음. 배포 후보 `20261020070229a7eb5f`, 서버 파일140개를 준비했다. **cloud_deployed=false**다.

## 화면 검증 대기 이유와 준비물

CUA의 앱·브라우저 목록이 비어 있다. 다른 자동검증 브라우저를 명령행으로 실행하는 방법에 대해 사용자에게 명시적 사용 요청을 받기 위한 질문을 보냈다. **답변을 받기 전 해당 브라우저를 실행하지 않았다.** 기존 사용자 프로필·로그인·개인 사진을 사용하지 않는다.

실행 준비: `tools/local/serve_editor_fixture.py`(WSL, 127.0.0.1:8767에서 실제 템플릿·정적 파일만 제공, POST/PATCH/DELETE 금지), `tools/local/verify-editor-layout.mjs`(분리된 headless Chromium). 브라우저 사용 승인을 받으면 390×674·393×620·375×548·320×480·844×320·1280×720에서 모든 편집 제어의 화면 내 위치·가림 여부·편집기 넘침·사진 최소 높이를 확인한다. 영역 추가·숫자 수정·강도·토글·확대·다음 단계/복귀·취소/초기화·스크롤 해제도 검사하도록 준비했다.

이 자동 화면 검사 스크립트는 아직 실행하지 않았고 물리 iPhone Safari도 미검증이다. 화면 검증의 미완료를 실제 운영 배포와 구분한다. 사용자 요청에 따라 가능한 필수 검사를 마친 수정본을 먼저 실제 운영에 적용했다. 향후 화면 검증에서 문제가 드러나면 수정과 배포를 이어간다. 실제 배치·동작을 검사하지 않은 상태에서 화면 검증까지 통과했다고 보고하지 않는다.

## 실제 적용 확인

`deploy-pythonanywhere.ps1`로 다시 검증한 웹46개·WSL Django196개·실제 HTTP20개 모두 PASS, check0·migration 변경 없음. PythonAnywhere Bash staging·전환·공개 HTTPS 검증을 완료했다. 릴리스 `202610200709276f1421`의 버전 쿼리가 붙은 composer·stage·editor-controls·CSS 4개와 운영 작성 템플릿의 SHA가 원본과 일치한다. CSS/스크립트의 `editor-fit-1`과 editor-dock 구조도 확인했다. 공개 모델·웹 자산42개 접근·크기·MIME PASS, 기존 공개 글1·2·3 유지. 근거는 `evidence/deployment/editor-ux-deployment.json`과 `public-assets.json`이다. 사용자에게 파일 업로드나 Reload를 요구하지 않는다.

## 후속 UI 간결화와 실제 적용

사용자의 후속 캡처에서 모든 옵션을 한꺼번에 노출한 화면이 복잡해 보이는 문제를 확인했다. 사진과 기본 조작을 한 화면에 유지하며 세부 옵션을 요청할 때 열도록 정리했다.

- 기본 화면은 이동·선택·직접 가리기, 실행 취소, 강도, 확대·맞춤, 다음 버튼으로 구성한다. 영역 선택 시에만 가림 해제·삭제와 선택 강도를 표시한다.
- 상단 더보기 패널에 영역 목록·수동 영역 추가·초기화·얼굴 다시 찾기·위치와 크기 숫자 입력을 모았다. Escape·외부 누르기·닫기 버튼으로 닫고, 분석 중 상단 버튼은 중단으로 전환한다. 기능과 얼굴 모델은 유지했다.
- 숫자 입력을 label 아래 블록으로 배치해 가로로 넘치는 원인을 수정했다. 기본 화면의 도구 행과 설명을 줄여 사진을 볼 공간을 확보했다. 사진 변경·전체 화면·스크롤 잠금·가로 화면 배치는 유지했다.
- Windows Node 웹 유닛46개·composer 구문 검사 PASS, WSL 실제 Django 템플릿 렌더링 PASS. 배포 진입점에서 WSL `python tools/verify_content.py`의 Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음.
- 릴리스 `2026102007340812030a`의 실제 배포 phase=verified를 확인했다. 공개 `composer.mjs?v=editor-simple-2`와 `content.css?v=editor-simple-2`의 SHA가 원본과 일치하며, 운영 작성 템플릿도 일치한다. 더보기·선택 시 도구 구조와 새 캐시 버전이 배포됐으며 기존 글1·2·3이 공개 API에 유지됐다. 증거는 `evidence/deployment/editor-simple-deployment.json`이다.

WSL `python tools/local/verify_pythonanywhere_public.py common01/dist/pythonanywhere-auto-2026102007340812030a.json`으로 공개 정적 자산42개의 접근·크기·MIME PASS를 확인했다. 결과는 `evidence/deployment/public-assets.json`이다.

이 간결화에 대한 실제 브라우저 배치 검사·물리 iPhone Safari 조작은 미실시다. 공개 코드·템플릿의 일치 확인을 시각 검증 완료로 표현하지 않는다. 별도 브라우저 검사 스크립트는 새 더보기 동선에 맞춰 갱신했으나 실행하지 않았다.

## 게시 전 확인 화면의 탭·태그·문구 UX 개선

2026-10-20. 후속 사용자 캡처에서 인식 문구마다 큰 카드·교정 입력·위치 보기 버튼이 반복되어 페이지를 길게 스크롤해야 했다. 테마 select와 쉼표 태그 입력도 선택 상태를 파악하기 어려웠다. 이에 확인 화면을 viewport 안의 글 작성 / 태그 / 검색 문구 탭으로 바꾸었다.

- 사진 미리보기·확인 탭·게시 버튼·선택 개수 요약을 유지하며 해당 탭의 내용만 표시한다. 가로 화면에서는 사진과 입력 영역을 좌우로 배치한다. 글이 길거나 문구가 많으면 해당 영역 안에서만 스크롤한다. 세로 높이가 460px 이하인 키보드 등의 상황에서는 사진을 일시적으로 숨겨 입력 공간을 확보한다. 모든 기기·모든 문구를 스크롤 없이 표시한다고 주장하지 않는다.
- 대표 테마는 한 개를 누르는 버튼, 태그는 선택/해제 상태가 표시되는 칩으로 바꾸었다. 자동 추천에서 해제한 태그는 다시 고를 수 있으며 직접 태그를 추가할 수 있다. Enter·추가 버튼·게시 직전의 입력 확정에 같은 중복 정규화·30자·10개 제한을 적용한다. 잘못된 추가는 기존 선택을 보존한다.
- OCR은 줄당 짧은 행으로 여러 문구를 함께 보여준다. 행을 누르면 사진의 해당 위치와 공용 교정란이 함께 바뀐다. 체크로 개별 포함/제외, 모두 포함/모두 제외, 검색 안 함을 제공한다. 일괄 포함은 기존 서버 한도인 100개까지만 선택하고 나머지 원문은 보존한다. 일괄 제외/복원은 line_id·교정값·origin·quad를 보존한다. 검색 제외가 사진의 실제 글자를 지우지는 않는다.
- 탭 전환 시 제목·본문·태그·교정값을 보존한다. 숨겨진 글 작성 탭의 필수 항목이 비었으면 게시 검증에서 해당 탭을 연다. 태그와 OCR 교정란의 Enter는 게시를 실행하지 않는다. 분석 중 탭은 둘러볼 수 있으나 값 수정은 잠그며 별도 분석 중단을 제공한다. 서버 저장 중에는 분석 중단으로 요청을 취소하지 않는다.
- Windows `node tools/local/verify-mobile-web.mjs`: 53 PASS(새 선택·일괄 처리·packet 회귀 7개 포함). composer 구문 검사 PASS. WSL `python tools/local/render_editor_fixture.py`: 실제 Django 렌더링·중복 ID·composer 요소 참조·3개 tab/panel 연결 PASS. 근거는 `evidence/mobile-web/unit-verification.json`, `unit-tests.txt`, `review-template.json`이다.

`deploy-pythonanywhere.ps1`의 WSL `python tools/verify_content.py`: Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음. 릴리스 `20261020075611be2d07` 실제 배포 phase=verified를 확인했다. 공개 composer·CSS·review-controls의 `review-tabs-1` URL과 운영 작성 템플릿이 Windows 원본 SHA와 일치하며 세 탭·태그·일괄 문구 조작 구조를 포함한다. 공개 정적 자산43개 접근·크기·MIME PASS, 기존 글1·2·3 유지, 개인 사진 게시 없음. 근거는 `evidence/deployment/review-tabs-deployment.json`과 `public-assets.json`이다.

새 UI의 실제 브라우저 배치·터치·키보드·물리 Safari 검사는 미실시다. CUA 목록에 연결된 브라우저가 없었고, 명령행 별도 브라우저를 승인 없이 실행하지 않았다. 코드·템플릿·자산의 공개 일치 확인을 실제 화면 검증 완료로 표현하지 않는다.

## 사용자 요청에 따른 실제 Android 전체 페이지 감사 완료

후속 사용자가 Android를 구동해 스크린샷을 찍으며 페이지별 문제를 먼저 확인하도록 명시적으로 요청했다. 기존 SDK/AVD와 시스템 WebView를 사용하는 로컬 검사 APK로 운영 사이트를 실행했다. 제품 코드 수정 전 원본 화면을 캡처한 뒤 공통 메뉴·목록 검색·계정 폼·사진 선택·상세를 정리했다. 태그 입력/선택 칩의 잘림도 실제 작은 화면 재검사로 찾아 보정했다.

최종 릴리스 `20261020082900cbea43`에서 실제 Android 412×650·412×550의 23개 화면 상태와 50개 레이아웃 조건을 통과했다. 화면 좌표·부모 스크롤 경계·다른 요소의 가림을 함께 검사하고 ADB PNG로 확인했다. 실제 공개 예제의 얼굴1곳·분류/문구 처리·일괄 제외/복원·태그 중복 추가도 실행했다. 별도 실제 키보드를 열어 viewport가 650→503px로 줄어도 태그 입력·추가·게시 버튼이 보이고 가려지지 않음을 확인했다. 최종 원본 캡처는 키보드를 포함해 24장이다.

Windows 웹53개·WSL Django196개·독립 HTTP20개·템플릿 계약 검사는 PASS다. 여섯 운영 템플릿과 공개 composer/CSS의 원본 SHA 일치, 자산43개 접근·크기·MIME, 기존 글1·2·3 유지도 확인했다. 보고서용 결과와 한계는 `docs/MOBILE_PAGE_AUDIT.md`, `evidence/mobile-web/android-ux-audit/{SUMMARY.json,index.html,after/results.json,after/keyboard.json}` 및 `evidence/deployment/mobile-pages-deployment.json`에 보존한다. 물리 Safari·일반 인식 정확도·평가 네이티브 Android 동기화를 이 결과로 완료 처리하지 않는다.
