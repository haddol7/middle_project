import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(dir,'rankings.json'),'utf8'));
const components=JSON.parse(fs.readFileSync(path.join(dir,'components.json'),'utf8')).components;
const byId=new Map(data.rows.map(r=>[r.id,r])),byComponent=new Map(components.map(c=>[c.id,c]));
const specs=[
 ['내용으로 정리하고 글자로 다시 찾기',['F01','F02']],
 ['내용 검색과 공개 전 노출 점검',['F01','F02','F10']],
 ['내용 검색과 게시할 컷 선택',['F01','F02','F09']],
 ['관련 글로 이어 읽기와 공개 전 점검',['F01','F05','F10']],
 ['관심 주제 발견과 게시할 컷 선택',['F01','F06','F09']],
 ['규칙 모음과 공개 전 점검',['F01','F04','F10']],
 ['분류와 확인된 대체 설명',['F01','F11']],
 ['OCR 검색과 확인된 대체 설명',['F02','F11']],
 ['관심 주제에서 놓친 글 이어 읽기',['F01','F16']],
 ['분류와 관련 글 발견',['F01','F05']],
 ['분류와 관심 주제 피드',['F01','F06']]
];
const plans=specs.map(([title,ids])=>{
 const capabilities=[...new Set(ids.flatMap(id=>byId.get(id).capabilityClosure))].sort();
 const componentIds=[...new Set(capabilities.flatMap(id=>byId.get(id).components))].sort();
 const server=componentIds.filter(id=>byComponent.get(id).side==='server').length,client=componentIds.length-server;
 const blockers=capabilities.filter(id=>byId.get(id).status!=='active').map(id=>`${id}: ${byId.get(id).status}`);
 if(componentIds.length>5)blockers.push('등록5개초과');if(!server||!client)blockers.push('서버/클라이언트불균형');
 return {title,ids,capabilities,components:componentIds,server,client,total:componentIds.length,eligible:blockers.length===0,blockers,recognitionRisk:capabilities.some(id=>byId.get(id).recognitionRisk==='high')?'high':'medium'};
});
fs.writeFileSync(path.join(dir,'portfolios.json'),JSON.stringify({note:'핵심 자격과 최대5개를 검토한 설명용 예시. 후보 점수를 부품 점수로 바꾼 최적화가 아니다.',plans},null,2)+'\n');
const doc=[
 '# 필요성 우선 후보 조합 예시','',
 '최종 선정이 아니라 검토용이다. 세 평가자의 필요성·환경·Codex gate를 모두 통과한 기능만 조합에 넣는다. **최대5개이므로 약한 기능을 넣어 정확히5개를 채울 필요는 없다.** 사용자 기능 점수는 서버/클라이언트 부품 점수가 아니므로 조합 평균으로 절대 최적해를 주장하지 않는다.','',
 '| 예시 | 포함 사용자 기능 | 서버 | Android | 등록 합계 |','| --- | --- | ---: | ---: | ---: |',
 ...plans.filter(p=>p.eligible).map(p=>`| ${p.title} | ${p.ids.map(id=>`${id} ${byId.get(id).title}`).join(' / ')} | ${p.server} | ${p.client} | ${p.total} |`),'',
 '## 각 등록 항목과 남은 주의점','',
 ...plans.filter(p=>p.eligible).flatMap(p=>[`### ${p.title}`,'',...p.components.map(id=>`- ${id} ${byComponent.get(id).title}: ${byComponent.get(id).scope}`),'',`독립 추가 기능 인정 위험: ${p.recognitionRisk}. 공유 SDK를 별도 슬롯으로 세지 않았고 실제 필요한 데이터 공급 기능을 포함했다. 기본 과제 ID1–13과 실제 PA↔Android 동작은 전제다.`,'']),
 '## 핵심 자격을 통과하지 못한 예시','',...plans.filter(p=>!p.eligible).map(p=>`- ${p.title}: ${p.blockers.join(', ')}`),'',
 '[전체 평가](REPORT.md) · [등록 정의](components.json) · [조합 데이터](portfolios.json)','',
 '분류·OCR·추천·피드는 원천 데이터나 계산을 공유한다. 교수님께 독립 기능으로 설명하려면 각 사용자 과업과 동작 증거가 구분돼야 하며, 단순히 같은 결과를 다른 화면에 표시하는 것은 별도 기능으로 과장하지 않는다. 새로운 구현·인식 품질·배포 검증은 아직 수행 전이다.'
].join('\n');
fs.writeFileSync(path.join(dir,'PORTFOLIOS.md'),doc+'\n');
console.log(JSON.stringify({eligible:plans.filter(p=>p.eligible).map(p=>({title:p.title,ids:p.ids,server:p.server,client:p.client,total:p.total})),blocked:plans.filter(p=>!p.eligible).map(p=>({title:p.title,blockers:p.blockers}))},null,2));
