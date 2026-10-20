# 추가 기능 구현·보고서 준비 기록

2026-10-20 시작. 승인된 [설계](design-20261020/README.md)에 따라 순차 구현한다. 아래 완료 표시는 실제 해당 환경의 검증 결과가 있을 때만 갱신한다.

| 단계 | 범위 | 상태 | 보고서 연결 |
| --- | --- | --- | --- |
| I01 | 기존 기본 계약·환경 확인 | WSL·Android 기본 회귀 통과; 지정 제출 캡처는 별도 | 기본 3–11 |
| I02 | 서버 분류·OCR 내용 검증/저장/교정/검색, 유닛·HTTP 테스트 | WSL 검증 통과; 실제 클라우드 미검증 | E03·E05, T06·T07·T10–T12 |
| I03 | Android 얼굴 탐지·영역 편집·게시 사본 | 실제 에뮬레이터·비행기 모드·수동 터치 회귀 통과 | E01, T01–T03 |
| I04 | Android 분류·OCR·교정·검색 연결 | 유닛·실제 기기·새 UI 전체 흐름 검증 통과 | E02·E04, T04·T05·T08·T09 |
| I05 | 새 주 화면·웹 연결·사용성·기본 회귀 | 웹 테스트·새 UI·기본 Android 회귀 통과; 제3자 사용성 관찰 미실시 | T13·T15 |
| I06 | PythonAnywhere 실제 배포·클라우드 동기화·증빙 | 대기 | 기본 12·13, T14 |

## 기록 원칙

각 단계에 사용자 문제, 구현 위치, 실제 결과, 테스트 명령·수·환경, 캡처/로그 위치, 한계와 미검증 내용을 적는다. 유닛테스트·실제 HTTP·실제 Android·PythonAnywhere 검증을 구분한다. 기존 사진관 버전 캡처와 테스트 수치를 새 기능의 성과로 재사용하지 않는다. 서버는 WSL 가상환경, Android는 Windows에서 검증한다.

## I01 — 환경과 변경 전 계약

- WSL Ubuntu의 `/home/daeha/.venvs/mobile_web_service/bin/python manage.py check`: 오류 0개.
- Windows 샌드박스에서는 WSL 접근이 거부되어, 호스트 권한으로 같은 WSL 환경에서 실행했다. Windows Python으로 대체하지 않았다.
- 기존 Post 응답 7필드·bare array, 웹 업로드, 세션/CSRF·Token 인증·소유권·이미지 크기/형식 검증을 유지한다.
- DB·사진을 삭제하거나 기존 Gallery/DecorLayout을 제거하지 않는다. 새 메타데이터 모델은 추가 migration으로 연결한다.

## I02 — 구현 의도

분류는 사용자가 확정한 테마·태그를 저장하고 재조회한다. 사진 속 문구 검색은 OCR 줄과 좌표를 함께 보관해 검색 출처를 설명한다. 최종 사진 바이트의 digest와 내용 버전을 검증해 사진 교체 후 옛 문구가 검색에 남는 일을 막는다. 무료 PythonAnywhere에서 기존 SQLite와 짧은 HTTP 요청만으로 동작하며 서버에서 인식 모델을 실행하지 않는다.

### 구현과 검증 결과

- 새 모델 PhotoContent/PhotoTag/PhotoTextLine과 추가 migration, 내용 조회·교정·일괄 요약·조건별 목록·OCR 검색을 구현했다. 기존 `/api_root/Post/` 응답 7필드와 JSON 배열은 유지한다.
- 사진과 내용은 한 트랜잭션에 저장한다. digest/크기가 다르면 전체 취소하고 이번 요청의 새 파일을 정리한다. 사진 교체는 이전 태그·검색 줄을 무효화하고 revision은 계속 증가시킨다.
- 독립 규칙 유닛테스트 13개, Django API/저장 테스트 19개, 실제 HTTP 3개, 두 프로세스의 파일 SQLite 동시 수정 테스트 1개를 추가했다(총 36개 추가). 기본·기존 회귀를 포함한 전체는 184개다.
- WSL 명령 `python tools/verify_content.py`: check 오류 0, migration 변경 없음, 전체 184개 PASS, 독립 실제 HTTP 엔진 20개 PASS. Coverage 총합 97.4%·라인 98.6%·분기 93.5%. 테스트 중 소스 변경 없음.
- 검증 로그·명령·당시 소스 SHA-256은 `common01/evidence/content/server/verification.json` 및 같은 폴더의 로그에 보존했다. 원래 baseline 증빙은 덮어쓰지 않았다. Coverage HTML은 `PhotoBlogServer/htmlcov/index.html`이다.
- 실패를 먼저 확인한 사례: 익명 인증 오류를 403으로 고정한 테스트가 실제 Token-first 설정의 401과 달랐다. 타인 수정은 403, 익명은 기존 인증 방식에 따라 401/403을 허용하도록 구분했다. 임의로 인증 설정을 바꾸지 않았다.
- 테스트용 migration 회귀가 과거 migration까지만 복원하면 새 테이블이 사라지므로, 종료 시 최신 migration leaf까지 복원하도록 고쳤다.
- 보고서 설명: “사진에만 있던 문구를 교정해 저장하고 검색하면 원래 줄의 위치를 함께 반환한다. 사진을 바꾸거나 문구를 제외하면 옛 검색 결과가 남지 않도록 파일과 내용 버전을 함께 검증했다.”
- 한계: 아직 Android의 실제 인식 결과와 연결하지 않았으며 PythonAnywhere 운영 성공을 뜻하지 않는다. 최종 화면 캡처·배포 URL·클라우드 동기화 증거는 후속 단계다.

### I02 후속 — 웹 연결 후 재검증

- 웹과 JSON API가 같은 `content_queries.py`의 ORM 검색 조건을 사용한다. 웹 목록에 글자·테마·태그 검색, 상세에 확정 테마·검색 문구 표시를 연결했다. 기본 웹 사진 작성·수정·삭제와 기존 인증을 유지한다.
- WSL `python tools/verify_content.py`: 전체 **187개 PASS**, 독립 실제 HTTP **20개 PASS**. Coverage 총합 **97.3%**, 라인 **98.6%**, 분기 **93.2%**. 웹 검색·교집합·검증 오류·새 내비게이션 테스트 3개가 추가되었다. 이는 위 184개 결과의 후속 기록이다.
- 로컬 DB 추가 migration 전 SQLite backup을 만들었다. 기존 글 **29개**의 author·이미지 경로·SHA-256이 전후 일치했다. `evidence/content/server/migration.json` 참조. 사용자 기존 사진을 삭제하거나 재분류하지 않았다.

## I03–I04 — Android 실제 기능

- `content/MosaicDraft`는 정규화 사각형과 실행 취소·초기화·얼굴별 해제·수동 영역을 관리한다. `PhotoCanvas`는 영역 선택·추가·이동·크기 조절·확대/이동과 보조 이동 버튼을 제공한다.
- `PhotoPipeline`은 방향·투명도를 정리한 작업 사본에서 실제 픽셀을 모자이크하고 JPEG를 인코딩한다. **같은 인코딩 파일을 다시 디코딩해 분류/OCR**에 사용하고 SHA-256과 함께 전송한다. 기기 원본은 변경하지 않는다.
- `VisionEngine`은 bundled 얼굴·이미지 라벨·한글/영문 OCR SDK를 사용한다. `ThemeMapper`는 공개된 라벨 index를 검토해 한국어 테마·태그에 연결하고 낮은 점수·접전에서는 미분류로 둔다. 별도 모델 학습·사용자 설치는 없다.
- 새 MainActivity에서 목록/내 글/작성→얼굴 확인→결과 교정→게시→문구 검색·위치 강조를 제공한다. 기존 3D Activity는 외부 진입이 없는 LegacyStudioActivity로 보존하고 새 내비게이션에서 제외했다.
- `ComposerState`는 큰 Bitmap 대신 앱 전용 파일 경로와 편집 메타데이터를 복원한다. 실제 Activity 재생성 후 제목·사진·교정 상태를 유지하고 게시하는 과정을 새 UI 테스트로 확인했다. 이전 이미지의 늦은 콜백은 GenerationGate로 차단한다.
- **Windows Gradle 유닛테스트 63개 PASS**: 기존 45개 + 새 순수 규칙 18개. 분류 임계값·기권·중복 태그·Unicode 길이·수동 영역 보존·실행 취소·불변 스냅샷·지연 결과 무효화를 다룬다.
- 빌드 명령: `assembleDebug assembleDebugAndroidTest testDebugUnitTest lintDebug --offline --no-daemon`. 최종 빌드 PASS, Lint Error 0개·Warning 9개. 버전 권고·플랫폼 Switch 및 표시 문자열 관련 항목으로 구분하며 무경고라고 주장하지 않는다.
- API35 에뮬레이터 **비행기 모드**에서 얼굴 탐지·실제 픽셀 모자이크·기기 내 분석 테스트 1개 PASS 후 비행기 모드를 해제했다. 원본 불변, 가림 영역 픽셀 변화, 최종 파일 digest를 실제 Android Bitmap/파일로 확인했다.
- `ContentDeviceTest` 최종 **6개 PASS**: 얼굴/모자이크, EXIF 방향·알파, 한글·영문 OCR·상태 복원, Android 세션/CSRF 기반 실제 게시·교정·검색·409·권한·검색 제외, 실제 터치의 수동 영역 추가·이동·실행 취소, 강아지 사진의 자동 동물 테마·태그 추천.
- `ContentUiTest` **1개 PASS**: 실제 OS DocumentsUI에서 사진 선택→얼굴 확인→게시 사본→분류 교정→Activity 재생성→실제 게시→제목·본문에 없는 가게 문구 검색→일치 영역 표시. 원본 화면 6장과 공개 사본을 `evidence/content/android`에 저장했다.
- `LiveRepositoryTest` **3개 PASS**: 기존 Android API·세션·업로드·소유권·실제 소켓 요청 수신 회귀. 212바이트 진단 GET에 Authorization/Cookie/본문이 없음을 검사하고 증거를 보존했다.
- 초기 UI 테스트는 대화상자 제목 ‘로그인’과 실제 버튼의 같은 문구를 구분하지 못해 실패했다. 클릭 가능한 노드를 선택하도록 테스트를 수정한 뒤 통과했다. 로그인이나 실제 업로드 경로를 우회하지 않았다.
- 공개 테스트 사진 출처·SHA-256은 `PhotoViewer/app/src/androidTest/assets/SOURCES.txt`에 기록했다. 신원 식별 기능은 없다.
- 한계: 제한된 고정 사진의 실제 동작 검증이며 대규모 모델 정확도 목표나 다양한 실기기 성능 달성을 의미하지 않는다. 제3자 사용성 관찰과 실제 PythonAnywhere 확인은 별도다.

