# 공통평가 보고서 작성용 메모

## 2026년 10월 20일 최신 양식 보고서 작성

사용자 새 첨부 Word는 기존 최종 평가서와 파일 SHA까지 같다. Word의 ID1–14·요구사항·판정 공란을 보존한 현재 보고서는 `common01/모바일웹서비스 프로젝트 공통평가 01_수행 결과 보고서.docx`다. 총16페이지·원본 내장 이미지18장, 추가 기능3개를 Client3/Server2의 등록5개로 설명한다. 기존 작성중 문서는 이전 이력으로 남긴다. 학번·이름·GitHub URL은 사용자가 아직 없다고 답변해 공란이다.

기존 준비 이력에서 달라진 점은 실제 PythonAnywhere 운영과 평가 PhotoViewer의 클라우드 동기화를 확인했다는 것이다. native 앱의 서버 설정·완료 사진3개를 새 캡처하고 공개 ID3·2·1과 대조했다. 현재 소스94개·설치 APK는 기존 JVM63개/기기10개 기록과 일치한다. 증거는 `evidence/report-20261020/native-cloud-verification.json`이다. 새 클라우드 게시·검색 전체 재검사를 뜻하지 않는다.

현재 보고서는 WSL196개·HTTP20개·Coverage97.3%, 웹62개, 배경 OCR216→0/정상14줄과 실제 공개 운영을 반영한다. 전체 페이지를 Word 읽기 전용 PDF 및 문서 스킬로 렌더·검토하고, 다른 폴더에 복사한 파일도 PNG16장이 모두 같음을 확인했다. 원본 이미지 바이트·요구사항·section·기타 원본 패키지를 보존했다. `evidence/content/report-current-verification.json`에 SHA와 검사 결과가 있다.

최종 제출 준비는 아직 완료가 아니다. ID1·3·4·5·6·7 지정 화면, 신원·저장소 URL·push·과제 제출은 남았다. Windows 앱 접근 승인 시간 초과로 새 창 촬영을 못 했으며, 없는 주소창·터미널·VS Code 화면을 합성하지 않았다. 본문 A13과 완료 여부에 이를 명시했다. 아래는 이전 작업 시점별 메모이며 최신 보고서보다 과거인 배포 대기·테스트 수는 이력으로 읽는다.

2026-10-20. 실제 구현·검증에 근거한 초안 재료다. 최종 Word 보고서 작성·교수님 판정·GitHub 제출 완료를 뜻하지 않는다. 최신 수치는 [구현 기록](IMPLEMENTATION_LOG.md)과 [서버](../evidence/content/server/verification.json)·[Android](../evidence/content/android/verification.json) manifest로 확인한다.

현재 자료로 [Word 작성본](<../모바일웹서비스 프로젝트 공통평가 01_수행 결과 보고서_작성중.docx>)을 만들었다. 제공 양식 2쪽과 설명·증빙 부록 7쪽, 총 9쪽이며 원본 화면 8장을 해상도 손실 없이 내장했다. 요구사항 문구·원본 양식을 보존하고 교수님 판정과 학번·이름은 공란이다. 실제 배포와 일부 지정 캡처·최종 제출은 아직 남아 있다. [문서 검수 기록](../evidence/content/report-draft-verification.json)을 참고한다.

## 프로젝트에서 해결한 문제

일상·후기 사진에는 주변 사람의 얼굴과 간판·메뉴 같은 정보가 함께 찍힌다. 사용자가 사진을 게시하기 전에 얼굴을 가리고, 내용을 쉽게 분류하고, 글에 적지 않은 사진 속 문구로도 나중에 기록을 찾을 수 있도록 세 기능을 연결했다. 사진관·마을 콘셉트는 새 주 화면에서 제외했다.

교수님께는 **문제 → 실제 조작 → 확인 가능한 결과 → 구현 난점과 검증** 순서로 설명한다. 기능 수나 AI SDK 이름만으로 차별점을 설명하지 않는다. 기본 평가의 업로드 UI·API·테스트·소켓·실제 PythonAnywhere 운영·Android 동기화는 추가 기능과 별도로 충족해야 한다.

## E01 · 얼굴 자동 모자이크 — Android와 모바일웹

사진을 선택하면 기기에서 얼굴을 찾고 기본적으로 가린 미리보기를 보여준다. 얼굴별 해제, 수동 영역 추가·이동·크기 조절, 강도 조절·실행 취소·초기화를 제공한다. 화면의 사각형만 덮는 것이 아니라 실제 이미지 픽셀에 모자이크를 적용한 게시 사본을 만든다. 원본은 수정하지 않는다.

