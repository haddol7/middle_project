# 사진관 마을 설계의 과거 기록

> 이전 실행 코드의 설계 이력이다. 현재는 사용자가 확정한 얼굴 자동 모자이크·자동 분류·사진 속 글자 검색의 [2026-10-20 설계 기준본](design-20261020/README.md)을 따른다. 사진관·마을 콘셉트는 폐기했으며, 과거 모아 설계는 승인된 새 기획이 아니다. 현재는 지정 운영자만 작성하는 1인 블로그다. Android 최신 화면과 실제 검사는 ANDROID_NATIVE_PARITY.md·PROJECT_STATUS.md를 따른다. 아래 내용은 새 서비스 지침이나 새 기능 완료 증거가 아니다.

사진과 짧은 이야기를 게시하면 개인 사진관이 성장하고, 사용자는 마을에서 다른 사람의 사진관을 방문한다. 일반 블로그와 3D 공간은 같은 서버 데이터를 사용한다. 아래 성장 수치와 상호작용은 프로젝트의 기획 규칙이며 교수님의 채점 기준이 아니다.

## 사용자 흐름

방문자는 일반 게시 목록 또는 3D 마을을 볼 수 있다. 회원은 가입·로그인 후 제목·본문·이미지를 게시한다. 자기 사진관에서 사진을 액자에 연결하고 가구를 배치·회전·삭제한 다음 저장한다. 다른 사람의 사진관에서는 사진과 이야기를 열람하지만 배치를 저장하지 못한다. 3D를 끄면 사진관 목록과 게시글 카드가 있는 일반 블로그가 표시된다.

## 성장 규칙

사진 수 0–2장은 작은 사진관, 3–7장은 넓은 사진관, 8–14장은 확장 사진관, 15장 이상은 큰 사진관으로 한다. 단계별 실내 크기·가구 한도·액자 공간을 분리된 정책에서 정의한다. 사진을 삭제해도 이미 열린 공간은 축소하지 않아 가구가 벽 밖으로 밀려나지 않게 한다. 현재 사진 수와 최대 도달 사진 수를 구분해 표시한다. 삭제된 사진의 액자는 비어 있는 액자가 되며, 타인의 사진 ID를 자기 배치에 연결할 수 없다.

## 데이터 경계

- 서버: User, Post, 개인 Gallery, 성장 이력, 검증된 개인 DecorLayout, 저장 revision.
- 서버에 저장하지 않는 것: 세계 맵·마을 타일·집의 세계 좌표·이동 상태·카메라 상태.
- 클라이언트: `/api/v1/galleries/` 목록을 받아 안정적인 ID 기반으로 마을을 절차적 생성한다. 방문한 사진관의 실내는 성장 정책과 저장된 개인 꾸미기에서 구성한다.
- 일반 웹·웹 3D·Java Android는 동일한 API 계약을 사용하되 렌더러를 공유하지 않는다. Android는 Java 네이티브 OpenGL ES로 별도 구현한다.

## 모듈 경계

기존 `Post` 모델·DRF API·웹 뷰를 기본으로 유지하고 소유자 권한을 바로잡는다. 성장과 배치 검증은 HTTP·ORM 없이 테스트 가능한 업무 규칙으로 둔다. 생성·수정·저장은 트랜잭션을 담당하는 저장 서비스에서 처리한다. API는 입력 검증·인증·권한·응답을 맡고, 렌더러는 네트워크 인증이나 성장 규칙을 직접 결정하지 않는다.

꾸미기는 revision을 포함한 전체 배치 저장 방식이다. 오래된 revision으로 저장하면 충돌을 반환하고 덮어쓰지 않는다. 종류·ID·좌표·회전·크기·수량·관련 사진 권한을 검증한다. 초안은 클라이언트에 있고 저장 성공 후에만 서버 revision으로 갱신한다.

## 시각적 목표

동물의 숲과 싸이월드의 개인 공간·방문·꾸미기를 참고하되 모델과 장식은 원본 제작한다. 둥근 지붕과 두꺼운 문창틀, 겹친 지붕재, 나무 널판과 크림색 벽, 잔디 가장자리와 층진 지형, 유기적 해안·수면 포말, 따뜻한 창빛과 부드러운 그림자, 움직이는 물·잎·구름을 통일된 화면으로 만든다. 카메라는 사람이 사진관을 알아보고 이동할 수 있는 높은 3/4 시점으로 하며 실내는 사진·가구가 잘 보이도록 전환한다.

