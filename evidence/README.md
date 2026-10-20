# 실행 결과와 실제 화면 증거

WSL 서버, 실제 웹 브라우저, Windows Android 에뮬레이터의 실행 결과를 구분한다. 서버·웹·Android의 로컬 기능을 검증했다. 주소창 포함 게시 화면·Telnet 터미널·Android 수신 원문의 VS Code 캡처는 아직 남아 있다. PythonAnywhere·최종 Word 보고서는 미완료다. 로컬 실행 증거를 클라우드 동작 증거로 간주하지 않는다.

## 평가 항목별 증거

| 평가 ID | 실제 결과와 파일 | 제출 준비 상태 |
| --- | --- | --- |
| 3 | [웹 작성 폼](baseline-web-form.jpg), [게시 상세](baseline-web-post.jpg), [API 작성 폼](baseline-api-post-form.jpg), [HTTP 201 응답](baseline-api-created.jpg) | 실제 POST 검증 완료, 게시 화면의 주소창 포함 캡처 추가 필요 |
| 4 | [실제 Telnet 출력](baseline/telnet-http.txt) | HTTP 200 및 게시글 2개 JSON 배열 확인, 터미널 캡처 추가 필요 |
| 5 | [실제 API JSON](baseline-api-list.json), [CodeBeautify 검증 화면](baseline-codebeautify.jpg) | 사용자 전송 허용 후 실제 Valid JSON 및 배열 2개 트리 확인·캡처 |
| 6 | [현재 Coverage HTML 화면](baseline-coverage.jpg), [현재 148개 테스트 로그](baseline/tests-coverage.txt), [현재 독립 실제 HTTP 17개 로그](baseline/http-api-engine.txt) | 현재 전체 WSL 검증 PASS, 생성 시각 및 총합 97.0%·라인 98.6%·분기 91.3%의 실제 HTML 캡처 확보 |
| 7 | [소켓 도구 검증](baseline/socket-curl-check.json), [실제 Android 요청 원본](android/android-request.bin), [익명 요청 검사](android/socket-request-check.json) | 실제 Android→WSL GET 원문 212B 수신·검증 PASS, VS Code 캡처는 미완료 |
| 8 | [localhost 게시 목록](baseline-home.jpg) | 실제 브라우저에 사진 게시글 2개 출력 |
| 9 | [Android 시작 화면](android/android-start.png) | 실제 API35 에뮬레이터 실행·화면 검증 |
| 10 | [Android 로컬 동기화](android/android-local-sync.png) | 실제 WSL API JSON 배열 수신·ImageView 사진 decode 검증 |
| 11 | [Android 게시 폼](android/android-upload-form.png), [게시 후 사진관](android/android-native-studio-saved.png) | 실제 OS 문서 선택·제목/본문 UI·multipart POST·서버 재조회 확인 |

[검증 명령과 소스 상태](baseline/verification.json)는 현재 WSL 실행 경로·명령 종료 코드·소스 SHA256과 검증 중 변경 여부를 담는 갱신 파일이다. 기본 단계의 총합 98.0%·라인 99.1%·분기 91.2%, 71개·HTTP 10개는 당시 기록이며 현재 추가 기능 결과를 뜻하지 않는다. 소켓 도구 24개는 전체 테스트에 포함되지만 Coverage 측정 대상은 Django `blog`·`photoblog`이고 도구·JavaScript GPU 성능 측정은 아니다.

[브라우저 업로드 저장 검증](baseline/browser-storage.json)은 별도의 테스트 DB가 아니라 브라우저가 실제로 만든 개발 DB의 Post 1·2를 읽어 확인한 결과다. 두 행의 작성자, 이미지 파일 존재, PNG 유효성, 원본 업로드 파일과 저장 파일의 SHA256 일치를 확인했다.

[잘린 JPEG 수정 전](baseline/jpeg-validation-before.json)은 디코딩 불가능한 JPEG가 검증에 통과하는 결함의 DB 저장 없는 재현이다. [수정 후 실제 서버 검증](baseline/jpeg-validation-after.json)은 네 잘린 JPEG의 거부와 실제 8000 서버의 multipart 400 응답, 기존 Post·사진 바이트 불변을 기록한다. 로컬 테스트 인증 세션은 종료했고 비밀번호·CSRF 값은 포함하지 않는다.