기술적 난점은 확대·이동 화면 좌표와 실제 이미지 좌표의 일치, 중첩 영역 합성, 실행 취소, 잘못 탐지되거나 놓친 얼굴의 사용자 보완이다. 사람의 신원을 알아내거나 모든 얼굴의 자동 탐지를 보장하는 기능은 아니다.

- 구현: `content/MosaicDraft`, `PhotoCanvas`, `PhotoPipeline`, `VisionEngine`.
- 검증: 순수 규칙 유닛, 실제 Android Bitmap·EXIF·알파·원본 파일 불변·실제 픽셀 검사, 기기 터치, 실제 OS 사진 선택·업로드 UI.
- 증빙: [얼굴 확인](../evidence/content/android/content-face-preview.png), [실제 게시 사진](../evidence/content/android/content-published.png), [UI로 게시한 서버 사본](../evidence/content/android/ui-uploaded-photo.jpg)·[digest 검사](../evidence/content/android/ui-uploaded-photo.json). 단일 인물 픽셀 검사 사본과 UI 게시 사진은 구분한다.

## E02 · 자동 테마·태그 추천과 교정 — Android와 모바일웹

최종 공개할 사진의 이미지 라벨을 한국어 대표 테마와 태그로 연결한다. 근거가 약하거나 두 테마가 비슷하면 미분류로 두고 대안을 제시한다. 사용자는 테마·태그를 고치거나 분류 없이 게시할 수 있다. 사진만으로 여행 여부나 감정을 단정하지 않는다.

일반 모델의 라벨을 사진 블로그의 제한된 테마로 연결하는 규칙과 기권 기준, 사용자 확정·수정 보존, 다른 사진의 늦은 결과 차단을 구현했다. 별도 모델 학습이나 수동 모델 설치를 사용자에게 요구하지 않는다.

- 구현: `ThemeMapper`, `VisionEngine`, `GenerationGate`, `ComposerState`, 새 작성/확인 화면.
- 검증: 임계값·동점·미지원 라벨·잘못된 점수·중복 태그·Unicode 길이·세대 무효화 유닛, 실제 bundled 모델 실행과 화면 교정·복원.
- 증빙: [분류·글자 확인](../evidence/content/android/content-classification-ocr.png).

## E03 · 확정 분류 저장과 조건별 조회 — 서버

사용자가 확인한 대표 테마와 태그를 검증해 저장하고 다시 접속해도 유지한다. 테마·태그·내 글 조건의 교집합을 조회한다. 기존 평가용 `/api_root/Post/`의 JSON 배열과 응답 7필드는 바꾸지 않고 내용 조회·교정·일괄 요약 API를 분리했다.

서버가 작성자·크기·테마 값·태그 한도를 검증하며 사진글과 분류를 한 트랜잭션에서 저장한다. 사진 파일의 SHA-256과 내용 버전이 맞지 않으면 거부한다. 동시에 수정할 때 한 요청만 반영하고 다른 요청은 409로 처리한다.

- 구현: `PhotoContent`, `PhotoTag`, `content_rules.py`, `content_services.py`, `content_api.py`, 기존 Post 저장 서비스.
- 검증: WSL의 규칙·API·DB/파일 롤백·실제 HTTP·두 프로세스 파일 SQLite 회귀. 실제 Android의 저장·재조회·권한도 확인했다.
- 증빙: [Android 최종 검증](../evidence/content/android/verification.json), [서버 검증](../evidence/content/server/verification.json).

## E04 · 사진 속 글자 인식·교정·일치 영역 — Android와 모바일웹

모자이크가 끝난 공개 사본에서 한글·영문을 인식한다. 사용자가 문구를 고치거나 검색에서 제외할 수 있다. 결과를 열면 사진의 해당 줄을 강조·확대해 어떤 정보 때문에 검색됐는지 확인한다. 검색 제외는 사진 속 글자를 지우는 기능과 구분해서 안내한다.

원본 이미지와 검색 정보의 좌표 연결, 한영 중복 줄 처리, 교정 결과 보존, 이미지 변경과 재인식의 무효화가 필요했다. 사진에 위치가 없는 문장을 임의로 넣고 가짜 영역을 표시하지 않는다.

- 구현: `VisionEngine`, `ComposerState`, 확인/검색/상세 화면, `PhotoCanvas`.
- 검증: 실제 한글·영문 OCR, 제외 문구 미전송, 상태 직렬화·Activity 재생성, 실제 문구 검색과 강조 화면. 전체 문구 펼침·다른 줄 위치로 이동·접기도 실제 UI에서 확인했다.
- 증빙: [결과 확인](../evidence/content/android/content-classification-ocr.png), [검색](../evidence/content/android/content-search-results.png), [일치 영역](../evidence/content/android/content-match-highlight.png).

## E05 · 사진 문구 저장·정규화 검색 — 서버

