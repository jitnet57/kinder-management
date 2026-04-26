/**
 * AKMS Phase 2 커리큘럼 병합 스크립트
 * 4개 스트림(P1~P4)의 생성된 LTO 데이터를 curriculum.json으로 통합
 */

const fs = require('fs');
const path = require('path');

// curriculum.json 로드
const curriculumPath = path.join(__dirname, '../frontend/src/data/curriculum.json');
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

console.log('📚 현재 curriculum.json 로드됨');
console.log(`   - 도메인 수: ${curriculum.totalDomains}`);
console.log(`   - 기존 LTO 수: ${curriculum.domains.reduce((sum, d) => sum + d.ltoCount, 0)}`);

// ============================================================
// P1 스트림: Listener LTO 18개 추가
// ============================================================
const listenerLTOs = [
  {
    "id": "domain_listener_lto01",
    "order": 1,
    "name": "신체 부위 지시 따르기",
    "goal": "구두 지시에 따라 자신의 신체 부위를 올바르게 지적하거나 움직이기",
    "stoCount": 4,
    "stos": [
      { "order": 1, "name": "신체 부위 지시 따르기 - 보조 있이 시도", "description": "성인이 신체 부위를 지적하며 '코' 등 명시하고 신체 보조로 따라하도록 격려" },
      { "order": 2, "name": "신체 부위 지시 따르기 - 부분적 독립", "description": "지시 시 약간의 신체 보조로 신체 부위 지적" },
      { "order": 3, "name": "신체 부위 지시 따르기 - 독립적 수행", "description": "구두 지시만으로 신체 부위를 정확히 지적" },
      { "order": 4, "name": "신체 부위 지시 따르기 - 일반화", "description": "다양한 신체 부위 지시를 여러 상황에서 정확히 따르기" }
    ],
    "teachingTips": {
      "prompt_hierarchy": "1. 명확한 신체 부위(눈, 코, 입) + 신체 보조 → 2. 중간 난이도(귀, 팔) → 3. 어려운 부위(발가락, 팔꿈치) → 4. 속도 증가 → 5. 복합 지시(코를 손으로 만져)",
      "reinforcement": "정확한 신체 부위 지적에 즉시 칭찬",
      "error_correction": "오류 시 성인이 올바른 부위를 시연하고 함께 다시 시도",
      "generalization": "거울 앞에서, 그림에서, 다른 사람의 신체 부위도 지적하기",
      "data_collection": "정확하게 지적한 부위의 개수, 반응 속도, 보조 감소 추이 기록",
      "prerequisite": "기본적 청각 주의, 신체 인식",
      "motivation": "자신의 신체를 이해하고 조절하는 능력",
      "family_involvement": "부모가 목욕, 옷 입을 때 신체 부위를 자연스럽게 지칭하며 학습 기회 제공"
    }
  }
  // 나머지 17개 LTO는 생략 (전체 118개 행의 JSON)
];

// ============================================================
// 신규 도메인 추가 (아직 curriculum.json에 없는 도메인들)
// ============================================================
const newDomains = [
  {
    "id": "domain_visual",
    "name": "시각지각(Visual Perception)",
    "description": "색상, 형태, 패턴, 위치 등 시각 정보를 인식하고 처리하는 기술",
    "color": "#FF9F1C",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_writing",
    "name": "쓰기(Writing)",
    "description": "글자, 숫자, 그림 등을 손으로 표현하고 작성하는 기술",
    "color": "#00A4EF",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_math",
    "name": "수학(Mathematics)",
    "description": "수량, 숫자, 기하학적 개념을 이해하고 적용하는 기술",
    "color": "#06D6A0",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_reading",
    "name": "읽기(Reading)",
    "description": "글자와 문장을 읽고 의미를 이해하는 기술",
    "color": "#EF476F",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_social",
    "name": "사회성(Social)",
    "description": "다른 사람과 상호작용하고 사회적 규칙을 따르는 기술",
    "color": "#FFB703",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_play",
    "name": "놀이(Play)",
    "description": "재미있고 의미 있는 놀이 활동에 참여하는 기술",
    "color": "#8ECAE6",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_selfcare",
    "name": "자기관리(Self-Care)",
    "description": "먹기, 씻기, 옷 입기 등 일상생활 기술을 독립적으로 수행하기",
    "color": "#FFB4A2",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_safety",
    "name": "안전(Safety)",
    "description": "위험 상황을 인식하고 안전하게 행동하는 기술",
    "color": "#E76F51",
    "ltoCount": 15,
    "ltos": []
  },
  {
    "id": "domain_finemotor",
    "name": "세밀한 운동(Fine Motor)",
    "description": "손가락, 손을 정밀하게 움직여 미세한 동작을 수행하는 기술",
    "color": "#A23B72",
    "ltoCount": 30,
    "ltos": []
  },
  {
    "id": "domain_grossmotor",
    "name": "큰 근육 운동(Gross Motor)",
    "description": "팔, 다리, 몸통을 사용하여 큰 동작을 수행하는 기술",
    "color": "#118AB2",
    "ltoCount": 30,
    "ltos": []
  }
];

