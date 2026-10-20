# 공통평가 구현 진행 기록

## 현재 상태 2026년 10월 20일

현재 서비스는 daejinha만 작성하는 1인 사진 블로그다. 사진관·마을·공개 회원가입을 제거했고 실제 PythonAnywhere 운영과 Android 동기화를 유지한다. Android의 2열 목록·고정 편집·세 탭·태그 칩·공통 문구 교정칸·키보드 대응 및 OCR 개선을 반영했다.

최근 기록은 WSL Django145·HTTP15, Windows 웹67, Android JVM38·통합기기9, 작은 화면 UI1, 운영 읽기 전용1 통과다. 운영 사진3개를 모두 표시·해시 대조했다. 보고서는19페이지·그림20장으로 최신화했다. 수치별 환경과 한계는 PROJECT_STATUS.md, ANDROID_NATIVE_PARITY.md 및 각 manifest를 따른다. 이번 문서 작업에서 프로그램 검사를 다시 실행한 것은 아니다.

다중 검색어 일치 줄, 최신 웹 전체 UI·물리 Safari, 지정 캡처6종과 GitHub 제출이 남아 있다. 최종 묶음은 만들지 않았다. 아래 단락은 이전 시점의 진행 기록이며 현재 상태나 현재 검사 수치로 읽지 않는다.

## 이전 진행 기록



2026-10-20 모바일웹 보완: 세 추가 기능을 웹 작성·수정·상세에도 구현했다. 브라우저에서 얼굴 탐지·모자이크, 테마/태그 추천, 한영 OCR·교정/제외와 검색 강조를 제공하며 서버 API를 Android와 공유한다. Windows Node 유닛 21개, 실제 Chromium 모델/픽셀 9개와 게시·검색·제외 흐름, WSL Django 196개·독립 HTTP 20개 PASS. [모바일웹 실제 증거](../evidence/mobile-web/browser-ui.json), [보고서 메모](REPORT_NOTES.md), [서버 manifest](../evidence/content/server/verification.json)를 기준으로 한다. 물리 아이폰 Safari와 실제 PythonAnywhere는 미검증이다. 아래 187개 기록은 이 보완 전 이력이다.

2026-10-20 구현 진행: 확정한 세 기능의 서버 검증/저장/검색, Android 인식·모자이크·교정·새 작성/검색 화면과 웹 검색을 구현했다. WSL 전체 187개·독립 HTTP 20개, Android JVM 63개와 실제 기기/전체 UI 흐름을 검증했다. 최신 기기 수·소스/APK·캡처는 [Android manifest](../evidence/content/android/verification.json), 상세 경위는 [구현 기록](IMPLEMENTATION_LOG.md), 보고서에 옮길 설명은 [메모](REPORT_NOTES.md)로 관리한다. PythonAnywhere 로그인·운영 확인, 지정 제출 캡처 일부·최종 Word·GitHub 제출은 미완료다. 다음 문단은 설계 시점의 이력이다.

2026-10-20: 사용자가 얼굴 자동 모자이크·자동 테마/태그 분류·사진 속 글자 검색을 확정하고 설계를 요청했다. 최종 평가서와 13일 전사문을 참고한 [현재 설계](design-20261020/README.md)에 화면·상태·데이터·API·검증·시연 및 기본 1–14 추적을 정리했다. 사용자 기능 3개, 추가 등록 계획 5개(Android 3·서버 2)다. 이번 변경은 문서·흐름도이며 실행 코드는 아직 교체하지 않았다. 과거 모아 설계·시안은 승인되지 않은 제안으로 보존한다. 아래 환경 복원 PASS는 기존 사진관 버전의 결과다.

2026년 10월 19일. 새 PC의 로컬 환경 복원과 실행 검증을 마쳤다. WSL 서버·실제 웹 3D·Java Android의 네이티브 3D와 로컬 동기화·게시·꾸미기·방문을 확인했다. 프로젝트 전체 제출은 미완료이며 PythonAnywhere 배포·클라우드 Android 동기화·최종 보고서·제출용 일부 캡처가 남아 있다. 아래 10월 10일 기록은 이전 PC의 작업 이력이다.

## 새 PC 환경 복원 (2026-10-19)

사용자의 현재 목표에 따라 기능 확장 없이 환경을 구성했다. 기존 WSL2 Ubuntu 22.04와 시스템 Python 3.10은 유지하고, uv의 CPython 3.12.15 및 `/home/daeha/.venvs/mobile_web_service`에 고정 의존성을 설치했다. 소스는 `/mnt/c/Users/1/mobile_web_service` 하나만 사용한다. 기존 DB를 SQLite backup으로 보존했으며 적용할 새 migration은 없었다.

