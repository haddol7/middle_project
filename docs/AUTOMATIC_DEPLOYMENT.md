# PythonAnywhere 재사용 인증과 자동 배포

2026-10-20 사용자의 명시적 요청에 따라 준비했다. **도구 구현과 실제 계정 연결·배포 성공은 별개**다. 실제 결과는 비공개 배포 기록과 공개 URL 검증으로 확인한다.

현재 계정은 공식 API 연결과 실제 반복 배포를 확인했다. 마지막 확인 상태는 DEPLOYMENT_CURRENT.md를 따른다. 아래 입력 절차는 새 컴퓨터이거나 인증이 실제로 없는 경우에만 수행한다. 이미 연결된 컴퓨터에서 다시 토큰을 입력할 필요는 없다.

## 최초 연결 또는 인증 복구가 필요할 때

PythonAnywhere Account → API Token에서 자신의 토큰을 복사해 이 컴퓨터의 `PythonAnywhere - Connect deployment` 입력창에 붙여넣고 Connect를 누른다. 토큰이 없을 때만 생성한다. 토큰·비밀번호를 대화에 보내지 않는다. 이미 연결된 인증은 덮어쓰지 않는다.

입력창은 `tools/local/connect-pythonanywhere-ui.ps1`이다. Windows는 가린 입력 UI만 제공한다. 토큰은 자식 WSL 프로세스의 표준입력으로 전달하며 명령줄·프로젝트 파일·대화에 넣지 않는다. 공식 HTTPS CPU API 인증 확인 뒤 WSL 홈 `~/.config/mobile-web-service/pythonanywhere/auth.json`에만 저장한다(디렉터리 0700, 파일 0600). API 토큰은 계정 관리 권한을 가지므로 배포 전용의 좁은 권한이라고 설명하지 않는다.

공식 API: https://help.pythonanywhere.com/pages/API/
토큰 안내: https://help.pythonanywhere.com/pages/GettingYourAPIToken/

이 방식은 사용자가 새로 요청한 공식 API 인증이다. 기존 브라우저 세션 쿠키나 차단된 브라우저 제어 경로를 재사용하지 않는다.

## 이후 에이전트가 수행하는 일

Windows에서 `tools/local/deploy-pythonanywhere.ps1`를 실행한다. Windows Node 웹 검증 후 WSL 가상환경의 `python tools/local/pythonanywhere_deploy.py`로 연결한다. 사용자는 매번 업로드하거나 Web Reload를 누르지 않는다. WSL에서 Windows 실행 파일을 직접 시작할 수 없는 현재 환경을 고려해 역할을 나눴고, WSL은 웹 증거의 최신 시각과 전체 파일 digest를 검증한다.

사용자가 2026-10-20 재확인한 작업 선호: 승인된 기능·UX 수정은 가능한 필수 검사를 마치면 **같은 작업에서 실제 배포와 공개 URL 확인까지 진행**해 휴대폰에서 볼 수 있게 한다. 화면 제어 브라우저가 연결되지 않는 경우 그 화면 검증은 미완료로 명시하되, 별도 검증 도구의 사용 응답을 기다린다는 이유만으로 이미 승인된 배포를 중단하지 않는다. 브라우저 검증의 미완료를 숨기거나 미실행 검사를 통과했다고 표현하지 않는다.