검색에 포함한 문구와 원래 줄의 영역만 보관한다. Unicode·대소문자·공백을 정규화해 제목·본문에 없는 사진 속 문구로 조회하고, 여러 단어·테마·태그 조건을 결합한다. 검색어의 `%`·`_`는 와일드카드가 아닌 실제 문자로 다룬다.

사진 교체·문구 교정·검색 제외·삭제 뒤에 이전 검색 결과가 남지 않게 처리했다. 이미지 digest와 revision을 묶어 오래된 좌표를 새 사진에 표시하지 않도록 한다. 의미 유사도를 이해하는 자연어 검색이나 외부 검색 서버를 도입한 기능은 아니다.

- 구현: `PhotoTextLine`, `content_queries.py`, `content_api.py`의 검색·서명된 페이지 cursor·일치 줄 반환.
- 검증: 한글·영문·띄어쓰기·리터럴 특수문자·AND·권한·페이지·수정/교체/제외·실제 HTTP 및 Android.
- 증빙: [실제 웹 검색](../evidence/content/web/photo-text-search.jpg), [서버 HTTP 로그](../evidence/content/server/http-api-engine.txt).

## 테스트·증빙을 설명할 때

| 검증 환경 | 최종 결과 | 재현·증거 |
| --- | --- | --- |
| WSL Ubuntu venv | Django 전체 196개·독립 HTTP 20개 PASS, check 0·migration 변경 없음 | `PhotoBlogServer`에서 `python tools/verify_content.py`, 서버 manifest |
| Coverage | 총합 97.3%·라인 98.6%·분기 93.3% | `PhotoBlogServer/htmlcov/index.html`, `evidence/content/server/coverage-report.txt` |
| Windows Node | 모바일웹 순수 규칙 유닛 21개 PASS | `tools/local/verify-mobile-web.mjs`, `evidence/mobile-web/unit-verification.json` |
| 실제 Chromium·WSL HTTP | 브라우저 모델·픽셀 9개 검사 및 실제 게시·교정·검색·제외 흐름 PASS | `evidence/mobile-web/browser-models.json`, `browser-ui.json`, `http-initial.json`, `http-excluded.json` |
| Windows Android | 빌드 PASS·JVM 유닛 63개 PASS·Lint 오류 0/경고 9 | `PhotoViewer/tools/verify-android.ps1 -RunDevice`, Android manifest |
| Android API35 에뮬레이터 + WSL | ContentDevice 6 + ContentUi 1 + LiveRepository 3 = 10개 PASS | 최종 실행 `20261019-173636-9c9bae3f`, 실제 원본 화면 6장 |
| 같은 최종 APK의 비행기 모드 | 위 10개 중 얼굴·모자이크/한영 OCR/자동 동물 분류 3개를 재실행해 PASS | `offline-check.json`, 설정 원상 복구. 고유 테스트 수에 중복 합산하지 않음 |

자동 분류의 실제 자료에서는 강아지 사진의 동물 테마·태그 추천을 확인했다. 모자이크한 단일 인물 사진의 기권도 기록했다. 복합 UI 사진의 음식 테마는 사용자 교정값이므로 자동 분류 성공 예제로 설명하지 않는다.

Python 규칙 유닛, Django API/저장 테스트, 독립 실제 HTTP 엔진, Android JVM 유닛, 실제 Android 인식/화면 테스트를 섞어 모두 ‘유닛’이라고 부르지 않는다. Coverage는 라인·분기·총합을 각각 보고하며 UI·인식 정확도·배포 성공을 대신하는 수치로 쓰지 않는다.

테스트와 캡처는 원본 파일·실행 환경·소스/APK SHA-256과 함께 보존한다. 가상 문구와 공개 예제 사진을 사용했고 비밀번호·토큰·CSRF를 보고서에 넣지 않는다. 기본 소켓 증빙은 212바이트 익명 GET이며 Cookie/Authorization/본문이 없음을 별도로 확인했다.

[요구사항별 구현·테스트·증거 연결](../evidence/content/implementation-trace.json)은 로컬 검증과 부분 검증·클라우드 대기를 구분한다. [파일 일치 검사](../evidence/content/integrity-check.json)는 검증 소스·APK·화면·서버 배포 후보가 현재 파일과 일치하는지 확인한 기록이며 기능 테스트를 대신하지 않는다.

## 아직 완료로 적으면 안 되는 내용

- PythonAnywhere 실제 앱 활성화·클라우드 Android 동기화: 계정 로그인 후 확인 필요.
- 대규모 사진 집합의 인식 정확도·다양한 실제 휴대폰 성능·제3자 사용성 관찰: 제한된 고정 자료의 기능 검증과 구분.
- 기본 평가의 주소창 포함 화면·Telnet 터미널·VS Code 실제 수신 파일 화면 등 지정 증빙: 기존 로그나 앱 사진으로 대체하지 않음.
- GitHub push·최종 Word 내장 이미지·URL 제출·교수님 판정: 별도 제출 단계.

