import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(dir,'rankings.json'),'utf8'));
const byId=new Map(data.rows.map(row=>[row.id,row]));
const legacyControls=new Set(['S39','S40','C39','C40']);
const active=data.rows.filter(row=>row.status==='pass'&&!legacyControls.has(row.id));
function closure(ids){
  const result=new Set(ids),queue=[...ids];
  while(queue.length){
    const id=queue.pop(),row=byId.get(id);
    if(!row||row.status!=='pass'||legacyControls.has(id))return null;
    for(const dependency of row.required)if(!result.has(dependency)){result.add(dependency);queue.push(dependency);}
    if(result.size>5)return null;
  }
  return result;
}
function conflict(rows){
  // 같은 처리 결과의 대안과 같은 쪽의 동일 계열 하위 기능을 중복 선택하지 않는다.
  for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){
    if(rows[a].family===rows[b].family&&rows[a].side===rows[b].side)return true;
    if(rows[a].side===rows[b].side&&(rows[a].overlaps.includes(rows[b].id)||rows[b].overlaps.includes(rows[a].id)))return true;
  }
  return false;
}
const units=[];
for(const row of active.filter(row=>row.side==='server')){
  const ids=closure([row.id]);
  if(!ids||ids.size!==2)continue;
  const entries=[...ids].map(id=>byId.get(id));
  if(entries.filter(v=>v.side==='server').length===1&&entries.filter(v=>v.side==='client').length===1)units.push([...ids].sort());
}
const unitKeys=new Set(),pairs=units.filter(ids=>{const key=ids.join(',');if(unitKeys.has(key))return false;unitKeys.add(key);return true;});
const output=[],seen=new Set();
for(let a=0;a<pairs.length;a++)for(let b=a+1;b<pairs.length;b++)for(const client of active.filter(row=>row.side==='client')){
  const ids=closure([...pairs[a],...pairs[b],client.id]);
  if(!ids||ids.size!==5)continue;
  const key=[...ids].sort().join(',');if(seen.has(key))continue;
  const rows=[...ids].map(id=>byId.get(id));
  if(rows.filter(row=>row.side==='server').length!==2||rows.filter(row=>row.side==='client').length!==3||conflict(rows))continue;
  seen.add(key);
  const mean=rows.reduce((sum,row)=>sum+row.mean,0)/5;
  const raterMeans=['rubric','feasibility','ux'].map(name=>rows.reduce((sum,row)=>sum+row.individual.find(v=>v.reviewer===name).total,0)/5);
  output.push({ids:[...ids].sort(),mean,min:Math.min(...raterMeans),max:Math.max(...raterMeans),effortSum:rows.reduce((sum,row)=>sum+row.effort,0),rows});
}
output.sort((a,b)=>b.mean-a.mean||b.min-a.min||a.effortSum-b.effortSum||a.ids.join().localeCompare(b.ids.join()));
fs.writeFileSync(path.join(dir,'portfolios.json'),JSON.stringify({candidateCount:data.candidateCount,method:'2 closed server-client pairs plus 1 client; 2 server + 3 client; no same-side overlap',count:output.length,portfolios:output.slice(0,30).map(({rows,...rest})=>rest)},null,2)+'\n');
const selected=output.slice(0,10);
const report=[
  '# 5개 등록 항목으로 구성하는 균형 조합 비교',
  '',
  '이 자료는 개별 점수를 단순히 상위 5개 골라 합칠 때 누락되는 서버/클라이언트 의존성을 점검한다. 기능 선정이나 구현 승인이 아니다. 내부 점수의 평균이며 공식 예상 득점이나 만점 조합이 아니다.',
  '',
  '## 구성 조건',
  '',
  '- 3명 모두 pass인 후보만 사용한다. 기존 사진관 성장·배치·3D 마을·꾸미기는 비교군으로 남기고 새 조합에서는 제외한다.',
  '- 서버 2개 + 클라이언트 3개. 서버/클라이언트 2개 쌍을 고른 뒤 클라이언트 1개를 추가한다. 이는 균형을 보는 한 가지 비교 형식이며 3서버+2클라이언트 등 모든 형태의 전역 최적해 탐색은 아니다.',
  '- 세 리뷰어가 요구한 의존성의 합집합을 닫은 결과가 정확히 5개여야 한다. 같은 쪽의 동일 계열/겹침 후보를 함께 넣지 않는다.',
  '- 단말 또는 서버의 대안을 하나로 정한 범위에서만 유효하다. UI에 조건을 더하거나 원자 일괄 처리·기기 동기화를 추가하면 다시 집계한다.',
  '- 테마·접근성·오류·로딩·상태 복원 등 공통 화면 품질을 버린다는 뜻이 아니다. 이를 독립 추가 항목으로 주장하는 것과 전체 품질로 구현하는 것은 구분한다.',
  '',
  `이 조건을 만족하는 조합 ${output.length}개를 비교했다. 아래는 같은 기준의 상위 10개다. 소수 한 자리 점수 차이는 확정적인 우열로 해석하지 않는다.`,
  '',
  '| 순위 | 서버 2개 | 클라이언트 3개 | 평균/100 | 평가자별 조합 평균 범위 |',
  '| --- | --- | --- | ---: | --- |',
  ...selected.map((entry,i)=>`| ${i+1} | ${entry.rows.filter(row=>row.side==='server').map(row=>`${row.id} ${row.title}`).join(' / ')} | ${entry.rows.filter(row=>row.side==='client').map(row=>`${row.id} ${row.title}`).join(' / ')} | ${entry.mean.toFixed(1)} | ${entry.min.toFixed(1)}–${entry.max.toFixed(1)} |`),
  '',
  '## 확인해야 할 한계',
  '',
  '- 같은 계열 두 후보를 보수적으로 배제했으므로 서로 다른 독립 기능으로 인정될 수 있는 조합도 제외됐을 수 있다.',
  '- 서버/클라이언트의 별도 등록 기준은 평가서에 있지만, 각 편의 기능의 최종 인정과 배점은 교수님 판단이다. UI와 실제 사용 과업의 경계는 최종 기능 정의에서 명확히 해야 한다.',
  '- 조합마다 기존 API·권한 회귀, 무료 PA DB/파일 용량·요청 시간, 실제 Android 화면, 재시작·오류·느린 연결 검증과 제출 증빙을 확보해야 한다.',
  '',
  '[개별 113개 평가](REPORT.md) · [조합 데이터](portfolios.json) · [평가 지침](protocol.md)'
].join('\n');
fs.writeFileSync(path.join(dir,'PORTFOLIOS.md'),report+'\n');
console.log(JSON.stringify({pairs:pairs.length,portfolioCount:output.length,top:output.slice(0,8).map(({rows,effortSum,...rest})=>({...rest,names:rows.map(row=>`${row.id} ${row.title}`)}))},null,2));