Windows에 공식 Android Studio Rabbit 1 / JBR25와 API36·Build Tools36.1.0·API35 Google APIs x86_64 가상 기기를 설치했다. SDK는 Codex 앱 경로 가상화를 피한 `C:/Users/1/AppData/Local/Programs/Android/Sdk`에 두고, 새 local.properties의 이스케이프와 Lint 캐시를 정리해 검증했다. 전역 JAVA_HOME은 보존하고 프로젝트 실행 스크립트가 해당 프로세스의 JDK를 선택한다. Telnet 도구의 이전 PC 고정 경로는 PATH에서 설치된 바이너리를 찾도록 수정했다.

- WSL: `python tools/verify_baseline.py` 전체 148개·독립 HTTP 17개 PASS, check 0개·migration 변경 없음·검증 중 소스 변경 없음. Coverage 총합 97.0%·라인 98.6%·분기 91.3%.
- Windows 웹: `node frontend/verify-web.mjs` 32개 PASS. 실제 브라우저의 3D 마을·기존 사진관 복원·신규 가입·사진 업로드·배치 저장·새로고침 복원을 확인했다.
- Windows Android: `verify-android.ps1 -RunDevice` 빌드·유닛 45개·실제 API35 기기 7개 PASS. Lint 오류 0개·버전 관련 경고 3개. 신규 원본 화면 10장을 확인했고 실제 익명 Android GET 212B를 WSL 소켓에서 수신했다.
- 이전 실습: Django 5개, Python 사칙연산 8개, 계산기 Java 10개 PASS. 소켓 실습의 실제 curl multipart와 추출 PNG SHA256 일치, 실제 계산기 30÷100=0.3을 확인했다.
- 기존 사진관 2의 사진 3장·8종 장식·저장 revision과 DB·파일·공개 HTTP 일치를 읽기 전용으로 확인했다. 테스트는 신규 로컬 계정과 사진을 추가했으며 기존 사용자 데이터를 삭제하지 않았다.
- 세 실습 Git 이력을 인계 bundle에서 복원했다. PythonAnywhere 변경·원격 push는 수행하지 않았다. 과거 검증 기록은 `.local/previous-evidence-20261010`에 보존했다.

실행 명령과 경로는 [현재 PC 실행 안내](../../transfer/LOCAL_SETUP.md), 현재 실행 로그는 프로젝트 루트의 `.local/setup-20261019`에 있다. 이전 PC의 baseline JPEG 캡처 전체를 이번 PC에서 새로 촬영한 것으로 주장하지 않는다.

## 역사적 기본 구현 검증

이 절의 71개·HTTP 10개·Coverage 98.0%는 추가 기능 구현 전 결과다. 같은 경로의 검증 로그·manifest와 `baseline-coverage.jpg`는 최신 소스로 갱신됐으므로 현재 결과와 화면은 아래 추가 기능 절 및 최신 manifest를 기준으로 한다. 옛 수치를 현재 화면에 적용하지 않는다.

- 실제 사진 업로드·게시 목록·상세·수정·삭제, 로그인·로그아웃, DRF Post API, 토큰 발급, JSON 확인 페이지를 구현했다. 작성자는 서버에서 지정하고 타인의 수정·삭제를 거부한다.
- WSL에서 `manage.py check`, `makemigrations --check --dry-run`, `coverage run manage.py test --verbosity 2`, 독립 `api_test_engine.py`를 재검증했다. JPEG 회귀 테스트를 포함한 서버 기본 47개와 소켓 도구 24개를 합친 71개, 독립 실제 HTTP 테스트 10개 모두 통과했다. 테스트용 DB와 이미지 저장소를 사용해 개발 DB를 변경하지 않는다.
- 당시 Coverage HTML과 JSON을 생성했다. 측정 대상은 Django 서버의 `blog`·`photoblog`이며 소켓 도구는 별도 테스트로 검증했다. 당시 총합 98.0%, 라인 99.1%, 분기 91.2%였고, 분기 Coverage를 98.0%라고 부르지 않았다. HTML 화면은 `evidence/baseline-coverage.jpg`에 저장했고 이후 현재 97.0% 화면으로 갱신했다.
- 실제 브라우저에서 웹 폼과 DRF multipart POST로 각각 PNG 사진을 게시했다. 게시 상세와 API 201 응답, 현재 게시 목록을 캡처했고 GET 응답에 두 게시글이 JSON 배열로 포함되는 것을 확인했다.
- 브라우저가 생성한 개발 DB의 Post 1·2를 WSL에서 읽기 전용으로 검사했다. 작성자 1, 이미지 존재, PNG 900×600 유효성, 원본과 저장 파일의 SHA256 일치 모두 통과했다. `evidence/baseline/browser-storage.json`에 기록했다.
- 공식 Ubuntu GNU Telnet으로 실제 HTTP GET을 실행해 200과 JSON 배열을 확인했다. `evidence/baseline/telnet-http.txt`는 실제 프로세스 출력이며 터미널 스크린샷을 대체하지 않는다.
- 검증 로그, 실행 명령, 소스 SHA256과 변경 여부는 `evidence/baseline/verification.json`에 기록했다. 재검증 도중 소스 변경은 없었다.

