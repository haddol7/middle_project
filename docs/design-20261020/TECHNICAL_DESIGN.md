# 내부 구조·데이터·API 설계

2026-10-20 · 구현 명세. 현재 실행 코드에서 확인한 계약을 기반으로 한다. 이 문서의 새 모델·API·클래스는 아직 구현하지 않았다.

> 위 문장은 설계 시점의 상태다. 후속 구현 위치·테스트·일부 모듈명 차이와 실제 결과는 [구현 기록](../IMPLEMENTATION_LOG.md)에 연결한다. 본문은 승인된 기능·계약의 기준이며 운영 완료 선언이 아니다.

## 1. 실행 위치와 의존성

Android가 이미지 처리와 인식을 담당하고, Django가 공개 사진글·확정 분류·검색 문구를 실제 저장하고 조회한다. 서버에는 원본 사진이나 ML 모델을 보내지 않는다. PythonAnywhere 밖의 서버·워커·DB·유료 인식 API는 필요하지 않다.

| 작업 | 담당 | 채택 방식 |
| --- | --- | --- |
| 사진 선택·방향 보정·작업 사본 | Android | 시스템 사진 선택기, 표본 디코딩, EXIF 방향 반영 |
| 얼굴 위치 | Android | bundled ML Kit Face Detection 16.1.7 |
| 모자이크 합성 | Android | 선택 사각형의 실제 픽셀 축소·최근접 확대, 최종 이미지 인코딩 |
| 테마·태그 추천 | Android | bundled ML Kit Image Labeling 17.0.9 + 버전 관리한 라벨 연결 규칙 |
| 한글·영문 OCR | Android | bundled Korean/Latin Text Recognition 16.0.1 |
| 검증·확정값 저장·권한·검색 | PythonAnywhere Django | 기존 SQLite·사진 저장소와 HTTP 요청 안의 짧은 처리 |

