# 추가 기능 버전의 PythonAnywhere 배포 현황

## 마지막 확인 상태

2026-10-20 마지막 검증 릴리스는 `20261020130539b3d8a3`이다. 실제 운영 주소는 https://daejinha.pythonanywhere.com/ 이며 지정 운영자 daejinha만 작성한다. 공개 회원가입·사진관·3D 실행 코드를 제거했고 문서 기울기 보정 OCR까지 배포하였다. 당시 WSL145·HTTP15·웹67 검사와 공개 모듈 WebView 회귀를 확인했다. [공개 배포 OCR 기록](../evidence/mobile-web/ocr-quality/production-results.json)을 따른다.

최신 Android는 기본 운영 주소와 화면·OCR를 반영한 APK를 설치했다. [읽기 전용 동기화](../evidence/content/android/cloud-sync.json)에서 운영 글3개·이미지3개를 해시 대조하고 모두 표시했다. Android만 변경한 작업 및 이번 문서 최신화에서는 서버를 새로 배포하지 않았다. 물리 iPhone Safari와 최신 웹 전체 작성 UI 흐름은 별도 미완료다.

공식 API 인증과 반복 배포는 이미 연결·검증되었다. 승인된 서버/웹 변경은 [자동 배포 절차](AUTOMATIC_DEPLOYMENT.md)를 사용한다. 새 토큰 입력은 인증이 실제로 없거나 만료된 경우에만 요청하며, 비밀정보는 프로젝트·보고서에 기록하지 않는다.

## 이전 배포별 기록

아래의 글 수·릴리스·검사 수는 각 배포 당시 기록이다. 현재 사용자가 유지하는 게시글 수나 최신 검사 수로 대체해 읽지 않는다.


2026-10-20. **공식 API 인증 연결, 실제 서비스 전환, 공개 HTTPS 검증을 완료했다.** 사용자 토큰은 이 컴퓨터의 가린 입력창에서 받아 WSL 홈의 비공개 파일에만 저장했다. 사용자가 앞으로 매번 업로드하거나 Reload를 누를 필요 없이 에이전트가 검증·패키징·업로드·전환·공개 검증을 수행한다.

