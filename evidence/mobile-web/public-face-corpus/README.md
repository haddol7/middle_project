# 공개 사진 얼굴 검사 자료 — 2026-10-20

최신: [v5 개선·회귀·배포 검증](IMPROVEMENT.md). 아래 준비·초기 CPU 검사 이력과 분리한다.

**WSL CPU 추론 완료 / 브라우저 실행 대기.** 후속 요청으로 같은 모델과 실제 앱 JavaScript 좌표 처리를 사용하는 독립 명령행 검사를 실행했다. [실제 결과와 문제점](RESULTS.md)을 우선한다. cases.json의 `prepared_not_executed`는 준비 당시 상태이며 실제 실행 증거는 `wsl-results/results.json`이다. 현재 CUA 브라우저 목록은 비어 있다. 사용자 브라우저나 개인 세션을 다른 도구로 조작하지 않았다. 서비스 코드를 변경하거나 새 릴리스를 배포하지 않았다.

16장: dlib의 PASCAL VOC 예제 9장, 공개 근접 인물 예제 1장, 강아지 1장, OpenCV 원숭이·건물·과일·스포츠 사진 4장, NASA Expedition 70 공식 단체사진 1장. 다운로드한 원본 바이트, 출처 URL, SHA256은 sources.json에 있다. 외부 원본의 이용 조건은 각 출처를 따른다. 이 자료를 앱 자산이나 제출물에 자동 포함하지 않는다.

dlib training.xml/testing.xml은 원래 저장소의 파일명이다. 이 프로젝트는 **모델 학습을 하지 않았고**, 두 XML의 얼굴 사각형을 평가 정답으로만 읽었다. 주석 사진 9장에 얼굴 좌표 43개가 있다. NASA 7명 등 추가 육안 개수는 별도 값이며, 좌표 주석의 정확도 통계에 합산하지 않는다. 흐릿한 군중이 있는 스포츠 사진은 정답 총개수 미정으로 유지한다.

WSL 프로젝트 venv에서 `python tools/local/prepare_face_corpus.py` 실행: JPEG 16장 decode/무결성, 모든 다운로드 SHA256, 주석 XML 파싱 성공. 결과 cases.json의 `inference_executed`는 false다. Windows Node의 `--check common01/web-tests/face-corpus.mjs`는 구문 검사만 통과했으며 모델·화면 실행을 대신하지 않는다.

브라우저 사용이 가능할 때 에이전트가 WSL에서 `python -m http.server 8766 --bind 127.0.0.1 --directory common01`을 실행하고 `http://127.0.0.1:8766/web-tests/face-corpus.html`의 검사 버튼을 누른다. 서비스와 동일한 WebVision worker·모델·모자이크 코드를 사용한다. 정답과 가림 영역을 IoU ≥ 0.3에서 최대 일대일 대응해 누락·오탐을 계산하고 주석 영역 80% 포함 여부, 실제 픽셀 변화, 원본 불변 여부와 처리 시간을 별도 기록한다. padding된 가림 영역을 비교한다는 측정 한계도 기록한다.

실행 후 JSON, 실패 사례와 실제 가림 화면을 저장하고 육안 검토해야 한다. 사진 개수 일치만으로 올바른 가림이라고 결론 내리지 않는다. 선택된 16장 결과를 일반적인 정확도나 물리 iPhone Safari·실제 PythonAnywhere 작성 화면 검사로 표현하지 않는다. 사진은 공개 게시하지 않는다.