SDK 버전과 API23 이상 조건은 2026-10-20 공식 [얼굴](https://developers.google.com/ml-kit/vision/face-detection/android), [분류](https://developers.google.com/ml-kit/vision/image-labeling/android), [OCR](https://developers.google.com/ml-kit/vision/text-recognition/v2/android) 문서로 확인했다. 현재 앱 minSdk24와 맞는다. 모델은 Gradle 의존성으로 APK에 포함한다. 사용자의 수동 모델 설치·학습과 Firebase 프로젝트 설정을 요구하지 않는다. 독립 ML Kit의 무료 기기 내 API와 Firebase 설정 불필요 안내는 [공식 설명](https://developers.google.com/ml-kit/migration)에 있다.

입력 이미지와 인식 결과 처리는 기기 안에서 이루어지지만 SDK의 성능 통계·업데이트 관련 통신은 있을 수 있다. ‘Google과 절대 통신하지 않음’으로 설명하지 않는다. [Terms & Privacy](https://developers.google.com/ml-kit/terms). 첫 실행 비행기 모드 인식은 실제 APK로 검증한다.

PythonAnywhere 무료 계정은 웹 앱 1개·워커 1개·전체 디스크 512MiB 등의 제한이 있다. 이 수치는 프로세스 메모리나 웹 요청의 일일 CPU 한도와 혼동하지 않는다. 계정 생성 시점별 예약 작업·MySQL 차이에 의존하지 않는다. 외부 네트워크 허용 목록도 인식 경로에 영향을 주지 않는다. [무료 계정](https://help.pythonanywhere.com/pages/FreeAccountsFeatures/), [WSGI 비동기 작업 제약](https://help.pythonanywhere.com/pages/AsyncInWebApps/).

## 2. 현 코드와의 연결

| 현재 확인한 코드 | 보존할 계약 | 설계 변경 |
| --- | --- | --- |
| `blog/models.py: Post` | author/title/text/dates/image, 저장·삭제 시 소유자 잠금 | 내용 메타데이터는 새 1:1 모델; Post 기본 필드 유지 |
| `blog/serializers.py: PostSerializer` | 응답 7필드, 작성자·날짜 서버 지정 | 선택적 write-only `photo_content` 입력만 추가; GET·POST 응답은 동일 |
| `blog/views.py: PostViewSet` | `/api_root/Post/`가 페이지 래퍼 없는 JSON 배열 | 기존 생성·수정 서비스에 검증된 묶음을 전달 |
| `blog/services.py` | SQLite 쓰기 의도 잠금, 원본 소유자 변경 금지, 실패 파일 정리 | 하나의 서비스가 Post·내용·검색 줄의 전체 트랜잭션과 파일 정리를 소유 |
| `blog/validators.py` | 5MiB·16MP·한 변 8192, JPEG/PNG/WebP, 전체 디코딩 검증 | 동일하게 적용; 서버는 업로드 파일을 재인코딩하지 않음 |
| `blog/api_v1_urls.py` | 기존 인증·Gallery API 경로 | 새 content·분류 조회·검색 경로 추가 |
| Android `PhotoRepository` | 같은 출처 제한, 세션 Cookie·CSRF, 오류 구분 | 메타데이터 전송·조회·교정·검색 메서드 추가 |
| Android `MultipartBody` | binary-safe multipart, 이미지 5MiB | 선택적 JSON 필드 지원; 기존 호출도 계속 가능 |
| Android `JsonCodec`, `PhotoPost` | 기존 배열 파싱과 사진 기본 객체 | 내용·검색 DTO 분리; 기존 필드에 새 데이터 억지로 삽입하지 않음 |

기존 웹 작성·수정도 계속 동작해야 한다. 웹에서 분석 없이 올린 사진은 미분류·미분석으로 보여준다. 웹은 저장된 확정 테마·태그·문구를 표시하고 동일 서버 검색을 이용할 수 있게 한다. 새 자동 인식과 영역 편집의 주 대상은 Android이며 웹에도 ML 편집기를 별도로 구현하는 범위는 아니다.

Gallery·DecorLayout과 Post 저장·신호가 연결되어 있다. 새 주 화면에서 사진관 진입을 빼더라도 데이터·모델·잠금·신호를 바로 삭제하지 않는다. 기존 권한·업로드·삭제 회귀를 통과시키며 화면 진입부터 교체하고, 불필요 코드 정리는 별도 변경으로 다룬다.

## 3. 사진 처리와 버전 일치

1. 선택 URI에서 크기·타입을 읽고 축소 디코딩한다. 방향 보정 후 긴 변 최대 2048px의 작업 이미지를 만든다. 고해상도 전체 이미지를 여러 장 동시에 메모리에 유지하지 않는다.
2. 얼굴 탐지는 ACCURATE, 윤곽·표정·추적은 비활성화한다. 사각형을 약 15% 확대해 이미지 경계에 맞춘다. 작은 얼굴 임계값과 탐지 해상도는 고정 검증 사진에서 조정하며 모든 얼굴 탐지를 보장하지 않는다.
3. 원래 작업 이미지와 영역 명령 목록을 분리한다. 매번 원래 작업 사본에서 활성 영역의 모자이크를 합성해 누적 열화와 실행 취소 오류를 막는다. 약/중/강은 영역 긴 변에 대한 블록 크기 비율 0.06/0.10/0.16을 초기값으로 사용하며 실제 식별 가능성을 육안 검수한다.
4. JPEG 품질 90에서 시작해 80·70으로 낮추고 필요시 해상도를 줄여 5MiB 이하로 확정한다. 업스케일하지 않는다. 알파 채널은 흰 배경으로 합성해 미리보기에도 같은 결과를 표시한다. EXIF 등 원본 메타데이터를 복사하지 않는다.
5. **확정된 인코딩 바이트를 다시 디코딩한 이미지**로 분류·OCR를 실행한다. 인코딩 이전 이미지로 분석하지 않는다. 이 바이트의 SHA-256, 너비·높이를 분석 묶음에 넣고 동일 바이트를 업로드한다.
6. 서버도 받은 바이트의 SHA-256과 검증된 실제 크기를 비교한다. 일치하지 않으면 전체 저장을 거부한다. 이후 이미지 변경 시 이전 내용·검색 줄을 삭제하거나 같은 파일의 새 분석으로 교체한다.

`imageGeneration`은 사진·모자이크 변경 때 증가한다. 인식 요청에는 해당 값과 최종 digest를 붙이고 콜백 수신 시 현재 값과 비교한다. 늦게 도착한 다른 사진의 결과는 폐기한다. 분류와 OCR는 독립 상태를 갖되 메모리 부담을 줄이기 위해 기본 실행 순서는 분류 다음 OCR다. 화면을 막지 않는 작업 실행기를 사용한다.

사용자가 고친 제목·본문·테마·태그는 자동 콜백이 덮어쓰지 않는다. 이미지가 바뀌면 기존 테마·태그 교정은 보류 상태로 남겨 재확인하고, OCR 문구와 좌표는 새 이미지에 재사용하지 않는다. 보류한 옛 OCR 교정은 비교용 로컬 정보일 뿐 업로드 대상이 아니다.

원본과 얼굴 사각형·가리기 해제 이력은 서버에 저장하지 않는다. 서버가 ‘얼굴 확인’ 표시만으로 실제 모자이크를 증명할 수도 없다. 증거는 최종 저장 파일과 실제 HTTP로 받은 이미지다.

## 4. 분류 규칙

라벨 연결표는 `theme_mapping_v1`처럼 앱 리소스로 버전 관리한다. 실제 SDK의 라벨 index·영문 설명을 확인한 항목만 등록하며, 한국어 이름을 추측해서 API에 요청하지 않는다. 음식 관련 라벨은 food, 동물은 animal, 풍경은 nature, 인물은 people, 건축·실내는 space, 사물은 object로 묶는다. 한 라벨이 여러 테마를 무차별 지원하게 만들지 않는다. 모델의 400여 라벨을 앱의 7개 테마로 줄이는 것은 학습이 아니라 검토된 연결 규칙이다.

테마 점수는 해당 테마에 연결된 라벨 점수의 최대값으로 시작한다. 최고 점수 0.65 이상이고 2위와 차이 0.12 이상일 때 대표 테마를 추천 선택한다. 그렇지 않으면 미분류와 상위 대안을 제시한다. 지원 라벨이 없으면 미분류다. `기타`는 사용자의 명시 선택으로 둔다. 태그는 검토된 라벨 중 0.60 이상에서 중복을 제거해 최대 5개를 추천한다.

임계값은 초기 설계값이며 모델의 정답 확률이 아니다. 실제 사진 평가에서 정확도·추천 비율·기권 비율을 함께 측정해 고정한다. 잘못된 추천을 피하려고 모든 사진을 미분류로 보내는 방식은 품질 목표를 충족하지 않는다. 얼굴을 가린 사진의 인물 분류 성능도 별도로 확인한다.

## 5. 데이터 모델

| 모델 | 필드·제약 | 의미 |
| --- | --- | --- |
| PhotoContent | post OneToOne CASCADE; revision 양의 정수; image_sha256 64 hex; width/height; schema_version=1; ocr_status; model_versions·mapping_version; updated_at | 한 게시 이미지에 연결된 확정 메타데이터 |
| PhotoContent 분류 필드 | theme enum 또는 null; theme_origin auto/user/unclassified; theme_status classified/unclassified/not_analyzed | 사용자가 확인한 대표 테마; 미분류와 미분석 구분 |
| PhotoTag | content FK CASCADE; display≤30문자; normalized≤60; origin auto/user; position; UNIQUE(content,normalized) | 확정 태그 최대 10개, 테마·태그 필터용 인덱스 |
| PhotoTextLine | content FK CASCADE; line_id UUID; text≤200문자; norm_text·compact_text; quad 4개 점; origin auto/user; position; UNIQUE(content,line_id) | 검색에 포함한 줄만 저장; 위치·문구 연결 |

좌표는 EXIF 방향을 반영한 최종 이미지 기준 0–1 값이다. 네 점은 시계 방향의 볼록 사각형이어야 하고 면적이 양수여야 한다. 서버는 숫자 타입, 유한값, 범위, 점 개수, 중복 ID, 문자열 길이를 검증한다. 출력은 항상 텍스트로 이스케이프하며 OCR 문구를 HTML로 실행하지 않는다.

분류 인덱스는 theme와 Post의 게시일/ID·작성자 조회를 지원한다. 검색은 정규화 문자열을 가진 전용 줄 테이블을 사용한다. SQLite FTS5 설치 여부나 한글 형태소 분석기에 의존하지 않는다. 제목·본문은 별도 기존 필드로 유지한다.

원시 모델 라벨 전체, 제외한 OCR 문구, 얼굴 정보는 업로드하지 않는다. 추천 대안과 미확정 교정은 기기의 작성 상태에만 둔다. 서버에는 최종 확정값과 재현에 필요한 모델·규칙 버전만 기록한다. 수정한 OCR 문구의 원래 인식 문자열을 서버에 계속 보관하지 않는다.

## 6. 쓰기 계약

기존 multipart `POST /api_root/Post/`와 이미지 교체 `PATCH /api_root/Post/{id}/`에 선택적 **write-only** JSON 필드 `photo_content`를 추가한다. 기존 필드만 보낸 요청도 정상 처리한다. GET 목록은 계속 bare array이고 응답 필드는 기존 `id, author, title, text, created_date, published_date, image` 일곱 개다.

새 Android는 최종 사진·글·확정 내용을 한 요청에 넣는다. 생성 응답도 기존 Post 객체이며, 성공 후 내용 조회가 실패해도 게시 성공을 실패로 바꾸어 재전송하지 않는다.

```json
{
  "schema_version": 1,
  "image_sha256": "<최종 업로드 바이트의 64자리 SHA-256>",
  "width": 1600,
  "height": 1200,
  "model_versions": {"label":"17.0.9","ocr_ko":"16.0.1","ocr_latin":"16.0.1"},
  "mapping_version": "theme_mapping_v1",
  "theme_status": "classified",
  "theme": "food",
  "theme_origin": "user",
  "tags": [{"display":"라멘","origin":"user"}],
  "ocr_status": "ready",
  "lines": [{
    "line_id":"d77ac062-dab4-41ce-8652-85b08339e227",
    "text":"바다라멘",
    "quad":[[0.12,0.08],[0.44,0.08],[0.44,0.15],[0.12,0.15]],
    "origin":"user"
  }]
}
```

OCR 상태는 ready/no_text/skipped/failed/not_analyzed다. ready인데 모든 줄을 제외했다면 빈 배열을 허용하고 ‘검색 문구 0개’로 표시한다. no_text는 실제 인식 완료 후 글자를 못 찾은 상태다. 서버가 클라이언트의 모델 버전·origin·상태를 정답 증거로 신뢰하지는 않는다.

JSON은 UTF-8 기준 64KiB 이하, 줄 100개 이하·전체 문구 8192문자 이하, 태그 10개 이하로 제한한다. 문자 수는 Unicode code point 기준으로 Android·Python을 맞춘다. 초과할 경우 어느 한도를 넘었는지 표시하고 포함할 문구·태그를 사용자가 줄이게 한다. 서버가 조용히 잘라서 다른 검색 결과를 만들지 않는다. 입력 문구의 숫자·특수문자는 보존하되 제어문자는 거부한다.

새 내용 묶음이 없는 기본 업로드는 미분석으로 처리한다. 이미지 교체 시 새 묶음이 없으면 이전 분류·OCR를 모두 무효화한다. 제목·본문만 고칠 때는 현재 내용이 유지된다. 이미지 교체와 내용 교정을 동시에 수행할 때는 하나의 트랜잭션과 revision 검사를 사용한다.

## 7. 조회·교정·검색 계약

| 경로 | 권한·요청 | 응답·실패 |
| --- | --- | --- |
| GET `/api/v1/posts/{id}/content/` | 공개된 글만 조회 | post_id, revision, image_sha256, 크기, 확정 테마·태그·OCR 상태·줄; 미분석은 revision 0과 빈 값, 존재하지 않거나 비공개 시 404 |
| GET `/api/v1/post-contents/?ids=1,2,3` | 공개 글 ID 최대 50개 | `{results:[내용 요약]}`; 테마·태그·revision만 제공, 원래 OCR 전체 줄은 상세 조회 |
| PATCH `/api/v1/posts/{id}/content/` | 작성자 + 기존 인증·CSRF, expected_revision·image_sha256 필수 | 내용 전체 교체, 서버 정규화·revision+1 반환; 버전 불일치 409, 타인 403, 입력 400 |
| GET `/api/v1/content-posts/` | theme·tag·author=me 선택 조건, 공개 글 | 새 페이지 응답 `{results,next_cursor}`; 기본 Post 목록 계약과 분리 |
| GET `/api/v1/photo-text-search/` | q 필수, theme·tag·author=me 선택 | `{results,next_cursor}`; 각 결과는 Post 요약·content_revision·image_sha256·matched_lines |

필터 없는 기본 Android 동기화는 기존 `PhotoRepository.getPosts()`와 `/api_root/Post/`의 JSONArray·이미지 수신을 계속 사용한다. 보이는 글의 테마·태그는 최대 50개 ID의 내용 요약을 묶어 받아 ID로 연결해 글마다 요청을 반복하지 않는다. 조건별 목록과 OCR 검색은 새 페이지 API를 사용하며, results의 각 항목에 기존 Post 객체와 필요한 내용 요약을 포함한다. 이 구분을 실제 기기 회귀에서 확인한다.

내용 수정은 PATCH지만 누락된 목록을 조합해 추측하지 않도록 명세상 확정 내용 전체를 보낸다. 서버가 모델 버전을 바꾸며 자동 재분류하는 동작은 없다. 이미지 변경 요청의 `photo_content`에도 expected_revision을 요구하며, 구형 기본 API·웹의 이미지 교체는 기존 동작을 유지하되 관련 메타데이터를 무효화한다. 변경 후 지연된 내용 수정은 digest/revision 비교에서 409가 된다.

오류 형식은 `{code, detail, fields, current_revision?}`로 통일한다. code 예: invalid_content, image_mismatch, stale_content, unauthenticated. 세션 인증의 로그인 만료는 기존 동작상 403일 수 있으므로 새 앱에서 상태 코드만으로 타인 권한 오류와 혼동하지 않는다. HTTP 400·403·404·409·413은 각각 입력·권한·존재·충돌·크기 안내로 연결한다.

현재 세션 Cookie·CSRF를 재사용한다. 기존 Token 인증도 유지하되 APK에 관리자 비밀번호나 고정 토큰을 넣지 않는다. `author=me`는 비로그인 시 인증 오류이며 타인의 비공개 데이터를 얻는 매개변수로 해석하지 않는다.

미분석 기존 사진의 내용 GET은 revision 0·image_sha256 null을 반환할 수 있다. 작성자가 이 사진을 재분석하면 기기에서 받은 실제 저장 파일의 digest를 제출하고, 서버는 해당 파일 digest를 계산해 비교한 뒤 첫 메타데이터를 저장한다. 서버 전체 사진을 ML로 일괄 재분석하지 않는다.

## 8. 검색 규칙과 결과 일치

1. 서버가 원문을 Unicode NFKC → casefold → 공백 합치기/trim 순으로 정규화한다. 공백을 제거한 compact 문자열도 만든다. Android의 사전 검사는 보조이며 서버 값을 최종 기준으로 한다.
2. q는 정규화 후 2–80문자, 최대 5개 공백 구분 검색어로 제한한다. 한 글자·공백뿐인 입력은 즉시 안내한다. 각 검색어가 포함된 OCR 줄이 같은 게시글 안에 하나 이상씩 있어야 한다. 단어들은 서로 다른 줄에 있어도 된다.
3. 각 줄의 일반 정규화 문자열 또는 compact 문자열에 리터럴 부분 문자열로 일치한다. SQL 매개변수를 사용하고 LIKE의 `%`, `_`, escape 문자를 이스케이프해 사용자의 특수문자가 와일드카드가 되지 않게 한다.
4. 테마·태그·작성자 조건은 AND로 결합한다. 공개 게시글 조건을 모든 내용·검색 API에서 공통 적용한다. 관련도 모델 없이 최신 게시일·ID 순으로 정렬한다.
5. keyset cursor로 20개씩, 최대 50개를 반환한다. cursor에는 정렬 경계·검색 조건·최초 조회 시점 상한을 서명해 넣는다. 요청 조건이 달라지면 기존 cursor를 거부한다. 인덱스 수정 중 목록이 완전히 고정된다고 보장하지는 않는다.
6. 검색 응답에는 최대 10개 일치 줄과 나머지 개수를 제공한다. 상세 content에서 나머지를 확인한다. content_revision과 digest가 검색 당시 값과 다르면 최신 내용을 다시 검색하고, 옛 좌표를 현재 이미지 위에 표시하지 않는다.

한글 형태소·의미 유사어·문장 이해·오타 자동 교정 검색은 이번 범위가 아니다. 공백을 없애면서 생긴 정규화 위치를 원본 글자의 좌표로 역산하지 않고, 원래 인식 줄 전체를 강조한다. 분류만 고쳐도 서버 저장 직후 필터에 반영되고, 문구 교정·제외·삭제 후에는 기존 문구로 검색되지 않아야 한다.

## 9. 원자성·동시 수정·파일 생명주기

입력의 구조 검증과 이미지 디코딩을 가능한 한 DB 쓰기 잠금 전에 끝낸다. 기존 소유자 쓰기 의도 잠금을 획득한 뒤 Post·PhotoContent의 소유권과 digest/revision을 다시 확인한다. 이미지와 내용·줄 교체를 한 `transaction.atomic`에서 수행한다. 서버가 클라이언트가 보낸 author를 채택하지 않는다.

SQLite의 select_for_update만으로 보호된다고 가정하지 않는다. 내용 수정도 현재 서비스의 lock_owner_gallery 방식을 사용하고 revision 조건부 UPDATE의 변경 행 수를 확인한다. 충돌 시 409로 종료하고 다른 사용자의 수정을 덮어쓰지 않는다. 장시간 인식 작업은 이 잠금 안에 없다.

DB와 파일 저장소는 같은 트랜잭션 자원이 아니다. 기존 서비스처럼 새 파일의 저장 여부·원래 파일명을 추적하고 DB 롤백 시 **이번 요청의 새 파일만** 정리한다. 기존 서비스 밖을 단순히 atomic으로 감싸면 기존 서비스의 커밋 판단과 정리가 달라질 수 있으므로, 생성·수정 서비스 자체가 새 내용 저장까지 책임지도록 확장한다. 기존 파일 삭제는 실제 커밋 이후 처리하고 실패 시 정리 대상만 로그에 남긴다. 사진 삭제는 관련 메타데이터와 줄을 CASCADE로 제거한다.

사용자 입력·사진·토큰을 일반 오류 로그에 통째로 쓰지 않는다. 요청 ID·오류 코드·크기·버전 등의 진단 정보로 연결한다. 응답이 유실된 POST는 자동 재전송하지 않고 실제 내 글 조회로 확인한다. 서버가 정확히 한 번 전송을 보장하는 별도 오프라인 큐 기능을 구현했다고 주장하지 않는다.

## 10. Android 모듈과 상태 보존

기존 Java·View 기반을 유지한다. MainActivity는 탐색·계정·서버 선택을 조정하고, 작성·모자이크·결과 확인·검색·상세 컨트롤러와 View를 분리한다. 신규 영역은 `content/PhotoPipeline`, `FaceDetectorAdapter`, `MosaicRenderer`, `ThemeMapper`, `OcrAdapter`, `ComposerState`, `ContentRepository`, `ContentJsonCodec`, `PhotoSearchController` 같은 책임으로 나눈다. 클래스명은 구현 시 조정 가능하지만 인식·순수 규칙·통신·화면 결합을 피한다.

작성 중 사본은 앱 전용 임시 파일로 두며 상태에는 파일 경로·이미지 세대·영역 명령·텍스트·확정 여부만 보존한다. Bitmap과 수MB 바이트 배열을 Bundle에 넣지 않는다. 회전 시 처리 결과를 새 화면 상태에 연결하고, 중단된 작업은 같은 세대의 확정 파일로 다시 수행할 수 있다. 로그아웃·서버 변경 시 진행 중 쓰기와 결과 연결을 끊어 다른 계정에 게시하지 않게 한다.

검색은 입력 변경 후 약 350ms 지연하고 이전 요청 세대를 폐기한다. 뒤로 가기 복원은 검색어·조건·목록 위치를 보존한다. 사진 다운로드는 기존 같은 출처 제한을 유지한다. 화면 작업이 취소되어도 이미 서버가 성공한 업로드를 없던 일로 표시하지 않는다.

## 11. 구현 순서와 완료 관문

| 단계 | 작업 | 다음 단계 전 확인 |
| --- | --- | --- |
| I01 | 현재 기본 API·웹·Android 업로드 회귀 기준 고정 | 응답 7필드·bare array, 권한·사진 검증, 기존 사용자 사진 보존 |
| I02 | PhotoContent·태그·줄·정규화·내용/검색 API, 저장 서비스 | WSL: 검증·원자성·revision·이미지 교체·검색·실제 HTTP 테스트 |
| I03 | Android 작성 상태·얼굴 탐지·영역 편집·실제 사본 생성 | Windows/Android: 원본 보존·실제 게시 픽셀·회전·누락 보완 |
| I04 | 테마·OCR·교정과 사진 hash 연결, 검색·일치 영역 UI | Windows/Android + WSL: 늦은 콜백·재분석·문구 제외·서버 재조회 |
| I05 | 목록·내 글·상세 새 화면 연결, 웹 기본·확정값 표시·검색 연결 | 기본 1–11 회귀와 실제 과업 사용성 검토; 과거 3D 진입 제거 |
| I06 | PythonAnywhere 실제 배포·검증 및 보고서 | 실제 클라우드 게시·검색·Android 동기화, 5개 추가 등록과 기본 증빙 |

서버 명령·의존성·migration·테스트는 WSL2 Ubuntu의 기존 Linux venv에서만 실행한다. 소스는 `/mnt/c/Users/1/mobile_web_service` 하나를 사용한다. Android 빌드·에뮬레이터·ADB는 Windows에서 실행한다. PythonAnywhere Bash는 배포·운영 확인에 사용한다. 배포 전 점검에서는 실제 계정의 Python 버전·디스크 잔량·현재 고정 의존성 호환성을 먼저 확인하며, 로컬 버전이 그대로 지원된다고 추정하지 않는다. 로컬 WSL 테스트로 클라우드 성공을 대신하지 않는다.

디스크 사용량은 배포 시 확인하고 사진을 자동 삭제하지 않는다. 5MiB 상한이 512MiB 디스크에서 사진 100장을 보장하는 것은 아니다. 서버 코드·venv·DB·로그·사진이 같은 할당량을 쓰므로 작은 최종 사본과 제한된 시연 데이터로 측정한다. 검색은 우선 LIKE 기반으로 측정하고 실제 500개 글·최대 100줄/글 기준의 p95와 쿼리 계획을 기록한다. 목표 미달이면 동일 SQLite 안의 검증된 후보 검색 최적화를 적용하며, 외부 검색 서버를 추가하지 않는다.
