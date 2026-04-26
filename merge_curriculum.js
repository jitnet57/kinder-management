const fs = require('fs');

// Load all curriculum data files
const curriculum = JSON.parse(fs.readFileSync('/e/kinder-management/frontend/src/data/curriculum.json', 'utf8'));
const p2Stream = JSON.parse(fs.readFileSync('/e/kinder-management/akms_phase2_stream_p2_ltos.json', 'utf8'));
const p4Stream = JSON.parse(fs.readFileSync('/e/kinder-management/frontend/src/data/STREAM_P4_motor_domains_and_rewards.json', 'utf8'));
const writingData = JSON.parse(fs.readFileSync('/e/kinder-management/akms_lto_writing.json', 'utf8'));
const mathData = JSON.parse(fs.readFileSync('/e/kinder-management/akms_lto_math.json', 'utf8'));
const readingData = JSON.parse(fs.readFileSync('/e/kinder-management/akms_lto_reading.json', 'utf8'));

console.log('All files loaded successfully');

const domainColors = {
  domain_visual: '#4ECDC4',
  domain_writing: '#95E1D3',
  domain_math: '#F38181',
  domain_reading: '#AA96DA',
  domain_social: '#FCBAD3',
  domain_play: '#A8D8EA',
  domain_selfcare: '#FFE66D',
  domain_safety: '#FF6B6B',
  domain_finemotor: '#74B9FF',
  domain_grossmotor: '#81ECEC'
};

const domainNames = {
  domain_visual: '시각지각(Visual Perception)',
  domain_writing: '쓰기(Writing)',
  domain_math: '수학(Math)',
  domain_reading: '읽기(Reading)',
  domain_social: '사회성(Social)',
  domain_play: '놀이(Play)',
  domain_selfcare: '자기관리(Self-Care)',
  domain_safety: '안전(Safety)',
  domain_finemotor: '미세운동(Fine Motor)',
  domain_grossmotor: '대운동(Gross Motor)'
};

const domainDescriptions = {
  domain_visual: '시각 정보를 처리하고 인식하는 능력',
  domain_writing: '문자, 단어, 문장을 필기로 표현하는 능력',
  domain_math: '수 개념, 계산, 수학적 문제 해결 능력',
  domain_reading: '문자와 텍스트를 읽고 이해하는 능력',
  domain_social: '타인과 상호작용하고 관계를 형성하는 능력',
  domain_play: '놀이를 통해 학습하고 즐기는 능력',
  domain_selfcare: '개인 위생, 식사, 의류 관리 등 자기관리 능력',
  domain_safety: '위험 상황을 인지하고 안전하게 행동하는 능력',
  domain_finemotor: '손과 손가락의 미세한 동작 제어 능력',
  domain_grossmotor: '전신 움직임과 큰 근육 제어 능력'
};

function ensureDomain(domainId, name, description, color) {
  let domain = curriculum.domains.find(d => d.id === domainId);
  if (!domain) {
    domain = { id: domainId, name, description, color, ltoCount: 0, ltos: [] };
    curriculum.domains.push(domain);
  }
  return domain;
}

// Merge P2 Stream (Visual)
for (const [domainKey, ltos] of Object.entries(p2Stream)) {
  if (Array.isArray(ltos) && ltos.length > 0) {
    const domain = ensureDomain(domainKey, domainNames[domainKey], domainDescriptions[domainKey], domainColors[domainKey]);
    const startOrder = domain.ltos.length + 1;
    ltos.forEach((lto, idx) => {
      lto.order = startOrder + idx;
      domain.ltos.push(lto);
    });
    domain.ltoCount = domain.ltos.length;
  }
}

// Writing
if (writingData.domain_writing) {
  const domain = ensureDomain('domain_writing', domainNames['domain_writing'], domainDescriptions['domain_writing'], domainColors['domain_writing']);
  const startOrder = domain.ltos.length + 1;
  writingData.domain_writing.forEach((lto, idx) => {
    lto.order = startOrder + idx;
    domain.ltos.push(lto);
  });
  domain.ltoCount = domain.ltos.length;
}

// Math
if (mathData.domain_math) {
  const domain = ensureDomain('domain_math', domainNames['domain_math'], domainDescriptions['domain_math'], domainColors['domain_math']);
  const startOrder = domain.ltos.length + 1;
  mathData.domain_math.forEach((lto, idx) => {
    lto.order = startOrder + idx;
    domain.ltos.push(lto);
  });
  domain.ltoCount = domain.ltos.length;
}

// Reading
if (readingData.domain_reading) {
  const domain = ensureDomain('domain_reading', domainNames['domain_reading'], domainDescriptions['domain_reading'], domainColors['domain_reading']);
  const startOrder = domain.ltos.length + 1;
  readingData.domain_reading.forEach((lto, idx) => {
    lto.order = startOrder + idx;
    domain.ltos.push(lto);
  });
  domain.ltoCount = domain.ltos.length;
}

// Fine Motor
if (p4Stream.finemotor_ltos) {
  const domain = ensureDomain('domain_finemotor', domainNames['domain_finemotor'], domainDescriptions['domain_finemotor'], domainColors['domain_finemotor']);
  const startOrder = domain.ltos.length + 1;
  p4Stream.finemotor_ltos.forEach((lto, idx) => {
    lto.order = startOrder + idx;
    domain.ltos.push(lto);
  });
  domain.ltoCount = domain.ltos.length;
}

// Gross Motor
if (p4Stream.grossmotor_additional_ltos) {
  const domain = ensureDomain('domain_grossmotor', domainNames['domain_grossmotor'], domainDescriptions['domain_grossmotor'], domainColors['domain_grossmotor']);
  const startOrder = domain.ltos.length + 1;
  p4Stream.grossmotor_additional_ltos.forEach((lto, idx) => {
    lto.order = startOrder + idx;
    domain.ltos.push(lto);
  });
  domain.ltoCount = domain.ltos.length;
}

// Update metadata
curriculum.version = '2.0';
curriculum.lastUpdated = '2026-04-27';
curriculum.totalDomains = curriculum.domains.length;
curriculum.totalLTOs = curriculum.domains.reduce((sum, d) => sum + d.ltoCount, 0);

// Validate
let validationErrors = [];
curriculum.domains.forEach(domain => {
  domain.ltos.forEach((lto, idx) => {
    if (!lto.id || !lto.order || !lto.name || !lto.goal || !lto.stos || !lto.teachingTips) {
      validationErrors.push(`LTO ${lto.id} missing fields`);
    }
    if (lto.order !== idx + 1) {
      validationErrors.push(`LTO ${lto.id} order mismatch`);
    }
    if (!Array.isArray(lto.stos) || lto.stos.length !== 4) {
      validationErrors.push(`LTO ${lto.id} STO count wrong`);
    }
  });
});

// Output
const outputPath = '/e/kinder-management/frontend/src/data/curriculum-v2.0.json';
fs.writeFileSync(outputPath, JSON.stringify(curriculum, null, 2));

console.log('MERGE COMPLETE');
console.log('Version:', curriculum.version);
console.log('Total Domains:', curriculum.totalDomains);
console.log('Total LTOs:', curriculum.totalLTOs);
console.log('Validation:', validationErrors.length === 0 ? 'PASSED' : `${validationErrors.length} errors`);
console.log('Output:', outputPath);

process.exit(validationErrors.length > 0 ? 1 : 0);