### I03–I05 최종 확인과 UI 보완

- Android 최종 실행 ID: `20261019-173636-9c9bae3f`(UTC). `tools/verify-android.ps1 -RunDevice`로 **JVM 63개·기기 10개(ContentDevice 6 + ContentUi 1 + LiveRepository 3)** PASS, 빌드 PASS, Lint 오류 0·경고 9. 테스트 중 소스가 바뀌지 않았고 manifest에 소스 94개·APK·당시 화면 6장의 SHA-256을 기록했다.
- 강아지 사진은 사용자 선택 없이 `animal` 테마와 강아지/반려동물 태그를 추천했다. 모자이크한 단일 인물 사진은 미분류였다. 복합 인물·표지판 UI fixture의 음식 테마는 **자동 정답이 아니라 사용자가 교정한 값**이다. 세 결과를 혼동해 모델 정확도를 주장하지 않는다.
- 최종 APK로 비행기 모드 **3개** 검사(얼굴 탐지·실제 모자이크 픽셀, 한글·영문 OCR·상태 복원, 강아지 사진 자동 동물 분류)를 통과했다. 비행기 모드는 검사 전 값으로 복구했다. `offline-check.json`의 APK SHA-256이 최종 빌드와 같다. 이 3개는 기기 10개 중 선택한 별도 오프라인 재실행이며 합쳐서 고유 테스트 13개라고 세지 않는다.
- 실제 Activity 재생성 시 루트 여백이 사라지는 문제를 고쳤다. 기본 18dp 여백과 window inset 재적용을 보장하고 UI 테스트에 여백 복원 검사를 넣었다. 버튼 최소 높이는 48dp, 보조 문구 색 대비를 조정했다.
- POST 성공 후 상세 조회만 실패해도 저장 완료 화면을 유지하도록 분리했다. 전송 결과가 불명확하면 자동 재전송하지 않고 입력을 보존한 채 내 글에서 확인하도록 안내한다. 네트워크 저장 중에는 폼을 비활성화한다. 복구 분기 전부의 장애 주입 테스트를 통과했다고 주장하지 않는다.
- 검색 결과의 revision과 상세의 최신 revision을 비교한 뒤에만 사진 위치를 강조한다. 상세에서 전체 문구 펼침·다른 줄 위치로 이동·접기를 제공한다. 서버의 일치 줄 10개 제한을 넘으면 나머지 개수를 안내한다. 전체 문구를 열고 `CAFE MENU` 줄로 이동·접는 동작을 실제 UI 회귀에 추가했다. 분석·목록·미리보기의 세대 검사와 비동기 종료 정리를 유지한다.
- 최종 UI가 실제로 게시한 글 60번의 이미지를 WSL HTTP로 내려받아 DB 파일·PhotoContent digest와 비교했다. **165,187바이트·1600×1200**, SHA-256 `cb332d20b8c246a5876806a0b9d9c2052a09b87452978ecfb8a40dc1b5c88737`이 일치했다. 교정 테마·검색 문구와 크기 제한도 확인했다. `ui-uploaded-photo.json` 참조.
- 로컬 WSL 서버는 `127.0.0.1:8000`에서 접근 가능하고 임시 소켓 수신기 8002는 검증 후 종료했다. 실제 웹 검색 화면은 `evidence/content/web/photo-text-search.jpg`다.
- 보고서 문장·기능별 구현/증빙은 [REPORT_NOTES.md](REPORT_NOTES.md), 설계 요구별 현재 검증 범위는 [implementation-trace.json](../evidence/content/implementation-trace.json)에 정리한다. 설계 당시 `acceptance.json`은 구현 전 이력으로 보존한다.

## I06 — 배포 후보와 실제 남은 작업

- 서버 소스 95개·577,707바이트의 배포 ZIP과 파일별 SHA-256 manifest를 만들었다. 개발 DB·사진·계정 정보·private 로그는 포함하지 않았다. [배포 후보](DEPLOYMENT_CURRENT.md) 참조.
- 실제 PythonAnywhere 로그인 화면을 열고 사용자 로그인을 요청했다. 현재 로그인·업로드·기존 앱 교체·Reload·클라우드 동기화는 수행하지 않았다. 로컬 통과를 기본 12·13의 완료로 표시하지 않는다.
- 최신 Coverage HTML과 통계는 생성했지만 브라우저 도구가 `file:` URL을 차단해 새 HTML 화면 캡처는 없다. 주소창·Telnet·VS Code 등 지정 방식의 증거, 제3자 사용성 관찰, 최종 Word·GitHub 제출도 미완료로 분리했다.

## 검증 환경에서 발생한 승인 제한과 해결

0.0.0.0 주소의 백그라운드 소켓 수신기는 자동 승인 검토에서 네트워크 노출·민감 헤더 저장 위험 때문에 거부됐다. WSL의 **127.0.0.1 루프백**, 포그라운드 일시 프로세스, Cookie/Authorization을 보내지 않는 진단 GET으로 범위를 줄인 검증은 승인·통과했다. 수신기를 종료하고 8002 리스너가 없음을 확인했다. 외부 인터페이스를 열거나 승인 거부 동작을 다른 경로로 우회하지 않았다.

## I07 — 현재 증거로 Word 보고서 작성

- 제공된 최종 평가서 원본을 보존하고 [작성 중 Word](<../모바일웹서비스 프로젝트 공통평가 01_수행 결과 보고서_작성중.docx>)를 별도로 만들었다. 기본 1–14번 요구사항 문구, 11번의 선택 관계, 교수님 판정란을 유지했다. Android 3·서버 2의 추가 등록 5개를 작성했다.
- 기본 평가 상태, 사용자 문제·조작·결과·직접 구현한 부분, 유닛/HTTP/기기 검사와 수치, 증거·한계를 기입했다. 배포·지정 캡처 대기는 완료로 바꾸지 않았다. 학번·이름·GitHub URL을 추정하지 않았다.
- 문서 9쪽(양식 2·부록 7), 내장 원본 화면 8장. 이미지 바이트 SHA256이 원본과 같고 외부 이미지 링크가 없다. 과거 CodeBeautify 화면은 기본 API 검증 이력으로 구분했다.
- 문서 작업은 Windows의 번들 문서 런타임과 설치된 Microsoft Word 읽기 전용 PDF 변환으로 수행했다. LibreOffice 미설치를 진단한 뒤 documents skill의 render_docx.py에 Word 변환 어댑터를 연결해 전 페이지를 PNG로 검수했다. 이것은 Django/backend 재검증이 아니다.
- 다른 폴더에 DOCX 파일 하나만 복사하고 Word에서 다시 렌더링했다. 9개 페이지 이미지가 원본 위치의 렌더와 일치한다. 원본 평가서·기존 styles/header/footer/numbering/customXml 파트도 보존했다.
- 표·이미지·한글·줄 간격·페이지 넘김을 검수하고 고아 문단을 정리했다. [문서 검수 원본](../evidence/content/report-draft-verification.json) 참조. 실제 PythonAnywhere 동작과 최종 제출 완료를 뜻하지 않는다.

## I08 — 모바일웹의 세 기능 구현과 실제 검증

