# 1인 사진 블로그 전환

2026-10-20. 운영자는 `daejinha` 한 계정이다. 사용자 정정에 따라 계정명을 유지하고 추가했던 `admin`을 제거했다. 지정 운영자만 작성·수정·삭제·교정할 수 있고 방문자는 로그인 없이 열람·검색한다. 임의의 staff/superuser 계정에 게시 권한을 추가하지 않는다. 

공개 회원가입은 웹/API/Android에서 제거했다. 로그인 후 홈으로 이동한다. 운영자에게만 게시 도구가 보이며 Android의 중복된 ‘내 글’ 메뉴도 제거했다. 운영 비밀번호는 변경하지 않았다. 운영자 지정은 `BLOG_OWNER_USERNAME` 설정으로 관리하며 기본값은 `daejinha`다. 로컬 개발 환경도 활성 운영자를 `daejinha`로 통일했다. 다른 로컬 테스트 계정은 로그인만 비활성화하고 테스트 데이터는 보존했다.

## 공통평가 유지 범위

제공된 최종 평가서에는 회원가입 필수 항목이 없다. 사진 multipart 업로드, 기존 7필드 JSON 배열 API, 실제 Python 테스트 엔진과 Coverage, Android의 UI 방식 Upload 및 서버 동기화, PythonAnywhere 실제 운영을 유지했다. 얼굴 모자이크·테마/태그·OCR 검색 기능도 유지한다. 다른 호스팅이나 외부 작업 서버를 추가하지 않았다.

## 제거한 사진관 잔재

- 개인 사진관 생성 신호와 회원가입 폼·처리, 사진관·마을·준비 실패 화면.
- 마을/사진관 URL, 사진관 목록·소개 변경·배치 저장·꾸미기 카탈로그 API.
- 사진 수에 따른 성장·공간 확장·가구/액자 배치 규칙과 DB 모델.
- 웹 Three.js·3D 장면·마을 지도·꾸미기 도구와 전용 빌드 의존성.
- Android LegacyStudioActivity, OpenGL 장면·마을 지도·배치 편집·가구 모델·3D 메시, 이동 버튼.
- Android 사진관 계정 응답·등록 요청 및 사용하지 않는 사진관 전용 테스트. 사진 파일 커밋 보존 검사는 일반 사진 저장 테스트로 옮겼다.

기존 마이그레이션 0001–0003은 이미 배포된 DB의 이력으로 유지한다. 새 0004는 사진관·배치 테이블만 제거하고 사용자·게시글·사진 분류·태그·문구 테이블을 유지한다. 과거 설계·검증 증거·복구본은 역사 자료이며 실행 기능이 아니다. 소스 복구본은 작업 전 보관본과 `.local/studio-removal-backup`에 있다. 운영 배포기는 일관된 DB·WSGI 복구본을 보관한다. 0004 이전 소스로 복구할 때는 해당 시점 DB 복구본도 함께 사용해야 한다.

## 최근 검증과 전환 당시 기록

- 최근 서버 기록: WSL Django145개·독립 HTTP15개, check 및 migration consistency 통과. Coverage 총합95.5%·라인97.2%·분기89.5%.
- 최근 Windows 기록: 웹67개, Android JVM38개·lint오류0개(경고8개), 통합기기9개. 작은 화면 UI1개와 운영 읽기 전용 동기화1개는 별도다.
- Android는 임시 WSL DB/미디어에서 실제 로그인·얼굴·한영 OCR·분류·게시·교정·검색·충돌409를 확인했다. 최신 앱은2열 목록·고정 편집·세 탭·칩·공통 교정칸·키보드 대응을 반영했다. ANDROID_NATIVE_PARITY.md를 따른다.
- PythonAnywhere 전환 당시 릴리스 `2026102012161187e3b4`의 HTTPS21조건은 single-owner-public.json에 보관한다. 그때의 기존 글4개는 과거 수치다. 마지막 웹 OCR 확인 릴리스는 `20261020130539b3d8a3`, 최근 Android 읽기 전용 검사에서는 운영 글3개·사진3개를 모두 확인했다.

현재 근거는 evidence/content/server/verification.json, evidence/content/android/verification.json, cloud-sync.json이다. 전환 당시 화면은 evidence/current-audit/single-owner-*로 구분한다. 보고서도 최신 결과로 갱신했으며 최종 제출 묶음·GitHub push는 진행하지 않았다.