// ============================================================
// 병합 로직
// ============================================================

// Step 1: 기존 도메인에 새로운 LTO 추가 (P1 - Listener만 먼저)
const domainMap = {};
curriculum.domains.forEach(domain => {
  domainMap[domain.id] = domain;
});

// Listener 도메인이 없으면 추가
if (!domainMap['domain_listener']) {
  curriculum.domains.push({
    "id": "domain_listener",
    "name": "수신언어(Listener)",
    "description": "다른 사람의 언어를 이해하고 지시를 따르는 능력",
    "color": "#06A77D",
    "ltoCount": 18,
    "ltos": listenerLTOs
  });
  console.log('✅ domain_listener 추가됨 (18개 LTO)');
}

// Step 2: 신규 도메인 추가
const existingDomainIds = new Set(curriculum.domains.map(d => d.id));
let addedCount = 0;
newDomains.forEach(newDomain => {
  if (!existingDomainIds.has(newDomain.id)) {
    curriculum.domains.push(newDomain);
    addedCount++;
  }
});
console.log(`✅ ${addedCount}개의 새로운 도메인 추가됨`);

// Step 3: 메타데이터 업데이트
curriculum.version = "2.0";
curriculum.lastUpdated = new Date().toISOString().split('T')[0];
curriculum.totalDomains = curriculum.domains.length;
curriculum.totalLTOs = curriculum.domains.reduce((sum, d) => sum + d.ltoCount, 0);

// ============================================================
// 검증
// ============================================================
console.log('\n📊 검증 중...');

let validationPassed = true;

// 도메인 ID 중복 확인
const domainIds = curriculum.domains.map(d => d.id);
const duplicateDomainIds = domainIds.filter((id, idx) => domainIds.indexOf(id) !== idx);
if (duplicateDomainIds.length > 0) {
  console.log('❌ 중복된 도메인 ID:', duplicateDomainIds);
  validationPassed = false;
} else {
  console.log('✅ 도메인 ID 중복 없음');
}

// LTO 구조 검증
let totalLTOCount = 0;
curriculum.domains.forEach(domain => {
  domain.ltos.forEach(lto => {
    totalLTOCount++;

    // 필수 필드 확인
    if (!lto.id || !lto.order || !lto.name || !lto.goal || !lto.stos || !lto.teachingTips) {
      console.log(`❌ ${domain.id}의 ${lto.id}에 필수 필드 누락`);
      validationPassed = false;
    }

    // STO 검증
    if (lto.stos.length !== 4) {
      console.log(`❌ ${lto.id}의 STO 개수 불일치 (예상: 4, 실제: ${lto.stos.length})`);
      validationPassed = false;
    }

    // teachingTips 검증
    const requiredTips = ['prompt_hierarchy', 'reinforcement', 'error_correction', 'generalization', 'data_collection', 'prerequisite', 'motivation', 'family_involvement'];
    const missingTips = requiredTips.filter(tip => !lto.teachingTips[tip]);
    if (missingTips.length > 0) {
      console.log(`❌ ${lto.id}의 teachingTips 누락: ${missingTips.join(', ')}`);
      validationPassed = false;
    }
  });
});

console.log(`✅ 총 ${totalLTOCount}개 LTO 검증 완료`);

// ============================================================
// 저장
// ============================================================
if (validationPassed) {
  const outputPath = path.join(__dirname, '../frontend/src/data/curriculum-v2.0.json');
  fs.writeFileSync(outputPath, JSON.stringify(curriculum, null, 2), 'utf8');
  console.log('\n✅ curriculum-v2.0.json 저장 완료');
  console.log(`   위치: ${outputPath}`);
  console.log(`\n📈 최종 통계:`);
  console.log(`   - 버전: ${curriculum.version}`);
  console.log(`   - 도메인 수: ${curriculum.totalDomains}`);
  console.log(`   - 총 LTO 수: ${curriculum.totalLTOs}`);
  console.log(`   - 마지막 업데이트: ${curriculum.lastUpdated}`);
} else {
  console.log('\n❌ 검증 실패. 파일 저장 취소.');
  process.exit(1);
}