- 공개 주소: https://daejinha.pythonanywhere.com/
- 이전 OCR 개선 릴리스: `20261020092725e44d69`. 줄/단어 증거 검사와 후보 영역 한 줄 재인식으로 배경 무늬를 걸러내고 검증된 고신뢰 문구만 자동 포함한다. [공개 코드·템플릿 검증](../evidence/deployment/ocr-deployment.json), [실제 배포 Android WebView 검사](../evidence/mobile-web/ocr-quality/production-results.json), [품질·검증 범위](OCR_QUALITY.md). 글자 없는 6개 입력의 오탐216→0, 생성 간판6줄·공식 인쇄물8줄 유지 PASS. Windows 웹62개·WSL Django196개·HTTP20개·공개 자산44개 PASS. 글1·2·3, 계정·미디어·기존 저장 문구를 유지한다. 이전 결과를 새 정책으로 바꾸려면 다시 읽기 후 저장한다.
- 재사용 절차: [자동 배포](AUTOMATIC_DEPLOYMENT.md), Windows 진입점 `tools/local/deploy-pythonanywhere.ps1` → WSL 검증·공식 API → PythonAnywhere Bash.
- 첫 검증 완료 릴리스: `20261020044548717b72`. [실제 배포 증거](../evidence/deployment/first-automated-deployment.json).
- 이전 2열 목록 릴리스: `2026102009071884b927`. 모바일 목록을 2열 썸네일·두 줄 제목으로 정리해 여러 글을 첫 화면에서 볼 수 있게 했다. 본문은 상세에서 제공하며 검색 결과가 없으면 안내가 전체 너비를 쓴다. [실제 배포 검증](../evidence/deployment/post-grid-deployment.json), [Android 3개 화면 크기 검사](../evidence/mobile-web/post-grid/results.json), [목록 화면](../evidence/mobile-web/post-grid/grid-393x650.png). Windows 웹53개·WSL Django196개·HTTP20개 PASS. 기존 글1·2·3과 API·페이지 이동을 유지했다. 물리 iPhone Safari와 평가 Android 네이티브 앱 동기화는 별도다.
- 이전 전체 페이지 릴리스: `20261020082900cbea43`. Android 사전 캡처를 바탕으로 메뉴·검색·계정 폼·선택·상세를 정리했다. [공개 검증](../evidence/deployment/mobile-pages-deployment.json), [페이지별 감사](MOBILE_PAGE_AUDIT.md), [당시 전후 화면](../evidence/mobile-web/android-ux-audit/index.html). 실제 Android WebView 412×650/550의 23개 화면 상태·50개 조건과 소프트 키보드 검사 PASS. [당시 증거](../evidence/mobile-web/android-ux-audit/SUMMARY.json)를 보존한다. 현재 2열 목록은 위의 새 캡처를 따른다.
- 이전 확인 탭 릴리스: `20261020075611be2d07`. 글 작성/태그/검색 문구 탭과 태그 칩·짧은 문구 목록을 도입했다. [당시 공개 코드·템플릿 검증](../evidence/deployment/review-tabs-deployment.json)을 보존한다.
- 이전 간결화 릴리스: `2026102007340812030a`. 모자이크 기본 도구를 줄이고 영역 선택 시 해제·삭제, 더보기에 세부 설정을 제공했다. [당시 코드·템플릿 검증](../evidence/deployment/editor-simple-deployment.json)을 보존한다.
- 이전 한 화면 UX 릴리스: `202610200709276f1421`. 사진과 편집 도구를 viewport 안에 배치하는 구조를 도입했다. [당시 공개 코드·작성 템플릿 검증](../evidence/deployment/editor-ux-deployment.json)을 보존한다.
- 이전 얼굴 개선 릴리스: `20261020062224e8ef72`. 얼굴 후보를 확대 재확인하고 중복 영역의 합집합 팽창을 없애는 v5 개선 배포다. [공개 코드·작성 템플릿 검증](../evidence/deployment/face-confirmation-deployment.json), [사진 평가와 한계](../evidence/mobile-web/public-face-corpus/IMPROVEMENT.md). WSL CPU 사진 검사에서는 비인물 오탐 8→0·정답 얼굴 43개 유지·사용자 사진 11곳 유지를 확인했다. 이번 v5는 실제 브라우저 얼굴 처리를 재검증하지 못했다. 이전 v4 릴리스 `202610200554583af100`의 [공개 작성 화면 검증](../evidence/mobile-web/face-group-pythonanywhere.json)과 [가림 화면](../evidence/mobile-web/face-group-pythonanywhere.jpg)은 v4 증거로 보존한다. 이전 이스터에그 [배포](../evidence/deployment/easter-egg-deployment.json)·[공개 조작](../evidence/deployment/easter-egg-browser.json), [재배포](../evidence/deployment/redeployment.json)·[데이터 보존 감사](../evidence/deployment/production-preservation.json)도 보존했다.
- 기존 글 2개·계정 1개·사진 파일 4개와 모든 원본 사진 digest가 유지됐다. 후속 배포에서 DB와 venv가 재사용됐고 SQLite quick_check가 정상이다. 홈 사용량 317,392 KiB(약 310 MiB)로 확인했다. 정적 파일 준비 중 NFS 쓰기 대기가 관찰됐지만 별도 사용자 작업 없이 완료됐다.
- 목록·로그인·평가 배열 API·현재 composer.mjs의 HTTP 200과 코드 digest를 확인했다. [모델/웹 자산 44개](../evidence/deployment/public-assets.json)의 공개 HEAD·크기·MIME도 모두 통과했다.
- 이전 사이트와 DB·WSGI·사진을 보존했다. 처음 전환 시 검증기의 `.js`/`.mjs` 파일명 오류로 기존 라우팅이 복구됐고, 검증기를 수정한 뒤 같은 staged 릴리스로 전환·검증을 완료했다.
- 실제 아이폰 Safari 조작, PythonAnywhere와 Android 앱의 실제 동기화, 평가서 지정 화면 증빙은 각각 별도 검증이 필요하다. 공개 HTTP 및 자산 검증만으로 이 항목들을 완료로 바꾸지 않는다.

