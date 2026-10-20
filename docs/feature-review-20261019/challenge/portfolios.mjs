import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(dir,'rankings.json'),'utf8'));
const map=new Map(data.rows.map(row=>[row.id,row]));
const excludedControls=new Set(['S39','S40','C39','C40']);
// 이 후보들은 단말 구현과 서버 위임 버전의 기술 점수가 달라 조합을 별도 설계해야 한다.
const variantDependent=new Set(['S04','S19','S26','S30','S34','S35','S36']);
const eligible=data.rows.filter(row=>row.status==='pass'&&!excludedControls.has(row.id)&&!variantDependent.has(row.id));
const eligibleIds=new Set(eligible.map(row=>row.id));
const byIndex=[...eligible].sort((a,b)=>a.id.localeCompare(b.id));
const bitById=new Map(byIndex.map((row,i)=>[row.id,1n<<BigInt(i)]));
const countBits=mask=>{let n=0;while(mask){mask&=mask-1n;n++;}return n;};
const fromMask=mask=>byIndex.filter(row=>(mask&bitById.get(row.id))!==0n);
function closure(id){
  const ids=new Set([id]),queue=[id];
  while(queue.length){
    const current=queue.pop();if(!eligibleIds.has(current))return null;
    for(const dependency of map.get(current).required)if(!ids.has(dependency)){ids.add(dependency);queue.push(dependency);}
    if(ids.size>5)return null;
  }
  let mask=0n;for(const member of ids)mask|=bitById.get(member);
  return mask;
}
const units=[...new Set(eligible.map(row=>closure(row.id)).filter(mask=>mask!==null).map(String))].map(BigInt);
function hasOverlap(rows){
  for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){
    if(rows[a].side===rows[b].side&&(rows[a].family===rows[b].family||rows[a].overlaps.includes(rows[b].id)||rows[b].overlaps.includes(rows[a].id)))return true;
  }
  return false;
}
const seen=new Set(),results=[];
function explore(mask){
  const key=mask.toString();if(seen.has(key))return;seen.add(key);
  const n=countBits(mask);if(n>5)return;
  const rows=fromMask(mask);
  if(hasOverlap(rows))return;
  const servers=rows.filter(row=>row.side==='server').length,clients=rows.filter(row=>row.side==='client').length;
  if(servers>3||clients>3)return;
  if(n===5){
    if(!((servers===2&&clients===3)||(servers===3&&clients===2)))return;
    const scoreTicks=rows.reduce((sum,row)=>sum+row.scoreTicks,0),technicalTicks=rows.reduce((sum,row)=>sum+row.axesTicks.T,0);
    const mean=scoreTicks/60,technical=technicalTicks/30;
    const raterMeans=['rubric','technical','ux'].map(reviewer=>rows.reduce((sum,row)=>sum+Math.round(row.individual.find(v=>v.reviewer===reviewer).total*4),0)/20);
    results.push({ids:rows.map(row=>row.id),servers,clients,scoreTicks,technicalTicks,mean,technical,min:Math.min(...raterMeans),max:Math.max(...raterMeans)});
    return;
  }
  for(const unit of units){const next=mask|unit;if(next!==mask&&countBits(next)<=5)explore(next);}
}
explore(0n);
results.sort((a,b)=>b.scoreTicks-a.scoreTicks||b.min-a.min||b.technicalTicks-a.technicalTicks||a.ids.join().localeCompare(b.ids.join()));
const output={rubric:data.rubric,count:results.length,closedStatesVisited:seen.size,workloadPenalty:false,variantDependentExcluded:[...variantDependent],portfolios:results.slice(0,50)};
fs.writeFileSync(path.join(dir,'portfolios.json'),JSON.stringify(output,null,2)+'\n');
const report=[
  '# 도전성 기준 5개 항목 조합',
  '',
  '최종 선정이 아니라 새 평가 기준의 조합 비교다. 작업량·구현 시간 감점과 부담을 이용한 동점 처리는 없다. 점수는 5개 후보의 내부 평가 평균이다.',
  '',
  '- 무료 환경과 Codex 수행 경로가 3인 평가에서 모두 통과한 후보만 사용했다. 사용자 수동 설치·학습·훈련이 필수인 후보는 없다.',
  '- 서버/클라이언트의 의존성을 모두 포함해 정확히 5개, 서버 2+클라이언트 3 또는 서버 3+클라이언트 2인 집합을 비교했다. 이전의 2개 쌍+단독 1개 형식 외에 3개+2개 구성도 탐색한다.',
  '- 같은 쪽의 동일 계열·중복 후보를 함께 넣지 않았다. 기존 사진관은 비교군이며 새 조합에서 제외했다.',
  '- S04/S19/S26/S30/S34/S35/S36은 단말 최소안과 서버 위임안을 섞으면 기술 점수의 비교 범위가 달라져 이번 조합 탐색에서 제외했다. 전체 기능 공간의 절대 최적해라는 뜻은 아니다.',
  '- 동점 정렬은 평가자 최저 평균, 기술 도전성 평균, ID 순이다. 기능 수를 줄이려고 독립적인 기능을 한 이름으로 묶지 않았다.',
  '',
  `위 조건을 만족하는 조합 ${results.length}개를 비교했다. 가까운 점수 차이는 동점권이며 기능 정의와 실제 구현 증거의 질이 중요하다.`,
  '',
  '| 순위 | 서버 | 클라이언트 | 평균/100 | 도전성/10 | 평가자 평균 범위 |',
  '| --- | --- | --- | ---: | ---: | --- |',
  ...results.slice(0,12).map((entry,i)=>{const rows=entry.ids.map(id=>map.get(id));return `| ${i+1} | ${rows.filter(row=>row.side==='server').map(row=>`${row.id} ${row.title}`).join(' / ')} | ${rows.filter(row=>row.side==='client').map(row=>`${row.id} ${row.title}`).join(' / ')} | ${entry.mean.toFixed(1)} | ${entry.technical.toFixed(1)} | ${entry.min.toFixed(1)}–${entry.max.toFixed(1)} |`;}),
  '',
  '[전체 재평가](REPORT.md) · [조합 데이터](portfolios.json) · [평가 기준](protocol.md)',
  '',
  '개별 알고리즘·화면·API는 아직 신규 구현 전이다. Codex 수행 경로 검토와 기존 개발 도구 확인을 실제 기능 성공 검증으로 쓰지 않는다.'
].join('\n');
fs.writeFileSync(path.join(dir,'PORTFOLIOS.md'),report+'\n');
console.log(JSON.stringify({count:results.length,states:seen.size,top:results.slice(0,6).map(entry=>({...entry,titles:entry.ids.map(id=>map.get(id).title)}))},null,2));