## 기본 증빙과 작업 순서

작성 폼, 게시 상세, API POST 201, localhost 목록, Coverage HTML의 실제 페이지 캡처를 확보했다. 평가 ID 3의 주소창 포함 게시 화면과 ID 4의 터미널 화면은 현재 자동 캡처 환경에서 확보할 수 없어 사용자 수동 캡처를 요청했다. 실행 명령과 파일 위치는 `evidence/README.md`에 정리했다.

CodeBeautify는 외부 전송 자동 승인 거부 후 사용자가 지정한 가상 테스트 JSON 전송을 명시적으로 허용해 진행했다. 실제 서비스에 현재 GET 응답의 게시글 2개 JSON을 입력하고 Validate를 실행했다. `Valid JSON` 표시와 `array [2]` 트리가 함께 보이는 `evidence/baseline-codebeautify.jpg`를 확보했다. 비밀번호·토큰·개인 사진은 전송하지 않았고 Save & Share는 실행하지 않았다.

초기 기본 증빙 확보 시 `--noreload` 서버의 소스 갱신 여부도 확인했다. WSL 시각 보정 때문에 시작 시각만으로 구버전 여부를 판단하지 않고 유효 CSRF를 포함한 빈 작성 POST를 현재 소스와 비교했다. 실제 런타임과 현재 소스 모두 필수 입력 오류 3개를 반환했으며 개발 DB의 게시글·사진 파일 수는 변하지 않았다. 당시 동작 차이가 입증되지 않아 서버를 재시작하거나 검사를 반복하지 않았다. `evidence/baseline/runtime-form-probe.json`에 기록했다. 이후 아래 JPEG 결함의 실제 소스 수정은 별도로 확인한 프로젝트 소유 서버를 재시작해 반영했다.

기본 증빙 완료 후 추가 기능을 구현하는 순서를 유지한다. 사용자가 수동 캡처를 제출 직전으로 미루고 구현을 계속하라고 명시하면 증빙은 미완료로 보존하고 순서 변경 근거를 기록한다.

## 최종 기본 서버 감사와 JPEG 수정

추가 기능으로 넘어가기 전 읽기 전용 코드 감사에서 잘린 JPEG가 `Image.verify()`만으로는 검증을 통과하는 결함을 확인했다. WSL에서 정상 JPEG의 끝 2·10·25·50바이트를 제거한 네 입력 모두 Serializer 검증에는 통과하지만 전체 디코딩은 실패했다. DB 저장 없이 재현한 결과는 `evidence/baseline/jpeg-validation-before.json`이다.

`blog/validators.py`에서 기존 포맷·크기·픽셀 검증 후 이미지를 다시 열어 `load()`까지 검증하도록 수정했다. 잘린 JPEG 거부·커서 초기화, 웹 폼의 DB·미디어 미생성, 실제 HTTP multipart API 400·DB·미디어 미생성의 회귀 테스트 3개를 추가했다. 전체 71개와 독립 HTTP 10개 통과 후 Coverage HTML을 재생성하고 실제 페이지 캡처를 갱신했다.

실행 경로·명령으로 소유자를 확인한 기존 서버를 수정 코드로 재시작했다. 실제 8000 서버에 로컬 테스트 작성자로 로그인해 유효 CSRF와 잘린 JPEG를 포함한 multipart POST를 보냈다. 400 및 image 오류를 확인했고 Post 1·2와 저장 사진 SHA256은 전후 일치했다. 테스트 세션은 로그아웃했고 비밀번호·CSRF 값은 기록하지 않았다. `evidence/baseline/jpeg-validation-after.json`에 증거를 저장했다.