- 모바일웹을 단순 목록·검색으로 한정했던 범위를 바로잡았다. 새 작성·수정 화면에 사진 선택/촬영 입력 → 자동 얼굴 탐지·실제 모자이크·수동 편집 → 같은 공개 사본의 테마/태그·한영 OCR → 교정·제외 → 게시를 구현했다. 상세에서 digest가 일치할 때만 문구 좌표를 표시하고 검색어의 일치 줄을 강조·확대한다.
- `blog/static/blog/content/`에 규칙·이미지 파이프라인·편집 Canvas·브라우저 worker·작성·상세 모듈을 두었다. MediaPipe 1.1.1, EfficientNet Lite0, Tesseract 7 한국어/영문 모델을 공식 출처에서 고정하고 약 70 MB 자산의 출처/라이선스/버전/digest를 `vendor/content/SOURCES.json`에 기록했다. `tools/local/prepare-web-vision.mjs`로 재현한다. CDN·외부 인식 서비스·서버 추론·사용자 모델 설치/학습이 필요 없다.
- 불확실한 추천은 미분류, 수동 수정 보존, 늦은 결과 차단, 분석 중단·재시도, 영역별 해제·강도·실행 취소·초기화, 확대·이동·터치 좌표, 제외 문구 미전송을 제공한다. 전송 중 폼을 고정하고 불명확한 응답의 자동 재전송을 차단한다. 기존 no-JavaScript 기본 업로드와 세션/CSRF/소유권·평가 배열 API를 유지했다.
- Windows Node 순수 규칙 **21개 PASS**, 신규 Django 모바일웹 **9개 PASS**. WSL의 `python tools/verify_content.py` 최종 **196개·독립 HTTP 20개 PASS**, check 0·migration 변경 없음·소스 변경 없음. Coverage 총합 97.3%·라인 98.6%·분기 93.3%. Android 코드는 이번 웹 작업에서 변경하지 않았으며 Android 검증 기록은 이전 최종 실행을 유지한다.
- 실제 Chromium에서 얼굴 모델·픽셀 변화·원본 보존·게시 사본 digest·동물 테마·한국어 태그·한영 OCR·좌표 **9개 검사 PASS**. 강아지 모델 점수가 여러 견종으로 분산되는 것을 관찰해 상호 배타 softmax의 하위 클래스 질량을 합산했다. 모르는 클래스의 질량을 재정규화하거나 복합 사진을 자동 음식 정답으로 기록하지 않았다.
- 390×844와 844×390 화면에서 실제 OS 파일 선택·자동 얼굴 1곳·가림 해제/실행 취소·수동 추가/취소·문구 교정/노이즈 제외·게시·검색 강조·재수정/제외를 확인했다. 글 **61**의 사본 **183,281B·1600×1200**, 서버 SHA256과 일치. 문구 3→2줄 revision 1→2, SUNSET 제외 후 검색 사라짐·사진 바이트 유지. `evidence/mobile-web`에 원본 캡처·모델 결과·HTTP 교차 검증을 보존했다.
- 상세의 함수명 location 충돌을 실제 UI에서 발견해 고친 뒤 상대 URL·사진 강조를 재검증했다. 화면 크기 변경은 실제 아이폰 Safari 검증이 아니다. 실제 iPhone·PythonAnywhere static/worker/HTTPS 검증은 로그인·배포 후 진행한다. 브라우저 오프라인 재시작·모든 제스처·장애 조합 검증도 완료로 주장하지 않는다.
- 배포 후보를 모바일웹 모델/런타임을 포함한 **137파일·28,348,782B** ZIP으로 갱신했다. 압축 전 모델/런타임은 약 70 MB다. 실제 업로드·활성화는 하지 않았다. Word 초안은 **10쪽·원본 이미지 10장**으로 갱신해 전 페이지를 검수했고, 다른 폴더의 DOCX 하나만으로 동일하게 렌더링되는 것을 확인했다. 과거 I06/I07의 95파일·9쪽 기록은 이전 버전 이력이다.

## I09 — PythonAnywhere 로그인과 배포 사전 점검

사용자 로그인 후 기존 Python 3.13 앱 설정을 읽고 최신 ZIP·manifest·보조 스크립트를 업로드했다. 실제 Bash에서 137개 파일 digest를 검증했다. 브라우저의 저장된 사이트 권한 차단으로 백업·새 환경 구성·공개 앱 전환 전 중단했다. 대화상 재승인만으로 저장된 차단이 해제되지 않았다. 기존 운영 코드·DB·WSGI/Web 설정은 변경하지 않았고 실제 배포 성공으로 표시하지 않는다. 상세는 DEPLOYMENT_CURRENT.md와 evidence/deployment/preflight.json을 참조한다.

## I10 — 공식 API 인증·자동 배포 및 실제 재배포 검증 (2026-10-20)

- 사용자가 매번 업로드하지 않도록 공식 API 인증과 자동 배포를 명시적으로 요청했다. 사용자가 PC의 가린 입력창에 토큰을 직접 넣었고, WSL에서 공식 API 인증을 확인한 뒤 홈의 0700 디렉터리/0600 파일에 저장했다. 비밀번호·토큰을 대화·명령줄·ZIP·보고서로 받거나 기록하지 않았다. 이전 브라우저 쿠키와 차단된 관리 UI를 재사용하지 않았다.
- Windows PowerShell 5의 입력 스트림이 UTF-8 BOM을 붙이는 오류를 더미 값으로 재현해 고쳤다. WSL에서 Windows 실행 파일을 직접 시작할 수 없는 점을 확인해 Windows Node 웹 검증 → 파일 전체 digest/시각 확인 → WSL 서버 검증/배포로 나눴다. Windows Python을 백엔드 검증에 사용하지 않았다.
- `tools/local/deploy-pythonanywhere.ps1`, `pythonanywhere_deploy.py`, `pythonanywhere_remote.py`로 검증·소스 안정성 확인·137파일 패키징·공식 API 업로드·PythonAnywhere Bash 준비·기존 앱 전환·HTTPS 확인까지 연결했다. 기존 사이트 전체/WSGI/SQLite 백업과 private 운영 설정, digest별 venv, 릴리스별 source, 공유 DB/media, hardlink 정적 자산 및 최근 두 릴리스 보존을 구현했다.
- 첫 전환에서 검증기의 composer.js/.mjs 불일치로 이전 라우팅/WSGI가 복구됐다. 실제 파일명 검증과 digest 회귀 테스트를 추가하고 staged 릴리스를 재개해 성공했다. 같은 인증을 재사용한 정상 진입점의 두 번째 배포 `2026102004523169f8f8`도 사용자 업로드·Reload·재인증 없이 완료했다. 이후 프로젝트 수정 시 에이전트가 배포까지 수행하는 규칙을 AGENTS.md에 기록했다.
- WSL 인증/배포 유닛 **38 PASS**. WSL 서버 **196개·독립 HTTP 20개 PASS**, check 오류 0·migration 변경 없음·소스 안정성을 확인했다. Windows 웹 규칙 **21 PASS**. PythonAnywhere Bash Python 3.13.1에서 의존성·pip check·migration·collectstatic·WSGI import가 통과했다. 운영 check는 오류 0·기존 HSTS 하위 도메인/preload 경고 2개다.
- 공개 `https://daejinha.pythonanywhere.com/`의 목록·로그인·평가 배열 API·현재 composer.mjs가 200이고 코드 digest가 일치했다. 모델/실행 자산 **39개**의 접근·크기·MIME도 모두 확인했다. 서버 측 최종 감사에서 기존 글 **2개**, 계정 **1개**, 사진 파일 **4개** 및 원본 사진 digest 전부 보존, SQLite 정상, DB/venv 재사용, private 운영 설정과 최초 전체 백업 보존을 확인했다.
- 홈 사용량 **317,392 KiB(약 310 MiB)**. 후속 collectstatic의 NFS 쓰기 대기를 진단했으며 최종 작업은 완료됐다. 모델 자산은 브라우저에서 실행하고 서버 추론/외부 워커/추가 호스팅/사용자 모델 설치·학습을 도입하지 않았다.
- 증거는 `evidence/deployment/{automation-tests,first-automated-deployment,redeployment,production-preservation,public-assets}.json`. 실제 iPhone Safari 조작과 배포 서버에 대한 Android 실제 동기화는 아직 별도다. Word는 기존 작성 중 초안이며 이번 배포 결과는 보고서 메모에 먼저 기록했다.
- 이후 사용자가 제목·본문이 있는 테스트 게시글 등록과 관리자 권한 확인을 요청했다. PythonAnywhere Bash에서 기존 활성 Django 계정의 is_staff/is_superuser가 모두 true임을 확인하고, 그 계정의 기존 게시글 서비스로 글 3번 `[배포 테스트] 사진 블로그 업데이트 확인`과 생성된 테스트 PNG를 등록했다. 비밀번호·계정 권한·기존 글은 변경하지 않았다. 공개 상세/이미지 HTTP 200, 제목·본문 노출, 사진 digest 및 평가 API 일치를 확인했다. 원본 데이터 보존 감사 시점의 글 2개에서 사용자 요청으로 3개가 된 것이며 증거는 `evidence/deployment/test-post.json`이다. 웹 UI 로그인이나 얼굴/OCR 조작을 수행한 검사로 표현하지 않는다.

