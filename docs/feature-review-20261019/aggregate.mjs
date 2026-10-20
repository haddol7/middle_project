import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const lines=fs.readFileSync(path.join(dir,'candidates.psv'),'utf8').trim().split(/\r?\n/);
const headers=lines.shift().split('|');
const catalog=lines.map(line=>{
  const cells=line.split('|');
  if(cells.length!==headers.length)throw new Error(`Catalog shape: ${cells[0]}`);
  return Object.fromEntries(headers.map((key,i)=>[key,cells[i]]));
});
const ids=new Set(catalog.map(row=>row.id));
if(catalog.length!==113||ids.size!==113)throw new Error('Expected 113 unique candidates');
const names=['rubric','feasibility','ux'];
const weights={R:5,T:4,U:5,F:3,E:3};
const reviews=names.map(name=>{
  const review=JSON.parse(fs.readFileSync(path.join(dir,`review-${name}.json`),'utf8'));
  if(review.rows.length!==113)throw new Error(`${name}: expected 113 rows`);
  const seen=new Set();
  for(const row of review.rows){
    if(!ids.has(row.id)||seen.has(row.id))throw new Error(`${name}: invalid/duplicate ${row.id}`);
    seen.add(row.id);
    for(const key of Object.keys(weights))if(!Number.isInteger(row[key])||row[key]<0||row[key]>5)throw new Error(`${name} ${row.id}: ${key} must be integer 0–5`);
    if(!Number.isInteger(row.effort)||row.effort<1||row.effort>5)throw new Error(`${name} ${row.id}: effort`);
    if(!['pass','hold','exclude'].includes(row.status))throw new Error(`${name} ${row.id}: status`);
    if(!['low','medium','high'].includes(row.recognitionRisk))throw new Error(`${name} ${row.id}: recognitionRisk`);
    for(const key of ['required','overlaps']){
      if(!Array.isArray(row[key]))throw new Error(`${name} ${row.id}: ${key}`);
      if(row[key].some(id=>!ids.has(id)||id===row.id))throw new Error(`${name} ${row.id}: invalid ${key}`);
    }
    if(typeof row.note!=='string'||!row.note.trim())throw new Error(`${name} ${row.id}: missing note`);
    row.total=Object.entries(weights).reduce((sum,[key,weight])=>sum+row[key]*weight,0);
  }
  return {...review,name,map:new Map(review.rows.map(row=>[row.id,row]))};
});
const average=values=>values.reduce((a,b)=>a+b,0)/values.length;
const rows=catalog.map(candidate=>{
  const individual=reviews.map(review=>({reviewer:review.name,...review.map.get(candidate.id)}));
  const totals=individual.map(row=>row.total);
  const status=candidate.prior==='exclude'?'exclude':candidate.prior==='hold'?'hold':individual.every(row=>row.status==='pass')?'pass':'review';
  return {...candidate,status,mean:average(totals),min:Math.min(...totals),max:Math.max(...totals),spread:Math.max(...totals)-Math.min(...totals),effort:average(individual.map(row=>row.effort)),axes:Object.fromEntries(Object.keys(weights).map(key=>[key,average(individual.map(row=>row[key]))])),required:[...new Set(individual.flatMap(row=>row.required))].sort(),overlaps:[...new Set(individual.flatMap(row=>row.overlaps))].sort(),recognitionRisks:individual.map(row=>row.recognitionRisk),individual};
}).sort((a,b)=>b.mean-a.mean||b.min-a.min||b.axes.R-a.axes.R||a.id.localeCompare(b.id));
let rank=0;for(const row of rows)row.rank=row.status==='pass'?++rank:null;
const output={date:'2026-10-19',rubric:'R25-T20-U25-F15-E15',formula:'R*5+T*4+U*5+F*3+E*3; equal mean of 3 independent reviews',candidateCount:113,evaluationCount:339,counts:Object.fromEntries(['pass','review','hold','exclude'].map(status=>[status,rows.filter(row=>row.status===status).length])),rows,reviewerBlindSpots:reviews.map(review=>({reviewer:review.name,blindSpots:review.blindSpots||[],topPairs:review.topPairs||[]}))};
fs.writeFileSync(path.join(dir,'rankings.json'),JSON.stringify(output,null,2)+'\n');
const esc=value=>String(value??'').replaceAll('|','／').replaceAll('\n',' ');
const sideLabel={server:'서버',client:'클라이언트',both:'서버+클라이언트'};
const statusLabel={pass:'검토 가능(3인)',review:'판정 이견',hold:'보류',exclude:'제외'};
const table=data=>[
  '| 순위 | ID | 구분 | 후보 | 평균/100 | 평가 범위 | R/T/U/F/E 평균(각 5) | 부담(1–5) | 판정 |',
  '| --- | --- | --- | --- | ---: | --- | --- | ---: | --- |',
  ...data.map(row=>`| ${row.rank||'—'} | ${row.id} | ${sideLabel[row.side]} | ${esc(row.title)} | ${row.mean.toFixed(1)} | ${row.min}–${row.max} | ${Object.values(row.axes).map(v=>v.toFixed(1)).join('/')} | ${row.effort.toFixed(1)} | ${statusLabel[row.status]} |`)
].join('\n');
const report=[
  '# 추가 기능 후보 113개 독립 평가',
  '',
  '2026-10-19. 사용자 요청에 따라 후보를 생성하고 과제 기준·구현 현실성·UI/UX를 담당한 서브 에이전트 3명이 각각 113개 전부를 독립 채점했다. 총 339건의 최종 평가다. 1차 90개 검토에서 대응 Android UI 누락을 발견해 23개를 보완하고 관련 서버 의존성·판정을 재평가했다. 이 문서는 비교 결과이며 기능 선정·새 콘셉트·구현 완료를 뜻하지 않는다.',
  '',
  '**점수는 교수님의 공식 배점이나 실제 예상 득점이 아닌 내부 비교 점수다.** 기술 잠재력과 완성도는 설계 상태의 평가이며 실제 PythonAnywhere 성능·배포·Android 실기기 검증을 대신하지 않는다.',
  '',
  '## 근거와 방법',
  '',
  '- [평가 지침·출처·집계 규칙](protocol.md), [후보 정의 원본](candidates.psv). 최종 평가서 ID14 최대 5개, 서버/클라이언트 별도 집계와 13일 수업의 난이도·사용성·의도 설명을 반영했다.',
  '- 평가 원본: [최종 Word 평가서](<C:/Users/1/mobile_web_service/모바일웹서비스 프로젝트_공통평가 01_수행 결과 보고서_최종.docx>), [13일 전사문](<C:/Users/1/mobile_web_service/course_reference/새로운 노트 (1).txt>) 1:33:18–1:41:15. 파일명에 최종이 들어간 Word도 작성 완료 보고서가 아니라 평가 양식이다.',
  '- 환경 근거: [무료 계정 사양](https://help.pythonanywhere.com/pages/FreeAccountsFeatures/), [웹 요청·백그라운드 작업 제약](https://help.pythonanywhere.com/pages/AsyncInWebApps/), [외부 통신 제한](https://help.pythonanywhere.com/pages/403ForbiddenError/), [ASGI 실험 기능](https://help.pythonanywhere.com/pages/ASGICommandLine/). 계정의 실제 배포 상태는 확인하지 않았다.',
  '- 공통 기준: R 추가 기능 인정 설득력 25, T 기술적 실질 20, U Android UI/UX와 편의 25, F 무료 환경·완성 가능성 15, E 시연·검증 용이성 15. 각 0–5 정수에 가중치를 적용하고 3명의 총점을 동일 비중으로 평균냈다.',
  '- 구현 부담은 별도 1–5 척도이며 작업 일수나 공식 점수가 아니다. 동점이면 가장 낮은 평가 점수가 높은 후보, R 평균, ID 순으로 정렬했다.',
  '- 활성 순위는 3명 모두 pass인 후보만 부여했다. 한 명이라도 보류/제외 판단이면 이견으로 분리했다. X 후보는 원천 제약 확인이 남았거나 기본 항목 중복이므로 활성 순위에 넣지 않았다.',
  '- 후보 수는 독립 가점 항목 수가 아니다. 같은 계열·하위 기능의 중복과 연결 UI/서버 의존성은 별도로 확인해야 한다. 상위 5개를 단순히 고르는 방식으로 최종 5개를 확정할 수 없다.',
  '- [서버 2개·클라이언트 3개 조합 비교](PORTFOLIOS.md)는 필수 의존성을 포함한 5개 구성을 별도로 검토한다. 이것이 모든 배분 방식의 전역 최적해라는 뜻은 아니다.',
  '',
  `판정 집계: ${Object.entries(output.counts).map(([key,count])=>`${statusLabel[key]} ${count}개`).join(', ')}.`,
  '',
  '## 종합 상위 후보',
  '',table(rows.filter(row=>row.status==='pass').slice(0,20)),
  '',
  '## 서버 상위 후보',
  '',table(rows.filter(row=>row.status==='pass'&&row.side==='server').slice(0,10)),
  '',
  '## 클라이언트 상위 후보',
  '',table(rows.filter(row=>row.status==='pass'&&row.side==='client').slice(0,10)),
  '',
  '## 전체 113개 점수',
  '',table(rows),
  '',
  '## 의존성과 평가 근거',
  '',
  ...rows.flatMap(row=>[
    `### ${row.id} ${row.title} — ${row.mean.toFixed(1)}점 / ${statusLabel[row.status]}`,
    '',row.definition,
    '',`후보 정의의 의존 힌트: ${row.dependency_hint}. 독립 평가에서 지적한 필수 의존성 합집합: ${row.required.join(', ')||'없음'}. 중복/대안: ${row.overlaps.join(', ')||'없음'}.`,
    '',...row.individual.map(item=>`- ${item.reviewer}: ${item.total}점, ${item.status}, 인정 위험 ${esc(item.recognitionRisk)} — ${item.note}`),''
  ]),
  '## 원자료와 재현',
  '',
  '- [과제 기준 평가](review-rubric.json) · [무료 환경·구현 현실성 평가](review-feasibility.json) · [UI/UX 평가](review-ux.json)',
  '- [집계 데이터](rankings.json). `node aggregate.mjs`는 113개 ID의 중복/누락·각 평가 점수 범위·의존 ID·산식을 검사한 뒤 이 문서와 데이터를 재생성한다.',
  '',
  '코드·DB·실행 앱·배포 환경은 이 평가로 변경하지 않았다. 기존 문서의 모아 확정 표현을 이번 후보 평가의 전제로 사용하지 않았다.'
].join('\n');
fs.writeFileSync(path.join(dir,'REPORT.md'),report+'\n');
console.log(JSON.stringify({counts:output.counts,top:rows.filter(row=>row.status==='pass').slice(0,15).map(row=>({id:row.id,title:row.title,score:+row.mean.toFixed(1),range:[row.min,row.max],required:row.required})),server:rows.filter(row=>row.status==='pass'&&row.side==='server').slice(0,10).map(row=>({id:row.id,title:row.title,score:+row.mean.toFixed(1),required:row.required})),disagreements:rows.filter(row=>row.status==='review').map(row=>({id:row.id,score:+row.mean.toFixed(1),statuses:row.individual.map(item=>item.status)}))},null,2));