## 모바일웹 추가 반영

Android에만 연결했던 세 기능을 모바일웹 작성·수정·상세에도 구현했다. 같은 기능을 웹에 구현한 것을 별도의 추가 기능으로 중복 계산하지 않는다. 서버 저장·검색 API는 두 클라이언트가 공유한다.

모바일웹은 같은 서버에서 제공하는 MediaPipe Face Detector·EfficientNet Lite0와 Tesseract 7의 한국어·영문 모델을 브라우저에서 실행한다. 사용자는 모델을 수동 설치하거나 학습할 필요가 없다. 무료 PythonAnywhere에는 약 70 MB의 정적 모델·런타임을 배포하며 서버가 추론을 수행하지 않는다. 최초 모델 다운로드와 브라우저 메모리·인식 시간은 기기에 따라 달라진다. 자산 출처·버전·SHA256은 `blog/static/blog/vendor/content/SOURCES.json`에 보존했다.

EfficientNet은 상호 배타적인 ImageNet 클래스의 softmax이므로 중복 클래스는 제거하고 견종 등 서로 다른 하위 클래스의 점수 질량을 상위 테마로 합산한다. Android ML Kit의 독립 이미지 라벨 방식과 구분한다. 미지원 클래스 점수를 숨기도록 재정규화하지 않는다. 테마 질량 0.65·차이 0.12·개별 최고점 0.1, 태그 질량 0.5의 기권 규칙은 제한된 자료의 초기 기준이며 정확도 보증 수치가 아니다.

390×844와 844×390 Chromium 화면에서 가로 넘침 없이 게시·조회했다. 공개 인물 예제+생성 간판을 OS 파일 선택기로 열어 자동 얼굴 1곳, 해제·실행 취소·수동 추가를 확인했다. 한영 문구를 실제 인식하고 노이즈 4줄을 제외, 한글을 교정해 게시했다. 복합 사진은 자동 미분류였고 음식 테마는 **사용자 교정값**이다. 실제 강아지 사진의 자동 동물·강아지 태그는 별도 모델 검사에서 확인했다.

실제 웹 게시 글 61번은 183,281바이트·1600×1200이며 SHA256 `a71402f60205d8cdb14dc02c11b622ae6783efe81a2575b387c0bf3ef74e5137`이 서버 내용 digest와 일치했다. 첫 revision의 3줄 중 SUNSET 줄을 수정 UI에서 제외한 뒤 revision 2의 2줄만 남고 SUNSET 검색 결과가 사라졌다. 사진 파일 바이트는 그대로 유지됐다. 교정한 한글 검색과 일치 위치 강조도 실제 화면에서 확인했다.

검사 중 상세 모듈의 보조 함수가 브라우저 location을 가려 상대 사진 URL을 잘못 읽는 문제를 발견해 수정하고 최종 강조 화면을 재검증했다. 브라우저 모델 검사 9개는 유닛 21개와 다른 실제 실행이며 모두 유닛이라고 합산하지 않는다. 물리 아이폰 Safari·카메라 권한·HEIC 변형, PythonAnywhere의 HTTPS 모델/worker 제공 및 실제 배포는 **검증 대기**다. Chromium의 화면 크기 변경을 아이폰 검증으로 표현하지 않는다.

## PythonAnywhere 배포 결과 갱신 — 2026-10-20

위의 PythonAnywhere 검증 대기 상태는 이 시점에서 갱신됐다. 공식 API 토큰을 사용자가 PC의 가린 입력창으로 연결했고 실제 앱 배포와 같은 인증을 재사용한 후속 자동 배포가 완료됐다. 현재 릴리스는 `2026102004523169f8f8`, 공개 주소는 https://daejinha.pythonanywhere.com/ 이다. 사용자에게 매번 업로드나 Web Reload를 요구하지 않는다.

서버의 원래 글 2개·계정 1개·사진 파일 4개 및 전체 원본 사진 SHA256이 보존됐고 SQLite quick_check, DB/venv 재사용, 원래 사이트 전체 백업 보존을 확인했다. 목록·로그인·평가 배열 API·새 composer.mjs가 공개 HTTPS 200이며 현재 코드 digest가 일치한다. 모델과 실행 자산 39개의 접근·크기·MIME가 정상이다. 서버는 PythonAnywhere Python 3.13.1이며 추론은 기존 설계대로 클라이언트에서 수행한다.