하우스·지형·식물·가구 모델 제작, 재질, 장면 조명, 카메라, 입력과 선택, 네트워크 및 배치 편집 상태를 나눈다. 특정 그래픽 효과의 구현 어려움이나 성능 우려만으로 효과를 생략하지 않는다. 실제 화면 확인과 수정 전에는 시각 목표가 완료된 것으로 판단하지 않는다.

## 환경과 안전

Django 단일 애플리케이션과 SQLite, 정적 웹 자산 및 업로드 이미지를 사용한다. PythonAnywhere 무료 환경을 벗어나는 외부 워커·Redis·Docker·Kubernetes를 필수 의존성으로 두지 않는다. 보안 설정은 배포 환경변수로 분리하고 운영에서 개발용 비밀키를 허용하지 않는다. 업로드 형식·용량·픽셀 수와 객체 권한을 검증한다. 로컬 테스트 계정·DB·업로드 파일·토큰은 Git에 포함하지 않는다.

## 참고 사례와 제작 근거

[Nintendo 공식 섬과 집 소개](https://animalcrossing.nintendo.com/new-horizons/create/)는 개인 거처·꾸미기·방문이 연결되는 흐름의 참고다. [Happy Home Paradise 공식 소개와 갤러리](https://www.nintendo.com/en-ca/store/products/animal-crossing-new-horizons-happy-home-paradise-70050000030669-switch/)의 실내·해변 집·야간 숲 화면을 직접 확인했다. 둥근 처마와 두꺼운 창틀, 겹친 지붕재와 무광 목재, 모래·잔디·물 경계의 곡선, 낮의 부드러운 그림자와 밤의 따뜻한 창빛을 제작 기준으로 삼는다. 우리 성장 단계와 수치·모델·색상은 해당 게임의 원본 규칙이나 에셋이 아니다.

싸이월드의 개인 공간 중심 방향은 [공식 블로그](https://cyworld.inblog.io/%EC%9D%B4%EC%BD%94%EB%85%B8%EB%AF%B8%EC%8A%A4%ED%8A%B8-%EA%B8%B0%EC%9E%90%EA%B0%80-%EB%AC%BC%EC%96%B4%EB%B4%A4%EC%96%B4%EC%9A%94-38560), 미니룸·미니미의 역사적 사례는 [2002년 서비스 발표 기사](https://www.inews24.com/view/62965)를 참고한다. 역사적 사례를 현재 서비스가 동작한다는 증거로 사용하지 않는다. 사진관 간판과 집을 선택해 방문하고 자기 공간을 꾸미는 흐름으로 발전시킨다.

웹은 [Three.js 설치 안내](https://threejs.org/manual/pages/installation.html)에 따라 버전이 고정된 정적 자산으로 빌드한다. [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)가 요구하는 WebGL 2를 확인하고 미지원 사유를 화면에 표시한다. 지원 브라우저에서 3D를 생략하는 근거로 삼지 않는다. 3D 전환·장면 교체 시 [자원 해제 지침](https://threejs.org/manual/pages/cleanup.html)에 따라 geometry·material·texture를 정리한다. Android에서는 웹 라이브러리를 사용하지 않는다.

기능 설계의 변경은 진행 기록에 근거와 함께 남긴다.

## Java Android 모듈 경계

`PhotoViewer`는 native `MainActivity`/`UiKit` 화면, 동일 출처 HTTP·쿠키·CSRF를 담당하는 `PhotoRepository`, 불변 `model` DTO, 렌더링과 무관한 `LayoutDraft`·`VillageMap`, 별도 `gl` 렌더러로 나눈다. 사진관 목록만으로 앱 내부에서 마을 좌표를 결정하며 세계 좌표를 서버에 전송하지 않는다.

OpenGL ES 3.0은 Java 셰이더·VBO·사진 텍스처·레이 선택으로 구현한다. 원본 모델 변환 도구는 서버의 개발 도구 폴더에 있고 앱에는 PVM 데이터만 포함된다. 웹 3D 런타임을 Android에 넣지 않는다. 지형 생성·이동 충돌·사진 자르기·PVM 검사는 GPU 없이 유닛 테스트하고, 실제 기기에서 셰이더 컴파일·장면 픽셀·입력·저장 복원을 추가 확인한다.

네트워크 작업과 사진 디코딩은 UI 스레드 밖에서 실행한다. 화면/서버 변경이나 Activity 파괴 이후의 오래된 응답은 generation으로 차단한다. 서버를 바꾸면 별도 쿠키 컨테이너를 사용하고 인증 값은 디스크에 저장하지 않는다. 업로드 성공 POST와 후속 동기화 GET을 구분하여 후속 실패가 성공한 사진의 재게시로 이어지지 않게 한다. 로그인·로그아웃도 인증 결과를 먼저 반영한 뒤 목록을 갱신한다.

## 서버 웹 구현 계약

성장 단계는 0·1·2·3이며 각각 실내 폭×깊이 8×6, 10×8, 12×10, 14×12, 높이 3.4다. 총 장식 한도는 20·32·48·64, 액자 한도는 8·16·24·32다. 가구 종류는 frame·sofa·chair·table·plant·lamp·rug·shelf다. 좌표는 개인 실내의 중심을 원점으로 한 x·z이며 마을의 세계 좌표와 별개다.

기존 `/api_root/Post/`의 배열·필드 계약을 유지한다. 별도 `/api/v1/galleries/`는 공개 사진관 배열, `/api/v1/galleries/<id>/`는 사진관 상세와 posts 배열, `/api/v1/galleries/<id>/layout/`는 GET과 소유자 전용 PUT, `/api/v1/catalog/`는 장식 목록, `/api/v1/auth/me/`는 현재 사용자·사진관 ID·CSRF 정보를 제공한다. 가입 웹 폼과 가입 API는 같은 Django 비밀번호 규칙을 사용한다. 기본 웹 사진 업로드와 기존 Post API 모두 성장·정리 서비스에 연결한다.

사진관에는 id·owner(id,username)·name·description·photo_count·peak_photo_count·level·level_name·room(width,depth,height)·limits(items,frames)·cover_url·is_owner를 제공한다. 상세 posts는 기존 Post Serializer 필드를 사용한다. layout 응답은 gallery_id·revision·items이며 PUT은 revision·items를 받는다. 항목은 id·kind·x·z·rotation(도)·scale·photo_id(null 허용)·wall(frame만 back,left,right)을 사용한다. 액자는 벽에 붙이고 가구는 바닥에 둔다. 서버가 종류별 위치·크기·수량·사진 소유권을 검증한다.

웹 화면은 Django 템플릿과 동일 출처의 정적 ES module을 사용한다. Three.js 0.186.0의 core·module 파일을 정적 vendor에 고정하여 CDN·Node 서버 없이 PythonAnywhere에서 제공한다. 일반 UI·네트워크·편집 초안과 Three.js 장면을 분리한다. 장면은 `createScene({host,mode,galleries,gallery,items,editable,onVisit,onOpenPhoto,onChangeItems,onSelectItem})`로 생성하며 setItems(items,selectedId), setSelectedItem(id), dispose()를 제공한다. 렌더러의 UI 이벤트는 초안을 변경하고 실제 저장·revision 갱신은 별도 UI 제어기가 담당한다.

장식의 여덟 필드는 전부 필요하고 ID는 UUID다. 바닥 가구의 photo_id·wall은 null이며 크기는 0.5–2, 회전은 0 이상 360 미만이다. 회전한 가구의 실제 바닥 영역에 0.15m 여유를 더해 경계를 검사한다. 액자는 중심 높이 1.6m, 벽에서 0.14m 안쪽에 붙인다. 뒷벽은 z=-depth/2+0.14·회전 0도, 왼벽은 x=-width/2+0.14·90도, 오른벽은 x=width/2-0.14·270도다. 장식 종류별 치수는 서버 catalog와 렌더러에서 일치시킨다.

성장으로 벽이 넓어지면 기존 벽 액자를 새 벽으로 옮기고 배치 revision을 갱신한다. 열린 공간은 줄이지 않는다. 삭제된 사진의 액자 연결도 제거하면서 revision을 올려 오래된 초안이 삭제·성장 전 상태를 덮어쓰지 못하게 한다. 이름은 80자, 소개는 2000자로 제한한다. 이 제한과 성장 수치는 프로젝트의 정책이며 별도의 교수님 평가 조건은 아니다.