## I11 — 메인 제목 이스터에그와 실제 변경 배포 검증 (2026-10-20)

- 사용자가 메인 제목 영역에 이스터에그를 넣어 실제 코드 변경의 PythonAnywhere 반영을 확인하도록 요청했다.
- `post_list.html`에서 기존 제목을 모양을 유지하는 기본 button으로 바꾸고 5회 연속 누르면 사진 이야기 카드가 나타나도록 구현했다. 누르는 간격이 4초를 넘으면 횟수를 다시 센다. 카드의 ‘다시 숨기기’, aria-expanded/controls, 키보드 기본 버튼 조작, focus-visible 및 reduced-motion을 지원한다. 서버 데이터는 변경하지 않는다.
- 배포 전 WSL `python tools/verify_content.py`: Django 196개·실제 HTTP 20개 통과, check 오류 0·migration 변경 없음. Windows `node tools/local/verify-mobile-web.mjs`: 21개 통과. `deploy-pythonanywhere.ps1`로 릴리스 `2026102005121116c05a`를 실제 PythonAnywhere에 배포했다. 공개 목록·로그인·평가 배열 API·composer.mjs 200 확인, 배포된 template SHA256이 Windows 원본과 일치한다.
- 실제 공개 페이지의 인앱 Chromium에서 최초 숨김, 4회 클릭까지 숨김, 5회에 공개, ‘다시 숨기기’, Enter 5회로 다시 공개를 확인했다. aria-expanded=true와 렌더된 카드 opacity=1도 확인했다. 공개 페이지 캡처와 결과는 `evidence/deployment/easter-egg-{browser.json,browser.jpg,detail.jpg,deployment.json}`에 보존했다. 물리 iPhone Safari 검사로 표현하지 않는다. 기존 게시글 3개도 공개 목록에 유지됐다.

## I12 — 실제 단체사진의 얼굴 누락 재현과 수정 (2026-10-20)

- 사용자가 첨부한 960×1280 사진에서 기존 브라우저 탐지 결과 **0곳**을 재현했다. 눈으로 확인되는 얼굴은 11개다. 원본을 static·소스·배포 ZIP에 넣거나 공개 게시하지 않고, 파일 선택기로 브라우저 메모리에만 읽어 검사했다.
- 기존 BlazeFace short-range 사전 학습 모델은 유지했다. 전체 사진과 겹치는 다중 크기 구역을 검사하고, 발견한 작은 얼굴 주변을 한 번 더 검사한다. 이미지 전체 좌표로 환산하고 중복 얼굴의 가림 범위를 합친다. 최대 40회 탐지·100영역으로 처리량을 제한하고 하나의 탐지기를 재사용·종료한다. 추가 서버 추론·설치·학습·유료 API는 없다. 참고: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/face_detection.md
- worker의 하위 모듈에 오래된 코드가 남는 캐시 문제도 관찰했다. 작성 페이지 → composer → vision → worker/engine → face-scans에 명시적 버전 URL을 연결했다. 처리 버전은 `mp_blazeface_sr1_tiles_v4`다.
- 로컬 실제 worker·작성 화면에서 **11곳 자동 탐지**, 11영역 모두 실제 모자이크 픽셀 변화, 원본 픽셀 보존을 확인했다. 검증 화면은 DEBUG에서만 열리며 개인 사진을 서버로 제출하지 않는다. 첫 확대 시각 검사에서 모든 얼굴이 가려지는 것을 확인했다.
- 구역 경계·예산·좌표 환산·범위 제한·중복 범위 합집합·가까운 다른 얼굴 분리·confidence·정밀 검사에 관한 유닛 10개를 추가해 Windows Node **31개 PASS**. 검증기의 검사 개수는 TAP 결과에서 읽도록 바꿨다. 실제 브라우저의 기존 얼굴/픽셀·동물 분류·한영 OCR **9개 PASS**(기존 인물 예제는 얼굴 1곳). 배포 전 WSL Django **196개**, 독립 HTTP **20개 PASS**, migration 변경 없음·check 오류 0.
- 증거: `evidence/mobile-web/face-group-before.json`, `face-group-after.json`, `face-group-local-mosaic.jpg`, `browser-models-facefix.json`, `unit-verification.json`. PythonAnywhere 릴리스 `202610200554583af100`의 공개 작성 화면에서도 같은 사진의 얼굴 11곳이 모두 자동 가림 상태임을 확인했다. `face-group-pythonanywhere.json`과 `face-group-pythonanywhere.jpg`에 실제 결과를 보존했다. 사진은 게시하지 않았고 임시 검증 탭을 닫았다. 공개 자산 41개 접근·크기·MIME도 통과했다. 브라우저는 Chromium이며 실제 iPhone Safari 검사로 표현하지 않는다.

## I13 — 추가 공개 사진 평가 준비, 실제 실행은 브라우저 연결 대기 (2026-10-20)

- 사용자의 추가 사진 수집·검사 요청에 따라 공개 사진 16장을 내려받았다. dlib 예제 9장에 공식 얼굴 사각형 43개가 있으며, 근접 인물·NASA 7인 단체·동물·건물·과일·흐릿한 군중 사진을 추가했다. `evidence/mobile-web/public-face-corpus/sources.json`에 URL·SHA256, `cases.json`에 원본 크기·정답을 보존했다. 원본은 앱·배포 ZIP에 추가하거나 공개 게시하지 않았다.
- WSL `python tools/local/prepare_face_corpus.py`로 JPEG 16장과 모든 다운로드 digest 및 주석 파싱을 확인했다. Windows Node `--check common01/web-tests/face-corpus.mjs` 구문 검사 통과. 이 검사를 얼굴 모델 실행이나 정확도 검증으로 표현하지 않는다.
- `web-tests/face-corpus.html` 및 `.mjs`에 실제 WebVision으로 순차 검사하고 일대일 IoU 대응·누락·오탐·가림 픽셀 변화·원본 보존·시간을 기록하는 로컬 검사 화면을 준비했다. 제품 동작은 변경하지 않았다. 화면 자체도 아직 브라우저 실행 미검증이다.
- 당시 CUA가 사용 가능한 브라우저 0개를 반환했고 사용자가 지금 브라우저를 열 수 없다고 답했다. 이 준비 시점에서는 모델 실행 미완료였다. 아래 후속 CPU 검사가 이 상태를 갱신하며 브라우저 실행은 여전히 별도다.

## I14 — 공개 16장 실제 CPU 추론: 비인물 오탐·중복 발견 (2026-10-20)

- 사용자 재개 요청 후에도 브라우저 연결이 없어서, WSL 홈의 독립 검사 venv에 MediaPipe 0.10.32와 headless OpenCV를 설치했다. Django venv·서버 requirements·PythonAnywhere 의존성은 변경하지 않았다. 앱의 동일 tflite 파일과 실제 face-scans/pipeline 함수들을 Node bridge로 호출했다. 명령은 검사 venv의 `python tools/local/evaluate_face_corpus.py`이며 종료 코드 0, 16장 오류 0, 소스 hash 및 원본 이미지 바이트 불변을 확인했다.
- 주석 43개 모두 가림 영역 하나에 80% 이상 포함됐다(전체 사진 1회 기준은 17개). IoU≥0.3 최대 일대일 대응은 TP37/FN6/FP16이다. 과도하게 큰 영역은 얼굴을 덮어도 IoU 대응에 실패하므로 FN6을 미가림 얼굴 6개로 보고하지 않는다. 얼굴 없는 사진 4장 중 강아지5영역·원숭이2영역·건물1영역이 오탐됐으며 과일은 0이었다. NASA 7인 사진은 8영역으로 얼굴 하나가 중복됐다.
- 육안 진단에서 벽·식탁 물체·손·의상 오탐, 큰 가림 합집합과 중복이 확인됐다. 현재 일반 품질은 개선 필요이며 한 사용자 사진 성공만으로 완료라고 판단할 수 없다. 제품 임계값이나 모델·코드는 이번 검사에서 변경하지 않았고 새 배포도 하지 않았다.
- 근거: `evidence/mobile-web/public-face-corpus/RESULTS.md`, `wsl-results/results.json`, 구역별 raw JSON과 좌표 진단 이미지. Python native와 browser WASM, Pillow와 canvas의 차이를 명시했다. 이번 결과는 canvas 모자이크·worker·Safari·실제 배포 UI 검증이나 Django 유닛 검사로 합산하지 않는다.

## I15 — 얼굴 후보 재확인·중복 억제 개선과 배포 (2026-10-20)