화면은 브라우저가 실제 출력한 JPEG이며 URL 주소창이나 터미널을 합성하지 않았다. 현재 테스트 사진은 업로드 검증용으로 생성한 PNG이고 최종 3D 에셋이 아니다. 비밀번호·토큰 파일과 임시 사진은 Git 제외 경로에 보관한다.

## 현재 웹 기능의 실제 실행

| 흐름 | 실제 화면·검증 파일 | 확인 내용 |
| --- | --- | --- |
| 회원가입과 개인 사진관 | [사진 1장인 성장 전](web/studio-before-growth.jpg), [성장 전 액자](web/studio-frame-before-growth.jpg) | 실제 웹 신규 가입 후 개인 사진관으로 이동, PNG multipart 업로드와 소유 사진 연결 |
| 성장·장식 저장 | [성장 후 꾸민 사진관](web/studio-decorated-after-growth.jpg) | 3장으로 level 1 성장, 10개 장식·8종류의 저장 배치 표시 |
| 일반 화면과 복원 | [일반 화면 복원](web/studio-normal-restored.jpg) | 3D와 같은 게시·배치 데이터, 저장 revision 및 장식 목록 복원 |
| 마을 탐색·전환 | [3D 마을](web/village-rendered.jpg), [일반 마을 목록](web/village-normal.jpg), [첫 렌더](web/village-first-render.jpg) | 실제 W 키 캐릭터 이동·집 클릭으로 다른 사진관 방문·3D/일반 데이터 전환 확인 |
| 다중 사용자·읽기 전용 | [다른 사용자 방문](web/studio-visitor.jpg) | 다른 신규 사용자로 사진관 2 방문·편집 도구 비노출. 변경 거부는 별도 서버 회귀 테스트에서 검증 |
| 액자와 사진 상세 | [액자 사진 열기](web/frame-photo-open.jpg) | 실제 방문자가 사진관 2의 3D 중앙 액자를 클릭→Post 3 상세로 이동, 제목·원본 사진 출력 확인 |
| 서버 저장 실증 | [DB·이미지·배치·HTTP 읽기 전용 검증](web/browser-storage.json) | Gallery 2/owner 2, Post 3·4·5, count/peak 3, level 1, room 10×8, revision 5, 10개/8종. 전체 이미지 decode·SHA 일치, 배치 재검증, 공개 HTTP 200과 DB 일치, 검사 전후 DB·미디어 불변 |
| 웹 로직 자동 테스트 | [Windows Node 실행 로그](web/node-tests.txt), [웹 소스·구문 검증 manifest](web/verification.json) | API·CSRF·동일 출처·충돌·초안·지도·장면 구조·자원 해제의 32개 PASS. GPU 렌더 성능·전체 브라우저 흐름 검증을 의미하지 않음 |

현재 개발 DB에서 생성한 화면 증거와 격리 테스트 DB의 성공을 섞지 않는다. `web/browser-storage.json`에는 계정명·비밀번호·토큰·CSRF·게시글 본문을 저장하지 않는다. 이미지 경로는 무작위 UUID다. 자동 테스트는 잘못된 입력·타인 권한·성장 경계·사진 삭제·rollback 파일 정리·commit 후 정리 실패·실제 파일 SQLite 동시 CAS까지 별도로 검증한다.

현재 최종 WSL 검증은 전체 148개(앱·소켓·저장 검사 134 + 운영 설정 14)·독립 실제 HTTP 17개 PASS, Django check 0개·migration 변경 없음·manifest pass true/검증 중 소스 변경 없음이다. Django `blog`·`photoblog` Coverage는 라인 691/701 = 98.6%, 분기 179/196 = 91.3%, 총합 870/897 = 97.0%다. 웹의 Windows Node 32개는 별도이고, 전체 148개에도 포함되는 소켓 24개와 도구는 이 Django Coverage 측정 범위 밖이다.