배포 인프라 유닛 38개는 WSL에서 통과했다. 기존 서버 유닛 196개·실제 HTTP 20개와 Windows 웹 규칙 21개도 배포 진입점에서 통과했다. 서로 다른 검사 유형을 모두 유닛 개수로 합산하지 않는다. 근거는 evidence/deployment의 automation-tests.json, first-automated-deployment.json, redeployment.json, production-preservation.json, public-assets.json이다.

물리 iPhone Safari 조작·카메라/HEIC와 배포 서버에 대한 Android 실제 동기화, 평가서에서 요구한 지정 화면의 증빙은 여전히 별도다. Word 작성 중 초안의 배포 대기 서술은 다음 문서 개정 때 이 증거로 갱신해야 한다. 이 메모 갱신을 Word 파일 개정 완료로 표현하지 않는다.

## 단체사진 얼굴 누락 수정 및 실제 배포 — 2026-10-20

사용자 제공 960×1280 단체사진에서 기존 탐지 결과 0곳을 재현했다. 전체 사진만 검사하던 처리를 겹치는 여러 크기의 구역 검사와 작은 얼굴 주변 재검사로 보완하고, 중복 탐지를 합쳐 가림 범위를 보존했다. 같은 사진에서 얼굴 11곳 자동 탐지와 각 영역의 실제 모자이크 픽셀 변화, 원본 픽셀 보존을 확인했다. worker의 하위 모듈까지 버전 URL을 연결해 오래된 코드가 남는 캐시 문제도 수정했다. 기존 사전 학습 모델을 사용하며 사용자 설치·학습이나 서버 추론은 추가하지 않았다.

Windows Node 웹 유닛 31개(좌표·구역·중복 처리 신규 10개 포함), 실제 브라우저 모델 검사 9개가 통과했다. WSL 프로젝트 venv에서 `python tools/verify_content.py`를 실행해 Django 196개·독립 HTTP 20개, 시스템 검사 및 migration 일관성을 통과했다. 검사 유형별 개수를 유닛으로 합산하지 않는다.

릴리스 `202610200554583af100`을 실제 PythonAnywhere에 배포했다. 공개 URL·코드 digest 및 정적 자산 41개를 검증했고 공개 작성 화면의 Chromium에서 같은 사진의 얼굴 11곳이 모두 자동 가림 상태임을 확인했다. 원본 사진은 소스·정적 자산·배포 ZIP에 포함하거나 공개 게시하지 않았다. 근거는 `evidence/mobile-web/face-group-{before,after,pythonanywhere}.json`, `face-group-pythonanywhere.jpg`, `browser-models-facefix.json` 및 `evidence/deployment/public-assets.json`이다. 실제 iPhone Safari·Android 동기화 검증과 Word 초안 개정은 이 기록과 별도다.

## 추가 사진 평가에서 확인된 한계 — 2026-10-20

공개 사진 16장을 동일 tflite 모델과 실제 앱의 JavaScript 구역·좌표·중복 처리로 WSL CPU 추론했다. 연결 가능한 브라우저가 없어 Python MediaPipe native 실행기를 사용했으며 실제 웹 WASM 실행·canvas 가림·Safari 검사를 대신하지 않는다. 실행 오류는 0이었다. 주석 얼굴 43개 모두 가림 영역에 80% 이상 포함됐지만 큰 영역에 의한 과도한 가림과 중복이 있다. 얼굴이 없는 표본 4장 중 강아지·원숭이·건물 3장에 오탐(총 8영역)이 생겼다. NASA 7인 사진도 8영역으로 중복이 있었다. 과일은 0영역이었다.

이는 한 사진의 11곳 탐지 성공을 일반적 정확도 보장으로 확장할 수 없다는 실증이다. 구역 검사의 작은 얼굴 포함 효과와 오탐 비용을 함께 평가해야 한다. IoU 대응의 FN6은 실제 미가림과 다르므로 단순 누락으로 쓰지 않는다. 전체 결과·출처·원시 탐지·이미지는 `evidence/mobile-web/public-face-corpus/RESULTS.md`에 연결했다. 서비스 코드는 변경·재배포하지 않았고 Word 초안은 이번 메모와 별도로 갱신해야 한다.

## 추가 평가를 반영한 v5 개선 — 2026-10-20

위의 실패를 기준으로 같은 모델의 후보 확대 재확인(2배·3배 context, confidence 0.8·위치 대응)과 강한 좌표를 남기는 중복 억제를 구현했다. 기존 16장에서는 정답 좌표 43개 포함을 유지하며 IoU 일대일 대응 TP43/FN0/FP0을 얻었다. 비인물 오탐은 총8→0, NASA 단체 중복은 8→7로 줄었다. 별도 공개 7장과 기존 인물 fixture 1장에서도 회귀를 검사했고 사용자 단체사진은 11곳을 유지했다. 사진 평가는 WSL native MediaPipe와 실제 앱 JavaScript geometry이며 브라우저 WASM·canvas와 구분한다. 개발 표본의 결과를 일반 정확도로 해석하지 않는다. 주석 밖 작은 후경 얼굴의 제외 사례도 한계로 기록했다.