아래 후보·전화 암호문 전달·브라우저 차단 내용은 **API 연결 이전의 준비 이력**이다. 만료된 전화 전달 명령은 현재 사용하지 않는다. 현재 인증은 PC의 가린 입력창과 별도로 제공한 공식 API 토큰으로 연결됐다. 이전 [배포 준비](DEPLOYMENT.md)는 사진관 버전 이력을 포함하므로 현재 기능·증빙은 이 문서와 [구현 기록](IMPLEMENTATION_LOG.md)을 우선한다.

## 검토할 수 있는 배포물

- ZIP: `common01/dist/pythonanywhere-common01-20261019-191129.zip` (파일명의 시각은 UTC).
- SHA-256: `bde2073c03369af989eb45f6595a79d362ac7e351e584b2a47a5021b664e761e`.
- 크기 28,348,782바이트, 서버 소스·템플릿·모바일웹 정적 모델/런타임·테스트·운영 도구 137개. 이전 95개 후보는 모바일웹 추가 전 이력이다.
- 파일별 SHA-256: 같은 이름의 `.json` manifest.
- 개발 DB, 사용자 업로드 사진, 계정 정보·private 설정, 증빙, node_modules, Coverage 산출물, Android APK는 제외했다.
- 재현: Windows `tools/local/package-common01.ps1`. 압축 안의 서버 루트는 `PhotoBlogServer/`다.

Android 모델은 APK에 포함된다. 모바일웹 MediaPipe·EfficientNet·Tesseract 한영 모델/런타임 약 70 MB는 ZIP에 정적 파일로 포함해 브라우저에서 실행한다. 서버 Python에는 추론 라이브러리를 설치하지 않는다. 압축 전 소스·collectstatic 복사·venv를 합친 실제 디스크 잔량을 배포 전에 확인한다. 서버는 Django·DRF·Pillow·SQLite로 사진·분류·OCR 문구를 검증·저장·조회한다. 추가 워커·외부 DB·유료 인식 API를 쓰지 않는다.

## 계정 접근 후 먼저 확인할 사항

현재 코드의 배포 후보 호스트는 `daejinha.pythonanywhere.com`이다. 실제 로그인한 계정·Web 탭의 호스트·System image·Python 지원 버전·디스크 잔량을 확인한 뒤 경로를 결정한다. 후보값만 보고 다른 계정이나 이전 Lab03 앱을 변경하지 않는다.

무료 Web 앱 하나에 기존 Lab03가 연결되어 있다면, 현 WSGI·Python/venv·static/media 매핑과 기존 DB/media를 보존하고 **교체 대상·복구 방법을 제시한 뒤 교체 승인을 받는다.** 서버 후보 소스가 준비되었다는 이유로 기존 앱을 덮어쓰거나 기존 DB에 migration하지 않는다. 실제 교체가 필요한지는 아직 계정 접근 전이라 미확인이다.

로그인 브라우저 세션이 없어 PythonAnywhere 로그인창을 열고 사용자 로그인을 요청했다. 비밀번호를 대화에 기록하도록 요구하지 않는다. 코드 업로드·새 소스/venv 준비·설정·검증은 로그인 후 에이전트가 진행할 작업이며, 사용자에게 모델 설치·학습을 맡기는 절차가 아니다.

## 별도 디렉터리 설치 계획

예정 경로는 `/home/daejinha/common01_20261020/PhotoBlogServer`, venv는 `/home/daejinha/.virtualenvs/common01_20261020`다. 실제 계정이 다르거나 해당 경로가 이미 존재하면 확인 없이 덮어쓰지 않는다. 코드 업로드 후 PythonAnywhere **Bash**에서만 설치·migration·운영 검사를 수행한다.

