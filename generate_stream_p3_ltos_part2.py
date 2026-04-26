#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AKMS Phase 2 Stream P3 Part 2: Self-Care & Safety 도메인 LTO 생성
Self-Care 15개 + Safety 15개
"""

import json

def generate_selfcare_ltos():
    """Domain Self-Care: 자기관리 (15개)"""
    ltos = [
        {
            "id": "domain_selfcare_lto01",
            "order": 1,
            "name": "얼굴 씻기",
            "goal": "물을 사용하여 독립적으로 얼굴을 씻기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "얼굴 씻기 - 보조 있이 시도", "description": "신체적/언어적 보조로 얼굴 씻기 시도"},
                {"order": 2, "name": "얼굴 씻기 - 부분적 독립", "description": "최소한의 보조로 얼굴 씻기 수행"},
                {"order": 3, "name": "얼굴 씻기 - 독립적 수행", "description": "보조 없이 완전히 독립적으로 얼굴 씻기"},
                {"order": 4, "name": "얼굴 씻기 - 일반화", "description": "다양한 환경에서 적절한 시기에 얼굴 씻기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 지도(손을 잡고) → 2. 시범 → 3. 언어적 지시 → 4. 자발적 시도",
                "reinforcement": "얼굴 씻기 완료 후 칭찬 및 격려",
                "error_correction": "눈에 물이 들어가면 안전하게 도움",
                "generalization": "식사 전, 야외 활동 후, 화장실 사용 후 등 다양한 상황",
                "data_collection": "얼굴 씻기 빈도, 필요한 보조 수준, 물 온도 선호도 기록",
                "prerequisite": "물에 대한 두려움 극복, 손-얼굴 협응능력",
                "motivation": "상큼한 느낌, 깨끗함에 대한 긍정적 피드백",
                "family_involvement": "부모에게 매일 아침, 저녁 얼굴 씻기 루틴 교육"
            }
        },
        {
            "id": "domain_selfcare_lto02",
            "order": 2,
            "name": "손 씻기",
            "goal": "비누와 물을 사용하여 손을 깨끗하게 씻기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "손 씻기 - 보조 있이 시도", "description": "신체적 지도로 손 씻기 시도"},
                {"order": 2, "name": "손 씻기 - 부분적 독립", "description": "최소한의 보조로 손 씻기 수행"},
                {"order": 3, "name": "손 씻기 - 독립적 수행", "description": "보조 없이 독립적으로 손 씻기"},
                {"order": 4, "name": "손 씻기 - 일반화", "description": "다양한 상황에서 적절히 손 씻기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 지도 → 2. 시범('비누 문질러요') → 3. 언어적 지시 → 4. 독립",
                "reinforcement": "손 씻기 완료 후 칭찬, 깨끗한 손 보여주기",
                "error_correction": "비누를 너무 많이 사용하면 조절",
                "generalization": "식사 전, 화장실 후, 야외 활동 후, 손이 더러울 때",
                "data_collection": "손 씻기 빈도, 지속시간, 물 온도 사용 능력 기록",
                "prerequisite": "물과 비누에 대한 익숙함",
                "motivation": "감염병 예방에 대한 이해, 깨끗함의 즐거움",
                "family_involvement": "부모에게 손 씻기 노래, 타이머 사용 방법 교육"
            }
        },
        {
            "id": "domain_selfcare_lto03",
            "order": 3,
            "name": "양치질하기",
            "goal": "칫솔을 사용하여 치아를 깨끗하게 닦기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "양치질하기 - 보조 있이 시도", "description": "신체적 지도로 칫솔질 시도"},
                {"order": 2, "name": "양치질하기 - 부분적 독립", "description": "최소한의 보조로 양치질 수행"},
                {"order": 3, "name": "양치질하기 - 독립적 수행", "description": "보조 없이 독립적으로 양치질"},
                {"order": 4, "name": "양치질하기 - 일반화", "description": "아침, 저녁 규칙적으로 양치질하기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 손잡이 → 2. 시범 → 3. 언어적 지시 → 4. 독립 수행",
                "reinforcement": "양치질 완료 후 칭찬 및 치아 상태 긍정적 언급",
                "error_correction": "칫솔이 입에 안전하게 들어가도록 안내",
                "generalization": "아침 기상 후, 밤 자기 전 등 일과에 통합",
                "data_collection": "양치질 빈도, 지속시간(최소 2분), 자발성 기록",
                "prerequisite": "입을 벌릴 수 있는 능력, 음식 삼키기 안전성",
                "motivation": "깨끗한 이에 대한 자부심, 치아 건강의 중요성 설명",
                "family_involvement": "부모에게 칫솔 선택, 불소 치약 사용, 양치 시간표 교육"
            }
        },
        {
            "id": "domain_selfcare_lto04",
            "order": 4,
            "name": "화장실 사용하기",
            "goal": "화장실에서 배뇨/배변을 독립적으로 수행하고 위생 처리하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "화장실 사용하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 화장실 사용 시도"},
                {"order": 2, "name": "화장실 사용하기 - 부분적 독립", "description": "최소한의 보조로 화장실 사용"},
                {"order": 3, "name": "화장실 사용하기 - 독립적 수행", "description": "보조 없이 완전히 독립적으로 화장실 사용"},
                {"order": 4, "name": "화장실 사용하기 - 일반화", "description": "다양한 화장실에서 적절히 사용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 함께 가기 → 2. 옆에서 지도 → 3. 뒤에서 관찰 → 4. 독립 사용",
                "reinforcement": "화장실 성공 후 큰 칭찬 및 긍정 강화",
                "error_correction": "사고 시 당황하지 말고 차분하게 처리",
                "generalization": "가정, 학교, 공중 화장실 등 다양한 환경",
                "data_collection": "화장실 사용 패턴, 성공률, 필요한 보조 기록",
                "prerequisite": "신체 신호 인식, 안전 이해",
                "motivation": "독립성에 대한 칭찬, 깨끗함의 중요성",
                "family_involvement": "부모에게 화장실 훈련 계획, 실수 처리 방법 교육"
            }
        },
        {
            "id": "domain_selfcare_lto05",
            "order": 5,
            "name": "옷 입기",
            "goal": "옷을 스스로 입을 수 있기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "옷 입기 - 보조 있이 시도", "description": "신체적 지도로 옷 입기 시도"},
                {"order": 2, "name": "옷 입기 - 부분적 독립", "description": "최소한의 보조로 옷 입기"},
                {"order": 3, "name": "옷 입기 - 독립적 수행", "description": "보조 없이 독립적으로 옷 입기"},
                {"order": 4, "name": "옷 입기 - 일반화", "description": "다양한 옷, 상황에서 적절히 입기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 지도 → 2. 시범 → 3. 언어적 지시 → 4. 자발적 수행",
                "reinforcement": "옷을 성공적으로 입은 후 칭찬 및 거울에서 확인",
                "error_correction": "옷이 뒤집혀 있으면 친절하게 바로잡기",
                "generalization": "계절에 맞는 옷, 특수한 상황의 옷(운동복 등)",
                "data_collection": "옷 입는데 걸리는 시간, 필요한 보조 수준 기록",
                "prerequisite": "미세 운동능력, 의복의 개념 이해",
                "motivation": "자신의 외모에 대한 긍정적 피드백",
                "family_involvement": "부모에게 옷 선택 기회 제공, 칭찬 방법 교육"
            }
        },
        {
            "id": "domain_selfcare_lto06",
            "order": 6,
            "name": "신발 신기",
            "goal": "신발을 정확하게 신고 끈 또는 밴드를 사용하여 고정하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "신발 신기 - 보조 있이 시도", "description": "신체적 지도로 신발 신기 시도"},
                {"order": 2, "name": "신발 신기 - 부분적 독립", "description": "최소한의 보조로 신발 신기"},
                {"order": 3, "name": "신발 신기 - 독립적 수행", "description": "보조 없이 독립적으로 신발 신기"},
                {"order": 4, "name": "신발 신기 - 일반화", "description": "다양한 신발, 상황에서 적절히 신기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 지도 → 2. 시범 → 3. 언어적 지시 → 4. 독립 수행",
                "reinforcement": "신발을 바르게 신은 후 칭찬",
                "error_correction": "신발이 뒤집혀 있으면 부드럽게 수정",
                "generalization": "운동화, 슬리퍼, 부츠 등 다양한 신발",
                "data_collection": "신발 신는데 걸리는 시간, 자발성 기록",
                "prerequisite": "앉기/서기 능력, 양쪽 발의 개념 이해",
                "motivation": "밖에 나가는 활동에 대한 기대감",
                "family_involvement": "부모에게 신발 선택, 신발끈 연습 방법 교육"
            }
        },
        {
            "id": "domain_selfcare_lto07",
            "order": 7,
            "name": "먹기",
            "goal": "스푼/포크를 사용하여 안전하게 음식을 섭취하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "먹기 - 보조 있이 시도", "description": "신체적 지도로 숟가락질 시도"},
                {"order": 2, "name": "먹기 - 부분적 독립", "description": "최소한의 보조로 음식 섭취"},
                {"order": 3, "name": "먹기 - 독립적 수행", "description": "보조 없이 독립적으로 먹기"},
                {"order": 4, "name": "먹기 - 일반화", "description": "다양한 음식, 식기로 적절히 먹기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 손을 잡고 → 2. 팔꿈치에서 안내 → 3. 언어적 지시 → 4. 독립",
                "reinforcement": "음식을 입에 잘 넣은 후 칭찬",
                "error_correction": "음식이 흘리면 당황하지 말고 닦아주기",
                "generalization": "다양한 음식 질감, 다양한 식기",
                "data_collection": "독립적 섭취량, 음식 낭비, 식사 시간 기록",
                "prerequisite": "저작 능력, 안전한 삼키기",
                "motivation": "맛있는 음식, 식사 후 포만감",
                "family_involvement": "부모에게 적절한 식기 사용, 식사 예절 교육"
            }
        },
        {
            "id": "domain_selfcare_lto08",
            "order": 8,
            "name": "마시기",
            "goal": "컵을 들어 물이나 음료를 안전하게 마시기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "마시기 - 보조 있이 시도", "description": "신체적 지도로 컵 마시기 시도"},
                {"order": 2, "name": "마시기 - 부분적 독립", "description": "최소한의 보조로 음료 마시기"},
                {"order": 3, "name": "마시기 - 독립적 수행", "description": "보조 없이 독립적으로 마시기"},
                {"order": 4, "name": "마시기 - 일반화", "description": "다양한 음료, 컵으로 적절히 마시기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 컵을 잡고 → 2. 손을 안내하며 → 3. 언어적 지시 → 4. 독립",
                "reinforcement": "성공적으로 마신 후 칭찬",
                "error_correction": "쏟으면 닦아주고 다시 시도",
                "generalization": "물, 우유, 주스 등 다양한 음료",
                "data_collection": "흘린 양, 독립 정도, 안전성 기록",
                "prerequisite": "손-입 협응능력, 안전한 삼키기",
                "motivation": "목이 탈 때의 해갈감",
                "family_involvement": "부모에게 적절한 음료 온도, 컵 크기 선택 교육"
            }
        },
        {
            "id": "domain_selfcare_lto09",
            "order": 9,
            "name": "침 뱉기",
            "goal": "양치질 후 또는 필요할 때 침을 적절히 뱉기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "침 뱉기 - 보조 있이 시도", "description": "모델링으로 침 뱉기 시도"},
                {"order": 2, "name": "침 뱉기 - 부분적 독립", "description": "최소한의 지도로 침 뱉기"},
                {"order": 3, "name": "침 뱉기 - 독립적 수행", "description": "보조 없이 적절하게 침 뱉기"},
                {"order": 4, "name": "침 뱉기 - 일반화", "description": "다양한 상황에서 적절히 침 뱉기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 시범(물을 입에 넣고 뱉기) → 2. 함께 하기 → 3. 언어적 지시 → 4. 독립",
                "reinforcement": "적절하게 뱉은 후 칭찬",
                "error_correction": "바닥에 뱉으면 안전하고 위생적인 방법 설명",
                "generalization": "양치질 후, 목에 뭔가 걸렸을 때 등",
                "data_collection": "침 뱉는 적절성, 위생 습관 기록",
                "prerequisite": "입 조절 능력, 위생 개념",
                "motivation": "깨끗함과 건강의 중요성",
                "family_involvement": "부모에게 위생적인 침 뱉기 방법 교육"
            }
        },
        {
            "id": "domain_selfcare_lto10",
            "order": 10,
            "name": "코 풀기",
            "goal": "티슈를 사용하여 코를 깨끗하게 풀기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "코 풀기 - 보조 있이 시도", "description": "신체적 지도로 코 풀기 시도"},
                {"order": 2, "name": "코 풀기 - 부분적 독립", "description": "최소한의 보조로 코 풀기"},
                {"order": 3, "name": "코 풀기 - 독립적 수행", "description": "보조 없이 독립적으로 코 풀기"},
                {"order": 4, "name": "코 풀기 - 일반화", "description": "다양한 상황에서 적절히 코 풀기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 시범 → 2. 신체적 안내 → 3. 언어적 지시 → 4. 독립",
                "reinforcement": "성공적으로 코를 푼 후 칭찬",
                "error_correction": "코를 자극하면 부드럽게 안내",
                "generalization": "코가 막혔을 때, 코감기 증상이 있을 때",
                "data_collection": "코 풀기의 자발성, 위생 습관 기록",
                "prerequisite": "코 자극에 대한 이해, 티슈 사용법",
                "motivation": "상큼한 느낌, 호흡 편함",
                "family_involvement": "부모에게 위생적인 코 풀기, 손 씻기 강조"
            }
        },
        {
            "id": "domain_selfcare_lto11",
            "order": 11,
            "name": "찬바람에 반응하기",
            "goal": "찬바람이 불 때 적절한 옷 입기나 실내로 들어가기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "찬바람에 반응하기 - 보조 있이 시도", "description": "성인 지도로 찬바람 반응 시도"},
                {"order": 2, "name": "찬바람에 반응하기 - 부분적 독립", "description": "최소한의 지도로 찬바람에 대응"},
                {"order": 3, "name": "찬바람에 반응하기 - 독립적 수행", "description": "자발적으로 적절히 대응"},
                {"order": 4, "name": "찬바람에 반응하기 - 일반화", "description": "다양한 온도 변화에 적절히 대응"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인이 옷을 입혀주기 → 2. 언어적 지시 → 3. 신호 제공 → 4. 자발적 반응",
                "reinforcement": "적절한 반응 후 칭찬 및 따뜻함 강조",
                "error_correction": "떨고 있으면 안전하게 온난",
                "generalization": "계절 변화, 실내외 온도 차이",
                "data_collection": "찬바람에 대한 반응 시간, 자발성 기록",
                "prerequisite": "체온 감각, 옷 입기 능력",
                "motivation": "따뜻함의 편안함",
                "family_involvement": "부모에게 계절 옷 준비, 온도 자각 촉진 방법 교육"
            }
        },
        {
            "id": "domain_selfcare_lto12",
            "order": 12,
            "name": "더위에 반응하기",
            "goal": "더운 날씨에 적절한 옷 입기, 수분 섭취, 쉬기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "더위에 반응하기 - 보조 있이 시도", "description": "성인 지도로 더위 대응 시도"},
                {"order": 2, "name": "더위에 반응하기 - 부분적 독립", "description": "최소한의 지도로 더위에 대응"},
                {"order": 3, "name": "더위에 반응하기 - 독립적 수행", "description": "자발적으로 적절히 대응"},
                {"order": 4, "name": "더위에 반응하기 - 일반화", "description": "다양한 환경에서 더위에 적절히 대응"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인이 도와주기 → 2. 언어적 지시 → 3. 신호 제공 → 4. 자발적 반응",
                "reinforcement": "적절한 수분 섭취, 휴식 후 칭찬",
                "error_correction": "과열 증상 시 즉시 개입",
                "generalization": "실외 활동, 운동 중, 계절 변화",
                "data_collection": "더위 반응 시간, 수분 섭취량, 자발성 기록",
                "prerequisite": "체온 감각, 물 마시기 능력",
                "motivation": "시원함의 편안함, 건강의 중요성",
                "family_involvement": "부모에게 더위 대응법, 수분 섭취 중요성 교육"
            }
        },
        {
            "id": "domain_selfcare_lto13",
            "order": 13,
            "name": "안전 거리 유지하기",
            "goal": "위험한 물체나 사람으로부터 안전한 거리 유지하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "안전 거리 유지하기 - 보조 있이 시도", "description": "신체적 지도로 안전 거리 유지 시도"},
                {"order": 2, "name": "안전 거리 유지하기 - 부분적 독립", "description": "최소한의 지도로 안전 거리 유지"},
                {"order": 3, "name": "안전 거리 유지하기 - 독립적 수행", "description": "자발적으로 안전 거리 유지"},
                {"order": 4, "name": "안전 거리 유지하기 - 일반화", "description": "다양한 위험 상황에서 거리 유지"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 손 잡고 멀어지기 → 2. 신체적 신호 → 3. 언어적 지시 → 4. 자발적 회피",
                "reinforcement": "안전하게 거리를 유지한 후 칭찬",
                "error_correction": "가까워지면 부드럽게 멀어지게 유도",
                "generalization": "칼, 불, 높은 곳, 길 등 다양한 위험",
                "data_collection": "위험 물체 인식도, 거리 유지 자발성 기록",
                "prerequisite": "위험 인식, 신체 조절 능력",
                "motivation": "안전에 대한 칭찬, 신뢰",
                "family_involvement": "부모에게 위험 물체 교육, 거리 유지 강화 요청"
            }
        },
        {
            "id": "domain_selfcare_lto14",
            "order": 14,
            "name": "위험 물질 피하기",
            "goal": "독한 냄새, 유독 물질 등을 인식하고 피하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "위험 물질 피하기 - 보조 있이 시도", "description": "성인 지도로 위험 물질 회피 시도"},
                {"order": 2, "name": "위험 물질 피하기 - 부분적 독립", "description": "최소한의 지도로 위험 물질 피하기"},
                {"order": 3, "name": "위험 물질 피하기 - 독립적 수행", "description": "자발적으로 위험 물질 회피"},
                {"order": 4, "name": "위험 물질 피하기 - 일반화", "description": "다양한 위험 물질 상황에서 회피"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 손 잡고 멀어지기 → 2. 신체적 신호 → 3. 언어적 경고 → 4. 자발적 회피",
                "reinforcement": "안전하게 회피한 후 칭찬",
                "error_correction": "가까워지면 즉시 개입 및 멀어지기",
                "generalization": "세제, 연기, 화학약품, 곰팡이 등",
                "data_collection": "위험 물질 인식도, 회피 자발성 기록",
                "prerequisite": "냄새 감각, 위험 개념 이해",
                "motivation": "건강 보호에 대한 칭찬",
                "family_involvement": "부모에게 가정 내 위험 물질 정보, 교육 방법 제시"
            }
        },
        {
            "id": "domain_selfcare_lto15",
            "order": 15,
            "name": "약 먹기",
            "goal": "의약품을 안전하게 복용하기 (의료 지도 하에)",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "약 먹기 - 보조 있이 시도", "description": "성인이 약을 주고 복용 안내"},
                {"order": 2, "name": "약 먹기 - 부분적 독립", "description": "최소한의 지도로 약 복용"},
                {"order": 3, "name": "약 먹기 - 독립적 수행", "description": "자발적으로 약 복용(보호자 감시 하에)"},
                {"order": 4, "name": "약 먹기 - 일반화", "description": "다양한 약 형태(알약, 물약 등)의 안전한 복용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인이 입에 넣어주기 → 2. 성인이 건네주고 지도 → 3. 자발적 복용 감시 → 4. 독립",
                "reinforcement": "약을 잘 먹은 후 칭찬",
                "error_correction": "거부 시 약의 중요성 설명",
                "generalization": "다양한 약 형태, 복용 시간 설정",
                "data_collection": "약 복용 자발성, 거부 빈도, 순응도 기록",
                "prerequisite": "삼키기 능력, 약에 대한 기본 이해",
                "motivation": "건강 회복에 대한 긍정적 강화",
                "family_involvement": "부모에게 약 복용 일정, 부작용 설명, 거부 대응 방법 교육"
            }
        }
    ]
    return ltos

def generate_safety_ltos():
    """Domain Safety: 안전 (15개)"""
    ltos = [
        {
            "id": "domain_safety_lto01",
            "order": 1,
            "name": "불에 대한 위험 인식",
            "goal": "불을 인식하고 위험함을 이해하여 접근하지 않기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "불에 대한 위험 인식 - 보조 있이 시도", "description": "성인 지도로 불의 위험성 인식 시도"},
                {"order": 2, "name": "불에 대한 위험 인식 - 부분적 독립", "description": "언어적 상기로 불 회피"},
                {"order": 3, "name": "불에 대한 위험 인식 - 독립적 수행", "description": "자발적으로 불을 피하기"},
                {"order": 4, "name": "불에 대한 위험 인식 - 일반화", "description": "다양한 상황의 불(초, 스토브, 담배)에 대응"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 안전한 거리에서 '뜨거워요' 표현 → 2. 신체적 회피 유도 → 3. 언어적 경고 → 4. 자발적 회피",
                "reinforcement": "불을 피한 후 칭찬 및 안전 강조",
                "error_correction": "접근하면 즉시 멀어지게 유도",
                "generalization": "부엌, 캠프, 라이터, 성냥 등 모든 화열 원천",
                "data_collection": "불에 대한 거리 유지, 반응 시간, 자발성 기록",
                "prerequisite": "뜨거움의 개념, 거리 감각",
                "motivation": "화상 위험에 대한 이해, 안전성 강조",
                "family_involvement": "부모에게 불 안전교육, 감시 중요성, 응급처치 교육"
            }
        },
        {
            "id": "domain_safety_lto02",
            "order": 2,
            "name": "날카로운 물체 위험 인식",
            "goal": "칼, 가위, 못 등 날카로운 물체를 인식하고 피하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "날카로운 물체 위험 인식 - 보조 있이 시도", "description": "성인 지도로 위험 인식 시도"},
                {"order": 2, "name": "날카로운 물체 위험 인식 - 부분적 독립", "description": "언어적 상기로 피하기"},
                {"order": 3, "name": "날카로운 물체 위험 인식 - 독립적 수행", "description": "자발적으로 날카로운 물체 회피"},
                {"order": 4, "name": "날카로운 물체 위험 인식 - 일반화", "description": "다양한 날카로운 물체에 대응"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 시각적으로 보여주며 '위험' 표현 → 2. 신체적 회피 유도 → 3. 언어적 경고 → 4. 자발적 회피",
                "reinforcement": "안전하게 피한 후 칭찬",
                "error_correction": "접근하면 즉시 멀어지게 유도",
                "generalization": "칼, 가위, 못, 유리, 핀 등 모든 날카로운 물체",
                "data_collection": "날카로운 물체 인식도, 거리 유지, 자발성 기록",
                "prerequisite": "위험의 개념, 손상에 대한 이해",
                "motivation": "상처 방지에 대한 이해, 안전성 강조",
                "family_involvement": "부모에게 안전한 도구 보관, 감시 중요성 교육"
            }
        },
        {
            "id": "domain_safety_lto03",
            "order": 3,
            "name": "높은 곳의 위험 인식",
            "goal": "높은 곳에서의 낙상 위험을 인식하고 조심스럽게 행동하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "높은 곳의 위험 인식 - 보조 있이 시도", "description": "성인 지도로 위험 인식 시도"},
                {"order": 2, "name": "높은 곳의 위험 인식 - 부분적 독립", "description": "언어적 경고로 조심스러운 행동"},
                {"order": 3, "name": "높은 곳의 위험 인식 - 독립적 수행", "description": "자발적으로 조심스러운 행동"},
                {"order": 4, "name": "높은 곳의 위험 인식 - 일반화", "description": "다양한 높이의 상황에서 안전 행동"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 높이 설명('떨어져요') → 2. 신체적 안전 지지 → 3. 언어적 상기 → 4. 자발적 조심",
                "reinforcement": "안전하게 행동한 후 칭찬",
                "error_correction": "위험한 행동 시 즉시 안전하게 개입",
                "generalization": "계단, 침대, 의자, 놀이터, 베란다 등",
                "data_collection": "높은 곳에서의 안전 행동, 반응 시간 기록",
                "prerequisite": "높이의 개념, 신체 균형감각",
                "motivation": "낙상 위험에 대한 이해, 안전의 중요성",
                "family_involvement": "부모에게 낙상 예방, 안전 환경 조성, 응급처치 교육"
            }
        },
        {
            "id": "domain_safety_lto04",
            "order": 4,
            "name": "물의 위험 인식",
            "goal": "깊은 물, 흐르는 물 등의 위험을 인식하고 안전 조치 따르기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "물의 위험 인식 - 보조 있이 시도", "description": "성인 지도로 물의 위험성 인식 시도"},
                {"order": 2, "name": "물의 위험 인식 - 부분적 독립", "description": "언어적 상기로 안전 조치 준수"},
                {"order": 3, "name": "물의 위험 인식 - 독립적 수행", "description": "자발적으로 물 안전 규칙 따르기"},
                {"order": 4, "name": "물의 위험 인식 - 일반화", "description": "다양한 수중 환경에서 안전 행동"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 물의 깊이 설명 → 2. 신체적 안전 지지 → 3. 언어적 경고 → 4. 자발적 준수",
                "reinforcement": "물 안전 규칙을 따른 후 칭찬",
                "error_correction": "위험한 행동 시 즉시 구조 및 교정",
                "generalization": "수영장, 강, 바다, 욕조 등 모든 물",
                "data_collection": "물 안전 규칙 준수율, 반응 시간 기록",
                "prerequisite": "깊이의 개념, 수상 안전 능력",
                "motivation": "익수 위험에 대한 이해, 수상 안전의 중요성",
                "family_involvement": "부모에게 수상 안전교육, 감시 중요성, 응급 수상 술기 교육"
            }
        },
        {
            "id": "domain_safety_lto05",
            "order": 5,
            "name": "도로 교통 안전 인식",
            "goal": "길을 건널 때 교통 신호를 따르고 안전하게 행동하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "도로 교통 안전 인식 - 보조 있이 시도", "description": "성인과 함께 안전하게 길 건너기"},
                {"order": 2, "name": "도로 교통 안전 인식 - 부분적 독립", "description": "언어적 지도로 길 건너기"},
                {"order": 3, "name": "도로 교통 안전 인식 - 독립적 수행", "description": "자발적으로 신호 따르고 안전하게 건너기"},
                {"order": 4, "name": "도로 교통 안전 인식 - 일반화", "description": "다양한 도로 환경에서 안전 행동"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 손 잡고 함께 → 2. 신호 지시하며 → 3. 언어적 지도 → 4. 자발적 준수",
                "reinforcement": "안전하게 길을 건넌 후 칭찬",
                "error_correction": "신호 무시 시 즉시 안전하게 개입",
                "generalization": "다양한 교차로, 상황, 계절의 도로",
                "data_collection": "신호 준수율, 반응 시간, 안전 행동 빈도 기록",
                "prerequisite": "신호등의 의미 이해, 좌우 구분",
                "motivation": "교통사고 위험에 대한 이해, 생명 안전의 중요성",
                "family_involvement": "부모에게 교통안전교육, 보행 안전 훈련, 모범 행동"
            }
        },
        {
            "id": "domain_safety_lto06",
            "order": 6,
            "name": "낙상 방지 행동",
            "goal": "미끄러운 곳, 울퉁불퉁한 길에서 안전하게 행동하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "낙상 방지 행동 - 보조 있이 시도", "description": "성인이 손을 잡고 안전하게 이동"},
                {"order": 2, "name": "낙상 방지 행동 - 부분적 독립", "description": "언어적 지도로 조심스러운 이동"},
                {"order": 3, "name": "낙상 방지 행동 - 독립적 수행", "description": "자발적으로 안전하게 이동"},
                {"order": 4, "name": "낙상 방지 행동 - 일반화", "description": "다양한 지면에서 안전 행동"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 손 잡고 → 2. 팔로 지지 → 3. 언어적 경고 → 4. 자발적 조심",
                "reinforcement": "안전하게 이동한 후 칭찬",
                "error_correction": "위험한 동작 시 즉시 안전하게 개입",
                "generalization": "빗길, 눈길, 계단, 비포장도로 등",
                "data_collection": "낙상 위험 행동 빈도, 안전 이동률 기록",
                "prerequisite": "균형감각, 신체 조절 능력",
                "motivation": "낙상 위험에 대한 이해, 안전성 강조",
                "family_involvement": "부모에게 안전한 신발, 지면 조건 고려, 응급처치 교육"
            }
        },
        {
            "id": "domain_safety_lto07",
            "order": 7,
            "name": "질식 위험 회피",
            "goal": "작은 물체를 입에 넣지 않고, 음식을 안전하게 섭취하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "질식 위험 회피 - 보조 있이 시도", "description": "성인 감시 하에 안전한 음식 섭취"},
                {"order": 2, "name": "질식 위험 회피 - 부분적 독립", "description": "언어적 상기로 안전한 음식 선택"},
                {"order": 3, "name": "질식 위험 회피 - 독립적 수행", "description": "자발적으로 안전한 음식 섭취"},
                {"order": 4, "name": "질식 위험 회피 - 일반화", "description": "다양한 상황에서 질식 위험 회피"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인이 음식 준비 감시 → 2. 입에 넣기 전 확인 → 3. 언어적 상기 → 4. 자발적 선택",
                "reinforcement": "안전하게 먹은 후 칭찬",
                "error_correction": "작은 물체를 집으려 하면 즉시 리디렉트",
                "generalization": "포도, 견과류, 동전, 약 등 다양한 물체",
                "data_collection": "입에 넣는 물체, 음식 크기 선택 안전성 기록",
                "prerequisite": "씹기 능력, 안전한 삼키기, 크기 개념",
                "motivation": "질식 위험에 대한 이해, 생명 안전의 중요성",
                "family_involvement": "부모에게 질식 위험 물체 제거, 적절한 음식 크기 준비, 응급처치 교육"
            }
        },
        {
            "id": "domain_safety_lto08",
            "order": 8,
            "name": "화상 방지 행동",
            "goal": "뜨거운 음식, 액체를 피하고, 화상 위험이 있는 물체에서 거리 유지",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "화상 방지 행동 - 보조 있이 시도", "description": "성인 지도로 뜨거운 것 회피"},
                {"order": 2, "name": "화상 방지 행동 - 부분적 독립", "description": "언어적 상기로 거리 유지"},
                {"order": 3, "name": "화상 방지 행동 - 독립적 수행", "description": "자발적으로 화상 위험 회피"},
                {"order": 4, "name": "화상 방지 행동 - 일반화", "description": "다양한 환경에서 화상 위험 회피"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. '뜨거워요' 표현 → 2. 신체적 거리 유도 → 3. 언어적 경고 → 4. 자발적 회피",
                "reinforcement": "안전하게 거리를 유지한 후 칭찬",
                "error_correction": "가까워지면 즉시 멀어지게 유도",
                "generalization": "끓는 물, 뜨거운 음식, 라디에이터, 히터, 스토브 등",
                "data_collection": "뜨거운 물체 인식도, 거리 유지, 자발성 기록",
                "prerequisite": "뜨거움의 개념, 거리 감각",
                "motivation": "화상 위험에 대한 이해, 안전성 강조",
                "family_involvement": "부모에게 화상 예방, 안전한 음식 취급, 응급처치 교육"
            }
        },
        {
            "id": "domain_safety_lto09",
            "order": 9,
            "name": "독성 물질 회피",
            "goal": "독성 약물, 화학약품, 유독 식물 등을 피하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "독성 물질 회피 - 보조 있이 시도", "description": "성인 감시 하에 독성 물질 회피"},
                {"order": 2, "name": "독성 물질 회피 - 부분적 독립", "description": "언어적 경고로 회피"},
                {"order": 3, "name": "독성 물질 회피 - 독립적 수행", "description": "자발적으로 독성 물질 회피"},
                {"order": 4, "name": "독성 물질 회피 - 일반화", "description": "다양한 독성 물질 상황에서 회피"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 접근 전 제거 → 2. 신체적 거리 유도 → 3. 언어적 경고 → 4. 자발적 회피",
                "reinforcement": "안전하게 피한 후 칭찬",
                "error_correction": "접근하면 즉시 멀어지게 유도",
                "generalization": "약, 세제, 살충제, 담배, 독버섯 등",
                "data_collection": "독성 물질 인식도, 회피 자발성 기록",
                "prerequisite": "냄새/맛 감각, 위험 개념",
                "motivation": "중독 위험에 대한 이해, 생명 안전의 중요성",
                "family_involvement": "부모에게 독성 물질 안전 보관, 라벨 확인, 응급중독 처치 교육"
            }
        },
        {
            "id": "domain_safety_lto10",
            "order": 10,
            "name": "낯선 사람 인식",
            "goal": "신원 확인 없는 낯선 사람을 인식하고 보호자에게 알리기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "낯선 사람 인식 - 보조 있이 시도", "description": "성인 지도로 낯선 사람 회피"},
                {"order": 2, "name": "낯선 사람 인식 - 부분적 독립", "description": "언어적 상기로 보호자에게 알리기"},
                {"order": 3, "name": "낯선 사람 인식 - 독립적 수행", "description": "자발적으로 낯선 사람 인식 및 보고"},
                {"order": 4, "name": "낯선 사람 인식 - 일반화", "description": "다양한 상황의 낯선 사람 인식"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 안전한 어른만 따라가기 → 2. 물음에 답하지 않기 → 3. 보호자에게 알리기 → 4. 자발적 주의",
                "reinforcement": "낯선 사람에 대해 보호자에게 알린 후 칭찬",
                "error_correction": "낯선 사람을 따라가려 하면 안전하게 개입",
                "generalization": "학교, 공원, 길 등 다양한 환경",
                "data_collection": "낯선 사람에 대한 인식도, 보고 빈도 기록",
                "prerequisite": "친숙함 vs 낯설음의 개념",
                "motivation": "자신을 보호하는 것의 중요성, 보호자 신뢰",
                "family_involvement": "부모에게 신원 확인, 비상 연락처, 거절하는 방법 교육"
            }
        },
        {
            "id": "domain_safety_lto11",
            "order": 11,
            "name": "도움 요청하기",
            "goal": "위험한 상황에서 성인에게 도움 요청하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "도움 요청하기 - 보조 있이 시도", "description": "신체적 지도로 도움 신호 시도"},
                {"order": 2, "name": "도움 요청하기 - 부분적 독립", "description": "언어적 격려로 도움 요청"},
                {"order": 3, "name": "도움 요청하기 - 독립적 수행", "description": "자발적으로 도움 요청"},
                {"order": 4, "name": "도움 요청하기 - 일반화", "description": "다양한 위험 상황에서 도움 요청"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신호 가르치기(손 들기) → 2. 음성 신호('도와줘요') → 3. 상황별 도움 → 4. 자발적 요청",
                "reinforcement": "도움을 요청한 후 즉시 도움을 제공하고 칭찬",
                "error_correction": "도움을 요청하지 않으면 안전하게 개입하고 가르치기",
                "generalization": "신체 위험, 감정 위험, 물질 위험 등 다양한 상황",
                "data_collection": "도움 요청의 빈도, 형태, 상황별 적절성 기록",
                "prerequisite": "신호 체계 이해, 타인 신뢰",
                "motivation": "도움 요청에 대한 긍정적 반응, 안전 강화",
                "family_involvement": "부모에게 도움 요청 신호 교육, 응답 및 강화 방법"
            }
        },
        {
            "id": "domain_safety_lto12",
            "order": 12,
            "name": "기본 안전 규칙 이해",
            "goal": "일상의 기본 안전 규칙(신호등, 열린 문 등)을 이해하고 따르기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "기본 안전 규칙 이해 - 보조 있이 시도", "description": "성인의 설명과 함께 규칙 따르기"},
                {"order": 2, "name": "기본 안전 규칙 이해 - 부분적 독립", "description": "언어적 상기로 규칙 준수"},
                {"order": 3, "name": "기본 안전 규칙 이해 - 독립적 수행", "description": "자발적으로 안전 규칙 준수"},
                {"order": 4, "name": "기본 안전 규칙 이해 - 일반화", "description": "새로운 안전 규칙도 빠르게 이해 및 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 반복 설명과 시범 → 2. 직접 경험 안내 → 3. 언어적 상기 → 4. 자발적 준수",
                "reinforcement": "규칙을 잘 따른 후 칭찬",
                "error_correction": "규칙 위반 시 부드럽게 교정 및 재교육",
                "generalization": "신호등, 문 열고 닫기, 엘리베이터, 계단 난간 등",
                "data_collection": "규칙 이해도, 준수율, 보조 필요성 기록",
                "prerequisite": "언어 이해, 지시 따르기",
                "motivation": "규칙 준수를 통한 안전 경험",
                "family_involvement": "부모에게 반복되는 안전 규칙 교육, 모범 행동"
            }
        },
        {
            "id": "domain_safety_lto13",
            "order": 13,
            "name": "응급 상황 이해",
            "goal": "응급 상황(크게 울기, 큰 소리 등)을 인식하고 안전한 행동하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "응급 상황 이해 - 보조 있이 시도", "description": "성인 지도로 응급 상황 대응 시도"},
                {"order": 2, "name": "응급 상황 이해 - 부분적 독립", "description": "언어적 지도로 응급 상황 인식"},
                {"order": 3, "name": "응급 상황 이해 - 독립적 수행", "description": "자발적으로 응급 상황 인식 및 행동"},
                {"order": 4, "name": "응급 상황 이해 - 일반화", "description": "다양한 응급 상황 시나리오에 대응"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 응급신호 가르치기 → 2. 모델링으로 응급 행동 → 3. 언어적 지도 → 4. 자발적 대응",
                "reinforcement": "응급 상황에 적절히 행동한 후 칭찬",
                "error_correction": "응급 상황 인식 실패 시 교육",
                "generalization": "화재 경보, 지진, 낙상, 질식 등",
                "data_collection": "응급 상황 인식도, 행동의 적절성 기록",
                "prerequisite": "신호/소리 인식, 기본 안전 규칙",
                "motivation": "생명 안전에 대한 이해",
                "family_involvement": "부모에게 응급 대응 계획, 대피 장소, 응급처치 교육"
            }
        },
        {
            "id": "domain_safety_lto14",
            "order": 14,
            "name": "긍정한 지시 따르기",
            "goal": "보호자의 긍정한(명확한) 안전 지시를 이해하고 따르기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "긍정한 지시 따르기 - 보조 있이 시도", "description": "신체적 지도로 지시 따르기 시도"},
                {"order": 2, "name": "긍정한 지시 따르기 - 부분적 독립", "description": "최소한의 지도로 지시 준수"},
                {"order": 3, "name": "긍정한 지시 따르기 - 독립적 수행", "description": "자발적으로 지시 준수"},
                {"order": 4, "name": "긍정한 지시 따르기 - 일반화", "description": "다양한 상황의 새로운 지시 신속히 이해 및 준수"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 안내 → 2. 시범 → 3. 언어적 지시 → 4. 독립적 준수",
                "reinforcement": "지시를 따른 후 즉시 칭찬 및 강화",
                "error_correction": "지시 불이행 시 부드럽게 리디렉트",
                "generalization": "이동, 활동 중단, 물체 접근 등 다양한 지시",
                "data_collection": "지시 이해도, 준수율, 보조 필요성 기록",
                "prerequisite": "언어 이해, 지시 따르기 기초",
                "motivation": "지시 준수로 인한 안전 경험",
                "family_involvement": "부모에게 명확한 지시 방법, 칭찬 방식 교육"
            }
        },
        {
            "id": "domain_safety_lto15",
            "order": 15,
            "name": "비상 연락처 알기",
            "goal": "부모 또는 보호자의 이름과 연락처를 알고 필요할 때 알릴 수 있기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "비상 연락처 알기 - 보조 있이 시도", "description": "반복 학습으로 연락처 외우기 시도"},
                {"order": 2, "name": "비상 연락처 알기 - 부분적 독립", "description": "힌트로 부모의 이름/번호 말하기"},
                {"order": 3, "name": "비상 연락처 알기 - 독립적 수행", "description": "보조 없이 부모의 이름과 번호 말하기"},
                {"order": 4, "name": "비상 연락처 알기 - 일반화", "description": "스트레스 상황에서도 연락처 말할 수 있기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 반복 학습(노래로) → 2. 질문에 답하기 → 3. 힌트 제공 → 4. 독립적 회상",
                "reinforcement": "정확하게 말한 후 칭찬",
                "error_correction": "오류 시 반복적으로 교정",
                "generalization": "학교, 길, 낯선 장소에서도 회상",
                "data_collection": "연락처 회상 정확도, 스트레스 상황에서의 수행 기록",
                "prerequisite": "언어 이해, 숫자 개념",
                "motivation": "비상 시 안전의 중요성 강조",
                "family_involvement": "부모에게 연락처 반복 학습, 노래/카드 활용 방법 제시"
            }
        }
    ]
    return ltos

# Generate data
selfcare_ltos = generate_selfcare_ltos()
safety_ltos = generate_safety_ltos()

# Print JSON
print("### Domain Self-Care (15개 LTO)")
print(json.dumps(selfcare_ltos, ensure_ascii=False, indent=2))
print("\n### Domain Safety (15개 LTO)")
print(json.dumps(safety_ltos, ensure_ascii=False, indent=2))