## 선행 증빙 대기 조건

주소창 포함 게시 화면과 Telnet 터미널 화면이 없는 조건은 최초 수동 캡처 요청, 소켓 도구 준비, 최종 기본 서버 감사의 연속 세 Goal 턴에서 그대로 확인됐다. 독립적으로 가능한 소켓 도구 준비·서버 감사·발견한 JPEG 결함 수정은 완료했다. 같은 테스트를 반복하거나 추가 기능을 선행 증빙 대신 구현하지 않는다.

Computer Use 스킬의 지원 Windows 경로도 확인했으나 Chrome 실행은 `Computer Use app approval timed out`으로 종료돼 주소창 캡처를 확보하지 못했다. 승인 없이 shell 실행 등 다른 경로로 우회하지 않았다. 스킬의 Windows 터미널 자동화 금지도 유지한다. 페이지 캡처를 주소창·터미널 합성 이미지로 바꾸지 않는다.

재개 조건은 사용자가 두 실제 캡처를 제공하거나, 캡처 제출을 나중으로 미루고 추가 기능을 먼저 구현하라고 명시하는 것이다. 후자의 경우에도 평가 증빙은 미완료로 보존한다. CodeBeautify JSON 전송 허용은 이 순서 변경 허용으로 해석하지 않는다.

## 구현 재개

2026년 10월 10일 사용자가 “목표에 따라서 구현 먼저 계속 진행”을 명시했다. 위 캡처 두 장은 미완료로 유지하고 서버·웹 추가 기능 구현을 먼저 진행한다. 평가 항목을 생략하거나 완료로 처리하는 변경이 아니라 증빙 확보 순서 변경이다. Java Android는 웹 구현 뒤에 진행하며 PythonAnywhere 필수 배포도 유지한다.

회원가입 웹 폼·탐색/개인 사진관 경로와 서버·실제 HTTP 통합 테스트를 작성했다. 등록 시 User·사진관·초기 배치를 하나의 트랜잭션으로 처리한다. 프런트 API 제어기의 동일 출처 제한·세션·CSRF·409 충돌·네트워크 오류 테스트 8개가 초기 Windows Node 검증에서 통과했다. Python 백엔드 검증을 Windows로 대체한 결과가 아니며, 이후 전체 웹 로직 검증과 WSL 서버 검증으로 범위를 확장했다.

Three.js 0.186.0을 공식 npm에서 고정 설치하고 core·module·라이선스를 Django 정적 vendor로 복사했다. 배포 서버에는 npm/Node 프로세스나 외부 CDN이 필요하지 않다. 성장·꾸미기 계약, UI 초안 상태와 렌더러 콜백 경계를 설계 문서에 기록했다. 렌더러의 시각 품질은 실제 브라우저 검증 전까지 완료로 판단하지 않는다.

## 현재 서버·웹 구현과 최종 검증