- 사용자 개선 요청에 따라 후보를 2배·3배 주변 범위에서 같은 모델로 재확인하고 confidence 0.8 및 위치 대응 조건을 적용했다. 단순 confidence 상향으로 사람을 잃지 않도록 개발 표본에서 확인했고 별도 공개 사진에서도 검증했다. 낮은 점수까지 포함한 후보 단계는 작은 얼굴의 대안을 보존하며, 최종 단계에서는 강한 좌표를 남기고 겹친 범위를 합치지 않는다. 처리량은 초기·정밀 40회 + 후보 100개×최대 2회 = 최대 240회, 최종 100영역으로 제한한다. 추가 모델·서버 추론·외부 인식 API는 없다.
- 기존 16장: 주석 43개 가림 포함 유지, IoU 대응 TP43/FN0/FP0(이전 TP37/FN6/FP16), 비인물 오탐 강아지5·원숭이2·건물1이 모두 0으로 감소, NASA 8영역→7영역. 별도 7장에서는 24얼굴 collage 24곳·2인 2곳·측면/근접 각1곳·그래피티/스도쿠/다른 강아지 각0곳. 기존 브라우저용 인물 fixture도 추가해 1곳 유지. 사용자 사진도 11곳 유지했다. 이는 WSL CPU native + 실제 앱 JavaScript geometry 결과이며 브라우저 WASM·canvas 검사를 대신하지 않는다. 식당 사진의 주석 밖 후경 작은 얼굴처럼 여전히 제외되는 사례를 한계로 남겼다.
- Windows Node 웹 유닛 39개 PASS(기존 31개에서 8개 추가), engine 구문 검사 통과. 배포 진입점에서 WSL `python tools/verify_content.py`: Django 196개·독립 HTTP 20개 PASS, check 0·migration 변경 없음. 유형별 검사를 유닛으로 합산하지 않는다.
- 릴리스 `20261020062224e8ef72` 실제 자동 배포 완료. 목록·로그인·평가 API·composer 200, 버전 쿼리가 붙은 주요 모듈 5개의 공개 SHA와 운영 작성 템플릿 SHA 일치, 정적 자산 41개 접근·MIME·크기 PASS. 모델 처리 버전은 `mp_blazeface_sr1_confirm_v5`, 하위 모듈 cache version은 `face-confirm-5`. 원본 글 1·2·3 유지, 개인 사진 게시 없음.
- 근거: `evidence/mobile-web/public-face-corpus/IMPROVEMENT.md`, `wsl-improved/results.json`, `public-face-holdout/wsl-improved/results.json`, `private-face-regression/results.json`, `evidence/deployment/face-confirmation-deployment.json`. 이번 v5의 실제 브라우저 얼굴 처리·물리 iPhone Safari는 미검증이며 v4의 과거 화면을 v5 증거로 재사용하지 않는다. 보고서 메모를 갱신했으며 Word 초안은 별도다.

## I16 — 한 화면 모자이크 편집 구조 수정, 화면 검증·배포 대기 (2026-10-20)

- 사용자의 스크롤 불편 캡처에 따라 얼굴 편집 단계에 viewport 크기 편집기를 적용하고 모든 편집 도구를 사진 아래/옆 dock으로 모았다. 숨겨진 위치·크기는 숫자 입력 4개로 노출했다. 상세 변경·검증·재개 절차는 `docs/EDITOR_UX_VERIFICATION.md`에 기록했다.
- 웹 유닛46개·WSL Django196개·실제 HTTP20개·check/migration 일관성·템플릿 렌더링을 통과했다. 배포 후보 `20261020070229a7eb5f`는 prepare-only이며 운영 전환은 하지 않았다.
- CUA 브라우저가 없어 별도 자동검증용 브라우저의 명령행 실행에 대해 사용자 응답을 요청했다. 아직 답변이 없으므로 대체 브라우저를 실행하지 않았고 실제 배치·동작 검증/운영 배포는 미완료다. 이전 얼굴 v5 배포나 그 진단 그림을 이 UX 변경의 화면 증거로 재사용하지 않는다.

## I17 — 사용자 즉시 적용 지시에 따른 UX 실제 배포 (2026-10-20)

- 사용자가 기능·UX 수정은 바로 적용해야 휴대폰에서 볼 수 있다고 재차 지시했다. 별도 브라우저 응답을 기다리는 것을 배포 중단 사유로 삼지 않고 기존 승인된 자동 배포를 진행했다. 이 선호를 `docs/AUTOMATIC_DEPLOYMENT.md`에 명시했다.
- `deploy-pythonanywhere.ps1`: Windows 웹46개·WSL Django196개·실제 HTTP20개 통과, check0·migration 변경 없음. 릴리스 `202610200709276f1421` 실제 배포 완료. 공개 목록·로그인·평가 API·composer 200, 버전 쿼리의 편집기 모듈/CSS4개와 운영 작성 템플릿 SHA 일치, 정적 자산42개 접근·크기·MIME PASS. 기존 공개 글1·2·3 유지, 개인 사진 게시 없음.
- 증거는 `evidence/deployment/editor-ux-deployment.json`, `public-assets.json`. I16의 운영 배포 대기 상태를 이 기록이 갱신한다. 별도 브라우저 배치 검사·실제 Safari는 아직 실행하지 않았으며 실제 사이트 코드 적용 성공과 구분했다. 보고서 상세는 `docs/EDITOR_UX_VERIFICATION.md`에 갱신했다.

## I18 — 모자이크 편집 UI 간결화와 실제 배포 (2026-10-20)

- 사용자가 한 화면 편집기 캡처를 보내 UI가 복잡하다고 지적했다. 기본 화면은 사진·이동/선택/직접 가리기·실행 취소·강도·확대/맞춤·다음으로 정리하고, 가림 해제·삭제는 영역 선택 시에만 표시하도록 변경했다.
- 더보기 패널에 영역 목록·영역 추가·초기화·얼굴 다시 찾기·위치/크기 숫자 입력을 옮겼다. Escape·외부 누르기·닫기와 초점 복귀, 분석 중 중단 버튼을 연결했다. 숫자 입력을 블록으로 배치해 가로 넘침 원인을 수정했다. 얼굴 모델·서버 기능·기존 편집 기능은 유지했다.
- Windows Node 웹 유닛46개 및 composer 구문 검사 PASS. WSL 실제 Django 템플릿 렌더링 PASS. 자동 배포의 WSL `python tools/verify_content.py`에서 Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음. 새 테스트 개수를 단순 UI 변경에 부풀려 추가하지 않았다.
- 릴리스 `2026102007340812030a` 실제 PythonAnywhere 배포 phase=verified를 확인했다. 공개 composer/CSS의 `editor-simple-2` URL SHA와 운영 작성 템플릿이 Windows 원본과 일치하고 더보기·선택 도구 구조가 포함됐다. 공개 정적 자산42개 접근·크기·MIME PASS, 공개 글1·2·3 유지, 개인 사진 업로드 없음. 증거는 `evidence/deployment/editor-simple-deployment.json`과 `public-assets.json`이다.
- 실제 브라우저 배치·물리 Safari 조작은 미실시다. 새 패널 동선에 맞춰 선택적 브라우저 검사 스크립트를 갱신했으나 실행 성공으로 기록하지 않았다. `docs/EDITOR_UX_VERIFICATION.md`·배포 현황·보고서 메모를 갱신했으며 Word 초안 갱신과 구분한다.

## I19 — 게시 전 확인 탭·태그 칩·밀도 높은 OCR 목록 (2026-10-20)

- 사용자 캡처의 큰 OCR 카드 반복과 긴 페이지 이동, 태그 선택 상태의 불명확함을 개선했다. 확인 단계를 글 작성/태그/검색 문구 탭으로 나누고 사진 미리보기·게시 버튼·선택 수를 공통 영역에 유지했다. 가로 화면은 사진과 편집 영역을 좌우로 배치하며 많은 내용은 탭 내부에서 스크롤한다. 아주 낮은 viewport에서는 사진을 숨겨 입력 공간을 확보한다.
- 테마 단일 선택과 태그 선택/해제를 칩으로 표시한다. 추천 해제 후 재선택, 직접 추가, Enter로 추가, 게시 직전 미확정 입력 반영을 연결했다. 기존 정규화·길이·10개 한도를 유지하며 잘못된 추가로 이전 선택이 사라지지 않는다.
- OCR은 여러 짧은 행과 공용 교정란을 사용한다. 행 선택 시 사진 위치에 초점을 맞추고 문구를 교정한다. 개별·전체 포함/제외, 검색 안 함을 제공한다. 일괄 포함은 100개 한도이며 제외/복원 시 ID·좌표·교정·origin을 보존한다. 빈 필수 글 항목은 해당 탭을 열어 안내하고 Enter 교정/태그 입력으로 갑자기 게시하지 않도록 했다.
- Windows Node `verify-mobile-web.mjs`: 53개 PASS(선택·일괄 처리·서버 packet 회귀 7개 추가), composer 구문 검사 PASS. WSL `render_editor_fixture.py`: 실제 템플릿·71개 고유 ID·54개 composer 요소 참조·3개 tab/panel 연결 PASS. 배포 진입점의 WSL `python tools/verify_content.py`: Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음. 검사 유형을 모두 유닛으로 합산하지 않는다.
- 코드·검사 근거는 `blog/static/blog/content/review-controls.mjs`, `web-tests/content-rules.test.mjs`, `evidence/mobile-web/{unit-verification.json,unit-tests.txt,review-template.json}`이다. 실제 브라우저 배치·터치·키보드·물리 Safari 검사는 미실시이며 공개 배포 결과와 구분한다. 상세 UX 기록은 `docs/EDITOR_UX_VERIFICATION.md`, Word 초안 수정은 별도다.
- 릴리스 `20261020075611be2d07`의 실제 배포 phase=verified를 확인했다. 공개 composer·CSS·review-controls의 새 버전 URL 및 운영 작성 템플릿 SHA 일치, 공개 정적 자산43개 접근·크기·MIME PASS, 기존 공개 글1·2·3 유지. 증거는 `evidence/deployment/review-tabs-deployment.json`과 `public-assets.json`이다. 사용자에게 파일 업로드·Reload를 요구하지 않았다.

