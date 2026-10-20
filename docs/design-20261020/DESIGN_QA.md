# 설계 검수 기록

2026-10-20. 이 기록은 **설계 자료 검수**이며 서버·Android 기능 테스트나 PythonAnywhere 배포 검증이 아니다.

## 문서 검수

설계 기준본·기능/화면·내부 구조·평가/시연·선정 기록의 연결을 확인했다. [연결표](acceptance.json)에는 사용자 기능 3개, Android 3+서버 2 등록, 요구사항 21개, 화면 7개, 상태 12개, 예정 테스트 15개, 기본 평가 1–14를 정의했다. 문서 구조·참조 검사 14/14와 로컬 링크 17개 검사를 통과했고 [검사 기록](design-check.json)에 저장했다. 참조가 맞는다는 것이 실제 기능이 통과했다는 뜻은 아니다.

현재 실행 코드 변경은 하지 않았다. 기존 사진관 코드를 제거하거나 배포·push하지 않았다. 과거 모아 제안이 승인된 설계라는 기존 안내 문구를 바로잡고, 확정된 세 기능의 설계가 현재 기준임을 표시했다. 최종 평가서·13일 전사문·현재 코드·공식 SDK/호스팅 문서를 근거로 설계했다.

## 흐름도 산출물 검수

흐름도는 보조 설명 자료다. 전체 기능·API의 상세 명세는 Markdown 문서가 기준이며, 그림의 ‘저장 후 조회’ 연결이 실제 네트워크 호출 전체를 표현하는 것은 아니다. 순차 노드 사이의 생략한 관계 문구는 인접한 동작 이름에 이미 포함된 의미이며, 경계의 HTTPS와 저장 후 조회 문구는 보존했다.

| 항목 | 결과 |
| --- | --- |
| diagram_type | workflow |
| output | `C:/Users/1/mobile_web_service/common01/docs/design-20261020/flow.html` |
| specification_sha256 | `d79ce398529b781a7771b9c26ec56b42b62324bd6310254ee1823e63936e3f59` |
| specification bytes | 3414 |
| artifact_sha256 | `d64019c5a2d4efcd82ed443a55a0d00f3f234beac1d7a13152433416604cfc55` |
| artifact bytes | 805869 |
| validation | 9/9 showcase, 0 errors, 0 warnings |
| browser_evidence | **failed** — 현재 HTML의 Chrome 실측에서 세로 넘침 |
| visual_review | **failed** — 작은 화면에서 아래 조작 영역까지 한 화면에 들어오지 않으며 큰 화면의 하단 여백도 개선 여지 있음 |
| correction_rounds | 2 |

실제 파일의 [전달 영수증](diagram-delivery.json)과 [Chrome 검사 영수증](flow.visual-check.json)을 구분해 보존한다. 자동 검사 영수증의 visualReview는 pending이며, 위 시각 검수는 해당 스크린샷을 별도로 열어 판단한 결과다. 1440×900 light/dark와 2048×1320 light 스크린샷을 직접 확인했다. 자동 캡처는 두 크기의 light/dark 네 장을 포함한다.

| Chrome 화면 | 문서 폭 | 문서 높이 | 판정 |
| --- | ---: | ---: | --- |
| 1440×900 light | 1440 | 1034 | 세로 스크롤 필요 |
| 1600×1000 light | 1600 | 1153 | 세로 스크롤 필요 |
| 1920×1080 light | 1920 | 1153 | 세로 스크롤 필요 |
| 2048×1320 light | 2048 | 1320 | 넘침 없음 |

설명 내용은 읽을 수 있지만 화면 맞춤 품질을 통과했다고 보고하지 않는다. 중복 카드·범례를 줄인 한 차례 시각 수정 후에도 세로 넘침이 남았다. 사용한 [archify SKILL.md](C:/Users/1/.codex/skills/archify/SKILL.md)의 제한은 “never exceed a maximum of two focused correction rounds”다. 구조 수정과 화면 수정의 두 회차를 마쳐 이 보조 HTML의 추가 레이아웃 수정은 이번 작업에서 중단하고 미해결 결과를 기록했다. 제품 기능 설계·문서 검수는 계속 완료한다.

한국어 제목·노드·설명을 사용했으며, 지원 언어 제약 때문에 고정 Viewer UI와 `<html lang>`는 영어로 남는다. 이 HTML·스크린샷을 실제 앱 구현 화면이나 평가 제출 동작 증거로 사용하지 않는다.