- `Gallery`·`DecorLayout`과 데이터 migration을 추가했다. 개발 DB 적용 전 백업 후 기존 Post 1·2와 실제 이미지 바이트를 보존했고, 기존 사용자에게 사진관과 초기 배치를 생성했다. 새 회원가입은 User·Gallery·Layout을 한 트랜잭션에서 생성하고 세션 로그인한다.
- `/api_root/Post/`는 기존 JSON 배열·필드를 유지한다. 웹 업로드와 Post API 작성·수정·삭제는 저장 서비스로 연결했으며 작성자·시각은 서버에서 지정한다. `/api/v1/`는 공개 사진관·상세·배치·catalog·현재 인증 정보·가입을 제공한다. 소유자만 변경하며 공개 조회는 인증정보를 노출하지 않는다.
- 순수 `domain.py`에서 성장 경계, UUID, 유한 숫자(거대 정수 포함), 가구 footprint·벽 부착·회전·크기·수량·사진 소유권을 검증한다. peak는 사진 삭제 후 축소되지 않는다. 성장 단계가 바뀌면 액자를 확장된 벽에 재배치하고 revision을 올린다. 사진 삭제 시 액자를 없애지 않고 photo_id를 비우며 오래된 초안 저장은 409로 거부한다.
- SQLite의 읽기 전 write-intent와 revision CAS를 사용한다. 별도 임시 파일 DB·독립 프로세스 두 개가 같은 revision으로 동시에 저장한 실제 회귀에서 저장 1건·충돌 1건·최종 revision 1을 확인했다. 공유 메모리 SQLite 결과로 파일 배포의 동작을 대신하지 않는다.
- 이미지 전체 디코딩은 저장 전에 검증하고 서비스 트랜잭션 실패 시 새 업로드 파일만 정리한다. commit 후 기존 사진 정리 실패가 rollback으로 오인돼 새 파일을 삭제하는 결함을 읽기 전용 재현으로 찾았다. robust on_commit 및 commit marker로 보완했고 실제 outer commit 회귀에서 DB가 가리키는 새 사진 파일이 보존됨을 확인했다. 실패한 기존 파일 정리는 에러 로그에 남긴다.
- 최종 WSL `tools/verify_baseline.py` 종료 코드 0: 전체 148개(기존 앱·소켓·저장 검사 134 + 운영 설정 14) PASS, 독립 실제 HTTP 17개 PASS, `check` 0개, `makemigrations --check --dry-run` 변경 없음. [현재 서버 manifest](../evidence/baseline/verification.json)의 모든 단계 통과 및 검증 중 소스 변경 없음이 확인됐다. 현재 Django Coverage 라인은 691/701 = 98.6%, 분기는 179/196 = 91.3%, 총합은 870/897 = 97.0%다. 실제 HTML 페이지를 새로고침해 생성 시각과 세 비율을 확인하고 [현재 Coverage 화면](../evidence/baseline-coverage.jpg)을 갱신했다. 총합을 분기 비율이라고 부르지 않는다.
- Windows Node의 현재 API·편집 초안·지도·장면 구성·충돌·자원 해제 테스트 32개 PASS 및 구문/소스 변경 검증을 [웹 manifest](../evidence/web/verification.json)에 기록했다. 이 결과는 Python backend·GPU 성능·Android 검증이 아니다.
- 실제 브라우저 신규 사용자의 PNG 3장 multipart 업로드로 level 0에서 level 1로 성장했다. 액자와 가구 10개·8종류를 저장했고 일반/3D 전환·서버 복원·3D 의자 drag 및 저장 후 재불러오기, W 키 캐릭터 이동, 집 클릭으로 다른 사진관 방문을 확인했다. 다른 신규 사용자의 사진관 방문에는 편집 도구가 나타나지 않았다. [성장 전](../evidence/web/studio-before-growth.jpg), [성장 전 액자](../evidence/web/studio-frame-before-growth.jpg), [성장 후 꾸미기](../evidence/web/studio-decorated-after-growth.jpg), [일반 화면 복원](../evidence/web/studio-normal-restored.jpg), [방문자 화면](../evidence/web/studio-visitor.jpg), [3D 마을](../evidence/web/village-rendered.jpg), [일반 마을 목록](../evidence/web/village-normal.jpg)에 실제 화면을 저장했다. 실제 방문자가 사진관 2의 중앙 3D 액자를 클릭해 Post 3 상세로 이동하고 제목·원본 이미지가 출력되는 흐름도 [액자 사진 열기](../evidence/web/frame-photo-open.jpg)에서 확인했다.
- 마지막 의자 drag·저장·복원 후 `verify_studio_storage.py`를 WSL에서 읽기 전용 실행했다. [실제 웹 저장 검증](../evidence/web/browser-storage.json): Gallery 2, owner 2, Post 3·4·5, count/peak 3, level 1, room 10×8, revision 5, 10개/8종류. 세 PNG의 전체 decode 및 fixture SHA256 일치, `validate_layout` 재검증, 공개 실제 HTTP GET 200과 DB 완전 일치, 검사 전후 해당 DB·미디어 불변을 확인했다. 계정명·비밀번호·CSRF·토큰·게시글 본문은 증거 JSON에 넣지 않았다.

이 서버·웹 단계의 성공을 Android나 PythonAnywhere 성공으로 계산하지 않았다. 이후 Java Android/네이티브 OpenGL ES 구현과 실제 로컬 실행 검증은 아래 단계에서 완료했다. 누락된 수동 캡처, PythonAnywhere 서버/Android 동기화, 최종 Word 보고서 및 원격 저장소 제출은 별도로 남아 있다.

## 소켓 요청 확인 도구

평가 ID 7의 서버 측 준비로 기존 과제 4의 수신·원문 저장·진단 응답 흐름을 `PhotoBlogServer/tools/socket_request_capture.py`에 재사용했다. 기존 저장소는 수정하지 않았고 공통평가 ROOT 밖의 파일을 import하지 않는다. 기본 포트는 8002이고 한 요청 후 종료하므로 실행 중인 Django 8000·Coverage 9001을 대체하거나 중지하지 않는다.

