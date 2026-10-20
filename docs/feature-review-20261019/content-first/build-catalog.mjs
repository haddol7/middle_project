import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const roles=['product','technical','assessment'];
const raw=Object.fromEntries(roles.map(role=>[role,JSON.parse(fs.readFileSync(path.join(dir,`discovery-${role}.json`),'utf8')).ideas]));
const sourceFields=['title','problem','flow','value','method','server','client','dependsOn','overlap','qualification','proof'];
for(const role of roles)for(const row of raw[role])for(const key of sourceFields)if(typeof row[key]!=='string'||!row[key].trim())throw Error(`${role}: ${key}`);
const seeds=[...raw.product.map((idea,i)=>({number:i+1,idea,source:`product:${i}`})),
  ...[[17,'technical',3],[18,'technical',9],[19,'technical',13],[20,'technical',14],[21,'technical',15],[22,'assessment',8],[23,'assessment',9],[24,'assessment',13],[25,'assessment',15],[34,'technical',7]].map(([number,role,index])=>({number,idea:raw[role][index],source:`${role}:${index}`}))];
const mappings={product:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],technical:[1,2,3,17,5,4,6,34,14,18,9,10,11,19,20,21],assessment:[1,2,3,4,5,6,8,34,22,23,13,11,12,24,15,25]};
const rootIdeas=[
  [26,'사진의 관심 영역으로 같은 테마 기록 찾기','한 사진에 여러 대상이 섞여 전체 이미지 테마만으로 원하는 부분의 기록을 찾기 어렵다.','사진에서 관심 부분을 사각형으로 선택 → 해당 부분의 라벨 후보 확인 → 선택한 테마의 기존 사진글 탐색.','전체 장면 대신 사용자가 관심을 둔 내용을 탐색의 출발점으로 삼는다.','Android에서 선택 영역만 Bitmap으로 샘플링하고 bundled Image Labeling을 실행한다. 정확한 사물 동일성 검색이 아니라 확인한 라벨로 기존 테마 조회를 한다.','F01의 테마 목록 API 재사용. 추가 서버 기능을 인위적으로 만들지 않는다.','영역 좌표·회전·확대·모호한 라벨과 결과 목록을 연결한다.','F01의 실제 게시물 테마와 조회가 필요. SDK 자체는 공유 의존성.','전체 테마 탐색과 비슷하며 확대/자르기 편집으로 목적을 바꾸지 않는다.','가능경로','ML Kit image-labeling 공식 bundled 경로. 합성 영역 좌표와 여러 대상 사진의 부분/전체 결과·빈 결과를 검증한다.'],
  [27,'인물 포함 여부·인원수로 내 사진 좁히기','제목을 기억하지 못하지만 혼자 찍힌 사진인지 단체 사진인지는 기억할 수 있다.','게시 전 얼굴 수 후보 확인 → 인물 없음/한 명/여러 명 분류 확정 → 해당 조건으로 내 사진 필터.','인물의 이름이나 신원을 등록하지 않고 구성 단서로 재탐색한다.','bundled ML Kit Face Detection의 검출 box 수를 저장한다. 작거나 가린 얼굴의 미검출을 허용하며 실제 인원수 정답으로 단정하지 않는다.','본인 사진의 사용자 확정 인원수 범주 저장·조건 조회.','검출 영역 확인·수정·검색 조건과 결과 설명.','얼굴 검출 SDK 자동 Gradle 구성. 동일인 인식/개인 학습 없음.','테마 분류의 인물 범주 확장으로 합쳐질 수 있고 일반 사용 필요성은 niche 여부를 먼저 판단한다.','가능경로','공식 bundled face-detection 경로. 검출 실패가 있는 사진과 인물 없음/단체 사진 fixture로 확정값과 필터를 검증한다.'],
  [28,'사진 장면의 자유로운 설명문 자동 생성','사진을 보는 데 어려움이 있거나 설명 작성이 부담스러운 사용자에게 구체적인 장면 설명이 필요할 수 있다.','사진 선택 → 장면 설명문 생성 → 작성자가 수정·확정 → 공개 열람에 사용.','단순 라벨보다 풍부한 설명을 제공할 잠재력이 있다.','ML Kit GenAI Image Description API 후보. 일반 image-labeling과 다른 지원 기기/AICore가 필요하며 현 AVD 지원은 확인되지 않았다.','확정 설명 저장·조회. 서버에서 생성형 모델을 돌리지 않는다.','지원 여부 조회·생성·수정 UI. 지원 안 되는 경우 템플릿으로 바꿔 같은 기능이라고 주장하지 않는다.','현재 장치의 공식 지원·언어·실행 검증 전 보류. 새 기기를 사용자가 준비해야 하면 탈락.','F11의 제한된 라벨 기반 보조 설명과 대안이며 품질 범위가 다르다.','조건부','공식 https://developers.google.com/ml-kit/genai 및 image-description/android. 기기 feature status와 실제 추론이 먼저 확인되어야 한다.'],
  [29,'자유 문장으로 사진 내용 검색','테마 단어를 모르고 장면을 문장으로만 기억하는 경우 키워드 검색이 어렵다.','장면을 문장으로 입력 → 이미지 내용에 가까운 사진글을 검색 → 근거와 결과 확인.','텍스트를 직접 적지 않은 사진도 문장의 의미로 찾을 잠재력이 있다.','텍스트·이미지 공통 공간의 사전학습 모델이 필요하다. 현재 고정한 모델 artifact·개별 라이선스·Android 런타임·한국어 품질은 없다.','기기 벡터의 제한된 유사도 비교·저장만 가능. 무료 PA에 대형 추론 서버를 두지 않는다.','텍스트·이미지 인코딩과 검색 UI. 단순 태그 동의어 검색으로 정의를 축소하지 않는다.','구체 사전학습 모델의 자동 취득·지원·한국어·CPU 검증 전 보류. 사용자 훈련으로 해결하지 않는다.','F17의 이미지→이미지 예시 검색 및 F03 구조화 조건 검색과 다르다.','조건부','문장/이미지 쌍의 검색 검증과 모델 이용 조건이 확보돼야 한다. Codex가 알아서 모델을 만든다고 통과시키지 않는다.'],
  [30,'사용자가 직접 훈련하는 맞춤 사진 분류기','기본 라벨에 없는 개인만의 분류를 자동화하고 싶은 경우가 있다.','사용자가 정답 사진을 수집·라벨링 → 직접 모델 학습 → 앱에 모델 배포 → 맞춤 분류.','개인 분류를 표현할 수 있지만 이번 사용자 조건과 충돌한다.','사용자가 직접 수집·라벨링·모델 훈련하는 AutoML/전이학습을 정의상 요구한다.','모델/결과 보관. 현 계획에 채택하지 않는다.','사용자 모델 준비와 학습이 필수인 비교군.','사용자 직접 모델 학습 금지와 충돌.','F01의 사전학습 모델+규칙 교정과 혼동하지 않는다.','제외','기능 정의 자체가 사용자 모델 훈련을 요구하므로 이번 gate에서 제외.'],
  [31,'촬영 위치가 가까운 내 기록 다시 찾기','장소 이름을 쓰지 않은 예전 사진을 대략 같은 위치라는 단서로 찾고 싶을 수 있다.','사진의 EXIF 위치 존재 확인 → 기준 사진 선택 → 가까운 거리의 내 게시물 후보와 거리 표시.','위치가 있는 기록을 제목 없이 다시 탐색한다. GPS 없는 사진의 위치를 시각적으로 추정하지 않는다.','ExifInterface로 실제 GPS 좌표를 읽고 Haversine 거리·제한된 후보 비교를 구현한다. 외부 지도·역지오코딩·유료 API는 사용하지 않는다.','소유자 범위의 좌표 메타데이터 저장·거리 조회, 공개 Post/이미지 계약 유지. 사진 비공개 보장을 주장하지 않는다.','위치 없음·기준 사진·거리 범위·거리순 후보 및 EXIF 정보 출처 표시.','AndroidX ExifInterface는 공식 Google Maven 자동 의존성. 위치 데이터가 있는 사진에 한정한다.','테마 검색과 다른 실제 메타데이터 단서이나 여행/위치 기록 상황에 한정될 수 있다.','가능경로','좌표가 있는 합성 EXIF·누락 EXIF·반구/날짜경계와 거리 oracle를 WSL/Android로 검증.'],
  [32,'테마별 대표 사진 추천과 사용자 확정','주제별 사진이 많아지면 해당 모음을 대표할 사진을 고르기 어렵다.','테마 모음에서 대표 후보 보기 → 선명도·노출·중복 제외 근거 확인 → 사용자가 선택하거나 다른 사진 지정.','사진 모음의 진입점을 고르는 수고를 줄인다.','확정 테마에서 제한 후보의 작은 이미지 엣지·노출 지표와 해시 중복으로 순위를 만든다. 미적 우수성이나 최고 사진을 판정하지 않는다.','대표 선택 저장·제한 후보 계산 및 데이터 변경 시 유효성 검사.','후보 비교·추천 이유·대표 확정·되돌리기.','F01 테마 데이터 필요. 별도 앨범 시스템을 숨겨 요구하지 않는다.','F09 게시 전 선택 및 F34 회고의 대표사진 표시와 겹친다. 독립 필요성 낮을 수 있다.','가능경로','기존 Pillow/SQLite와 Android 비교 UI. 의도적 어두운 사진을 강제로 배제하지 않는 fixture 검증.'],
  [33,'분류가 모호한 사진 검토함','자동 인식이 애매했던 사진을 놓치면 테마 검색에서 빠질 수 있다.','미확정 사진 목록 → 제안 근거 확인 → 테마 수정·보류 → 다시 검색.','인식 결과의 빈틈을 관리하지만 기본 분류의 필수 교정 품질에 가까울 수 있다.','분류 confidence·사용자 확정 상태와 제한된 필터·일괄 저장. 새 모델 훈련 없음.','미확정 목록 및 소유자 수정 API.','미확정 수·검토·보류·재조회 UI.','F01의 추론과 저장·수정 필요.','F01에 포함해야 할 교정 UX를 새 기능으로 과대 집계할 위험이 높다.','가능경로','낮은 신뢰도·새 분석 버전·이미 수정한 사진의 재분석이 사용자 선택을 훼손하지 않는지 검증.'],
  [35,'문서 사진 원근 보정 — 이전 추천 비교군','비스듬히 찍힌 문서 사진을 펴서 게시하고 싶은 경우가 있다.','문서 네 모서리를 직접 지정 → 확대 보조 → 투영 보정 사본을 게시.','문서 공유에서는 가독성을 개선하지만 일반 사진 블로그의 핵심 필요성을 먼저 검증해야 한다.','Android Matrix.setPolyToPoly·Canvas·기하 좌표와 상태 복원.','기본 단일 사진 POST를 재사용.','네 점 조작·퇴화 사각형 거부·전후 비교.','기존 Android SDK. 모델·사용자 설치 없음.','사용자가 목적 적합성을 지적한 이전 후보. 높은 T로 필요성을 상쇄하지 않는 비교군.','가능경로','합성 투시 격자의 오차·코너 조작을 검증할 수 있으나 기술 증거가 서비스 필요성을 입증하지는 않는다.']
];
for(const [number,...cells] of rootIdeas){const idea=Object.fromEntries(sourceFields.map((key,i)=>[key,cells[i]]));seeds.push({number,idea,source:'root'});}
const clientOnly=new Set([9,10,12,13,19,20,21,24,25,26,35]);
const requires=new Map([[3,[1,2]],...[4,5,6,7,8,15,16,22,25,26,32,33,34].map(n=>[n,[1]]),[14,[1,7]]]);
const overlaps={1:[15,25,33],2:[3,19],3:[1,2,4],4:[3,8,32],5:[6,7,14,16],6:[5,16],7:[5,22],8:[4,22],9:[18,23,32],10:[],11:[21,28],12:[2,19],13:[21],14:[5,7],15:[1,33],16:[5,6],17:[18,23],18:[9,17,23],19:[2,12],20:[24],21:[11,13],22:[7,8],23:[9,17,18],24:[20],25:[1,2,33],26:[1,17],27:[1],28:[11],29:[3,17],30:[1],31:[],32:[4,9,34],33:[1,15,25],34:[4,14,32],35:[]};
const fid=n=>'F'+String(n).padStart(2,'0');
const components=[];
const candidates=seeds.sort((a,b)=>a.number-b.number).map(({number,idea,source})=>{
  const id=fid(number),own=[...(clientOnly.has(number)?[]:[`S${String(number).padStart(2,'0')}`]),`C${String(number).padStart(2,'0')}`];
  for(const component of own)components.push({id:component,side:component[0]==='S'?'server':'client',capability:id,title:`${idea.title} — ${component[0]==='S'?'서버':'Android'}`,scope:component[0]==='S'?idea.server:idea.client});
  const origins=roles.flatMap(role=>mappings[role].flatMap((n,i)=>n===number?[`${role}:${i}`]:[]));
  if(source==='root')origins.push('root');
  return {id,...idea,type:number===35?'control':[17,28,29,30].includes(number)?'conditional':(requires.get(number)?.length?'extension':'capability'),requires:(requires.get(number)||[]).map(fid),components:own,overlaps:(overlaps[number]||[]).map(fid),origins};
});
const map=new Map(candidates.map(c=>[c.id,c]));
// 선택한 최소안과 등록 범위를 일치시킨다. 구조화 링크 서버는 이번 F20에 포함하지 않는다.
map.get('F20').server='기존 Post 본문 text에 사용자가 승인한 URL을 삽입해 저장한다. 구조화 링크 필드·새 서버 API·서버 URL 크롤링은 포함하지 않는다.';
map.get('F20').flow='사진에서 QR/웹주소 후보를 추출 → 원문·도메인 확인 → 작성자가 선택한 URL만 편집 가능한 게시 본문에 삽입 → 기존 단일 POST로 게시.';
map.get('F01').server+=' 개별 사진의 이미지 지문·분석 버전·수정 revision을 검사하는 분석 결과 적용 API를 포함한다. 기존 사진에도 같은 API를 적용할 수 있으나 대량 진행·재개 UI는 F25다.';
components.find(c=>c.id==='S01').scope=map.get('F01').server;
map.get('F25').server='F01/S01의 권한·이미지 지문·분석 버전·revision 검증 결과 적용 API와 기존 게시물 페이지 조회를 재사용한다. 새 서버 작업 큐·서버 진행 체크포인트·상시 작업은 만들지 않는다.';
map.get('F25').client='단말 로컬 DB에 처리한 게시물ID·이미지 지문·페이지 위치를 체크포인트로 저장하고, 기존사진 분석의 진행·중단·앱 종료 후 재개·결과 확인·재시도를 제공한다.';
components.find(c=>c.id==='C25').scope=map.get('F25').client;
function close(id,seen=new Set()){if(seen.has(id))return seen;seen.add(id);for(const req of map.get(id).requires)close(req,seen);return seen;}
for(const c of candidates){c.capabilityClosure=[...close(c.id)].sort();c.componentClosure=[...new Set(c.capabilityClosure.flatMap(id=>map.get(id).components))].sort();c.minimumRegistration={server:c.componentClosure.filter(id=>id[0]==='S').length,client:c.componentClosure.filter(id=>id[0]==='C').length,total:c.componentClosure.length};c.withinFive=c.minimumRegistration.total<=5;}
const data={date:'2026-10-20',startedDate:'2026-10-19',rawAgentIdeas:roles.reduce((n,role)=>n+raw[role].length,0),mergedAgentCapabilities:seeds.filter(s=>s.source!=='root').length,rootAdditions:rootIdeas.length-1,controls:1,count:candidates.length,scope:'사진 내용을 활용하는 사진 블로그 후보. 구현·채택 결과가 아니다.',candidates};
// 선택·비교·한 장 게시까지 F09의 평가 범위를 고정한다.
map.get('F09').flow='게시 후보 사진 최대12장 선택 → 시각적으로 가까운 사진 비교 → 흐림·극단 노출 참고 지표 확인 → 사용자가 한 장을 골라 기존 단일 POST로 게시.';
fs.writeFileSync(path.join(dir,'candidates.json'),JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(dir,'components.json'),JSON.stringify({note:'평가서에 맞춘 보수적 등록 가정. 기본 API·공유 SDK는 새 슬롯 아님. 독립 인정은 최종 증거에 달려 있음.',components},null,2)+'\n');
console.log(JSON.stringify({count:data.count,raw:data.rawAgentIdeas,merged:data.mergedAgentCapabilities,rootAdditions:data.rootAdditions,controls:data.controls,overBudget:candidates.filter(c=>!c.withinFive).map(c=>({id:c.id,registration:c.minimumRegistration})),titles:candidates.map(c=>[c.id,c.title,c.minimumRegistration.total])},null,2));
