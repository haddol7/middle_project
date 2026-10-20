# 사진 블로그 공통평가 01

일상·후기 사진의 얼굴을 가리고, 테마·태그와 사진 속 문구로 게시글을 찾는 Django·Java Android·모바일웹 프로젝트다. 추가 기능은 얼굴 자동 모자이크, 테마·태그 추천, 사진 속 글자 검색이다. 원본을 유지하고 사용자가 확인한 게시 사본과 분류·문구를 서버에 저장한다.

운영 서버: https://daejinha.pythonanywhere.com/

## 제출 자료

컴퓨터공학과 하대진 · 2020105671  
GitHub: https://github.com/haddol7/middle_project

- `PhotoBlogServer/`: Django 서버와 API·테스트
- `PhotoViewer/`: Java Android 클라이언트와 기기 테스트
- 수행 결과 보고서는 별도 전달 자료다. 이 저장소에는 포함하지 않는다.
- `web-tests/`: 모바일웹 규칙·인식 회귀 검사
- `evidence/`: 실행 로그·검증 결과·화면 증빙
- `docs/`: 설계·검증 범위·구현 기록

운영자 한 명이 게시물을 관리하며 방문자는 공개 게시글을 열람·검색한다. 구현과 검증 범위는 보고서 및 [평가 항목 추적표](docs/REQUIREMENTS.md)에서 확인할 수 있다. 운영 DB·사용자 원본 업로드·배포 인증정보·빌드 캐시는 저장소에 포함하지 않는다.

## 실행

서버는 WSL Ubuntu의 독립 Python 가상환경에서 실행한다. 소스는 Windows 폴더의 `/mnt/c/...` 경로를 사용한다. Python 3.12 이상과 requirements.txt의 고정 패키지를 사용하며 Windows Python을 서버 검증에 사용하지 않는다.

```bash
# WSL, PhotoBlogServer 폴더
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000 --noreload
```

PC 브라우저는 http://127.0.0.1:8000/ 으로, Android 에뮬레이터는 http://10.0.2.2:8000/ 으로 접속한다. 로컬 DB는 migrate로 새로 생성하고 운영 DB를 복사하지 않는다. 로컬 게시 계정은 필요할 때 `python manage.py createsuperuser --username daejinha`로 만든다. 다른 이름을 사용하면 실행 환경의 BLOG_OWNER_USERNAME도 그 이름으로 지정한다.

Android는 Windows Android Studio에서 PhotoViewer를 연다. compileSdk 36·Build Tools 36.1.0·Gradle 9.6.0을 사용한다. SDK 경로는 각 PC의 local.properties에 설정하며 이 PC 전용 파일은 포함하지 않았다. Android 인식 모델은 APK에 포함되고 웹 모델은 같은 서버에서 내려받아 기기에서 실행한다. 별도 모델 학습이나 유료 인식 API가 필요하지 않다.

앱의 기본 주소는 운영 HTTPS다. 로컬 검사 시 `계정·설정 → 서버 연결 설정`에서 주소를 바꿀 수 있다. 서버 코드의 deploy 폴더는 PythonAnywhere용 운영 설정 예시다. 실제 서버 비밀키와 PythonAnywhere API 인증정보는 비공개 설정으로 관리한다. 평가용 계정 정보는 별도 전달한다.

## 검사 결과와 실행 방법

| 구분 | 확인 결과 | 재현 방법 |
| --- | --- | --- |
| WSL Django | 145개 통과, check 오류 없음, migration 변경 없음 | PhotoBlogServer에서 `python tools/verify_content.py` |
| WSL 독립 HTTP | 15개 통과 | 같은 위치에서 `python api_test_engine.py` |
| Coverage | 총합 95.5%, 라인 97.2%, 분기 89.5% | `PhotoBlogServer/htmlcov/index.html` |
| Windows 웹 규칙 | 67개 통과 | 루트에서 `node --test web-tests/content-rules.test.mjs` |
| Windows Android JVM | 38개 통과 | PhotoViewer에서 `./gradlew.bat testDebugUnitTest` |
| Android API35 에뮬레이터 | 통합 기기 테스트 9개 통과 | `evidence/content/android/verification.json` |
| 실제 PythonAnywhere Android 동기화 | 읽기 전용 검사 1개, 당시 글·사진3개 모두 표시·해시 대조 | `evidence/content/android/cloud-sync.json` |
| Android 작은 화면 | 약320×560dp 전체 작성 UI1개 통과 | `evidence/content/android/small-screen/verification.json` |

Android 실행 결과와 현재 소스·설치 APK의 해시 일치를 확인하였다. 기기 테스트는 사전 준비한 로컬 운영자로 사진을 게시하므로 TEST_OWNER_USERNAME·TEST_OWNER_PASSWORD를 설정하고 Windows에서 로컬 테스트 서버를 대상으로 `PhotoViewer/tools/verify-android.ps1 -RunDevice`를 사용한다. 운영 서버를 대상으로 기기 테스트를 실행하지 않는다.

최신 Android 앱에서 운영 글3개·사진3개의 표시와 해시를 확인했다. 이 검사는 읽기 전용이다. 게시·모자이크·태그 수정·교정·검색 UI는 WSL 임시 DB/미디어 서버에서 검사했다. 전환 전 운영 HTTP 33개 조건의 기록은 `evidence/submission-final/cloud-content-flow.json`에 남기며, 당시 글4번의 URL을 현재 재현 주소로 사용하지 않는다.

Android의 2열 목록·고정 편집·세 탭·태그 칩·문구 공통 교정칸·키보드 대응 및 OCR 개선은 [앱 반영 내역](docs/ANDROID_NATIVE_PARITY.md)을 따른다. [현재 보고서](<모바일웹서비스 프로젝트 공통평가 01_수행 결과 보고서.docx>)와 `_작성중.docx`는 같은 최신 내용이다. 추가 기능 E01·E02·E03은 확인한 범위에서 완료, E04·E05는 다중 검색어의 일치 줄 표시 보완 때문에 부분으로 표시한다. 인식의 누락·오인식은 수동 확인으로 보완하며 정확도를 보장하지 않는다.

사진관·마을 실행 코드와 3D 의존성을 제거했다. 현재는 지정 운영자만 작성하는 1인 블로그이며 공개 회원가입이 없다. 전환 범위와 검증은 [1인 블로그 전환](docs/SINGLE_OWNER_BLOG.md)을 따른다. 현재 추가 기능으로 등록한 항목은 얼굴 모자이크, 테마·태그, 사진 글자 검색을 양식에 따라 나눈 Client 3개·Server 2개다. 구현 위치와 보고서 증빙은 docs/REQUIREMENTS.md에 연결하였다.