요청 헤더·본문 크기 제한, Content-Length 완전 수신, 중복 길이·미지원 Transfer-Encoding 거부, 파일 덮어쓰기 방지를 보강했다. 원문에는 인증 헤더가 포함될 수 있어 기본 출력은 실행별 고유 `evidence/private/request-captures/` 경로에 저장한다. 캡처 파일의 비밀 헤더를 로그에 출력하지 않는다.

서버 측 준비 단계에서 WSL 실제 curl GET의 HTTP 200 진단 응답과 원문 125바이트 완전 일치를 확인해 `evidence/baseline/socket-curl-check.json`에 기록했다. 이 응답은 명시적인 text/plain이며 JSON 사진 동기화 응답이 아니다. 실제 Android 요청은 아래 후속 단계에서 검증했다. VS Code 화면은 아직 없으므로 ID 7의 제출 증빙 전체는 미완료다.

WSL `python -m unittest blog.tests.test_socket_request_capture -v`에서 독립 테스트 24개가 통과했다. 실제 socketpair·임시 저장 폴더로 GET·분할 multipart 바이트 보존, 정확한 64KiB 헤더 경계와 분할 구분자, 불완전·중복 길이·크기 초과 거부, 파일 충돌 보존, 저장 실패 500, 연결 종료 후 저장 파일 유지 등을 확인했다. 이 시점의 전체 68개는 JPEG 회귀 추가 전 역사적 결과이며 현재 전체 148개에도 소켓 도구 24개가 포함된다.

2026-10-10 Windows API35 에뮬레이터에서 `LiveRepositoryTest#testSocketDiagnosticCapturesOnlyAnonymousGet`를 실행해 1개 PASS(1.583s)를 확인했다. 실제 Android의 `GET /api_root/Post/ HTTP/1.1`, `Accept: text/plain`, Android Dalvik User-Agent 원문 212B를 WSL 소켓 서버가 저장했다. WSL 읽기 전용 검사에서 Cookie·Authorization·X-CSRFToken 없음 및 본문 0B를 확인했다. 수신 원본은 `evidence/private/request-captures/2026-10-10-15-12-37-90fb03ad/2026-10-10-15-14-44.bin`에 보존한다. 원문 파일의 VS Code 표시 캡처는 아직 없으므로 ID 7의 제출 증빙 전체가 완료된 것은 아니다.

최종 전체 Android 검증에서도 같은 212B 익명 GET을 다시 수신했다. WSL 검사 후 `evidence/android/android-request.bin`으로 원본을 그대로 복사했다. SHA256 `6480558342d14fdd1ee62af5db625a665c98f823ba6ae5a003578bc48b14ece2`·바이트 보존·인증 헤더 없음·본문 0B를 `socket-request-check.json`에 기록했다. 이 파일을 VS Code에서 실제로 여는 화면은 아직 필요하다.

## Android 구현 및 실제 기기 검증

`PhotoViewer`에 Java native 화면, 독립 API/cookie/CSRF repository, 불변 DTO, LayoutDraft/VillageMap, OpenGL ES 3.0 렌더러 및 원본 PVM 자산을 구현했다. 회원가입·로그인·로그아웃, 실제 JSONArray 사진 동기화·디코딩, 사진 선택/제목/본문 업로드 UI, 개인 사진관 성장·방문, 여덟 장식 추가·이동·사진 연결·저장·복원·revision 409 초안 유지, 일반/3D 전환을 연결했다. APK에는 WebView/JS/Three.js 런타임이 없다.

Windows API35 `lab05_api35`를 `emulator-5554`로 실행했다. 실제 Android HTTP 테스트 2개에서 로그인·가입·CSRF·multipart 원본 SHA256·권한·성장·액자 재투영·stale 409를 확인했다. 시작 화면·WSL 서버 사진 동기화·GLES/일반 전환 3개도 실행했다. 첫 GLES 캡처는 frame counter 증가 직후 화면 합성 전 촬영되어 비어 있었으므로 성공 증거로 쓰지 않는다. 실제 합성 화면의 GL 영역에서 색상 변화/장면 픽셀을 기다리는 검사로 보강한 단일 테스트가 통과했고 지형·집·다리·캐릭터가 나오는 PNG를 확인했다. 원형 광장·화단·간판 지지대 누락과 잘못 잘린 공중 꽃을 원본 자산 변환기에서 수정했다.