웹 유닛 39개·WSL Django196개·실제 HTTP20개가 통과했고 PythonAnywhere 릴리스 `20261020062224e8ef72`를 실제 배포했다. 공개 주요 모듈 5개·작성 템플릿의 hash 일치와 자산41개 접근·MIME·크기를 확인했다. 기존 글은 유지됐다. 신규 서버 모델 라이브러리나 사용자 설치·학습은 없다. 검증 상세는 `evidence/mobile-web/public-face-corpus/IMPROVEMENT.md`, 배포 증거는 `evidence/deployment/face-confirmation-deployment.json`이다. v5의 실제 Safari·worker·canvas 흐름은 아직 별도 검증이 필요하며 Word 초안 갱신 완료로 표현하지 않는다.

## 한 화면 편집 UX와 실제 적용 — 2026-10-20

사진이 커서 도구를 보기 위해 위아래로 스크롤하던 사용자 캡처를 근거로, 얼굴 편집 단계만 전체 화면으로 전환하고 사진이 도구를 제외한 높이에 맞춰지도록 변경했다. 모든 주요 편집 도구와 위치·크기 숫자 입력을 dock에 노출했고 가로 화면에서는 사진 옆에 배치했다. Safari visible viewport·브라우저 확대·빈 좌표 입력의 경계 처리를 추가해 웹 유닛46개가 통과했다. WSL Django196개·실제 HTTP20개도 통과했다.

사용자가 수정 후 바로 볼 수 있도록 적용하라고 지시해 릴리스 `202610200709276f1421`을 실제 PythonAnywhere에 배포했다. 공개 편집기 코드/CSS4개·작성 템플릿의 digest 일치, 자산42개 접근·크기·MIME, 기존 게시글 유지를 확인했다. 증거는 `evidence/deployment/editor-ux-deployment.json`, 상세는 `docs/EDITOR_UX_VERIFICATION.md`다. 연결된 브라우저가 없어 실제 화면 크기별 배치·물리 Safari 검사는 아직 미완료다. 화면 검증 통과와 공개 코드 반영을 혼동하지 않으며 Word 초안 갱신은 별도다.

## 모자이크 편집 UI 간결화 — 2026-10-20

모든 도구를 한꺼번에 노출한 화면이 복잡하다는 후속 사용자 의견을 반영했다. 기본 화면에는 사진과 이동·선택·직접 가리기·실행 취소·강도·확대·다음만 남겼다. 영역을 선택하면 해제·삭제를 표시하며, 영역 목록·수동 추가·초기화·다시 찾기·위치/크기 숫자는 더보기로 모았다. 숫자 입력의 가로 넘침 원인도 수정했다. 기존 편집 기능과 얼굴 모델은 유지한다. 사용자가 자주 사용하는 조작과 세부 조절의 노출 시점을 구분한 UX 변경으로 설명할 수 있다.

Windows 웹 유닛46개·구문 검사, WSL 템플릿 렌더링·Django196개·실제 HTTP20개가 통과했다. 릴리스 `2026102007340812030a`의 실제 배포 phase=verified, 공개 composer/CSS와 운영 템플릿의 원본 SHA 일치, 새 캐시 버전과 더보기 구조, 공개 게시글1·2·3 유지를 확인했다. 근거는 `evidence/deployment/editor-simple-deployment.json`이다. 실제 브라우저 화면·물리 Safari 사용성 검사는 미실시이며 코드 반영 검증과 구분한다. Word 초안 갱신은 별도다.

## 게시 전 확인 화면의 태그·OCR UX 개선 — 2026-10-20

후속 사용자 캡처의 반복적인 큰 문구 카드와 페이지 왕복 문제를 근거로 확인 단계를 글 작성/태그/검색 문구 탭으로 재구성했다. 사진과 게시 버튼은 공통 영역에 유지하고 많은 내용은 탭 내부에서 스크롤한다. 테마는 단일 선택 버튼, 태그는 선택/해제 칩과 직접 추가로 표현했다. OCR은 짧은 목록에서 선택하면 사진 위치와 공용 교정란이 함께 바뀌며, 개별·전체 포함/제외를 지원한다. 입력 화면을 작게 만드는 데 그치지 않고 조작 대상·선택 상태·사진 근거를 같은 화면에서 연결한 변경으로 설명할 수 있다. 매우 낮은 viewport에서는 입력 공간 확보를 위해 사진을 숨긴다.

