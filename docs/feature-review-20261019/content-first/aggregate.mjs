import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const catalog=JSON.parse(fs.readFileSync(path.join(dir,'candidates.json'),'utf8'));
const components=JSON.parse(fs.readFileSync(path.join(dir,'components.json'),'utf8')).components;
const ids=new Set(catalog.candidates.map(c=>c.id));
const roles=['product','technical','assessment'],axes={N:3,T:4,U:2,E:1};
const gates=new Set(['pass','hold','exclude']);
const reviews=roles.map(role=>{
  const d=JSON.parse(fs.readFileSync(path.join(dir,`review-${role}.json`),'utf8'));
  if(d.rows.length!==ids.size)throw Error(`${role}: rows ${d.rows.length}`);
  const seen=new Set();
  for(const r of d.rows){
    if(!ids.has(r.id)||seen.has(r.id))throw Error(`${role}: ID ${r.id}`);seen.add(r.id);
    for(const k of Object.keys(axes))if(!Number.isFinite(r[k])||r[k]<0||r[k]>10||!Number.isInteger(r[k]*2))throw Error(`${role}/${r.id}: ${k}`);
    if(!['core','niche','weak'].includes(r.need))throw Error(`${role}/${r.id}: need`);
    if((r.need==='core'&&r.N<7)||(r.need==='niche'&&(r.N<4||r.N>=7))||(r.need==='weak'&&r.N>=4))throw Error(`${role}/${r.id}: need/N consistency`);
    for(const k of ['codexGate','platformGate'])if(!gates.has(r[k]))throw Error(`${role}/${r.id}: ${k}`);
    for(const k of ['userManualWork','trainingRequired'])if(typeof r[k]!=='boolean')throw Error(`${role}/${r.id}: ${k}`);
    if((r.userManualWork||r.trainingRequired)&&r.codexGate==='pass')throw Error(`${role}/${r.id}: disallowed Codex pass`);
    for(const k of ['needReason','implementation','dependencies','verification','demo','componentIssue','note'])if(typeof r[k]!=='string'||!r[k].trim())throw Error(`${role}/${r.id}: ${k}`);
    if(r.registrationAdvice!==undefined&&typeof r.registrationAdvice!=='string')throw Error(`${role}/${r.id}: registrationAdvice`);
    if(!['low','medium','high'].includes(r.recognitionRisk))throw Error(`${role}/${r.id}: recognitionRisk`);
    if(!Array.isArray(r.overlaps)||r.overlaps.some(id=>!ids.has(id)||id===r.id))throw Error(`${role}/${r.id}: overlaps`);
    r.total=Object.entries(axes).reduce((sum,[k,w])=>sum+r[k]*w,0);
  }
  return {...d,role,map:new Map(d.rows.map(r=>[r.id,r]))};
});
const rows=catalog.candidates.map(c=>{
  const individual=reviews.map(d=>({reviewer:d.role,...d.map.get(c.id)}));
  const ticks=individual.reduce((n,r)=>n+Math.round(r.total*2),0);
  const axisTicks=Object.fromEntries(Object.keys(axes).map(k=>[k,individual.reduce((n,r)=>n+r[k]*2,0)]));
  const excluded=individual.some(r=>r.codexGate==='exclude'||r.platformGate==='exclude'||r.userManualWork||r.trainingRequired);
  const environmentHold=individual.some(r=>r.codexGate!=='pass'||r.platformGate!=='pass');
  const needAgreement=individual.every(r=>r.need==='core')?'core':individual.every(r=>r.need==='niche')?'niche':individual.every(r=>r.need==='weak')?'weak':'mixed';
  const issues=individual.filter(r=>r.componentIssue.trim().toLowerCase()!=='none').map(r=>({reviewer:r.reviewer,note:r.componentIssue}));
  const status=excluded?'excluded':environmentHold?'hold':!c.withinFive?'over_budget':issues.length?'scope_review':needAgreement==='core'&&c.type!=='control'?'active':needAgreement==='mixed'?'need_review':needAgreement;
  return {...c,individual,needAgreement,status,ticks,axisTicks,mean:ticks/6,axes:Object.fromEntries(Object.keys(axes).map(k=>[k,axisTicks[k]/6])),minN:Math.min(...individual.map(r=>r.N)),min:Math.min(...individual.map(r=>r.total)),max:Math.max(...individual.map(r=>r.total)),componentIssues:issues,overlaps:[...new Set([...c.overlaps,...individual.flatMap(r=>r.overlaps)])].sort(),recognitionRisk:individual.some(r=>r.recognitionRisk==='high')?'high':individual.some(r=>r.recognitionRisk==='medium')?'medium':'low'};
}).sort((a,b)=>b.ticks-a.ticks||b.minN-a.minN||b.axisTicks.N-a.axisTicks.N||b.axisTicks.T-a.axisTicks.T||a.id.localeCompare(b.id));
const resultMap=new Map(rows.map(r=>[r.id,r]));
for(let pass=0;pass<rows.length;pass++)for(const r of rows)if(r.status==='active'&&r.requires.some(id=>resultMap.get(id).status!=='active'))r.status='dependency_hold';
let rank=0;for(const r of rows)r.rank=r.status==='active'?++rank:null;
const counts=Object.fromEntries([...new Set(rows.map(r=>r.status))].map(status=>[status,rows.filter(r=>r.status===status).length]));
const data={date:catalog.date,rubric:'NeedGate-N30-T40-U20-E10',formula:'N*3+T*4+U*2+E; mean of three independent reviews',candidateCount:rows.length,evaluationCount:rows.length*3,rawAgentIdeas:catalog.rawAgentIdeas,mergedAgentCapabilities:catalog.mergedAgentCapabilities,rootAdditions:catalog.rootAdditions,controls:catalog.controls,feasibilityWeight:0,effortPenalty:false,featureTestsExecuted:false,pythonAnywhereDeploymentVerified:false,counts,rows,blindSpots:reviews.map(d=>({reviewer:d.role,notes:d.blindSpots||[]}))};
fs.writeFileSync(path.join(dir,'rankings.json'),JSON.stringify(data,null,2)+'\n');
const labels={active:'핵심 추천',hold:'환경/Codex 보류',excluded:'필수 조건 제외',over_budget:'최소 등록 5개 초과',scope_review:'등록 범위 이견',dependency_hold:'원천 기능 미통과',need_review:'필요성 판정 이견',niche:'한정 상황',weak:'목적 약함',core:'비교군'};
const needLabels={core:'핵심 과업',niche:'한정 상황',weak:'목적 약함',mixed:'평가자 이견'};
const table=list=>['| 순위 | ID | 사용자 기능 | 평균/100 | 필요성/10 | 도전성/10 | 최소 등록 S+C | 판정 |','| --- | --- | --- | ---: | ---: | ---: | --- | --- |',...list.map(r=>`| ${r.rank||'—'} | ${r.id} | ${r.title} | ${r.mean.toFixed(1)} | ${r.axes.N.toFixed(1)} | ${r.axes.T.toFixed(1)} | ${r.minimumRegistration.server}+${r.minimumRegistration.client}=${r.minimumRegistration.total} | ${labels[r.status]} |`)].join('\n');
const active=rows.filter(r=>r.status==='active');
const report=[
 '# 사진 블로그 필요성 우선 재평가','',
 `서브 에이전트 3명의 원안 ${catalog.rawAgentIdeas}개를 ${catalog.mergedAgentCapabilities}개로 중복 통합하고 root 제안 ${catalog.rootAdditions}개와 이전 원근 보정 비교군 ${catalog.controls}개를 더해 **${rows.length}개 후보를 3명이 각각 독립 평가했다(${rows.length*3}건)**. 후보 한 행은 사용자 기능이며 서버/클라이언트 구현을 별도 행으로 세어 후보 수를 늘리지 않았다. 서로 대안인 후보와 필수 조건 위반 비교군도 포함한다.`,
 '', '**이번 결과는 후보 검토다. 사용자 연구로 수요를 검증하거나 새 기능을 구현·배포한 결과가 아니다. 기존 앱 코드와 서비스 콘셉트를 변경하지 않았다. 점수는 교수님 공식 배점이 아니다.**','',
 '## 필요성을 먼저 통과시키는 방법','',
 '- 세 평가자 모두 일반 사진 블로그의 게시·정리·찾기·읽기/발견 문제와 직접 연결된다고 판단(core, N>=7)해야 핵심 순위에 오른다. 특수 촬영물·취향·좁은 상황은 niche, 목적이 약하면 weak로 분리했다. 높은 기술 점수로 이를 상쇄하지 않는다.',
 '- 점수: 필요성 N30 · 기술 도전성 T40 · UI/UX U20 · 과제 차별성과 증빙 E10. 0–10/0.5 단위, `N*3+T*4+U*2+E`. 현실성·작업량·일정 감점은 0이다. 단순 SDK 호출에 모델 자체 개발 난도를 주지 않았다.',
 '- 무료 PA·Codex 구현 경로·사용자 직접 설치/공부/라벨링/모델 훈련/RL 불필요는 별도 자격이다. 기술 도구가 공유된다고 제품 기능 슬롯을 늘리지 않으며, 실제 분석 데이터 공급에 필요한 서버·Android 동작은 누락하지 않는다.',
 '- 기본 과제 ID1–13과 공개 Post API, 실제 PA 저장/조회 및 Android 동기화를 유지한다. ID14 최대5개와 서버/클라이언트 별도 집계를 적용했다. 기본 업로드·테마별 단순 필터·필수 교정 품질을 추가 기능으로 중복 주장하지 않는다.',
 '',`집계: ${Object.entries(counts).map(([key,n])=>`${labels[key]} ${n}개`).join(', ')}.`,
 '', '## 결과 해석','',
 `- 자동 테마·태그 추천(F01)의 필요성 평균은 ${resultMap.get('F01').axes.N.toFixed(1)}/10로 높게 평가됐다. OCR 검색(F02)은 필요성 ${resultMap.get('F02').axes.N.toFixed(1)}/10, 도전성 ${resultMap.get('F02').axes.T.toFixed(1)}/10로, 사진을 다시 찾는 동작과 좌표·색인·교정의 통합이 종합 점수를 높였다. 근소한 점수 차이는 확정적 우열이 아니다.`,
 '- 핵심 기능의 수를 늘리는 것보다 사진 선택→분석→사용자 확인→PA 저장→내용으로 다시 찾는 흐름이 실제로 이어지는지 중요하다. SDK 호출 성공만으로 해당 기능을 완성했다고 보지 않는다.',
 '- 자유 문장 검색·임베딩 예시 검색·생성형 사진 설명은 유용할 가능성과 별개로 현재 모델/기기/이용 조건 gate가 미완결이라 핵심 추천에서 제외했다. 구현 불가능하다고 단정한 것이 아니라 확인 전 추천하지 않는다는 뜻이다.',
 '- QR·외국어 읽기·인원수·GPS 필터 등은 작동 경로가 있어도 일반 사진 블로그에서 필요한 상황이 한정된다고 구분했다. 이전 원근 보정은 높은 난도만으로 핵심 순위에 복귀하지 않았다.',
 '- 분류+OCR은 서버2·Android2, 총4개 등록 가정으로 균형이 맞는다. 공개 전 노출 점검을 더하는 경우 총5개다. 이는 검토 예시이며 최종 채택이 아니다.',
 '', '## 핵심 추천 순위','',table(active),
 '', '## 한정 상황·판정 이견·보류·제외','',table(rows.filter(r=>r.status!=='active')),
 '', '## 읽어야 할 집계 주의점','',
 '- 자동 테마·태그 추천은 추천 칩·사용자 교정·테마별 기본 조회를 포함한다. 이 하위 화면을 다시 독립 가점으로 세지 않는다.',
 '- OCR 검색은 인식·원문 확인·색인·검색·일치 영역 표시까지 포함한다. 모델 추론과 검색 버튼을 독립 사용자 기능 둘로 늘리지 않는다.',
 '- F03의 현재 정의는 분류 S+C, OCR S+C, 별도 복합 검색 S+C로6개다. 높은 점수라도 현재 최대5개 계획에 채택하지 않는다. 기존 검색 UX로 흡수하는 경우 별도 추가 기능이라고 세지 말아야 하며 이는 현재 정의의 새 조합이 아니다.',
 '- F14의 원안에 있는 새 기록 영구 연결은 F07 전체 기능을 재사용하도록 의존성을 닫았다. 원안을 단순 열기·숨기기로 축소하지 않았으며 F01+F07+F14의 최소6등록으로 현재 계획에서 제외했다.',
 '- F25 기존 자료 분석과 F33 모호한 분류 검토는 F01의 완성 범위와 겹칠 위험이 높다. 필요한 구현을 하되 독립 추가 기능 등록 여부와 구분한다.',
 '- F11 대체 설명, F12 번역, F13 질문, F19 복사 등은 필요한 SDK를 직접 포함하는 최소안으로 평가했다. 공유 인식 라이브러리를 별도 F01/F02 사용자 기능 슬롯으로 강제하지 않는다. 내용 저장 데이터가 필요한 파생 후보는 requires에 실제 원천을 포함했다.',
 '- [최대5개와 서버/클라이언트 균형을 점검한 예시](PORTFOLIOS.md)는 점수만으로 확정한 최적해가 아니다. 최대5개이므로 가치가 약한 기능을 끼워 정확히5개를 채울 필요는 없다.',
 '', '## 구체적인 사용자 가치와 Codex 수행 경로','',
 ...rows.flatMap(r=>[
  `### ${r.id} ${r.title} — ${r.mean.toFixed(1)} / ${labels[r.status]}`,'',
  `- 불편: ${r.problem}`,`- 이용 흐름: ${r.flow}`,`- 사용자 효과: ${r.value}`,`- 고정 구현 범위: ${r.method}`,`- 서버: ${r.server}`,`- Android: ${r.client}`,`- 의존 후보: ${r.requires.join(', ')||'없음'}. 최소 등록: ${r.componentClosure.join(', ')}.`,`- 중복/대안: ${r.overlaps.join(', ')||'없음'}. 추가 인정 위험: ${r.recognitionRisk}.`,`- 필요성 판정: ${needLabels[r.needAgreement]}. 평가자 총점 범위 ${r.min.toFixed(1)}–${r.max.toFixed(1)}.`,
  ...r.individual.flatMap(i=>['',`**${i.reviewer}** — N/T/U/E ${i.N}/${i.T}/${i.U}/${i.E}, ${i.total.toFixed(1)}점, 필요성=${i.need}, Codex=${i.codexGate}, 무료환경=${i.platformGate}.`,`- 필요성 근거: ${i.needReason}`,`- 구현: ${i.implementation}`,`- 의존성/자동 구성: ${i.dependencies}`,`- 검증 계획: ${i.verification}`,`- 시연: ${i.demo}`,`- 등록 감사: ${i.componentIssue}. 사용자 수동작업=${i.userManualWork}, 훈련=${i.trainingRequired}.`,...(i.registrationAdvice?[`- 등록 주의: ${i.registrationAdvice}`]:[]),`- 판단: ${i.note}`]),''
 ]),
 '## 공식 경로와 검증 한계','',
 '- [Image Labeling](https://developers.google.com/ml-kit/vision/image-labeling/android) · [한국어/영문 OCR](https://developers.google.com/ml-kit/vision/text-recognition/v2/android) · [얼굴 검출](https://developers.google.com/ml-kit/vision/face-detection/android) · [온디바이스 SDK 구성](https://developers.google.com/ml-kit/migration) · [ML Kit 이용 조건](https://developers.google.com/ml-kit/terms). SDK 제공 범위가 서비스 테마의 정답률을 보장하지 않는다. 얼굴 검출은 동일인 인식이 아니다.',
 '- [무료 PA 범위](https://help.pythonanywhere.com/pages/FreeAccountsFeatures/) · [비동기 작업 제약](https://help.pythonanywhere.com/pages/AsyncInWebApps/). Android가 인식하고 PA가 실제 게시글·분류·색인·검색 데이터를 담당하는 경로를 검토했다. 유료 작업자·외부 핵심 서버로 대체하지 않는다.',
 '- 이번에는 기존 개발 도구 근거와 공식 SDK·모델 경로를 검토했다. 새 기능의 Gradle 통합·AVD 인식 정확도·WSL 구현 테스트·실제 PA URL 검증은 실행 전이다. 평가표의 검증 문장은 앞으로 수행할 계획이다.',
 '- 모델 훈련 없이 쓸 수 있는 사전학습 SDK와, 기기/개별 모델 조건이 미확인인 생성형·임베딩 후보를 분리했다. 미확인 후보를 가벼운 태그 검색으로 축소해 통과시키지 않았다.',
 '', '## 원자료와 재현','',
 '- [발굴 지침](brief.md) · [평가 지침](protocol.md) · [고정 후보](candidates.json) · [서버/Android 등록 범위](components.json).',
 '- [제품 관점](review-product.json) · [기술 관점](review-technical.json) · [과제 관점](review-assessment.json) · [집계 데이터](rankings.json).',
 '- `node build-catalog.mjs`로 발굴 원안과 명시적 통합/정의 보완을 재현하고 `node aggregate.mjs`로 ID·점수·필수 근거·gate·등록 수를 검증해 집계한다. 과거 순위는 변경하지 않는다.',
 '', '## 평가자가 남긴 한계','',...data.blindSpots.flatMap(d=>[`**${d.reviewer}**`,...(Array.isArray(d.notes)?d.notes:[String(d.notes)]).map(note=>`- ${note}`),''])
].join('\n');
fs.writeFileSync(path.join(dir,'REPORT.md'),report+'\n');
console.log(JSON.stringify({counts,top:active.slice(0,12).map(r=>({id:r.id,title:r.title,score:+r.mean.toFixed(1),N:+r.axes.N.toFixed(1),T:+r.axes.T.toFixed(1),registration:r.minimumRegistration,risk:r.recognitionRisk})),issues:rows.filter(r=>r.componentIssues.length).map(r=>({id:r.id,issues:r.componentIssues}))},null,2));