코드 감사에서 POST 업로드 성공 후 GET 동기화 실패 시 중복 게시할 수 있던 UI 흐름을 수정했다. 인증 결과도 목록 동기화와 별도로 확정한다. Activity 파괴/서버 교체 시 generation으로 늦은 응답을 차단하고, 미지원 GLES 기기는 3D 성공으로 위장하지 않고 명시적으로 일반 화면만 제공한다. 앱 backup/device-transfer에서 로컬 설정·파일을 제외하고 이동 버튼은 키보드/접근성 클릭도 지원한다.

실제 OS 문서 선택기→native 게시 폼→multipart 서버 저장→액자/소파 배치 저장→HTTP 재조회 복원→실제 GLES 소파 swipe→편집 좌표 변화→서버 배치 복원→로그아웃→3D 집 tap→해당 사진관 읽기 전용 방문을 확인했다. UI 새로고침으로 사라진 접근성 노드의 클릭은 새 노드에서 거부된 이벤트만 재시도하도록 검사 도구를 고쳤다. 사진 카드도 `navigate`를 거쳐 초안 폐기 확인을 받고, 3D/일반 두 모드에서 취소 후 초안·좌표·장면이 유지되는 회귀를 통과했다.

등록은 POST 201의 SessionInfo를 바로 반환하고 로그아웃은 서버 성공 후 쿠키·CSRF를 폐기해 익명 상태를 먼저 확정한다. 뒤따르는 목록 GET 실패를 가입/로그아웃 실패로 혼동하지 않는다. 실제 Android loopback HTTP로 등록201·로그아웃302 후 조회503 조건을 검증했고, 이 조건 검사는 실제 Django 연동 증거와 구분한다.

최종 [Android 검증 도구](../PhotoViewer/tools/verify-android.ps1)의 Windows `-RunDevice` 실행은 Gradle 빌드·유닛 45개·실제 기기 7개 모두 PASS, Lint 오류 0개·SDK 관련 경고 2개다. [Android manifest](../evidence/android/verification.json)에 실제 JBR25·Gradle9.6·API35·소스/자산 안정·APK SHA256과 원본 PNG 10장을 기록했다. 실제 화면의 지형·집·사진 액자·소파·읽기 전용 상태를 시각 확인했다. 작성 캡처의 OS 전환 잔상도 검출해 앱 대화상자 합성 후 촬영하게 보강했다. 초기 잘못된 빈 화면·디버그 PNG 6개는 삭제하지 않고 Git 제외 private 폴더에 보존했다.

현재 로컬 서버·웹·Java Android 기능의 구현과 검증은 마쳤다. 평가 ID 3·4·7의 최종 제출용 캡처, ID 12·13의 실제 PythonAnywhere 배포/Android 동기화, 보고서 편집·렌더 검증, 원격 저장소 제출은 남아 있다.

## PythonAnywhere 배포 준비 검사

[배포 가이드](DEPLOYMENT.md)와 stdlib 비공개 운영 설정 로더·설정 생성·management 래퍼·PA WSGI 예시를 준비했다. 새 설정은 소스 밖의 owner-only 폴더/파일에 저장하고 기존 키를 덮어쓰지 않는다. WSL 운영 설정 검증 14개는 실제 Django WSGI import와 `check --deploy`까지 확인했다. 최종 `tools/verify_baseline.py`는 이제 전체 148개 및 독립 HTTP 17개 PASS, 소스 안정, migration 변경 없음이다. Coverage 총합 97.0%·라인 98.6%·분기 91.3%는 동일하며 실제 HTML 캡처도 갱신했다.

실제 PA 계정의 system image/Python 버전/디스크는 미확인이고 배포는 수행하지 않았다. HSTS includeSubDomains/preload 경고 2개는 미해결로 유지했다. 무료 앱 1개 제한상 기존 Lab03 앱 전환이 필요할 수 있어 원본 코드·WSGI·DB·media를 보존하고 전환 승인을 받은 뒤 진행한다. 새 배포 준비 검증은 실제 클라우드 또는 Android 클라우드 동기화 성공을 뜻하지 않는다.

2026-10-10 사용자가 “백업 후 공통평가 앱으로 교체”를 명시적으로 승인했다. 기존 Lab03 코드·DB·media·WSGI/Web 설정을 먼저 보존하고, 별도 새 소스·venv·DB·media·비공개 운영 설정으로 전환하는 범위다. Git commit/push 승인은 포함하지 않는다. 현재 Codex 브라우저의 PythonAnywhere는 로그아웃 상태여서 로그인 탭을 사용자에게 인계했다. 비밀번호를 채팅·파일에 요구하지 않으며 로그인 완료 전에는 원격 파일 또는 Web 설정을 변경하지 않았다.