1. ZIP 파일별 경로와 전체 SHA-256을 확인하고 새 디렉터리에만 압축을 푼다.
2. 계정에서 지원되는 Python 3.12 이상을 확인한다. 앱 Python과 venv Python을 맞추고 고정 requirements를 설치해 `pip check`를 실행한다.
3. 기존 운영 설정과 별개로 앱용 private config의 유효성·권한을 확인한다. 키·비밀번호를 로그·보고서에 출력하지 않는다. 기존 키를 임의로 덮어쓰거나 재발급하지 않는다.
4. `deploy/manage_production.py`가 읽는 같은 설정으로 `check --deploy`, `migrate`, `collectstatic --noinput`을 수행한다. 새 migration `0003_photocontent_phototag_phototextline`까지 포함한다.
5. 후보 WSGI·venv·Source/Working directory·`/static/`·`/media/` 매핑을 실제 절대 경로로 작성한다. 현재 앱 교체가 필요하다면 승인 후에만 활성화/Reload한다.
6. 실제 HTTPS URL로 기본 웹·배열 API·이미지, 분류/검색 API·세션/CSRF·권한을 검증한다. 정적 .mjs의 JavaScript MIME, .wasm·worker·모델/언어 파일과 DEBUG=false의 /dev/content-check/ 404를 확인한다. PythonAnywhere 오류 로그와 디스크 잔량을 확인한다.
7. Android의 계정·설정에서 실제 HTTPS 호스트로 연결해 동기화·사진 선택/모자이크·업로드·분류 재조회·문구 교정/검색·일치 영역을 확인한다. 운영 검증용 공개 예제 사진만 사용하고 기존 개인 사진을 무단 업로드하지 않는다.

8. 실제 아이폰 Safari에서 모바일웹 보관함·촬영 입력, 실제 얼굴 탐지·모자이크·한영 OCR·교정·제외·게시·검색 강조를 확인한다. Chromium 390×844/844×390 로컬 검증은 이 절차를 대신하지 않는다. 첫 다운로드·worker fallback·메모리·키보드·뒤로가기를 기록한다.

운영 보안 검사에서 HSTS 하위 도메인/preload 경고가 있더라도 무조건 켜서 없애지 않는다. 실제 도메인 정책과 영향을 확인하고 결과를 남긴다. DEBUG·CSRF·같은 출처 제한을 꺼서 통과시키지 않는다.

## 클라우드에서만 완료할 수 있는 증빙

기본 12번은 실제 PythonAnywhere 서버 화면, 13번은 그 서버의 사진을 받은 실제 Android 화면이 필요하다. 추가 기능 E03/E05의 클라우드 저장·검색과 E01/E02/E04의 클라우드 연동도 실제 배포 후에만 확인한다. WSL의 196개·HTTP 20개 및 Android·모바일웹 로컬 성공을 이 증빙으로 대체하지 않는다.

GitHub push·최종 제출 보고서 작성 및 제출은 별도 단계다. ZIP은 배포 후보이며 최종 제출물 전체가 아니다.

## 아이폰에서 공식 API 인증 연결 준비

2026-10-20. 브라우저 로그인 공유 대신 공식 PythonAnywhere API 인증을 받을 로컬 도구를 준비했다. 현재 **인증 대기**이며 원격 파일·Web 설정 변경은 없다. PythonAnywhere 플러그인은 검색에서 찾지 못했다.

