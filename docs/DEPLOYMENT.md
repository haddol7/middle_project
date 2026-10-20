# PythonAnywhere 무료 배포 준비

> 2026-10-20 추가 기능 버전의 실제 배포 후보·계정 접근 상태·설치/검증 계획은 [현재 배포 문서](DEPLOYMENT_CURRENT.md)를 따른다. 아래 사진관·3D 항목과 이전 PC 경로는 과거 준비 이력이며 새 추가 기능의 운영 완료 증거가 아니다.

## 보관된 수동 준비 절차

아래는 자동 배포 연결 이전의 검토 기록이다. 현재는 사용자가 재사용 인증·자동 배포를 승인하여 실제 운영 검증까지 마쳤다. 일반 수정마다 새 승인을 받거나 최초 준비를 반복하라는 지침이 아니다. 최신 운영 절차는 DEPLOYMENT_CURRENT.md와 AUTOMATIC_DEPLOYMENT.md를 따른다.

작성 당시에는 배포 준비 단계로 실제 PythonAnywhere를 변경하지 않았고 클라우드·Android 동기화가 미검증이었다. 이후 실제 배포와 Android 동기화는 완료되었으므로 아래 문장을 현재 상태로 해석하지 않는다. 소스 준비·WSL 검사와 실제 배포 검증을 구분한다.

## 먼저 승인받아야 하는 범위