## I20 — Android 화면별 사전 점검과 모바일 페이지 공통 UX 개선 (2026-10-20)

- 사용자가 먼저 실제 Android를 구동해 캡처하며 수정할 페이지를 확인하도록 지시했다. 제품 코드를 바꾸기 전에 API35 AVD를 실행하고 공통 메뉴·목록/빈 검색·로그인/가입·상세·사진 선택·수정 검토·공개 예제 얼굴/분류/OCR 단계를 캡처했다. Chrome 초기 설정 동의를 대신 수행하지 않고 기존 시스템 WebView로 로컬 검사 APK를 만들었다. 평가 Android 앱과 서버 동기화 구현은 교체하지 않았다.
- 공통 메뉴의 줄바꿈을 없애고 보조 계정 조작을 메뉴로 모았다. 목록 소개·검색을 줄이고 테마/태그 필터를 펼쳐 사용하는 구조로 바꾸었다. 계정 폼과 상세 여백·사진 크기를 정리하고 회원가입의 폐기된 사진관 용어를 정정했다. 기본 웹 폼·CSRF·서버 가입/검색 검증은 유지한다.
- 사진 선택을 편집·검토와 같은 viewport 작업 화면으로 바꾸고 상태·중단·취소를 연결했다. 긴 형식 설명은 펼쳐 보게 했다. Android 재검사에서 찾은 550px 태그 입력/선택 칩 잘림도 보정했다. 위치만 화면 안인지 보는 데서 나아가 부모의 잘림 경계와 다른 요소의 실제 가림을 확인했다.
- Windows 웹 유닛53개·composer 구문 검사와 WSL 실제 템플릿 계약 검사를 통과했다. 자동 배포에서 WSL `python tools/verify_content.py`: Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음. UI 변경에 반복 구현 검사를 억지로 추가하지 않고 실제 Android 화면·조작 검증을 별도로 수행한다.
- 구현 전 캡처와 수정 대상 표는 `docs/MOBILE_PAGE_AUDIT.md`, `evidence/mobile-web/android-ux-audit/before/`에 보존했다. 첫 배포 후 목록 사진 시작 y614→242px·메뉴136→61px·가입 완료 버튼 하단921→463px를 실측했다. 전체 결과는 마지막 배포의 Android 결과와 공개 URL 검증 기록에 이어서 정리한다. Word 초안 수정과 물리 Safari 검사는 별도다.
- 최종 릴리스 `20261020082900cbea43` 실제 배포·공개 검증 완료. 여섯 템플릿과 공개 composer/CSS SHA 일치·자산43개·기존 글1·2·3 유지 PASS. 실제 Android 412×650/550에서 23개 화면 상태·50개 조건 PASS, 키보드가 열린 503px viewport에서도 태그 입력·추가·게시 버튼의 위치/가림 검사 PASS. 키보드 포함 원본 PNG24장과 SHA를 `evidence/mobile-web/android-ux-audit/SUMMARY.json`에 연결했다. 얼굴1곳·OCR/분류·문구 제외/복원·태그 중복 추가를 실제 엔진으로 실행했으며 게시하지 않았다. 사용성 관찰·물리 Safari·평가 네이티브 동기화와 구분한다.

## I21 — 한 화면에 여러 게시글을 보여주는 모바일 2열 목록 (2026-10-20)

- 사용자가 한 게시글의 큰 사진과 긴 본문 때문에 다른 글이 보이지 않는 캡처를 제시했다. 목록을 모바일 2열 썸네일 그리드로 변경하고 제목은 최대 두 줄, 작성자·짧은 날짜·테마/태그는 짧은 행으로 정리했다. 목록 본문 미리보기를 제거하며 실제 전체 본문은 상세에서 그대로 제공한다. 긴 제목 전체는 링크 title·사진 alt와 상세에서 보존한다.
- `.post-grid` 범위로 스타일을 제한하고 작은 폭에서도 두 열이 넘치지 않도록 `minmax(0,1fr)`·텍스트 생략을 적용했다. 데스크톱은 공간에 따라 여러 열이다. 검색 조건·태그·테마·상세 링크의 q·페이지 이동·기존 글과 API 배열 계약을 유지한다. 빈 검색 결과는 전체 그리드 폭을 사용한다.
- 첫 배포 `20261020090144b70b46`에서 Windows 웹53개·WSL Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음. 실제 Android WebView의 native 크기를 393×650·393×550·320×550으로 바꾸어 두 열, 카드 두 개 이상 완전 표시, 사진 세 개 표시, 가로 넘침 없음과 상세의 원본 사진·전체 본문 접근을 확인했다. 로컬 검사 APK의 폭 조절은 테스트 전용이며 평가 Android 앱이나 운영 구조 변경이 아니다.
- 증거는 `evidence/mobile-web/post-grid/results.json`·세 화면 PNG와 `evidence/deployment/post-grid-deployment.json`이다. Windows Node 순수 규칙 수53에 UI 검사를 합산하지 않는다. 물리 iPhone Safari·평가 Android 네이티브 동기화·Word 초안 수정은 별도다.
- 최종 릴리스 `2026102009071884b927` 실제 배포 phase=verified. 최종 템플릿 SHA가 원본과 일치하고 공개 썸네일3개·기존 글1·2·3을 확인했다. Android 세 크기에서 두 카드 이상 완전 표시·세 사진 표시·가로 넘침 없음, 빈 검색 안내의 전체 너비, 상세의 원본 사진·전체 본문 접근 모두 PASS. 빈 검색 보정 후에도 Windows 웹53개·WSL Django196개·HTTP20개·check0·migration 변경 없음으로 검증했다. 사용자 게시글/계정/미디어 변경 없이 적용했다.

## I22 — 배경 무늬의 OCR 오탐과 검색 자동 포함 개선 (2026-10-20)

- 배경 사진에서 178개 OCR 결과·100개 자동 포함되는 사용자 화면을 확인했다. 원본 배경 파일은 첨부되지 않았으므로 원본 재현으로 주장하지 않는다. 기존 줄 신뢰도25·첫100개 자동 포함을 원인으로 확인했다.
- 문자 구성·줄/단어 신뢰도·좌표를 검사한 후 후보 crop을 한 줄 모드로 재인식해 일치 여부를 확인한다. 검증된 고신뢰 결과만 자동 포함하고 중간 수준은 미선택, 불안정한 결과는 제외한다. 재확인은 최대100개, 읽기 순서·수정·제외·선택 결과만 전송하는 계약·중단 처리를 유지한다. 모델이나 PythonAnywhere 추론 의존성을 추가하지 않았다. OCR 버전/캐시 경로를 `ocr-confirm-1`로 구분했다.
- Windows 웹 유닛62개 PASS, 실제 Android에서 캡처한 잔디 오탐5개를 고정 회귀 자료로 추가했다. WSL 실제 Django 템플릿 ID·탭·composer 경로 계약 PASS. 자동 배포의 WSL `python tools/verify_content.py`로 Django196개·독립 HTTP20개 PASS, check0·migration 변경 없음이다.
- 배포 전 실제 Android API35 WebView에서 글자 없는 6개 입력의 기존 오탐216개→0개, 생성 한영/짧은 간판6줄과 공식 인쇄물8줄 유지. 동일 잔디의 해상도 변형·사진 crop은 독립 사진으로 합산하지 않는다. 자연 간판 전체 recall·물리 Safari·평가 네이티브 ML Kit 검증으로 일반화하지 않는다. 자세한 설계·범위는 `docs/OCR_QUALITY.md`, 원시 자료는 `evidence/mobile-web/ocr-quality/`다.
- 최종 `20261020092725e44d69` 실제 배포·공개 URL/모듈4개/템플릿 SHA 일치·공개 자산44개 PASS, 기존 글1·2·3 유지. 배포된 모듈을 Android WebView에서 다시 실행한 9개 조건 PASS: 글자 없는 입력 검출216→0·자동선택158→0, 정상14줄 유지. `production-results.json` 및 검증 전용 native ADB PNG3장과 SHA를 보존한다. 이 캡처를 제품 UI 사용성이나 사용자 원본 검증으로 오인하지 않는다. WSL 서버196개·HTTP20개, Windows 순수 규칙62개의 수를 별도로 기록했다.