- 도구: 루트 `tools/local/pythonanywhere_auth.py`, 검사 `tools/local/test_pythonanywhere_auth.py`.
- WSL 실행: `python -m unittest discover -s tools/local -p test_pythonanywhere_auth.py -v` **12개 PASS**. 앱 서버의 기존 196개 검사와 별도이며 새 클라우드 성공 증거가 아니다.
- 사용자 흐름: 아이폰 Safari에서 공식 Account → API token을 생성(없을 때만)하고 새 Bash 콘솔을 연다. 에이전트가 제공한 공개 명령을 한 번 붙여 넣는다. 콘솔은 API_TOKEN 환경변수를 OpenSSL RSA-4096 OAEP SHA256으로 암호화해 `PA-AUTH1:` 문자열만 출력한다. 사용자 비밀번호·토큰 원문은 대화에 요구하지 않는다. 설치·모델 학습·추가 호스팅이 필요 없다.
- 비공개 키/토큰은 WSL 홈 `.config/mobile-web-service/pythonanywhere`의 디렉터리 0700·파일 0600에만 저장한다. 키·토큰은 보고서·배포 ZIP·Windows 소스·검증 출력에 넣지 않는다. 공개 명령과 만료 시각만 루트 `.local/pythonanywhere-auth-request.json`, `.local/pythonanywhere-phone-command.txt`에 있다.
- 수신 문자열은 임시 파일을 거쳐 WSL `python tools/local/pythonanywhere_auth.py accept`의 표준입력으로 전달한다. 공식 HTTPS CPU API로 확인한 뒤에만 인증을 저장하고 일회용 복호화 키를 제거한다. HTTP redirect를 따라 토큰을 전달하지 않는다. `status`·`check` 출력에 토큰을 넣지 않는다.
- 연결 명령은 30분만 유효하다. 이 제한은 전달 요청의 만료이며 실제 PythonAnywhere API 토큰의 만료/권한 축소가 아니다. 토큰은 계정 관리 권한을 가진다. 만료 시 `renew`가 새 전달 키를 만들며 유효한 요청이나 이미 연결된 인증을 덮어쓰지 않는다.
- 사용자가 암호문을 전달한 뒤 인증 확인 → 실제 계정/기존 앱 점검 → 승인된 백업·별도 배포·HTTPS 검증으로 이어간다. API 인증은 브라우저 로그인 쿠키를 생성하는 기능이 아니다. 공식 근거: https://help.pythonanywhere.com/pages/API/ 및 https://help.pythonanywhere.com/pages/GettingYourAPIToken/.

## 로그인 후 배포 점검 2026년 10월 20일

- 사용자가 직접 PythonAnywhere에 로그인했고 계정 daejinha를 확인했다. Python 3.13, 기존 source/working `/home/daejinha/mobile-web-service-project`, venv `/home/daejinha/.virtualenvs/mobile-web-service`, static/media 매핑을 읽기 전용으로 확인했다. 최초 저장공간 표시는 112.3 MB/512 MB였다.
- 최신 ZIP·manifest·배포 보조 스크립트를 계정 홈에 업로드했다. 실제 PythonAnywhere Bash의 audit에서 137개 파일 SHA256과 전체 ZIP digest가 일치했다. 기존 blog migration은 0001_initial, 0002_post_image, 0003_alter_post_image, 0004_alter_post_image이며 현재 배포 후보와 이름이 다르므로 복사 DB의 마이그레이션과 데이터 보존을 별도로 확인해야 한다.
- 백업·새 source 추출·새 venv·migration·WSGI/Web 설정 변경·Reload는 **아직 수행하지 않았다**. 현재 공개 사이트는 기존 버전이다. 사전 점검은 `evidence/deployment/preflight.json`에 보존했다.
- Bash 프레임 입력에 대해 브라우저가 처음에는 사용자 권한 거부, 대화상 재승인 뒤에는 저장된 사이트 권한 또는 관리 정책의 접근 차단을 반환했다. 동일 작업을 API·다른 브라우저·직접 프로토콜로 우회하지 않고 중단했다. 컴퓨터 앱의 설정 > 브라우저에서 www.pythonanywhere.com의 차단 상태를 변경해야 한다. 이는 PythonAnywhere 로그인 실패가 아니다.
- 재개 시 같은 브라우저의 기존 콘솔 48736170을 확인한다. 콘솔용 DOM paste는 화면에 문자를 삽입할 뿐 실제 Bash에 보내지 않았고, 프레임의 textbox에 pressSequentially와 Enter를 사용한 실제 echo/audit는 실행됐다. 입력창에 남은 텍스트를 확인한 뒤 새 명령을 보낸다. 현재 blocker는 입력 방식이 아니라 저장된 사이트 권한이다.
