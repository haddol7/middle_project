import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url)),base=path.dirname(dir);
const input=fs.readFileSync(path.join(base,'candidates.psv'),'utf8').trim().split(/\r?\n/);
const header=input.shift().split('|');
const catalog=input.map(line=>{const cells=line.split('|');if(cells.length!==header.length)throw Error('candidate columns');return Object.fromEntries(header.map((key,i)=>[key,cells[i]]));});
const ids=new Set(catalog.map(row=>row.id));if(ids.size!==113||catalog.length!==113)throw Error('expected 113 candidates');
const old=JSON.parse(fs.readFileSync(path.join(base,'rankings.json'),'utf8'));
const oldById=new Map(old.rows.map(row=>[row.id,row]));
const weights={T:5,U:2.5,R:2,V:0.5},reviewerNames=['rubric','technical','ux'];
const gates=new Set(['pass','hold','exclude']);
const reviewers=reviewerNames.map(name=>{
  const review=JSON.parse(fs.readFileSync(path.join(dir,`review-${name}.json`),'utf8'));
  if(review.rows.length!==113)throw Error(`${name}: count`);
  const seen=new Set();
  for(const row of review.rows){
    if(!ids.has(row.id)||seen.has(row.id))throw Error(`${name}: id ${row.id}`);seen.add(row.id);
    for(const key of Object.keys(weights))if(!Number.isFinite(row[key])||row[key]<0||row[key]>10||!Number.isInteger(row[key]*2))throw Error(`${name} ${row.id}: score ${key}`);
    for(const key of ['status','codexGate','platformGate'])if(!gates.has(row[key]))throw Error(`${name} ${row.id}: ${key}`);
    for(const key of ['userManualWork','trainingRequired'])if(typeof row[key]!=='boolean')throw Error(`${name} ${row.id}: ${key}`);
    if(row.status==='pass'&&(row.codexGate!=='pass'||row.platformGate!=='pass'||row.userManualWork||row.trainingRequired))throw Error(`${name} ${row.id}: inconsistent qualification`);
    for(const key of ['implementation','dependencies','verification','note'])if(typeof row[key]!=='string'||!row[key].trim())throw Error(`${name} ${row.id}: missing ${key}`);
    if(!['low','medium','high'].includes(row.recognitionRisk))throw Error(`${name} ${row.id}: recognition risk`);
    for(const key of ['required','overlaps'])if(!Array.isArray(row[key])||row[key].some(id=>!ids.has(id)||id===row.id))throw Error(`${name} ${row.id}: ${key}`);
    row.total=Object.entries(weights).reduce((sum,[key,weight])=>sum+row[key]*weight,0);
  }
  return {...review,name,map:new Map(review.rows.map(row=>[row.id,row]))};
});
const avg=values=>values.reduce((a,b)=>a+b,0)/values.length;
const rows=catalog.map(candidate=>{
  const individual=reviewers.map(review=>({reviewer:review.name,...review.map.get(candidate.id)}));
  const totals=individual.map(row=>row.total);
  const scoreTicks=totals.reduce((sum,value)=>sum+Math.round(value*4),0);
  const axesTicks=Object.fromEntries(Object.keys(weights).map(key=>[key,individual.reduce((sum,row)=>sum+row[key]*2,0)]));
  const status=candidate.prior==='exclude'?'exclude':candidate.prior==='hold'?'hold':individual.every(row=>row.status==='pass')?'pass':'review';
  const previous=oldById.get(candidate.id);
  return {...candidate,status,scoreTicks,axesTicks,mean:scoreTicks/12,min:Math.min(...totals),max:Math.max(...totals),axes:Object.fromEntries(Object.keys(weights).map(key=>[key,axesTicks[key]/6])),oldScore:previous.mean,oldRank:previous.rank,scoreChange:scoreTicks/12-previous.mean,required:[...new Set(individual.flatMap(row=>row.required))].sort(),overlaps:[...new Set(individual.flatMap(row=>row.overlaps))].sort(),individual};
}).sort((a,b)=>b.scoreTicks-a.scoreTicks||b.min-a.min||b.axesTicks.T-a.axesTicks.T||b.axesTicks.R-a.axesTicks.R||a.id.localeCompare(b.id));
let rank=0;for(const row of rows)row.rank=row.status==='pass'?++rank:null;
const data={rubric:'T50-U25-R20-V5',formula:'T*5+U*2.5+R*2+V*0.5; equal mean of 3 independent re-evaluations',candidateCount:113,evaluationCount:339,weightsPercent:{T:50,U:25,R:20,V:5},feasibilityWeight:0,effortPenalty:false,qualification:['Codex implementation route','no user manual installation or learning','no model training or reinforcement learning','free PythonAnywhere and required assignment'],counts:Object.fromEntries(['pass','review','hold','exclude'].map(status=>[status,rows.filter(row=>row.status===status).length])),rows,blindSpots:reviewers.map(review=>({reviewer:review.name,notes:review.blindSpots||[]}))};
fs.writeFileSync(path.join(dir,'rankings.json'),JSON.stringify(data,null,2)+'\n');
const side={server:'서버',client:'클라이언트',both:'서버+클라이언트'},label={pass:'후보 유지(3인)',review:'자격 판정 이견',hold:'보류',exclude:'제외'};
const esc=value=>String(value??'').replaceAll('|','／').replaceAll('\n',' ');
const table=list=>[
  '| 순위 | ID | 구분 | 후보 | 새 평균/100 | 도전성/10 | 이전 평균 | 평가 범위 | 자격 |',
  '| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |',
  ...list.map(row=>`| ${row.rank||'—'} | ${row.id} | ${side[row.side]} | ${row.title} | ${row.mean.toFixed(1)} | ${row.axes.T.toFixed(1)} | ${row.oldScore.toFixed(1)} | ${row.min.toFixed(1)}–${row.max.toFixed(1)} | ${label[row.status]} |`)
].join('\n');
const top=rows.filter(row=>row.status==='pass');
const report=[
  '# 도전성 중심 추가 기능 재평가',
  '',
  '**사용자 요청:** 구현 현실성·작업량을 점수에서 제외하고 어려운 기술에 더 높은 비중을 주며, Codex가 직접 구현/자동 구성/검증할 경로가 있어야 한다. 사용자 수동 설치·개발 공부·모델 훈련·강화학습이 필요한 후보는 자격에서 제외한다.',
  '',
  '동일 113개를 서브 에이전트 3명이 새 기준으로 독립 재평가했다(339건). 이전 점수에 새 가중치만 곱한 결과가 아니다. 이전에 UI/증빙 항목에 섞였던 작업 부담 감점도 제거하도록 했다. **점수는 교수님 공식 배점이나 실현된 성능이 아닌 설계 후보 비교용이다.**',
  '',
  '## 새 기준과 필수 조건',
  '',
  '- 기술적 도전성 T 50%, Android UI/UX 잠재력 U 25%, 추가 기능 인정 설득력 R 20%, 결과 차별성과 증명 가능성 V 5%. 각 0–10, 0.5 단위. 산식은 `T*5+U*2.5+R*2+V*0.5`다.',
  '- 현실성 F=0%, 작업량 감점=0. 일정·예상 작업량은 동점 정렬에도 사용하지 않는다. 동점은 리뷰어 최저 총점, T 평균, R 평균, ID 순이다.',
  '- 무료 PythonAnywhere·필수 과제·Codex 수행 경로·사용자 수작업 및 훈련 불필요 조건은 점수가 아니라 채택 자격이다. 실제 계정 인증/배포 승인과 사용자의 개발 수작업을 구분한다.',
  '- 어려운 기능은 구체 알고리즘과 API로 구현할 경로를 적었을 때 채택 가능하다. 표의 자격 통과는 구현 완료나 무결점 성공 보장을 뜻하지 않는다.',
  '- [새 평가 지침](protocol.md) · [113개 정의](../candidates.psv) · [이전 평가](../REPORT.md) · [기존 도구 읽기 전용 확인](toolchain-check.json).',
  '- 기존 도구 확인: WSL Python/Django/Pillow/SQLite 실행과 Windows JDK/ADB/AVD 목록 확인에 성공했다. 현재 연결 기기는 0대이며 새 기능 실기기 테스트나 PA 계정 검증을 수행한 것은 아니다.',
  '- 이미지 기하/합성 경로: Android 공식 [Matrix](https://developer.android.com/reference/android/graphics/Matrix), [Canvas](https://developer.android.com/reference/android/graphics/Canvas), [PdfDocument](https://developer.android.com/reference/android/graphics/pdf/PdfDocument). 이 API를 이용하는 기능에 개인 모델 학습은 필요하지 않다.',
  '- 과제 근거: [최종 평가서](<C:/Users/1/mobile_web_service/모바일웹서비스 프로젝트_공통평가 01_수행 결과 보고서_최종.docx>) ID14 및 [13일 전사문](<C:/Users/1/mobile_web_service/course_reference/새로운 노트 (1).txt>). 무료 환경은 [공식 무료 계정 문서](https://help.pythonanywhere.com/pages/FreeAccountsFeatures/)와 기존 지침의 공식 자료를 유지한다.',
  '',`자격 집계: ${Object.entries(data.counts).map(([key,count])=>`${label[key]} ${count}개`).join(', ')}.`,
  '',
  '## 결과 해석',
  '',
  '- 오프라인 게시 대기함(C08), 원근 보정(C16), 클라우드 초안 이어쓰기(C52)가 클라이언트 상위다. 단순 화면 수가 아니라 영속 상태·실패 복구·기하 변환·정밀 조작을 구현하는 난도를 반영했다.',
  '- 서버에서는 클라우드 초안(S24), 업로드 멱등성(S09), 유사 사진 그룹(S11), 원본 보존 버전(S18)이 상위다. 기존 SQLite/Pillow와 요청 단위 처리로 구성하며 개인 모델 훈련·외부 작업자를 전제로 하지 않는다.',
  '- 원근 보정은 이전 82.7→96.8, 클라우드 초안 서버는 86.0→93.9, 유사 사진 서버는 84.0→92.4다. 복합 검색 서버는 94.3→84.2로 내려갔다. 기능의 품질이 바뀐 것이 아니라 쉬운 완성보다 기술 도전성을 우선한 새 기준의 결과다.',
  '- S09는 과제 기준 평가자가 기본 업로드 신뢰성과의 중복 인정 위험을 high로 표시했다. 점수가 높아도 별도 편의 기능으로 설명할 목적과 사용자에게 보이는 결과가 필요하다. C08/C52/C09를 겹쳐 등록하거나 편집 도구들을 이름만 나누지 않는다.',
  '- [서버·클라이언트 의존성을 포함한 5개 조합](PORTFOLIOS.md)에서 별도로 비교했다. 조합 평균은 항목 점수 평균이며 기능 간 제품 일관성에 별도 점수를 준 결과는 아니다. 근소한 차이는 확정적인 우열로 해석하지 않는다.',
  '',
  '## 종합 상위 20개',
  '',table(top.slice(0,20)),
  '',
  '## 서버 상위 12개',
  '',table(top.filter(row=>row.side==='server').slice(0,12)),
  '',
  '## 클라이언트 상위 15개',
  '',table(top.filter(row=>row.side==='client').slice(0,15)),
  '',
  '## 기존 사진관 비교군',
  '',table(rows.filter(row=>['S39','S40','C39','C40'].includes(row.id))),
  '',
  '## 전체 113개',
  '',table(rows),
  '',
  '## 후보별 Codex 수행 경로와 근거',
  '',
  ...rows.flatMap(row=>[
    `### ${row.id} ${row.title} — ${row.mean.toFixed(1)} / ${label[row.status]}`,
    '',row.definition,
    '',`추가 구현 의존성: ${row.required.join(', ')||'없음'}. 중복/대안: ${row.overlaps.join(', ')||'없음'}. 점수 변화는 평가 관점 변경 효과이며 실제 기능 향상을 뜻하지 않는다.`,
    '',...row.individual.flatMap(item=>[
      `- **${item.reviewer}: ${item.total.toFixed(1)}**, T/U/R/V=${item.T}/${item.U}/${item.R}/${item.V}. Codex=${item.codexGate}, 환경=${item.platformGate}, 수동 개발작업=${item.userManualWork}, 훈련=${item.trainingRequired}, 인정위험=${item.recognitionRisk}.`,
      `  - 구현: ${esc(item.implementation)}`,
      `  - 의존성: ${esc(item.dependencies)}`,
      `  - Codex 검증 경로: ${esc(item.verification)}`,
      `  - 판단: ${esc(item.note)}`
    ]),''
  ]),
  '## 원자료와 재현',
  '',
  '- [과제 기준 리뷰](review-rubric.json) · [기술 도전성/Codex 리뷰](review-technical.json) · [UI/UX 리뷰](review-ux.json) · [집계 데이터](rankings.json).',
  '- `node aggregate.mjs`: 113개 ID·0–10/0.5 점수·gate·수동작업/훈련·근거·의존성을 검사하고 재집계한다. 기존 평가 자료와 실행 코드는 변경하지 않는다.',
  '',
  '이 비교는 새 기능을 구현하거나 최종 선정한 결과가 아니다. 상위 후보의 서버/클라이언트 의존성과 최대 5개 집계는 별도로 닫아야 한다.'
].join('\n');
fs.writeFileSync(path.join(dir,'REPORT.md'),report+'\n');
console.log(JSON.stringify({counts:data.counts,server:top.filter(row=>row.side==='server').slice(0,12).map(row=>({id:row.id,title:row.title,score:+row.mean.toFixed(1),T:+row.axes.T.toFixed(1),old:+row.oldScore.toFixed(1),required:row.required})),client:top.filter(row=>row.side==='client').slice(0,15).map(row=>({id:row.id,title:row.title,score:+row.mean.toFixed(1),T:+row.axes.T.toFixed(1),old:+row.oldScore.toFixed(1),required:row.required})),disputed:rows.filter(row=>row.status==='review').map(row=>({id:row.id,gates:row.individual.map(v=>[v.codexGate,v.platformGate])}))},null,2));