태그 정규화·중복·10개 한도와 잘못된 추가의 기존 값 보존, OCR 일괄 처리의 ID·좌표·교정 보존 및 100개 한도, 서버 packet 회귀 7개를 추가해 Windows 웹 유닛53개 PASS다. WSL 실제 템플릿 렌더링과 요소·탭 연결, Django196개·독립 HTTP20개도 PASS했다. 근거는 `evidence/mobile-web/unit-verification.json`, `review-template.json`과 `docs/EDITOR_UX_VERIFICATION.md`다. 실제 브라우저 배치·물리 Safari·사용성 관찰은 미실시이며 Word 초안 갱신과도 구분한다.

릴리스 `20261020075611be2d07` 실제 배포 phase=verified, 공개 composer/CSS/review-controls 및 운영 템플릿 SHA 일치, 자산43개 접근·크기·MIME PASS, 공개 글1·2·3 유지를 확인했다. 실제 배포 증거는 `evidence/deployment/review-tabs-deployment.json`이다. 로컬 성공만으로 배포 완료라고 표시하지 않았으며 사용자 수동 업로드 없이 적용했다.

## Android 사전 캡처를 통한 전체 페이지 UX 개선 — 2026-10-20

사용자 요청에 따라 코드를 먼저 바꾸지 않고 실제 Android API35 에뮬레이터 WebView로 운영 사이트의 화면을 캡처했다. 공통 메뉴의 두 줄 배치, 첫 사진보다 큰 검색 영역, 가입 도움말로 밀린 완료 버튼, 사진 선택 단계의 반복 설명을 수정 대상으로 확인했다. 수정 대상 표·전후 원본 캡처·측정 파일은 `docs/MOBILE_PAGE_AUDIT.md`와 `evidence/mobile-web/android-ux-audit/`에 연결한다.

공통 메뉴·접는 검색 필터·간결한 계정 폼·한 화면 사진 선택·사진 상세 배치를 정리했다. 650px 화면에서 목록 첫 사진의 시작이 y614→242px, 헤더136→61px, 가입 버튼 하단921→463px로 바뀌었다. 550px 재검사에서 태그 입력과 선택 칩의 잘림도 발견해 보정했다. 긴 게시글 전체나 사진 목록을 한 화면으로 강제하지 않고 핵심 콘텐츠와 주요 조작이 앞에서 드러나게 하는 데 초점을 맞췄다.

Windows 웹53개, WSL Django196개·독립 HTTP20개·템플릿 계약 검사를 통과했다. Android 실기 엔진 실행/원본 캡처와 PythonAnywhere 반영 여부를 로컬 유닛 검사와 구분한다. 공개 예제만 사용했고 시험 글·계정 생성이나 게시·삭제를 하지 않았다. 실제 iPhone Safari와 평가 Android 네이티브 앱 동기화·Word 초안 개정은 별도다.

최종 `20261020082900cbea43`의 운영 템플릿6개·공개 composer/CSS SHA 일치, 자산43개 PASS를 확인했다. 실제 Android의 650/550px 화면에서 23개 상태·50개 조건 PASS, 실제 키보드로 503px가 된 경우도 태그 입력·추가·게시 버튼의 표시와 가림 검사를 통과했다. 키보드 포함 원본24장·실패 이력·최종 결과·SHA는 `evidence/mobile-web/android-ux-audit/SUMMARY.json`·`index.html`과 하위 JSON/PNG에 보존한다. 화면 좌표만 들어왔는지 보는 데서 부모 잘림과 실제 가림을 함께 검사하도록 보완한 과정을 UX 개선 근거로 설명할 수 있다.

## 모바일 목록의 2열 썸네일 구성 — 2026-10-20

사용자가 한 화면에 여러 글을 보고 싶다고 요청해 큰 본문 카드 대신 모바일 2열 썸네일·최대 두 줄 제목·작성자·날짜·짧은 분류 정보로 목록을 구성했다. 원본 사진과 전체 본문은 상세에 보존하고 검색·필터·페이지 이동·API는 유지한다. 기본 목록은 글을 찾고 선택하는 화면, 상세는 전체 내용을 읽는 화면으로 역할을 정리한 UX 변경으로 설명할 수 있다.

Windows 웹53개·WSL Django196개·독립 HTTP20개를 통과한 첫 변경 배포 후 실제 Android WebView의 393×650·393×550·320×550에서 두 열과 두 카드 이상 완전 표시·세 사진 노출·가로 넘침 없음, 상세 본문 접근을 확인했다. 단순 데스크톱 크기 변경이 아닌 native WebView 폭/높이 조절과 ADB 원본 PNG다. 근거는 `evidence/mobile-web/post-grid/results.json`과 세 화면 캡처, 실제 배포 증거는 `evidence/deployment/post-grid-deployment.json`이다. 물리 Safari와 Word 초안 개정은 별도다.