현재 웹 화면 증거는 실제 브라우저 출력이며 주소창 합성이 아니다. 최신 Coverage 화면도 HTML을 새로고침하고 현재 생성 시각 및 비율을 확인해 같은 파일에 갱신했다. 3D 그래픽을 렌더링했다는 결과를 GPU 성능 최적화 또는 Java OpenGL ES 실행 성공으로 해석하지 않는다.

## Android 로컬 검증

Windows에서 `PhotoViewer/tools/verify-android.ps1 -RunDevice`를 실행했다. 실제 Gradle 빌드·Java 유닛 45개·API35 에뮬레이터의 기기 테스트 7개 PASS, Lint 오류 0개·SDK 관련 경고 2개다. [Android manifest](android/verification.json)에 소스·PVM 자산·설치 APK·현재 실행 PNG의 SHA256과 소스 안정 여부를 기록한다. `BuildOnly` 결과나 이전 PNG만으로 기기 검증을 통과시키지 않는다.

| 실제 흐름 | 원본 화면 | 검사 내용 |
| --- | --- | --- |
| 시작·사진 동기화 | [시작](android/android-start.png), [동기화](android/android-local-sync.png) | 실제 WSL 서버 JSON 배열과 ImageView 디코딩 |
| 마을·일반 전환 | [GLES 마을](android/android-native-village.png), [일반 마을](android/android-normal-village.png) | 실제 셰이더 실행·장면 픽셀 및 SurfaceView 제거 |
| 사진 게시 | [게시 폼](android/android-upload-form.png) | 실제 시스템 문서 선택기로 생성 PNG 선택, URI 읽기·제목/본문·multipart POST |
| 배치 저장·드래그 | [저장된 사진관](android/android-native-studio-saved.png), [소파 이동](android/android-native-studio-dragged.png) | 실제 액자/소파 저장·HTTP 재조회, SurfaceView 터치→편집 X 좌표 변화 |
| 일반 화면 복원 | [서버 배치 복원](android/android-studio-normal-restored.png) | 미저장 배치 폐기 후 서버 버전 1·장식 2개 복원 |
| 집 선택·읽기 전용 | [집 터치 직전](android/android-native-village-before-house-tap.png), [방문](android/android-visitor-readonly.png) | 실제 집 좌표 터치→해당 사진관 이름 확인, 타인 저장 UI 비노출 |

`LiveRepositoryTest` 3개는 실제 Django 인증·CSRF·multipart 원본 SHA256·권한·성장·액자 재투영·revision 409·소켓 진단을 검사한다. 그중 인증 성공과 후속 GET 실패를 구분하는 검사는 Android의 실제 HttpURLConnection/JSONObject와 격리된 loopback HTTP 응답을 사용하며 Django 배포 검증으로 집계하지 않는다. `NativeUiSmokeTest` 3개는 시작·사진 동기화·GLES 전환을, `NativeStudioFlowTest` 1개는 실제 회원가입부터 사진 선택·꾸미기·방문까지 이어지는 흐름을 검사한다. 3D/일반 두 모드에서 미저장 배치의 사진 카드 이동을 취소하면 초안과 좌표가 유지되는 회귀도 포함한다.

셰이더 draw counter 증가만으로 성공을 판단하지 않고 실제 합성 화면의 색상·장면 픽셀을 확인한다. 파일 선택기 전환이 끝나기 전에 촬영된 화면은 게시 폼 증빙으로 쓰지 않는다. 초기 빈 화면·디버그 캡처는 `private/android/early-native-captures-20261010/`에 보존했으며 공개 원본에는 최종 검증의 10장을 사용한다. 이 실행의 서버는 WSL localhost이며 PythonAnywhere 서버/앱 동기화와는 별개다.

## 직접 캡처할 화면

### 게시 상세의 주소창

서버 실행 중 Windows 브라우저에서 `http://127.0.0.1:8000/post/1/`을 연다. 주소창, 게시글 제목·본문, 업로드한 사진이 함께 보이도록 창을 넓힌 후 화면을 캡처한다. 사진은 로그인 없이도 볼 수 있다. 결과는 `baseline-web-post-with-address.png`로 이 폴더에 넣는다.

### Telnet 터미널

WSL Ubuntu 터미널에서 다음 명령을 실행한다.