## I23 — 제공 양식 대조와 현재 수행 결과 보고서 작성 (2026-10-20)

- 새 첨부 Word는 기존 최종 평가서와 SHA256까지 동일하다. 원본 요구사항 앞4열·판정 공란·section·스타일·헤더/푸터·불투명 패키지를 보존했다. 신원·GitHub URL은 사용자 답변에 따라 공란으로 유지했다.
- 실제 평가 PhotoViewer 앱의 서버 설정에서 PythonAnywhere HTTPS를 지정해 동기화 완료 사진3개와 테스트 제목·이미지를 캡처했다. WSL 공개 API의 ID3·2·1과 교차 확인했고 native 소스94개와 설치 APK는 기존 JVM63개·기기10개 기록과 일치한다. 새 클라우드 게시·검색 전 과정을 재실행한 것은 아니다. evidence/report-20261020/native-cloud-verification.json에 원본2장·SHA를 연결했다.
- common01의 제공 이름 보고서를 작성했다. 총16페이지·원본 이미지18장, 사용자 기능3개·등록5개, WSL196개·HTTP20개·웹62개·OCR216→0/정상14줄·공개 운영을 반영한다. 기존 작성중 파일은 이력으로 보존한다.
- Microsoft Word 읽기 전용 PDF와 documents 스킬 render_docx.py로 모든 페이지를 렌더·검토했고 다른 폴더에 복사한 보고서의 PNG16장이 모두 동일하다. 패키지·요구사항·이미지 원본 바이트 보존 및 외부 이미지 링크 없음, 교수님 판정 공란을 검사했다. evidence/content/report-current-verification.json에 현재 파일 SHA를 기록했다.
- ID1·3·4·5·6·7 지정 화면 보완, 신원·GitHub URL·push·과제 제출은 남았다. Windows 앱 접근 승인 시간 초과로 새 창 촬영을 못 했으며 로그·본문에 가짜 주소창·터미널·VS Code를 합성하지 않았다. 제품 코드·운영 게시글·계정·미디어는 변경하지 않았다.

## I24 — 다중 에이전트 검토를 반영한 보고서 문체 수정 (2026-10-20)

- 사용자 승인에 따라 현재 보고서의 도구 작업 사정·반복 해명을 제거하고 문제·구현 처리·검사 결과 중심으로 정리했다. 작성자 시점을 통일하고 JVM/에뮬레이터, 수동 분류값, OCR 비교 기준과 표본, 클라우드 확인 범위를 보존했다. 문체·증빙 에이전트 재검토와 원본 대조를 수행했다.
- 원본 양식·판정 공란·기능등록5개·평가상태·원본그림18개를 유지했다. Word 전체16쪽을 렌더·검토하고 별도 폴더 복사본 PNG16장이 같은 것을 확인했다. current Word SHA 446534a1e3b79403741ff97a7845d22d501c878283ceaba522682cdc89fac14d. 검증은 evidence/content/report-editorial-revision.json과 report-current-verification.json, 변경 전 파일은 .local/report-current/before-editorial*에 보존한다.
- 문서 수정 작업이며 제품 코드·DB·배포·게시글·미디어 변경 및 새로운 백엔드/Android 실행 검증은 없다. 미완료 캡처·신원·GitHub·제출 상태도 변경하지 않았다.


## I25 제출 세트 정리와 운영 HTTP 검증 2026-10-20

WSL Django196개·독립HTTP20개·Windows웹62개 재검사 PASS. 운영 HTTPS 기존 계정의 세션 로그인으로 검토용 글4번을 만들어 분류 저장·조회·OCR 문구 교정·검색·제외·복원·수정충돌409를 확인했다. 첫 검색어는 5단어 제한 초과로 거부되어 제한에 맞춘 뒤 같은 글로 재개했다. 최종33개 검사항목 PASS, 기존 글1·2·3의 필드·내용·사진해시 불변, 세션 로그아웃. 운영 글은4개이며 기존 native 화면3개는 이전 시점으로 유지한다. 새 모델 추론·브라우저 게시 재실행으로 집계하지 않는다. 증거는 evidence/submission-final/cloud-content-flow*.json. 최신 Telnet 로그·Coverage HTML도 확보했다. 보고서 A15를 추가해17쪽·그림18장을 유지했다. Windows 화면제어의 현재 URL 확인 실패로 지정6종 캡처는 중단·미완료다. 제출 폴더에서 이전 작성본·DB·인증·사용자미디어·캐시·private를 제외하고 해시검사를 수행한다. 신원·원격저장소·push·최종제출은 미정이다.


## I26 신원 기입과 제품 완료 범위 재점검 2026-10-20

사용자 제공 컴퓨터공학과 하대진·2020105671·middle_project 저장소 주소를 기입했다. git ls-remote 읽기 전용 접근 성공·refs없음, push없음. 실제 운영 브라우저에서 This is a lot 검색 시 무관한 줄까지7곳 표시를 확인했고 편집 메타데이터 복원·태그/문구 탭도 확인했다. 실제 native API35 앱 목록 갱신으로 사진4개 수신·이미지를 확인했으나 한 화면에 완전한 카드1개만 보이는 밀도 문제가 남는다. Android 편집·문구 목록은 source에서 세로로 긴 기존 구조를 확인했다. 클라이언트 UX·검색 일치 범위·최신 전체 UI 흐름을 부분/미검증으로 나눠 PROJECT_STATUS.md에 기록했다. 평가 ID14와 E01/E02/E04/E05를 부분으로 정정하고 서버 분류 저장 범위는 유지한다. 제품 코드·운영 게시글 변경 없음. 이전 묶음은 archive로 이동했고 새 묶음은 생성하지 않는다.

## I27 상단 중복 링크 제거와 회원가입 정책 확인 2026-10-20

상단 사진·검색 링크만 제거하고 홈 검색창을 유지했다. 기존 탐색 테스트의 표시 문구를 수정했다. 자동 배포의 WSL Django196개·독립HTTP20개와 Windows 웹62개 검사를 통과하고 PythonAnywhere 공개 URL에서 링크 부재·검색창 유지를 별도로 확인했다. 회원가입은 일반 계정 생성·자동 로그인·개인 사진관 이동이며 일반 회원도 자신의 글을 게시할 수 있어 1인 운영 전환이 미완료다. 제공된 최종 평가 양식과 전사문에서 회원가입 필수 항목은 확인되지 않았다. 이번에는 가입·게시 권한 정책을 변경하지 않았다.


## I28 1인 블로그 전환 및 사진관 잔재 제거 2026-10-20

공통평가의 사진 API·UI Upload·PythonAnywhere·Android 동기화를 유지하면서 지정 운영자만 작성/수정/삭제/분류 교정하도록 서비스·웹·토큰/세션 API·관리자 화면을 제한했다. 회원가입과 자동 사진관 생성, 마을·사진관·성장·꾸미기·배치 API, 웹 Three 및 Android Legacy/OpenGL/메시를 제거했다. 이전 사진 저장 커밋 검사는 독립 테스트로 보존했다. 마이그레이션0004의 사용자/사진/분류 보존 검사 통과, 로컬DB61개 게시글 백업 후 적용. 전용 폴더 삭제는 자동 승인 검토에서 한 차례 차단되어 대상 파일의 3D 용도·기존 보관본을 확인하고41개 파일 해시 일치 복구본을 만든 후 실행했다.

WSL 전체144개·실제HTTP15개, 웹62개, Android JVM30개·lint오류없음·실기기7개 통과. 두 번째 기기 실행은 이전 테스트 글까지 세던 조건 때문에 실패했으며 게시글ID별 검사로 수정해 최종7개 통과했다. 임시 로컬 서버에서 실제 얼굴/분류/OCR/UI게시/검색을 실행했고 운영에는 새 글을 생성하지 않았다. PythonAnywhere 최종릴리스2026102012161187e3b4 및 익명HTTPS21조건·기존4개글/미디어·최신Android4개동기화를 확인했다. 자세한 변경목록과 증거는 SINGLE_OWNER_BLOG.md. 보고서최종수치반영·기존 UX/검색보완·최종묶음·push는 별개 미완료다.

## I29 상세 화면의 전체 OCR 문구 목록 숨김 2026-10-20

사용자 요청에 따라 웹 상세의 전체 문구 펼침과 JavaScript 비활성 대체 목록, Android 상세의 전체 문구 버튼·목록을 제거했다. 인식/저장/교정/검색 데이터는 유지하고 검색에 일치한 위치 버튼은 유지한다. 웹은 검색 일치가 있을 때만 위치 뷰어를 실행한다. Android 빌드·JVM 검사 통과 후 에뮬레이터에 새 APK를 설치했다. 이전 기기7개 실행 증거는 I28 시점이며 이번 UI 제거 이후의 기기 전체 재실행으로 계산하지 않는다. PythonAnywhere 배포 및 공개 화면 확인 결과는 이번 배포 로그와 캡처를 따른다.

