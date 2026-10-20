# 사진 내용 활용 중심 후보 발굴·재평가

2026-10-19 사용자 요청: 자동 테마 분류처럼 사진 블로그에 필요한 기능을 더 많이 발굴하고 서브 에이전트로 다시 평가한다. 먼저 실제 필요성을 따지고, 통과 후보의 기술 도전성을 높게 평가한다. 무료 PythonAnywhere와 Codex 구현·자동 구성·검증 경로가 필수이며 사용자 직접 설치·개발 공부·데이터 라벨링·모델 훈련·강화학습을 요구하지 않는다. 기능 구현이나 서비스 콘셉트 확정은 이번 범위가 아니다.

## 먼저 통과해야 하는 조건

- 대상은 기존 공개 사진 블로그. 사진 게시, 기록 정리, 다시 찾기, 읽기와 발견에 구체적인 도움이 있어야 한다. 문서 전문 서비스·쇼핑·의료·독립 사진 편집기로 목적을 바꿔 정당화하지 않는다.
- 필요성은 가중 평균으로 상쇄할 수 없는 gate다. 어느 사용자 과업의 어떤 불편을 해결하는지 구체적으로 제시한다. 유용한 상황이 한정되면 niche, 목적이 약하면 weak로 구분하고 핵심 추천에서 제외한다. 'AI라서/수학이 어려워서/화면이 멋져서'만으로 통과시키지 않는다.
- 기본 과제 ID1–13과 공개 Post JSON 배열 및 실제 PythonAnywhere 서버·Android 동기화 유지. ID14 최대5개, 서버/클라이언트 각각 구현하면 별도 등록. 기술적 공통 라이브러리는 사용자 기능이 아니며 별도 슬롯으로 자동 집계하지 않는다. 독립적인 사용자 기능을 이름만 합쳐 슬롯을 줄이지도 않는다.
- 무료 PA: 단일 웹앱/워커·전체512MiB·외부 통신 제한. 상시 worker, 정확한 예약, 외부 핵심 서버, 유료 DB/API, 미확인 ASGI 의존 금지. Android 온디바이스 추론은 검토 가능하며 실제 게시글·데이터 저장/조회는 PA가 담당한다.
- Codex가 기존 WSL venv 및 Windows Android Gradle/JDK/SDK/ADB로 구현·설치·검증하는 경로가 있어야 한다. 새로운 외부 계정/API키·지원 여부 모르는 특수 하드웨어·사용자 수동 모델 준비가 필수면 보류한다. 자동 Gradle 의존성·공식 앱 내 모델 다운로드는 사용자 수동 설치와 구분한다.
- 사전학습 모델 사용은 사용자 모델 훈련과 다르다. 모델의 공식 취득 경로·라이선스/이용 조건·런타임·기기 지원이 불명확하면 '가능'이라고 단정하지 않는다. 합성 fixture·검증 데이터는 모델 훈련이 아니다.
- 작업량·일정·구현 용이성은 점수나 동점 처리에 사용하지 않는다. 도전성은 유용한 동작을 제대로 완성하는 데 필요한 실제 난도로 판단한다. SDK 메서드 호출 자체를 AI 모델 연구 난도로 부풀리지 않는다.

## 원본과 도구 근거

- AGENTS.md: `C:/Users/1/mobile_web_service/AGENTS.md`.
- 평가서: `C:/Users/1/mobile_web_service/모바일웹서비스 프로젝트_공통평가 01_수행 결과 보고서_최종.docx`.
- 13일 전사문: `C:/Users/1/mobile_web_service/course_reference/새로운 노트 (1).txt` 1:33:18–1:33:59 난도·사용성 노력, 1:36:38–1:37:40 목적·의도, 1:41:15 UI 개선. 공식 숫자 배점은 없다.
- 과거 정의는 `../candidates.psv`. 과거 순위를 그대로 재가중하지 않는다. 기존113개는 서버/클라이언트 별도 행을 포함했으며 독립적인 제품 아이디어113개가 아니다.
- 기존 개발 도구 읽기 전용 확인: `../challenge/toolchain-check.json`. Windows 소스 하나, backend는 WSL; Java17 Android minSdk24/compileSdk36. 추가 기능 실행·정확도·배포 성공을 확인한 자료는 아니다.
- Android 설정: `C:/Users/1/mobile_web_service/common01/PhotoViewer/app/build.gradle.kts`, `settings.gradle.kts`에 Google Maven 경로 존재.

## 이번에 확인한 공식 구현 경로

- https://developers.google.com/ml-kit/vision/image-labeling/android : 기본 사전학습 라벨400+, 점수·라벨ID, bundled 모델을 앱에 포함 가능. 최소API23. 음식/동물 등 테마는 라벨→서비스 분류 규칙과 사용자 교정으로 구성한다. 여행·감성 같은 의도를 사진만으로 확정하지 않는다.
- https://developers.google.com/ml-kit/vision/text-recognition/v2/android : 한국어/영문 bundled OCR 경로, 글자 영역 좌표 제공. 이미지 글자의 인식과 검색을 구분하고 정확도 검증 필요.
- https://developers.google.com/ml-kit/migration : 독립 온디바이스 SDK는 Firebase 프로젝트 구성 불필요, 무료. 대형 생성형 API와 기기 제한이 다르다.
- https://help.pythonanywhere.com/pages/FreeAccountsFeatures/ : 무료 계정 범위. 실제 계정 생성일·잔여 공간은 미확인.
- https://help.pythonanywhere.com/pages/AsyncInWebApps/ : WSGI 작업·스레드·요청 시간 관련 제약.
- https://developers.google.com/ml-kit/genai : 생성형 Image Description은 지원 기기 제한. 현재 보유 AVD/일반 기기에서 동작한다고 가정하지 않는다.

## 1단계 발굴 출력

본인 전용 discovery-<role>.json 작성. role=product/technical/assessment. 서로 결과를 읽지 않는다. 12–18개 사용자 중심 아이디어를 제안하고 중복을 피한다. 각각 {title,problem,flow,value,method,server,client,dependsOn,overlap,qualification,proof}를 문자열로 기록한다. qualification은 가능경로/조건부/제외 중 하나. 근거 없는 자유문장 의미검색·식물 종/음식명 정답·인물 동일인 인식을 일반 라벨링으로 가능하다고 하지 않는다. 이 파일은 발굴 원자료이며 아직 점수표가 아니다.

## 2단계

root가 중복을 통합한 고정 후보와 컴포넌트 정의·채점 스키마를 protocol.md에 작성한 뒤, 세 평가자가 모든 후보를 독립 평가한다. 필요성 gate를 통과하지 못한 높은 난도 기능은 활성 순위에서 제외한다. 비슷한 확장 기능들은 중복과 의존성을 표시하고 5개 등록 조합을 별도 검토한다.