```bash
cd /mnt/c/Users/haddo/mobile_web_service/common01/PhotoBlogServer
/home/daeha_linux/.venvs/mobile_web_service/bin/python tools/capture_telnet.py
```

이 도구는 실제 설치된 GNU Telnet을 실행한다. 출력에 Telnet 명령, GET 요청, HTTP 200 응답과 JSON 배열이 나타나도록 터미널을 넓힌 후 캡처한다. 결과는 `baseline-telnet-terminal.png`로 이 폴더에 넣는다. 서버에 연결할 수 없으면 캡처 성공으로 처리하지 않는다.

## 재검증

WSL Ubuntu에서 현재 서버 전체 검증과 로그·HTML 생성을 다시 수행하려면 다음 명령을 실행한다. 도구명에 baseline이 남아 있지만 현재 추가 기능 테스트도 포함한다.

```bash
cd /mnt/c/Users/haddo/mobile_web_service/common01/PhotoBlogServer
/home/daeha_linux/.venvs/mobile_web_service/bin/python tools/verify_baseline.py
```

Coverage 화면은 서버가 실행 중일 때 `http://127.0.0.1:9001/`에서 볼 수 있다. `htmlcov`는 생성 파일이므로 Git에 포함하지 않는다. 코드 변경 후에는 테스트와 리포트를 다시 생성하고 최신 실행 결과로 증빙을 갱신한다.

현재 웹 로컬 저장 결과는 WSL에서 다음과 같이 읽기 전용으로 다시 확인한다. ID·최소 revision·필수 장식 종류는 실제 최종 구성에 맞춰 지정한다. 업로드 fixture는 Git 제외 테스트용 PNG이며 배포 서버에서 이 로컬 명령을 제출 증거로 쓰지 않는다.

```bash
python tools/verify_studio_storage.py \
  --gallery-id 2 --owner-id 2 --post-ids 3 4 5 --min-revision 5 \
  --required-kinds frame sofa chair table plant lamp rug shelf \
  --fixture ../evidence/test-runs/baseline-photo.png
```

## Android 요청 원문 캡처 준비

평가 ID 7에서는 실제 Android 요청을 받아야 한다. WSL에서 다음 명령으로 한 요청만 받는 캡처 서버를 시작한다. Django 8000과는 별개다.

```bash
cd /mnt/c/Users/haddo/mobile_web_service/common01/PhotoBlogServer
/home/daeha_linux/.venvs/mobile_web_service/bin/python tools/socket_request_capture.py
```

기본 포트는 8002이고 출력 파일 위치가 터미널에 표시된다. 에뮬레이터의 연결 주소는 `http://10.0.2.2:8002/`이며, `LiveRepositoryTest#testSocketDiagnosticCapturesOnlyAnonymousGet`가 인증 Cookie·CSRF·토큰 없이 실제 GET을 보낸다. 현재 API35 에뮬레이터에서 212B 원문 수신과 진단 응답을 확인했다. 이 서버의 text/plain 응답은 사진 목록이 아니므로 이 단계의 성공을 앱 동기화 성공이라고 주장하지 않는다. Django API의 사진 동기화는 8000에서 별도로 검증한다.

최종 실행의 [Android 원문](android/android-request.bin)은 WSL에서 GET·인증 헤더 없음·본문 0B를 검사한 뒤 바이트를 변경하지 않고 복사했다. SHA256은 [검사 기록](android/socket-request-check.json)에 있다. VS Code에서 이 파일을 열고 원문 요청 줄·헤더가 보이도록 실제 화면을 캡처해 `android-request-vscode.png`로 저장한다. 단순 파일 또는 Codex 편집기 화면으로 VS Code 캡처 항목을 완료 처리하지 않는다.

원문은 기본적으로 Git 제외 `private/request-captures/`에 저장한다. 인증 Token·Cookie 등이 포함된 원문을 공개 저장소에 올리거나 보고서에 노출하지 않는다. 공개 증빙은 비밀 헤더 없는 실제 Android GET으로 만들며, 원문을 가공하면 가공본이라고 표시한다. curl 결과는 도구 검증일 뿐 Android 요청 증빙을 대체하지 않는다.