## 초기에 확인한 기존 기반

- 당시 루트는 Git 저장소가 아니었다. `week3/practice_code`, `week3/assignment4_socket_server`, `week4/lab05`는 별도 Git 저장소이며 초기 감사에서 clean이었다.
- `mobile-web-service-project/.git`는 불완전한 잔재로 확인했지만 삭제하거나 수정하지 않았다.
- WSL2 Ubuntu와 `/home/daeha_linux/.venvs/mobile_web_service` 실행 가능. 기본 sandbox에서 WSL 서비스 접근이 거부되므로 승인된 WSL 실행을 사용한다.
- 기존 Django의 WSL `check`, 테스트 5개, `makemigrations --check --dry-run` 통과. 운영 DB를 변경하지 않았다.
- 기존 코드의 다른 사용자 API PATCH·DELETE, 웹 수정 시 작성자 교체, 누락된 로그인 URL 문제를 임시 테스트 DB에서 재현했다. 이후 새 프로젝트 기본 구현에서 수정하고 회귀 테스트를 추가했다.

## 작업 순서

1. 별도 `common01/PhotoBlogServer`에서 기존 모델·API·웹 흐름 발전 및 기본 결함 수정.
2. 실제 HTTP API 테스트 엔진, DB·이미지 통합 테스트, Coverage HTML.
3. 기본 POST·게시 화면, telnet, CodeBeautify, localhost 브라우저 증빙.
4. 다중 사용자·성장·방문·꾸미기 서버와 일반 웹 구현 및 테스트.
5. 절차적 3D 마을·실내·편집·전환 구현과 실제 브라우저 검증.
6. Java Android와 네이티브 OpenGL ES 구현, Windows 빌드·에뮬레이터·ADB 검증.
7. 실제 PythonAnywhere 배포 및 Android 동기화 검증, 제공 Word 보고서 정리.

## 결정 기록

- 기존 과제 저장소와 DB는 보존하고 `common01`를 공통평가 제출 ROOT로 사용한다.
- `/api_root/Post/`는 강의의 `JSONArray` 클라이언트와 호환되는 JSON 배열로 유지한다. 일반 신규 API는 별도 `/api/v1/`에 둔다.
- 렌더링용 맵은 클라이언트 생성이다. 서버에 세계 좌표를 저장하지 않는다. 개인 사진관 꾸미기 위치는 별도 사용자 데이터로 저장한다.
- 성장으로 열린 공간은 사진 삭제 후에도 유지한다. 이미 저장한 꾸미기의 공간 유효성을 보존하기 위한 규칙이다.
- 웹 서비스는 Django 정적 자산으로 배포한다. Sites의 Cloudflare 호스팅·자동 push 워크플로는 사용하지 않는다.

## 미완료와 접근 조건

PythonAnywhere 배포 계정 접근, 최종 GitHub 저장소 URL과 사용자가 승인한 push는 아직 진행하지 않았다. 로컬 구현·테스트는 이 접근 조건과 독립적으로 계속 진행한다. 새로운 접근 조건이 확인되면 필요한 조치와 영향을 구분해 기록한다.

제공 Word 보고서 원본은 보존했다(SHA256 `32143cf4d65a830410d5dec20b7d5b9b922d448c1382d2ab7dc5fc9a93384d6c`). 원본 전체 평가 표를 다시 읽었지만 페이지 렌더링은 bundled runtime에 LibreOffice `soffice.exe`가 없어 실패했다. 연결된 문서 세션도 없다. 문서 지침의 원본 렌더·시각 검사 조건이 충족되지 않아 템플릿을 추측해 최종 보고서를 작성하거나 검증됐다고 보고하지 않는다. 보고서 편집 전에 이 렌더링 환경을 해결해야 한다. 이 문제는 서버·웹 구현의 실행 환경 문제와는 별개다.

같은 원본을 내용 변경 없이 제출 ROOT의 `모바일웹서비스 프로젝트 공통평가 01_수행 결과 보고서.docx`로 복사했고 SHA256 일치를 확인했다. 이는 템플릿 위치 준비일 뿐, 캡처 삽입·보고서 작성·렌더 검증을 완료한 최종 보고서가 아니다.
