#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AKMS Phase 2 Stream P3: 사회 및 생활 도메인 LTO 생성
총 60개의 LTO 생성 (각 도메인 15개)
"""

import json

def generate_social_ltos():
    """Domain Social: 사회성 (15개)"""
    ltos = [
        {
            "id": "domain_social_lto01",
            "order": 1,
            "name": "눈 맞춤 유지하기",
            "goal": "2초 이상 다른 사람의 눈을 바라보기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "눈 맞춤 유지하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 눈 맞춤 시도"},
                {"order": 2, "name": "눈 맞춤 유지하기 - 부분적 독립", "description": "최소한의 보조로 눈 맞춤 수행"},
                {"order": 3, "name": "눈 맞춤 유지하기 - 독립적 수행", "description": "보조 없이 눈 맞춤 독립적으로 수행"},
                {"order": 4, "name": "눈 맞춤 유지하기 - 일반화", "description": "다양한 사람, 상황에서 눈 맞춤 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 유도(턱 만지기) → 2. 언어적 힌트('눈 보세요') → 3. 시선 유도 → 4. 점진적 감소",
                "reinforcement": "눈 맞춤 직후 즉시 강화(칭찬, 강화물)",
                "error_correction": "눈 맞춤 실패 시 다시 유도하고 강화",
                "generalization": "다양한 사람(부모, 선생님, 또래), 다양한 위치에서 훈련",
                "data_collection": "세션마다 눈 맞춤 시간, 보조 수준, 횟수 기록",
                "prerequisite": "사회적 상황 이해, 기본 주의집중",
                "motivation": "아동이 선호하는 강화물 사용",
                "family_involvement": "부모에게 일상에서 눈 맞춤을 격려하는 방법 교육"
            }
        },
        {
            "id": "domain_social_lto02",
            "order": 2,
            "name": "인사하기",
            "goal": "손 흔들기, 인사말 등으로 다른 사람에게 인사하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "인사하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 인사 시도"},
                {"order": 2, "name": "인사하기 - 부분적 독립", "description": "최소한의 보조로 인사 수행"},
                {"order": 3, "name": "인사하기 - 독립적 수행", "description": "보조 없이 독립적으로 인사"},
                {"order": 4, "name": "인사하기 - 일반화", "description": "다양한 상황, 다양한 사람에게 인사 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 유도(손 잡아 흔들기) → 2. 몸짓 유도 → 3. 언어적 힌트('안녕하세요') → 4. 점진적 감소",
                "reinforcement": "인사 직후 즉시 칭찬 및 상호작용으로 강화",
                "error_correction": "인사 실패 시 모델링으로 보여주고 다시 시도",
                "generalization": "입장, 퇴장, 전화 등 다양한 상황에서 연습",
                "data_collection": "인사 빈도, 형태(손 흔들기/말), 보조 수준 기록",
                "prerequisite": "인사의 의미 이해, 타인 인식",
                "motivation": "인사 후 즐거운 상호작용 경험 제공",
                "family_involvement": "부모에게 일상에서 인사 모델링 요청"
            }
        },
        {
            "id": "domain_social_lto03",
            "order": 3,
            "name": "이름으로 부르기",
            "goal": "다른 사람의 이름을 정확히 부르기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "이름으로 부르기 - 보조 있이 시도", "description": "음성 모델링 또는 신체적 보조로 이름 부르기 시도"},
                {"order": 2, "name": "이름으로 부르기 - 부분적 독립", "description": "부분적 힌트로 이름 부르기"},
                {"order": 3, "name": "이름으로 부르기 - 독립적 수행", "description": "보조 없이 정확하게 이름 부르기"},
                {"order": 4, "name": "이름으로 부르기 - 일반화", "description": "다양한 맥락에서 적절히 이름 부르기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 음성 모델링 → 2. 부분적 음성 제시 → 3. 구두 힌트 → 4. 점진적 감소",
                "reinforcement": "올바르게 이름 부른 후 즉시 강화",
                "error_correction": "발음 오류 시 올바른 발음 모델링",
                "generalization": "다양한 사람의 이름, 다양한 상황에서 연습",
                "data_collection": "이름 부르기 정확도, 대기 시간 기록",
                "prerequisite": "언어 이해, 음성 모방 능력",
                "motivation": "이름을 불린 사람의 긍정적 반응 활용",
                "family_involvement": "부모에게 가정에서 자주 부르는 이름으로 연습 요청"
            }
        },
        {
            "id": "domain_social_lto04",
            "order": 4,
            "name": "감정 인식하기",
            "goal": "자신과 타인의 기본 감정(행복, 슬픔, 화남) 인식하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "감정 인식하기 - 보조 있이 시도", "description": "감정 그림 또는 신체적 신호로 감정 표현 시도"},
                {"order": 2, "name": "감정 인식하기 - 부분적 독립", "description": "최소한의 힌트로 감정 인식"},
                {"order": 3, "name": "감정 인식하기 - 독립적 수행", "description": "보조 없이 감정 인식 및 표현"},
                {"order": 4, "name": "감정 인식하기 - 일반화", "description": "다양한 상황에서 감정 인식 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 감정 카드 제시 → 2. 얼굴 표정 모델링 → 3. 구두 힌트 → 4. 질문",
                "reinforcement": "정확한 감정 인식 후 칭찬 및 활동으로 강화",
                "error_correction": "오류 발생 시 올바른 감정 모델링",
                "generalization": "책, 사진, 실제 상황에서 감정 인식 연습",
                "data_collection": "인식한 감정의 정확도, 반응 시간 기록",
                "prerequisite": "기본 의사소통 능력",
                "motivation": "감정 표현 후 공감적 반응 제공",
                "family_involvement": "부모에게 일상에서 감정 이름 붙이기 요청"
            }
        },
        {
            "id": "domain_social_lto05",
            "order": 5,
            "name": "감정 표현하기",
            "goal": "자신의 감정을 말, 그림, 신체 표현으로 나타내기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "감정 표현하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 감정 표현 시도"},
                {"order": 2, "name": "감정 표현하기 - 부분적 독립", "description": "최소한의 보조로 감정 표현"},
                {"order": 3, "name": "감정 표현하기 - 독립적 수행", "description": "보조 없이 감정 독립적으로 표현"},
                {"order": 4, "name": "감정 표현하기 - 일반화", "description": "다양한 상황에서 감정 표현 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 모델링 → 2. 신체적 유도 → 3. 언어적 힌트 → 4. 점진적 감소",
                "reinforcement": "감정 표현 후 즉시 공감적 반응 제공",
                "error_correction": "부적절한 표현 시 적절한 모델링",
                "generalization": "다양한 감정, 다양한 환경에서 표현 연습",
                "data_collection": "감정 표현 방식, 빈도, 정확도 기록",
                "prerequisite": "감정 인식, 기본 의사소통",
                "motivation": "감정 표현에 대한 성인의 주의 깊은 경청",
                "family_involvement": "부모에게 아동의 감정 표현 격려 방법 교육"
            }
        },
        {
            "id": "domain_social_lto06",
            "order": 6,
            "name": "공감 표현하기",
            "goal": "다른 사람의 감정에 적절히 반응하고 위로하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "공감 표현하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 공감 표현 시도"},
                {"order": 2, "name": "공감 표현하기 - 부분적 독립", "description": "최소한의 보조로 공감 표현"},
                {"order": 3, "name": "공감 표현하기 - 독립적 수행", "description": "보조 없이 공감 독립적으로 표현"},
                {"order": 4, "name": "공감 표현하기 - 일반화", "description": "다양한 상황에서 공감 표현 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 모델링(나쁜 느낌이겠네) → 2. 신체적 유도(안아주기) → 3. 언어적 힌트 → 4. 감소",
                "reinforcement": "공감 표현 후 칭찬 및 긍정적 상호작용",
                "error_correction": "부적절한 반응 시 올바른 모델링",
                "generalization": "다양한 타인의 감정 상황에서 연습",
                "data_collection": "공감 표현의 유형, 빈도, 적절성 기록",
                "prerequisite": "감정 인식, 감정 표현",
                "motivation": "공감에 대한 긍정적 반응 제공",
                "family_involvement": "부모에게 일상에서 공감 모델링 요청"
            }
        },
        {
            "id": "domain_social_lto07",
            "order": 7,
            "name": "차례 지키기",
            "goal": "놀이나 활동에서 차례를 기다리고 순서대로 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "차례 지키기 - 보조 있이 시도", "description": "신체적/언어적 보조로 차례 기다리기 시도"},
                {"order": 2, "name": "차례 지키기 - 부분적 독립", "description": "짧은 시간 대기, 최소 보조로 차례 지키기"},
                {"order": 3, "name": "차례 지키기 - 독립적 수행", "description": "보조 없이 차례 지키기 수행"},
                {"order": 4, "name": "차례 지키기 - 일반화", "description": "다양한 활동, 다양한 그룹 상황에서 차례 지키기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 손 잡기 → 2. 언어적 지원('~의 차례') → 3. 시각적 신호 → 4. 점진적 감소",
                "reinforcement": "차례를 기다린 후 즉시 아동의 차례 제공 및 칭찬",
                "error_correction": "차례 넘어설 때 부드럽게 유도하고 다시 대기",
                "generalization": "게임, 식사, 활동 등 다양한 맥락에서 연습",
                "data_collection": "대기 시간, 자발적 준수율, 보조 수준 기록",
                "prerequisite": "기본 지시 이해, 기다리기 능력",
                "motivation": "차례 준수 후 즉각적 보상 제공",
                "family_involvement": "부모에게 가정에서 차례 지키기 연습 방법 교육"
            }
        },
        {
            "id": "domain_social_lto08",
            "order": 8,
            "name": "함께 놀기",
            "goal": "다른 사람과 상호작용하며 함께 놀이 활동에 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "함께 놀기 - 보조 있이 시도", "description": "신체적/언어적 보조로 함께 놀기 시도"},
                {"order": 2, "name": "함께 놀기 - 부분적 독립", "description": "최소한의 보조로 함께 놀이 참여"},
                {"order": 3, "name": "함께 놀기 - 독립적 수행", "description": "보조 없이 함께 놀이 지속"},
                {"order": 4, "name": "함께 놀기 - 일반화", "description": "다양한 또래, 다양한 놀이에서 함께 참여"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 참여 → 2. 함께 행동 유도 → 3. 언어적 격려 → 4. 자발성 장려",
                "reinforcement": "함께 놀이 중 자주 상호 작용으로 강화",
                "error_correction": "독립적 놀이로 회귀 시 다시 참여 유도",
                "generalization": "다양한 또래, 그룹 크기, 놀이 유형에서 연습",
                "data_collection": "함께 놀이 지속 시간, 상호작용 횟수, 보조 수준 기록",
                "prerequisite": "기본 사회적 관심, 차례 지키기",
                "motivation": "함께 놀이에 대한 긍정적 경험",
                "family_involvement": "부모에게 또래와의 놀이 기회 확대 요청"
            }
        },
        {
            "id": "domain_social_lto09",
            "order": 9,
            "name": "도움 주기",
            "goal": "다른 사람이 도움이 필요할 때 적절히 도와주기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "도움 주기 - 보조 있이 시도", "description": "신체적/언어적 보조로 도움 주기 시도"},
                {"order": 2, "name": "도움 주기 - 부분적 독립", "description": "최소한의 보조로 도움 주기"},
                {"order": 3, "name": "도움 주기 - 독립적 수행", "description": "보조 없이 자발적으로 도움 제공"},
                {"order": 4, "name": "도움 주기 - 일반화", "description": "다양한 상황에서 도움 주기 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 모델링 → 2. 신체적 유도 → 3. 언어적 힌트 → 4. 점진적 감소",
                "reinforcement": "도움 제공 후 칭찬 및 타인의 감사 반응 강조",
                "error_correction": "도움 형태가 부적절하면 올바른 방법 모델링",
                "generalization": "다양한 타인, 다양한 도움 상황에서 연습",
                "data_collection": "도움 제공의 빈도, 유형, 적절성 기록",
                "prerequisite": "타인의 필요 인식, 기본 기술",
                "motivation": "도움으로 인한 타인의 긍정적 반응 강조",
                "family_involvement": "부모에게 가정에서 도움 기회 창출 요청"
            }
        },
        {
            "id": "domain_social_lto10",
            "order": 10,
            "name": "양보하기",
            "goal": "자신의 물건이나 활동을 다른 사람과 나누기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "양보하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 양보 시도"},
                {"order": 2, "name": "양보하기 - 부분적 독립", "description": "최소한의 보조로 양보 수행"},
                {"order": 3, "name": "양보하기 - 독립적 수행", "description": "보조 없이 자발적으로 양보"},
                {"order": 4, "name": "양보하기 - 일반화", "description": "다양한 물건, 다양한 상황에서 양보"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 유도 → 2. 모델링 → 3. 언어적 힌트 → 4. 점진적 감소",
                "reinforcement": "양보 직후 칭찬 및 타인의 긍정적 반응 강조",
                "error_correction": "거부 시 잠깐 대기 후 다시 시도",
                "generalization": "선호물, 비선호물 모두에서 양보 연습",
                "data_collection": "양보의 빈도, 물건 유형, 지속 시간 기록",
                "prerequisite": "소유권 이해, 사회적 관심",
                "motivation": "양보에 대한 칭찬 및 타인의 기쁨 강조",
                "family_involvement": "부모에게 가정에서 양보 모델링 요청"
            }
        },
        {
            "id": "domain_social_lto11",
            "order": 11,
            "name": "사과하기",
            "goal": "실수나 부정적 행동 후 사과 표현하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "사과하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 사과 시도"},
                {"order": 2, "name": "사과하기 - 부분적 독립", "description": "최소한의 보조로 사과 수행"},
                {"order": 3, "name": "사과하기 - 독립적 수행", "description": "보조 없이 자발적으로 사과"},
                {"order": 4, "name": "사과하기 - 일반화", "description": "다양한 상황에서 사과 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 모델링('죄송해요') → 2. 신체적 유도 → 3. 언어적 힌트 → 4. 감소",
                "reinforcement": "사과 후 타인의 용서 및 재결합 경험으로 강화",
                "error_correction": "거짓 사과나 마지못한 사과 시 교정",
                "generalization": "다양한 갈등 상황에서 사과 연습",
                "data_collection": "사과의 빈도, 자발성, 적절성 기록",
                "prerequisite": "실수/잘못 행동 인식, 감정 이해",
                "motivation": "사과 후 타인의 긍정적 반응",
                "family_involvement": "부모에게 사과 모델링 및 격려 요청"
            }
        },
        {
            "id": "domain_social_lto12",
            "order": 12,
            "name": "감사 표현하기",
            "goal": "도움을 받거나 선물을 받았을 때 감사를 표현하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "감사 표현하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 감사 표현 시도"},
                {"order": 2, "name": "감사 표현하기 - 부분적 독립", "description": "최소한의 보조로 감사 표현"},
                {"order": 3, "name": "감사 표현하기 - 독립적 수행", "description": "보조 없이 감사 독립적으로 표현"},
                {"order": 4, "name": "감사 표현하기 - 일반화", "description": "다양한 상황에서 감사 표현 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 모델링('고마워요') → 2. 신체적 유도(박수) → 3. 언어적 힌트 → 4. 감소",
                "reinforcement": "감사 표현 후 타인의 긍정적 반응으로 강화",
                "error_correction": "부족한 표현 시 올바른 형태 모델링",
                "generalization": "다양한 상황, 다양한 타인에게 감사 표현",
                "data_collection": "감사 표현의 빈도, 형태, 자발성 기록",
                "prerequisite": "감정 이해, 다른 사람의 행동 인식",
                "motivation": "감사 표현에 대한 따뜻한 반응",
                "family_involvement": "부모에게 감사 표현 모델링 요청"
            }
        },
        {
            "id": "domain_social_lto13",
            "order": 13,
            "name": "친구 만들기",
            "goal": "또래 아동과 사회적 관계를 시작하고 유지하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "친구 만들기 - 보조 있이 시도", "description": "신체적/언어적 보조로 또래와의 상호작용 시도"},
                {"order": 2, "name": "친구 만들기 - 부분적 독립", "description": "최소한의 보조로 또래와 관계 형성"},
                {"order": 3, "name": "친구 만들기 - 독립적 수행", "description": "보조 없이 또래와 자발적 상호작용"},
                {"order": 4, "name": "친구 만들기 - 일반화", "description": "다양한 또래, 상황에서 친구 관계 확대"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 매개 놀이 → 2. 약간의 촉진 → 3. 또래와의 직접 상호작용 → 4. 독립적 상호작용",
                "reinforcement": "또래와의 긍정적 상호작용 후 칭찬",
                "error_correction": "부정적 상호작용 시 적절한 행동 모델링",
                "generalization": "다양한 환경, 다양한 또래 그룹에서 경험",
                "data_collection": "또래와의 상호작용 빈도, 지속시간, 질 기록",
                "prerequisite": "사회적 기술(인사, 차례 지키기 등)",
                "motivation": "또래와의 긍정적 경험 강조",
                "family_involvement": "부모에게 또래 만남 기회 확대 요청"
            }
        },
        {
            "id": "domain_social_lto14",
            "order": 14,
            "name": "그룹 활동 참여",
            "goal": "여러 명이 참여하는 그룹 활동에 참여하고 지속하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "그룹 활동 참여 - 보조 있이 시도", "description": "신체적/언어적 보조로 그룹 활동 참여 시도"},
                {"order": 2, "name": "그룹 활동 참여 - 부분적 독립", "description": "최소한의 보조로 그룹 활동 참여"},
                {"order": 3, "name": "그룹 활동 참여 - 독립적 수행", "description": "보조 없이 그룹 활동 지속"},
                {"order": 4, "name": "그룹 활동 참여 - 일반화", "description": "다양한 그룹 크기, 활동에서 참여"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 소규모(2-3명) → 2. 중간 규모(4-6명) → 3. 대규모 → 4. 다양한 그룹",
                "reinforcement": "그룹 활동 참여 후 칭찬 및 상호작용",
                "error_correction": "이탈 시 부드럽게 유도하여 참여 지속",
                "generalization": "다양한 활동 유형, 다양한 환경에서 경험",
                "data_collection": "참여 시간, 이탈 빈도, 사회적 상호작용 횟수 기록",
                "prerequisite": "함께 놀기, 차례 지키기",
                "motivation": "그룹 활동에서의 긍정적 경험",
                "family_involvement": "부모에게 그룹 활동 기회 제공 요청"
            }
        },
        {
            "id": "domain_social_lto15",
            "order": 15,
            "name": "감정 조절하기",
            "goal": "부정적 감정을 인식하고 적절한 방법으로 조절하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "감정 조절하기 - 보조 있이 시도", "description": "신체적/언어적 보조로 감정 조절 시도"},
                {"order": 2, "name": "감정 조절하기 - 부분적 독립", "description": "최소한의 보조로 감정 조절"},
                {"order": 3, "name": "감정 조절하기 - 독립적 수행", "description": "보조 없이 감정 조절 수행"},
                {"order": 4, "name": "감정 조절하기 - 일반화", "description": "다양한 상황에서 감정 조절 적용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 깊은 호흡 모델링 → 2. 신체적 유도(포옹) → 3. 언어적 안심 → 4. 점진적 독립",
                "reinforcement": "적절한 감정 조절 후 칭찬 및 안심",
                "error_correction": "부정적 행동으로 표현되면 안전하게 개입",
                "generalization": "다양한 감정 유발 상황에서 조절 기술 적용",
                "data_collection": "감정 폭발 빈도, 조절 방법, 회복 시간 기록",
                "prerequisite": "감정 인식, 기본 자기조절",
                "motivation": "감정 조절 성공에 대한 칭찬",
                "family_involvement": "부모에게 감정 조절 기술 교육 및 지원 방법 제시"
            }
        }
    ]
    return ltos

def generate_play_ltos():
    """Domain Play: 놀이 (15개)"""
    ltos = [
        {
            "id": "domain_play_lto01",
            "order": 1,
            "name": "독립적 놀이",
            "goal": "성인의 직접적 지도 없이 혼자 놀이 활동에 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "독립적 놀이 - 보조 있이 시도", "description": "성인이 옆에서 지도하며 놀이 시도"},
                {"order": 2, "name": "독립적 놀이 - 부분적 독립", "description": "성인이 주변에 있으나 최소 개입으로 놀이"},
                {"order": 3, "name": "독립적 놀이 - 독립적 수행", "description": "성인의 개입 없이 독립적으로 놀이"},
                {"order": 4, "name": "독립적 놀이 - 일반화", "description": "다양한 물건, 환경에서 독립적 놀이 지속"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 직접 지도 → 2. 근처에서 관찰 → 3. 같은 공간에서 관찰 → 4. 시간 제한 없이 독립",
                "reinforcement": "독립적 놀이 지속 후 칭찬",
                "error_correction": "부정적 행동 시 안전하게 개입",
                "generalization": "다양한 물건, 다양한 환경에서 놀이",
                "data_collection": "독립적 놀이 시간, 빈도, 행동의 다양성 기록",
                "prerequisite": "기본 놀이 기술, 안전 이해",
                "motivation": "독립적 놀이의 즐거움 경험",
                "family_involvement": "부모에게 아동의 독립적 놀이 시간 제공 요청"
            }
        },
        {
            "id": "domain_play_lto02",
            "order": 2,
            "name": "병렬 놀이",
            "goal": "다른 아동 옆에서 상호작용 없이 각자의 놀이 활동 진행하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "병렬 놀이 - 보조 있이 시도", "description": "성인 지도 하에 다른 아동 옆에서 놀이 시도"},
                {"order": 2, "name": "병렬 놀이 - 부분적 독립", "description": "최소한의 보조로 옆에 있는 또래와 함께 놀이"},
                {"order": 3, "name": "병렬 놀이 - 독립적 수행", "description": "보조 없이 다른 아동 옆에서 독립적 놀이"},
                {"order": 4, "name": "병렬 놀이 - 일반화", "description": "다양한 또래, 다양한 놀이 환경에서 병렬 놀이"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 중재 → 2. 근처 관찰 → 3. 같은 공간 → 4. 독립적 병렬 놀이",
                "reinforcement": "병렬 놀이 지속 후 칭찬",
                "error_correction": "상호작용 시도 시 부드럽게 리디렉트",
                "generalization": "다양한 또래, 다양한 상황에서 경험",
                "data_collection": "병렬 놀이 지속 시간, 또래와의 거리, 행동 기록",
                "prerequisite": "독립적 놀이, 또래와의 근접성 수용",
                "motivation": "또래와 함께 있는 경험의 긍정성",
                "family_involvement": "부모에게 또래와의 병렬 놀이 환경 제공 요청"
            }
        },
        {
            "id": "domain_play_lto03",
            "order": 3,
            "name": "협력 놀이",
            "goal": "다른 아동과 함께 상호작용하며 공동의 놀이 활동 진행하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "협력 놀이 - 보조 있이 시도", "description": "성인 중재로 다른 아동과 협력 놀이 시도"},
                {"order": 2, "name": "협력 놀이 - 부분적 독립", "description": "최소한의 성인 지도로 협력 놀이"},
                {"order": 3, "name": "협력 놀이 - 독립적 수행", "description": "보조 없이 협력 놀이 지속"},
                {"order": 4, "name": "협력 놀이 - 일반화", "description": "다양한 또래, 다양한 협력 활동에서 참여"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 주도 → 2. 성인 안내 → 3. 또래와 직접 상호작용 → 4. 독립적 협력",
                "reinforcement": "협력 놀이 지속 후 칭찬 및 긍정 강조",
                "error_correction": "갈등 시 협력 기술 재모델링",
                "generalization": "다양한 또래, 다양한 협력 활동",
                "data_collection": "협력 놀이 지속 시간, 갈등 빈도, 상호작용 횟수 기록",
                "prerequisite": "병렬 놀이, 차례 지키기, 감정 조절",
                "motivation": "협력의 즐거움 경험",
                "family_involvement": "부모에게 협력 놀이 환경 조성 요청"
            }
        },
        {
            "id": "domain_play_lto04",
            "order": 4,
            "name": "역할극 참여",
            "goal": "특정 역할을 가정하고 그 역할에 따라 행동하는 상징적 놀이",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "역할극 참여 - 보조 있이 시도", "description": "성인의 모델링과 지도로 역할극 시도"},
                {"order": 2, "name": "역할극 참여 - 부분적 독립", "description": "최소한의 힌트로 역할 유지하며 놀이"},
                {"order": 3, "name": "역할극 참여 - 독립적 수행", "description": "보조 없이 역할극 지속"},
                {"order": 4, "name": "역할극 참여 - 일반화", "description": "다양한 역할, 다양한 극본으로 역할극"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 주도 역할극 → 2. 성인 가이드 → 3. 약간의 힌트 → 4. 자발적 역할극",
                "reinforcement": "역할에 따른 적절한 행동 후 칭찬",
                "error_correction": "역할 이탈 시 부드럽게 리콜",
                "generalization": "다양한 역할(의사, 부모, 동물 등), 다양한 소품",
                "data_collection": "역할 유지 시간, 창의성, 또래와의 조화 기록",
                "prerequisite": "독립적/협력 놀이, 상상력 발달",
                "motivation": "역할극의 즐거움, 다양한 역할 경험",
                "family_involvement": "부모에게 가정에서의 역할극 격려 요청"
            }
        },
        {
            "id": "domain_play_lto05",
            "order": 5,
            "name": "블록/퍼즐 조작",
            "goal": "블록을 쌓거나 퍼즐 조각을 맞추는 구성적 놀이",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "블록/퍼즐 조작 - 보조 있이 시도", "description": "신체적 지도로 블록 쌓기/퍼즐 맞추기 시도"},
                {"order": 2, "name": "블록/퍼즐 조작 - 부분적 독립", "description": "최소한의 도움으로 블록/퍼즐 조작"},
                {"order": 3, "name": "블록/퍼즐 조작 - 독립적 수행", "description": "보조 없이 구성적 놀이 수행"},
                {"order": 4, "name": "블록/퍼즐 조작 - 일반화", "description": "다양한 복잡도, 다양한 소재로 구성 놀이"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 유도 → 2. 시각적 모델 제시 → 3. 구두 지시 → 4. 독립적 조작",
                "reinforcement": "성공적 조작 후 즉시 칭찬",
                "error_correction": "오류 시 올바른 방법 모델링",
                "generalization": "다양한 블록 유형, 복잡도 증가",
                "data_collection": "조작 시간, 완성도, 독창성 기록",
                "prerequisite": "미세한 운동능력, 지속적 주의집중",
                "motivation": "완성의 즐거움, 창의적 결과물",
                "family_involvement": "부모에게 다양한 블록/퍼즐 제공 요청"
            }
        },
        {
            "id": "domain_play_lto06",
            "order": 6,
            "name": "그림 그리기/색칠하기",
            "goal": "펜이나 크레용으로 그림을 그리거나 색칠하는 창의적 활동",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "그림 그리기/색칠하기 - 보조 있이 시도", "description": "신체적 지도로 그리기/색칠 시도"},
                {"order": 2, "name": "그림 그리기/색칠하기 - 부분적 독립", "description": "최소한의 지도로 그리기/색칠 수행"},
                {"order": 3, "name": "그림 그리기/색칠하기 - 독립적 수행", "description": "보조 없이 독립적으로 그리기/색칠"},
                {"order": 4, "name": "그림 그리기/색칠하기 - 일반화", "description": "다양한 도구, 주제로 창의적 표현"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 손잡이 → 2. 손 안내 → 3. 구두 지시 → 4. 자유로운 표현",
                "reinforcement": "작품 완성 후 칭찬 및 전시",
                "error_correction": "과도한 수정 없이 노력 강조",
                "generalization": "다양한 도구(펜, 크레용, 물감), 주제",
                "data_collection": "그리기 시간, 손 협응력, 창의성 기록",
                "prerequisite": "미세한 운동능력, 도구 조작",
                "motivation": "창의적 표현의 즐거움, 작품 인정",
                "family_involvement": "부모에게 그리기 재료 제공 및 전시 요청"
            }
        },
        {
            "id": "domain_play_lto07",
            "order": 7,
            "name": "음악 활동 참여",
            "goal": "악기 연주, 노래 부르기 등 음악 활동에 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "음악 활동 참여 - 보조 있이 시도", "description": "성인의 지도로 음악 활동 시도"},
                {"order": 2, "name": "음악 활동 참여 - 부분적 독립", "description": "최소한의 지도로 음악 활동 참여"},
                {"order": 3, "name": "음악 활동 참여 - 독립적 수행", "description": "보조 없이 음악 활동 지속"},
                {"order": 4, "name": "음악 활동 참여 - 일반화", "description": "다양한 음악, 악기로 활동 확대"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체적 유도 → 2. 모델링 → 3. 언어적 힌트 → 4. 독립적 참여",
                "reinforcement": "음악 활동 참여 후 칭찬 및 격려",
                "error_correction": "부정적 행동 시 안전하게 개입",
                "generalization": "다양한 악기, 음악 장르, 그룹 활동",
                "data_collection": "음악 활동 지속 시간, 악기 조작력, 참여도 기록",
                "prerequisite": "청각 능력, 기본 운동 조절",
                "motivation": "음악의 즐거움, 청각적 피드백",
                "family_involvement": "부모에게 가정에서 음악 활동 격려 요청"
            }
        },
        {
            "id": "domain_play_lto08",
            "order": 8,
            "name": "춤추기",
            "goal": "음악에 맞춰 신체를 움직이는 활동",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "춤추기 - 보조 있이 시도", "description": "신체 지도로 춤추기 시도"},
                {"order": 2, "name": "춤추기 - 부분적 독립", "description": "최소한의 지도로 춤추기"},
                {"order": 3, "name": "춤추기 - 독립적 수행", "description": "보조 없이 음악에 맞춰 춤추기"},
                {"order": 4, "name": "춤추기 - 일반화", "description": "다양한 음악, 다양한 상황에서 춤추기"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체 지도 → 2. 손 잡아 함께 춤추기 → 3. 옆에서 모델링 → 4. 자유로운 표현",
                "reinforcement": "춤춘 후 칭찬 및 긍정적 피드백",
                "error_correction": "부정적 행동 시 안전하게 개입",
                "generalization": "다양한 음악, 여러 사람과의 춤",
                "data_collection": "춤추는 시간, 운동 범위, 흥미도 기록",
                "prerequisite": "대근육 발달, 음악 수용",
                "motivation": "신체 표현의 즐거움, 음악과의 동기화",
                "family_involvement": "부모에게 가정에서 음악과 함께 춤 격려 요청"
            }
        },
        {
            "id": "domain_play_lto09",
            "order": 9,
            "name": "스포츠 활동 참여",
            "goal": "공차기, 공던지기 등 기본 스포츠 활동에 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "스포츠 활동 참여 - 보조 있이 시도", "description": "신체 지도로 스포츠 활동 시도"},
                {"order": 2, "name": "스포츠 활동 참여 - 부분적 독립", "description": "최소한의 지도로 스포츠 활동"},
                {"order": 3, "name": "스포츠 활동 참여 - 독립적 수행", "description": "보조 없이 스포츠 활동 수행"},
                {"order": 4, "name": "스포츠 활동 참여 - 일반화", "description": "다양한 스포츠, 다양한 상황에서 참여"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 신체 지도 → 2. 손 잡고 함께 → 3. 옆에서 모델링 → 4. 독립적 수행",
                "reinforcement": "성공적 스포츠 행동 후 칭찬",
                "error_correction": "기술 오류 시 올바른 방법 모델링",
                "generalization": "다양한 공 크기, 다양한 활동",
                "data_collection": "스포츠 활동 지속 시간, 기술 습득도, 참여도 기록",
                "prerequisite": "대근육 발달, 조정력",
                "motivation": "스포츠의 즐거움, 성공 경험",
                "family_involvement": "부모에게 실외 스포츠 활동 기회 제공 요청"
            }
        },
        {
            "id": "domain_play_lto10",
            "order": 10,
            "name": "보드게임 참여",
            "goal": "규칙이 있는 보드게임에 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "보드게임 참여 - 보조 있이 시도", "description": "성인 지도로 보드게임 시도"},
                {"order": 2, "name": "보드게임 참여 - 부분적 독립", "description": "최소한의 지도로 보드게임 참여"},
                {"order": 3, "name": "보드게임 참여 - 독립적 수행", "description": "보조 없이 보드게임 지속"},
                {"order": 4, "name": "보드게임 참여 - 일반화", "description": "다양한 게임, 여러 또래와 참여"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인과 함께 → 2. 성인 가이드 → 3. 약간의 지도 → 4. 독립적 게임",
                "reinforcement": "규칙 준수, 차례 지키기 후 칭찬",
                "error_correction": "규칙 이탈 시 부드럽게 교정",
                "generalization": "다양한 게임, 다양한 또래 그룹",
                "data_collection": "게임 지속 시간, 규칙 이해도, 차례 준수율 기록",
                "prerequisite": "차례 지키기, 간단한 규칙 이해",
                "motivation": "게임의 즐거움, 승리의 경험",
                "family_involvement": "부모에게 가족 게임 시간 제공 요청"
            }
        },
        {
            "id": "domain_play_lto11",
            "order": 11,
            "name": "카드게임 참여",
            "goal": "카드 게임 규칙을 이해하고 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "카드게임 참여 - 보조 있이 시도", "description": "성인 지도로 카드게임 시도"},
                {"order": 2, "name": "카드게임 참여 - 부분적 독립", "description": "최소한의 지도로 카드게임 참여"},
                {"order": 3, "name": "카드게임 참여 - 독립적 수행", "description": "보조 없이 카드게임 지속"},
                {"order": 4, "name": "카드게임 참여 - 일반화", "description": "다양한 카드게임으로 참여 확대"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 주도 → 2. 성인 가이드 → 3. 최소 지도 → 4. 독립적 게임",
                "reinforcement": "올바른 카드 선택, 규칙 준수 후 칭찬",
                "error_correction": "잘못된 선택 시 부드럽게 안내",
                "generalization": "다양한 카드게임, 다양한 또래",
                "data_collection": "게임 지속 시간, 카드 이해도, 규칙 준수율 기록",
                "prerequisite": "색깔/숫자 구분, 간단한 규칙 이해",
                "motivation": "게임의 재미, 승리의 경험",
                "family_involvement": "부모에게 카드게임을 통한 학습 격려 요청"
            }
        },
        {
            "id": "domain_play_lto12",
            "order": 12,
            "name": "상상 놀이",
            "goal": "현실과 다른 상황을 가정하고 상상적으로 표현하는 놀이",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "상상 놀이 - 보조 있이 시도", "description": "성인의 모델링으로 상상 놀이 시도"},
                {"order": 2, "name": "상상 놀이 - 부분적 독립", "description": "최소한의 지도로 상상 놀이 참여"},
                {"order": 3, "name": "상상 놀이 - 독립적 수행", "description": "보조 없이 상상 놀이 지속"},
                {"order": 4, "name": "상상 놀이 - 일반화", "description": "다양한 상상적 시나리오로 놀이 확대"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 주도 상상 놀이 → 2. 성인 안내 → 3. 약간의 힌트 → 4. 자유로운 상상",
                "reinforcement": "창의적 표현에 대한 칭찬",
                "error_correction": "부정적 상상 시 긍정적 방향으로 리디렉트",
                "generalization": "다양한 상황, 다양한 또래와의 상상 놀이",
                "data_collection": "상상 놀이 지속 시간, 창의성, 또래와의 조화 기록",
                "prerequisite": "역할극 참여, 언어 발달",
                "motivation": "상상의 즐거움, 창의적 표현의 인정",
                "family_involvement": "부모에게 상상 놀이 격려 및 함께 하기 요청"
            }
        },
        {
            "id": "domain_play_lto13",
            "order": 13,
            "name": "야외 놀이",
            "goal": "실외 환경에서 다양한 놀이 활동에 참여하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "야외 놀이 - 보조 있이 시도", "description": "성인 지도로 야외 놀이 시도"},
                {"order": 2, "name": "야외 놀이 - 부분적 독립", "description": "최소한의 지도로 야외 놀이 참여"},
                {"order": 3, "name": "야외 놀이 - 독립적 수행", "description": "보조 없이 야외 놀이 지속"},
                {"order": 4, "name": "야외 놀이 - 일반화", "description": "다양한 야외 환경, 계절에서 놀이"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인과 함께 → 2. 근처에서 관찰 → 3. 관심만 유지 → 4. 자유로운 탐험",
                "reinforcement": "야외 활동 참여 및 탐험 후 칭찬",
                "error_correction": "안전 관련 행동 시 즉시 개입",
                "generalization": "다양한 야외 환경(공원, 해변, 숲), 계절",
                "data_collection": "야외 놀이 시간, 활동 범위, 탐험도 기록",
                "prerequisite": "안전 이해, 대근육 발달",
                "motivation": "자연과의 상호작용, 탐험의 즐거움",
                "family_involvement": "부모에게 야외 활동 기회 확대 요청"
            }
        },
        {
            "id": "domain_play_lto14",
            "order": 14,
            "name": "상호작용적 놀이",
            "goal": "다른 사람과 적극적으로 상호작용하며 놀이하기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "상호작용적 놀이 - 보조 있이 시도", "description": "성인 중재로 상호작용적 놀이 시도"},
                {"order": 2, "name": "상호작용적 놀이 - 부분적 독립", "description": "최소한의 지도로 상호작용적 놀이"},
                {"order": 3, "name": "상호작용적 놀이 - 독립적 수행", "description": "보조 없이 상호작용적 놀이 지속"},
                {"order": 4, "name": "상호작용적 놀이 - 일반화", "description": "다양한 또래, 다양한 놀이에서 상호작용"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 성인 주도 → 2. 성인 가이드 → 3. 약간의 촉진 → 4. 독립적 상호작용",
                "reinforcement": "긍정적 상호작용 후 칭찬 강조",
                "error_correction": "부정적 상호작용 시 적절한 기술 모델링",
                "generalization": "다양한 또래, 그룹 크기, 놀이 유형",
                "data_collection": "상호작용 빈도, 지속시간, 긍정성 기록",
                "prerequisite": "협력 놀이, 함께 놀기",
                "motivation": "상호작용의 즐거움, 또래와의 유대",
                "family_involvement": "부모에게 또래와의 상호작용 기회 제공 요청"
            }
        },
        {
            "id": "domain_play_lto15",
            "order": 15,
            "name": "놀이 규칙 이해하기",
            "goal": "다양한 놀이와 게임의 규칙을 이해하고 따르기",
            "stoCount": 4,
            "stos": [
                {"order": 1, "name": "놀이 규칙 이해하기 - 보조 있이 시도", "description": "규칙 설명과 함께 놀이 시도"},
                {"order": 2, "name": "놀이 규칙 이해하기 - 부분적 독립", "description": "최소한의 상기로 규칙 따르기"},
                {"order": 3, "name": "놀이 규칙 이해하기 - 독립적 수행", "description": "보조 없이 규칙 준수하며 놀이"},
                {"order": 4, "name": "놀이 규칙 이해하기 - 일반화", "description": "다양한 새로운 놀이 규칙 신속히 이해"}
            ],
            "teachingTips": {
                "prompt_hierarchy": "1. 시범과 설명 → 2. 직접 경험 안내 → 3. 상기 → 4. 독립적 이해",
                "reinforcement": "규칙 준수 후 칭찬",
                "error_correction": "규칙 이탈 시 부드럽게 상기 및 교정",
                "generalization": "다양한 게임, 다양한 규칙 복잡도",
                "data_collection": "규칙 이해 속도, 준수율, 보조 필요성 기록",
                "prerequisite": "언어 이해, 주의집중",
                "motivation": "규칙 준수를 통한 게임 성공의 즐거움",
                "family_involvement": "부모에게 다양한 게임을 통한 규칙 학습 요청"
            }
        }
    ]
    return ltos

# Generate all data
social_ltos = generate_social_ltos()
play_ltos = generate_play_ltos()

# Print JSON for first domain
print("## Stream P3 결과\n")
print("### Domain Social (15개 LTO)")
print(json.dumps(social_ltos, ensure_ascii=False, indent=2))
print("\n### Domain Play (15개 LTO)")
print(json.dumps(play_ltos, ensure_ascii=False, indent=2))