무료 계정은 Web 앱 1개와 저장공간 512MB를 제공한다. `daejinha.pythonanywhere.com`에 기존 Lab03 앱이 남아 있다면 Common Assessment 01을 두 번째 앱으로 동시에 배포할 수 있다고 가정하지 않는다. 기존 앱 교체는 다음 범위를 사용자와 확인한 뒤에만 진행한다. [공식 무료 플랜](https://www.pythonanywhere.com/pricing/)

- 기존 Web 탭 WSGI·Python/venv·정적 매핑을 기록하고 보존한다.
- 기존 Lab03 DB와 media를 함께 보존한다. Lab03 폴더에 Common Assessment 소스를 복사하거나 기존 DB에 이번 migration을 적용하지 않는다.
- Common Assessment 전용 새 소스 경로·새 venv·새 DB·새 media를 사용한다. Web 탭이 가리키는 경로 변경과 Reload 시점을 승인받는다.
- 이전 과제 URL의 화면이 바뀌는 영향 및 복구 경로를 확인한다. 동시 유지가 필요하면 무료 앱 1개 제한과 충돌하므로 먼저 교수님/사용자 확인이 필요하다. 다른 호스팅이나 명목상 PythonAnywhere 페이지로 대체하지 않는다.

아래의 설치·생성·migration·매핑 변경 명령은 **그 승인 이후 PythonAnywhere Bash에서 실행할 절차**다. 현재 Windows PowerShell이나 WSL에 그대로 실행해 클라우드 배포를 했다고 간주하지 않는다. 이 문서에는 자동 업로드·push·앱 교체 스크립트가 없다.

## 실행 환경과 고정 의존성

[requirements.txt](../PhotoBlogServer/requirements.txt)는 Django 6.1.1, DRF 3.18.1, Pillow 12.3.0, asgiref 3.12.1, sqlparse 0.6.0, coverage 7.16.2를 고정한다. Django의 설치 metadata상 Python 3.12 이상이 필수다. 현재 로컬 검증 인터프리터는 WSL Python 3.12.3이므로 PA에서도 가능하면 Python 3.12로 맞춘다. Python 3.13을 선택한다면 해당 환경에서 별도 검사해야 한다.

실제 계정의 System image는 아직 확인하지 않았다. 공식 표상 `innit`은 3.12/3.13을 지원하지만 `haggis`는 지원하지 않는다. Account → System image와 Web 앱의 Python 선택을 확인한다. 이미지 변경은 기존 Lab03 venv에 영향을 줄 수 있으므로 몰래 변경하지 않는다. Bash에서 `python3`의 기본 버전만 믿지 말고 명시한 버전으로 venv를 생성한다. Web 앱 Python과 venv Python은 같아야 한다. [지원 버전](https://help.pythonanywhere.com/pages/PythonVersions/), [이미지 변경 영향](https://help.pythonanywhere.com/pages/ChangingSystemImage/)

아래 경로의 `APPROVED_REPOSITORY`는 승인된 새 clone/업로드 디렉터리 이름으로 바꾼다. 예시는 현재 상위 작업 폴더의 `common01/PhotoBlogServer` 구조를 유지한 경우다. 최종 제출 저장소 ROOT에 `PhotoBlogServer`가 바로 들어가면 중간 `/common01`을 빼야 한다. 실제 `manage.py`가 있는 경로를 확인하고 WSGI·Web 탭·static/media를 모두 그 경로에 맞춘다. 현재 GitHub 제출 저장소와 실제 클라우드 폴더는 확정되지 않았다. 과거 Lab03 저장소 경로를 재사용하지 않는다.

```bash
cd /home/daejinha/APPROVED_REPOSITORY/common01/PhotoBlogServer
python3.12 -m venv /home/daejinha/.virtualenvs/common01
source /home/daejinha/.virtualenvs/common01/bin/activate
python --version
python -m pip install --no-cache-dir -r requirements.txt
python -m pip check
```

이전부터 `/home/daejinha/.virtualenvs/common01`이 존재하면 새 venv를 무작정 그 위에 만들지 않는다. 소유 용도·Python 버전을 먼저 확인한다. 패키지 설치 가능 여부 및 전체 저장공간은 PA에서 실제 확인할 항목이다. npm/Node·node_modules·htmlcov·Android build 산출물은 서버 런타임에 필요하지 않다. Three.js 고정 vendor와 라이선스가 Django 정적 소스에 포함되어 있어 Node 서버·외부 CDN 없이 제공한다.

## 비공개 운영 환경값

[production.json.example](../PhotoBlogServer/deploy/production.json.example)은 키 이름만 설명하는 **동작하지 않는 예시**다. 실제 비밀키를 이 파일이나 Git에 넣지 않는다. 새 키는 [create_private_config.py](../PhotoBlogServer/deploy/create_private_config.py)가 생성하며 키를 출력하지 않는다. 실제 설정은 제출 소스 밖의 소유자 전용 폴더/파일에 저장한다.

```bash
python -B deploy/create_private_config.py \
  --config /home/daejinha/.config/common01/production.json \
  --host daejinha.pythonanywhere.com
```

이 명령은 private 디렉터리 0700·JSON 파일 0600을 만들고 기존 파일이 있으면 덮어쓰지 않고 실패한다. 운영 키를 Reload마다 새로 만들거나 기존 파일을 지우지 않는다. 실제 JSON은 다음 환경값을 담는다.

- `DJANGO_DEBUG`: 문자열 `false`만 허용한다.
- `DJANGO_SECRET_KEY`: 자동 생성한 충분히 긴 랜덤 키. 개발 키·예시 키는 거부한다.
- `DJANGO_ALLOWED_HOSTS`: 실제 승인한 `daejinha.pythonanywhere.com` 단일 호스트. URL·와일드카드·localhost를 섞지 않는다.

[production.py](../PhotoBlogServer/deploy/production.py)는 Linux/Python 3.12+, 파일 위치·소유권·권한·JSON 키·운영값을 검사한 다음 Django import 전에 환경을 설정한다. 설정이 없거나 잘못되면 서버가 시작하지 않는다. 이 방식은 stdlib만 사용하므로 python-dotenv 의존성을 추가하지 않는다. 현재 기본 settings가 로컬 편의를 위해 DEBUG=true를 기본값으로 사용하므로 운영에서는 이 로더를 반드시 거쳐야 한다.

Bash에서 `export`한 변수는 PA Web worker에 자동 전달되지 않는다. 다음 WSGI 예시와 management 래퍼가 **동일 private JSON**을 읽게 해야 한다. [공식 환경변수 안내](https://help.pythonanywhere.com/pages/EnvironmentVariables/)

## PA Web 탭 WSGI 설정

승인된 앱을 Manual configuration으로 설정하고 Python 3.12 및 `/home/daejinha/.virtualenvs/common01`을 지정한다. Source code/Working directory는 새 `…/common01/PhotoBlogServer`로 설정한다.

Web 탭 Code 영역의 WSGI 링크(통상 `/var/www/daejinha_pythonanywhere_com_wsgi.py`)에 [pythonanywhere_wsgi.py.example](../PhotoBlogServer/deploy/pythonanywhere_wsgi.py.example)의 내용을 수동으로 반영한다. 예시의 `PROJECT_ROOT`, `PRIVATE_CONFIG` 두 절대 경로를 승인한 값으로 바꾼다. 경로 placeholder가 남으면 시작을 거부한다. 프로젝트 안의 `photoblog/wsgi.py`만 수정한다고 PA Web 탭 설정이 바뀌는 것은 아니다. [공식 Django 배포](https://help.pythonanywhere.com/pages/DeployExistingDjangoProject/)

예시의 로더가 운영값을 읽은 뒤 `DJANGO_SETTINGS_MODULE=photoblog.settings`와 WSGI application을 구성한다. 개발 `manage.py runserver`를 클라우드 서비스 프로세스로 띄우지 않는다. 서버는 PA의 WSGI Web 앱으로 동작한다.

## 새 DB·정적 파일·미디어

management 명령에도 [manage_production.py](../PhotoBlogServer/deploy/manage_production.py)를 사용한다. 비밀키를 명령 인수나 터미널 출력에 넣지 않는다.

```bash
python -B deploy/manage_production.py \
  --config /home/daejinha/.config/common01/production.json check --deploy
python -B deploy/manage_production.py \
  --config /home/daejinha/.config/common01/production.json migrate
python -B deploy/manage_production.py \
  --config /home/daejinha/.config/common01/production.json collectstatic --noinput
```

SQLite는 새 `PhotoBlogServer/db.sqlite3`에 생성되며 User/Gallery/Layout와 Post를 저장한다. 기존 Lab03 DB를 복사하거나 덮어쓰는 절차가 아니다. 이번 migration 파일은 0001 및 0002이며 기존 사용자 초기 사진관 생성은 해당 신규 앱 DB migration의 일부다. 관리자가 필요하면 동일 래퍼로 `createsuperuser`를 대화형 실행한다. 계정 비밀번호를 명령 인수·공개 로그·보고서에 넣지 않는다.

PA Web 탭 Static files에 **두 매핑**을 추가한다. 경로는 새 앱의 정확한 절대 경로로 바꾼다.

| URL | 실제 디렉터리 |
| --- | --- |
| `/static/` | `/home/daejinha/APPROVED_REPOSITORY/common01/PhotoBlogServer/staticfiles` |
| `/media/` | `/home/daejinha/APPROVED_REPOSITORY/common01/PhotoBlogServer/media` |

`DEBUG=false`에서는 Django의 개발용 media URL 제공이 꺼진다. `/media/` 매핑을 생략하면 게시글 JSON이 떠도 사진은 404가 될 수 있다. DB/업로드는 Git 제외 파일이므로 source clone만으로 로컬 사진이 배포되지 않는다. 실제 PA에서 사진을 올리고 DB와 파일을 함께 백업한다. 로컬 테스트용 계정·사진·DB를 임의로 운영 데이터로 복사하지 않는다. [공식 static/media 안내](https://help.pythonanywhere.com/pages/DjangoStaticFiles/)

512MB는 소스·venv·기존 과제·DB·미디어 등에 함께 사용된다. 실제 사용량을 확인하고 사용자 사진을 자동으로 지워 공간을 확보하지 않는다. 공개 사진 서비스이므로 `/media/` 사진은 공개 접근 가능하다. 서버는 업로드를 PNG/JPEG/WebP, 최대 5MiB, 크기/픽셀 상한 및 전체 디코딩으로 검증한다. 업로드 디렉터리를 실행 코드 또는 정적 소스 폴더로 매핑하지 않는다.

## HTTPS·CSRF·Android 계약

운영 설정은 HTTPS redirect, secure session/CSRF cookies, `HTTP_X_FORWARDED_PROTO=https` proxy SSL 표시 및 HSTS 1시간을 사용한다. 실제 PA에서 HTTPS가 정확히 감지되는지 확인해야 하며 redirect 반복이 생겼다고 DEBUG를 켜거나 CSRF를 끄지 않는다. 원인은 PA 프록시/WSGI/호스트 설정으로 진단한다. PA Web 탭의 Force HTTPS 옵션과 실제 응답도 확인한다. [HTTPS 강제](https://help.pythonanywhere.com/pages/ForcingHTTPS/), [Django 운영 점검](https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/)

웹 페이지와 `/api/v1/`은 동일 HTTPS origin이다. 현재 Java Android도 cookie session과 CSRF를 사용한다. 로그인·가입·사진 POST·layout PUT은 cookie 및 CSRF 보호를 유지한다. 익명 `/api/v1/auth/register/`에도 CSRF가 필요하므로 먼저 `/api/v1/auth/me/`에서 CSRF cookie/값을 받고 같은 origin의 POST에 cookie·`X-CSRFToken`·`Origin`을 전달한다. 정상 동일 출처를 위해 `CSRF_TRUSTED_ORIGINS=*`나 CORS wildcard를 추가하지 않는다. 기존 실습 호환용 `/api-token-auth/` 및 `Authorization: Token …` 지원도 유지하지만, 이는 현재 Android 앱의 로그인 구현 방식이 아니다.

`GET /api_root/Post/`는 기존 평가 Android의 JSONArray 계약을 위해 공개 JSON **배열**이며 pagination envelope가 아니다. 추가 API는 `/api/v1/`에 있다. Android 클라우드 서버 주소를 `https://daejinha.pythonanywhere.com`으로 바꾸고 배포 API가 준 같은 origin의 `/media/` 사진을 받아야 한다. `10.0.2.2`, localhost, 로컬 캡처용 8002 서버는 클라우드 검증에 사용할 수 없다.

## 완료 판정과 실제 검증

2026-10-10 WSL 배포 모드 점검은 오류 0·경고 2였다. `security.W005`는 HSTS 하위 도메인 포함, `security.W021`은 preload 미활성 경고이며 **아직 미해결로 기록한다**. 도메인의 모든 하위 경로/도메인 HTTPS 정책 및 preload의 장기 영향 확인 없이 경고를 없애려고 무조건 켜지 않는다. 이 WSL 결과가 PA 설치·운영 성공을 증명하지 않는다.

배포 후 실제 HTTPS URL에서 다음을 확인하고 필요한 평가 캡처를 남긴다. 비밀번호·토큰·CSRF/private 설정·관리자 개인정보는 공개 증빙에 넣지 않는다.

1. 기본 게시 화면, `/village/`, `/api_root/Post/`, `/api/v1/galleries/`가 정상 응답한다. HTTP는 HTTPS로 이동하고 HTTPS는 redirect loop가 없다.
2. `/static/blog/app.js`, vendor Three.js 및 CSS가 올바른 콘텐츠 타입으로 전달된다. 실제 브라우저 3D가 렌더링되고 JS 오류가 없다.
3. 일반 사용자 가입·로그인, 사진 업로드, 해당 사진 `/media/` 응답이 정상이다. 작성자/타인 권한과 CSRF 거부도 확인한다.
4. 사진관 성장·벽 액자·배치 저장/재조회·revision 충돌이 실제 cloud DB에서 정상이다.
5. Java Android가 위 배포 API에서 사진을 동기화하고 업로드한다. 실제 앱 화면/주소가 명시된 증거를 얻는다.
6. PA error log를 검토하고 운영값으로 `check --deploy` 및 의존성 확인을 다시 실행한다. 확인 결과와 남은 경고를 기록한다.

로컬 도구 확인은 다음과 같다. Linux 임시 파일만 사용하며 개발 DB·사진·클라우드 앱을 변경하지 않는다.

```bash
cd /mnt/c/Users/haddo/mobile_web_service/common01/PhotoBlogServer
/home/daeha_linux/.venvs/mobile_web_service/bin/python -B -m unittest deploy.test_production -v
```

WSL helper 테스트는 private 환경값·권한·중복키·덮어쓰기 금지·누락된 WSGI 경로 거부를 확인한다. 경로를 실제 로컬 소스로 치환한 WSGI 예시로 Django application을 import하고 운영 DEBUG/host/secure-cookie 설정도 확인한다. 명령 래퍼의 실제 `check --deploy`는 위 HSTS 경고 2개를 유지한다. 이 검증은 PA의 시스템 이미지·파일 권한·프록시·Web 탭·static/media 매핑을 대신하지 않는다.

평가의 PythonAnywhere 서버 동작·Android 동기화·Word 캡처는 위 실제 배포 검증 후에만 완료로 표시한다.