1. 공식 API 인증과 이미 실행 중인 배포용 Bash 콘솔을 확인한다. API로 콘솔 객체를 만드는 것만으로 프로세스가 실행되지는 않으므로, 콘솔이 종료됐다면 최초 브라우저 연결 한 번이 추가로 필요할 수 있다. 기존 사용자 콘솔을 종료하지 않는다.
2. 서버 소스를 먼저 패키징한 뒤 WSL 서버 검증과 Windows Node의 브라우저 규칙 검증을 실행한다. 검증 후 소스 digest가 그대로인지 확인한다. 개발 DB·사진·토큰·Android 결과물은 ZIP에 넣지 않는다.
3. ZIP·파일별 manifest·Bash용 배포 worker를 공식 파일 API로 올린다. Bash에서 전체 및 파일별 digest·경로·ZIP symlink·가용 공간·배포 잠금을 확인한다.
4. 첫 배포는 기존 WSGI·프로젝트 전체·일관된 SQLite snapshot을 별도로 보존한다. 이후에도 배포마다 DB와 WSGI 복구본을 남긴다. 기존 사용자·게시글·사진 보존을 확인한다.
5. 버전별 source와 requirements digest별 venv를 준비한다. 변경 없는 source와 모델 정적 파일은 hardlink로 공유한다. DB·media·production secret은 릴리스와 별도로 유지하고 기존 SECRET_KEY를 재사용한다.
6. 설치·pip check·production check·migration plan·migration·collectstatic·WSGI import를 PythonAnywhere Bash에서 수행한다. 새 candidate가 준비되기 전 기존 WSGI를 바꾸지 않는다.
7. 기존 앱의 source/venv/static/media/HTTPS와 WSGI를 연결하고 공식 API로 Reload한다. 공개 HTTPS 목록·로그인·평가 API·현재 JavaScript digest까지 확인한 뒤에만 배포 성공으로 기록한다.
8. 전환 실패 시 이전 WSGI와 라우팅을 복구한다. 새 게시글을 잃지 않도록 공유 DB를 자동으로 과거 snapshot으로 덮어쓰지는 않는다. 스키마 변경은 이전 코드와의 호환성 확인이 별도로 필요하다.

배포 결과와 이전 Web 설정은 WSL 비공개 인증 폴더 아래 `deployments/<release>/`에 보존한다. 서버의 백업·설치 로그는 `~/.local/share/common01-auto/<release>/`에 비공개로 보존한다. 공개 서버 source는 `~/common01-auto/releases/<release>/PhotoBlogServer`다. 민감 파일은 static 경로에 두지 않는다. 공개 검증 후 최근 두 릴리스와 복구본을 남기며, 첫 기존 사이트 전체 백업은 영구 보존한다. 업로드 임시 ZIP을 제거해 무료 공간의 누적 사용을 줄인다.

무료 계정의 저장공간·CPU와 이미 실행 중인 Bash 콘솔 가용성은 실제 계정에서 재확인한다. 실패한 작업은 로그와 상태를 조사한 뒤 재개하며 무조건 반복 실행하지 않는다. 로컬 변경 감시기나 별도 호스팅을 설치하는 방식은 아니다.

## 이번 검증 범위

- WSL: 인증 및 배포 유닛테스트 38개 통과. 실제 RSA 왕복, 인증 실패 시 미저장, private 권한, opaque 토큰, redirect 거부, ZIP digest/경로, API multipart 계약, 콘솔 echo 오인 방지, staging 실패 차단, 공개 URL 검증 후 commit, 전환 실패 시 WSGI/라우팅 복구, 정리 범위/원본 백업 보존, Windows UTF-8 BOM 및 실제 composer.mjs 경로/digest 회귀를 확인했다.
- Windows: 가린 입력 대화상자가 실제로 열리는 것을 프로세스 창 제목으로 확인했다. 최초 터미널 창 방식은 유지되지 않아 대화상자로 변경했다.
- Windows PowerShell 5의 .NET 표준입력이 UTF-8 BOM(U+FEFF)을 앞에 붙이는 문제가 더미 문자열로 재현됐다. 토큰 원문을 읽지 않고 전달 계층을 진단했다. WSL 입력에서 맨 앞 BOM 한 개를 제거하도록 수정하고 회귀 테스트를 추가했다.
- 실제 API 인증과 첫 배포를 완료했다. `evidence/deployment/first-automated-deployment.json`과 `public-assets.json`이 실제 클라우드 증거다. 문서 자체와 로컬 테스트를 클라우드 증거로 대신하지 않는다.
- 정상 배포 진입점으로 후속 릴리스 `2026102004523169f8f8`의 재배포도 완료했다. `redeployment.json`과 `production-preservation.json`에 재인증/수동 업로드/수동 Reload가 필요 없었던 결과와 기존 데이터·공유 DB·venv 재사용 결과를 기록했다. 기존 글 2개·계정 1개·사진 파일 4개·원본 digest가 보존됐다.
- 로컬 배포 진입점의 전체 검사에서 WSL Django 196개·실제 HTTP 20개·Windows 웹 규칙 21개가 통과했고, 서버 source 안정성과 migration consistency를 확인했다. PythonAnywhere에서는 Python 3.13 의존성 설치·pip check·운영 check·마이그레이션·collectstatic·WSGI import를 완료했다. check --deploy의 기존 두 경고(W020/W021)는 공유 호스팅의 HSTS 하위 도메인·preload 선택이며 오류 0개다.