## I30 사용자 지정 관리자 계정 추가 2026-10-20

사용자가 지정한 admin 계정을 로컬과 PythonAnywhere에 추가했다. 지정 비밀번호는 메모·소스·증거에 기록하지 않았다. 기존 운영자와 게시글/사진은 보존하고, 활성·staff·superuser인 명시적 admin만 기존 글의 작성자를 바꾸지 않고 관리하도록 웹·API·Django 관리자·Android 세션 권한 처리를 연결했다. 임의의 다른 superuser 또는 이름만 admin인 일반 계정에는 게시 권한을 추가하지 않는다. 공개 회원가입은 계속404다. WSL145개·실제HTTP15개·웹62개 및 Android JVM30개와 빌드 통과. 실제 운영 HTTPS로 로그인·관리자 대시보드·can_publish/can_manage_all·기존 글 편집 GET200·로그아웃을 확인했고 새 글/수정 저장은 하지 않았다. 증거 evidence/current-audit/admin-account.json. 최신 Android 전체 기기검사는 별도다.

## I31 admin 제거·daejinha 단일 운영자 유지 2026-10-20

사용자가 운영자 이름을 daejinha로 정정하여 계정명은 유지했다. 정정 전 hadaejin 기본값으로 검증 중이던 배포 프로세스를 중단했고 해당 계정으로 운영 DB를 변경하지 않았다. PythonAnywhere DB 백업 후 추가 admin을 제거하여 운영 계정1개 daejinha만 유지했다. 실제 HTTPS 로그인과 Django 관리자 대시보드를 확인했다. 당시 공개 게시글/DB 게시글 수는0이었으며 없는 글의 편집 검증으로 집계하지 않았다. 비밀번호는 메모/증거에 기록하지 않았다. 로컬도 admin 제거, 활성 운영자명 통일, 다른 테스트 계정은 비활성화하고 데이터 보존. 코드의 admin 특별 권한을 제거하고 회귀검사를 추가했다. 계정 증거 evidence/current-audit/sole-account.json.

## I32 기울어진 손글씨·문서 OCR 보완 2026-10-20

첨부된 손글씨 사진을 외부 인식 서비스/게시 API에 보내지 않고 실제 Android API35 WebView의 기존 Tesseract로 재현했다. 기존 sparse 모드는118개 파편→엄격한 재확인 후4개 후보(자동선택0)를 남겼다. 별도의 종이 문서 경로를 추가하여 중성·밝은 배경과 어두운 획의 투영으로 기울기를 추정한다. 첨부 사진은14도. 인식용 임시 캔버스를 확대·회전하고 문서 레이아웃 모드로 재인식한다. 한글 증거가 적은 문서는 영문 모델로 재확인하며 짧은 무늬 조각·약한 단어·불일치 결과는 보류한다. 후보40개 상한·3줄 이상·기존보다 충분한 문자량 조건으로 결과를 교체한다. 문서 후보는 모두 확인 전 미선택이고, 보정된 위치는 원본 사진 좌표로 역변환한다. 게시 이미지 자체는 회전하지 않는다. OCR 탭은 선택된 수가 아니라 발견한 수를 표시해0개로 오해하지 않게 했다.

동일 PNG의 기존4개→개선16개 후보를 확인했고, 실제 공개 배포 모듈과 게시 JPEG 경로에서도16개·자동선택0개(약15.4초)가 나왔다. 단어 정확도/CER를 측정한 결과가 아니며 일부 손글씨 오자는 남는다. 공개 배포 회귀에서 배경6조건0개·한영 생성 간판6줄·인쇄문8줄을 유지했다. 위치16개는 WSL 서버의 시계방향 볼록사각형 검증을 통과했다. WSL145개·실제HTTP15개·Windows웹67개 PASS. PythonAnywhere20261020130539b3d8a3 verified. 증거 handwriting-page-results.json 및 production-results.json. 첨부 사진과 원시 인식문은 .local에만 보관하고 제출 증거에는 해시·개수·범위만 기록했다. 실제 iPhone Safari 및 native ML Kit 개선으로 집계하지 않는다. 기존 글은 수정 화면에서 다시 읽고 확인·저장해야 새 결과가 적용된다.

## I33 Android 화면·인식 개선 반영 2026-10-20

Java PhotoViewer에 2열 사진 목록, 접이식 필터, 화면 안에 유지되는 얼굴 편집 도구·적용 버튼, 글 작성/태그/검색 문구 탭, 태그 칩, 짧은 문구 목록과 공통 교정칸을 반영했다. 키보드를 열면 사진·보조 도구를 접어 입력칸과 게시 버튼을 남긴다. 전체 OCR 문구 목록은 공개 상세에서 계속 숨긴다. 기본 연결 주소는 실제 PythonAnywhere로 변경했다. 원본 보존·사진 교체·수동 영역·가림 강도·수정 충돌·중복 게시 방지는 유지했다.

Android ML Kit에 부분 사진의 얼굴 재탐지·주변 재확인·중복 정리를 추가하고, OCR에는 후보 선별·잘라낸 영역 재확인·문서 기울기 보정·원본 좌표 복원을 추가했다. 문서 결과는 확인 전 미선택이다. 웹의 인식 모델로 Android 검사를 대신하지 않았다. 사용자 단체사진11명, 배경6조건 문구0개, 인쇄8줄을 확인했다. 손글씨는32개 파편/중복 후보 대신25개 문서 후보가 나왔고 자동선택0개였다. 철자 오류·누락은 남는다. 공개9장 주석43개 중42개 대응, 주석외8개 검출(배경 인물·그림 포함). 이를 임의 사진의 전체 정확도로 일반화하지 않는다.

Windows Gradle 빌드·JVM38개·lint오류0개(경고8개), 실제 Android 통합9개 통과. WSL Ubuntu 임시 DB/미디어 서버에서 실제 OS 사진 선택→모자이크→태그 수정→게시→재생성 복원→문구 검색→위치 표시를 실행했다. 320×560dp 작은 화면에서도 같은 UI흐름1개를 완주하고 캡처8개를 기록했다. Android 15의 키보드 영역이 완료 버튼을 덮던 문제와 작은 파일 선택기의 미리보기 아이콘을 누르던 테스트 문제를 수정했다. 전송 JSON의 모델 버전 필드는 기존 서버 규격3개를 유지했다. WSL 서버 검증기로 Android 문구 좌표33개(손글씨25개)를 확인했다.

실제 PythonAnywhere는 읽기 전용 CloudSyncTest1개로 현재 글3개 및 이미지3개 다운로드·해시·앱 표시를 확인했다. 운영 글/계정/미디어를 변경하지 않았다. 증거는 evidence/content/android/verification.json, small-screen/, recognition-quality.json, cloud-sync.json. 자세한 설명은 ANDROID_NATIVE_PARITY.md. 이번 변경은 Android APK에 적용한 것으로 별도 서버 배포를 실행하지 않았다. 보고서 DOCX 최신화·웹 일치 영역·최종 제출은 별개다.

## I34 보고서와 현재 안내 문서 최신화 2026-10-20

Word의 평가 원문·판정 공란·신원과 저장소를 유지하면서 최신1인 블로그·Android 화면·검사 수·운영 동기화를 반영했다. 오래된 Android 화면7개를 교체하고 작은 화면2개를 추가했다. A16은 탭·칩·키보드, A17은 웹/Android 인식 결과와 한계를 설명한다. 현재19페이지·내장 그림20장이다. E01·E02는 확인 범위에서 완료로 바꾸고, E04·E05 및 ID14는 다중 검색어 일치 줄 보완 때문에 부분으로 유지했다. 과거 운영 글4번을 현재 재현 주소로 안내하던 문구를 제거했다.

README·평가 추적·작업 현황·배포/인증 안내·진행 기록·1인 전환·OCR 설명도 맞췄다. 과거 설계/배포 기록은 삭제하거나 현재 결과로 고쳐 쓰지 않고 시점을 명시했다. 이번 작업은 기존 검증 기록을 문서에 반영한 것이며 프로그램 검사·서버 재배포·소스 push·최종 묶음을 새로 실행하지 않았다. Word 렌더 검수 결과는 evidence/content/report-current-verification.json을 따른다.


## I35 검색 강조와 API 폼 회귀 검증
여러 단어 검색 시 관련 없는 반복 문구가 강조되는 문제를 공통 규칙으로 수정했다. 모든 단어를 포함한 줄을 우선하고, 분리된 줄은 최소한으로 선택한다. API HTML 폼의 선택 JSON 빈 값 처리도 수정했다. WSL148개와 HTTP15개 통과, Coverage95.7%. PythonAnywhere 릴리스20261020144652d2d706에 반영했다. assessment-completion에 실제 캡처를 추가했다. 보고서는 사용자 요청에 따라 GitHub에서 제외한다.