최종 배포는 `2026102009071884b927`이며 원본 템플릿 일치·공개 썸네일3개·기존 글1·2·3을 확인했다. 빈 검색 결과의 안내도 두 열에 걸쳐 전체 폭으로 표시하며 실제 Android에서 이를 확인했다. 최종 코드의 검사도 웹53개·WSL Django196개·독립 HTTP20개 PASS다. 이전 전체 페이지 감사의 한 열 목록 캡처는 당시 이력으로 남기고 현재 목록 증거는 `post-grid/`의 새 원본을 사용한다.

## 글자 없는 배경의 OCR 오탐을 검색에서 차단 — 2026-10-20

사용자 캡처에서 무의미한 178개 문구와 100개 자동 선택을 확인했다. 사진의 나뭇잎·털·벽돌 무늬를 sparse-text OCR이 문자로 오인하는 결과를 줄 신뢰도25만으로 받던 문제가 있었다. 문자/단어 증거 검사와 후보 crop의 한 줄 재인식을 결합해 일관된 결과만 유지하며, 양쪽 점수85 이상만 자동 선택한다. 애매한 결과는 사용자 확인을 거치고 선택되지 않은 문구는 기존 패킷 규칙대로 전송하지 않는다. 무료 PythonAnywhere에서는 서버 추론이나 외부 서비스를 추가하지 않는다.

검증은 Windows 규칙 유닛62개·WSL Django196개·독립 HTTP20개와 실제 Android WebView 모델 검사로 나누어 기록한다. 글자 없는 6개 입력의 오탐216→0, 한영/짧은 생성 문구6줄·공식 인쇄물8줄 유지다. 해상도 변형과 crop은 독립 사진으로 세지 않는다. `docs/OCR_QUALITY.md`, `evidence/mobile-web/ocr-quality/`, 실제 오탐의 `web-tests/fixtures/ocr-texture-confirmations.json`을 보고서 근거로 사용한다. 사용자 원본 사진·자연 간판 대규모 정확도·물리 Safari 검증은 별도다. 기존 저장된 문구를 자동 삭제하지 않으며 다시 읽기 후 저장해야 새 정책으로 갱신된다. Word 초안은 이번에 수정하지 않았다.

최종 배포 `20261020092725e44d69`의 공개 모듈4개·편집 템플릿·자산44개와 기존 글1·2·3을 확인했다. 운영 모듈의 실제 Android WebView 검사9조건 PASS, 오탐216→0/기존 자동선택158→0/정상14줄 유지다. `production-results.json` 및 SHA가 연결된 ADB PNG3장은 검증 전용 모델 실행 화면이며 제품 UI 감사나 사용자 원본 사진 증거로 쓰지 않는다. 실행 시간0.8~5.2초는 단일 시행으로서 대규모 정확도·p95 속도 목표 달성을 의미하지 않는다.

## 보고서 문체 수정과 재검토 — 2026-10-20

다중 에이전트 검토 후 사용자 승인으로 현재 Word 본문·캡션을 수정했다. 도구 접근 승인, 양식 해시 비교, 합성·점수 해명을 본문에서 제거하고 기능의 문제·처리·검사 결과를 먼저 설명했다. Windows JVM63건과 API35 에뮬레이터10건을 구분하고 A7 수동 교정, A10 비교 기준·216→0·생성/파생 자료·원본 미검증, A12 클라우드 목록/이미지 수신 범위와 제출 보완 상태를 유지했다.

수정 후 문체·증빙 에이전트가 재검토했고 원본 불변/모자이크 사본 픽셀 변화 표현도 보정했다. Word 읽기 전용 PDF와 documents 렌더러로 16쪽 모두 확인했으며 원본 그림18개·요구사항·판정 공란·평가 상태·스타일/section을 보존했다. 별도 폴더 복사본 PNG16장도 일치한다. 현재 SHA는 446534a1e3b79403741ff97a7845d22d501c878283ceaba522682cdc89fac14d, 증거는 evidence/content/report-current-verification.json 및 report-editorial-revision.json이다. 이전 dd515fb0… 버전과 원고·검증은 .local/report-current/before-editorial*에 보존했다. 지정 증빙과 신원·GitHub·최종 제출은 여전히 보완 대상이다.


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

I29 최종 확인: PythonAnywhere 릴리스 20261020122819d0e6cd verified. WSL 서버144·실제HTTP15·웹62 통과, 공개 상세/모듈5조건 통과 및 실제 브라우저 전체 목록 부재·일치위치 유지 확인. 증거 evidence/deployment/hidden-text-list.json, evidence/current-audit/hidden-text-list.png. Android JVM30·새 APK 설치는 hide-all-text-android.json.

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
