#!/usr/bin/env python3
"""
AKMS Curriculum Data Generator
Generates 14 VB domains with 240+ LTOs based on the Verbal Behavior framework
and myABAData curriculum structure.
"""

import json
from typing import List, Dict, Any

DOMAINS = [
    {
        "id": "domain_mand",
        "name": "요청(Mand)",
        "description": "아동이 원하는 것을 요청하는 언어 기술",
        "color": "#FF6B6B",
    },
    {
        "id": "domain_tact",
        "name": "명명(Tact)",
        "description": "환경의 자극에 대해 명명하는 언어 기술",
        "color": "#4ECDC4",
    },
    {
        "id": "domain_intraverbal",
        "name": "상호언어(Intraverbal)",
        "description": "타인의 언어 자극에 반응하여 언어하는 기술",
        "color": "#45B7D1",
    },
    {
        "id": "domain_echoic",
        "name": "따라말하기(Echoic)",
        "description": "타인의 언어를 따라하는 기술",
        "color": "#96CEB4",
    },
    {
        "id": "domain_receptive",
        "name": "수용언어(Receptive)",
        "description": "언어를 이해하고 반응하는 기술",
        "color": "#FFEAA7",
    },
    {
        "id": "domain_social",
        "name": "사회성(Social)",
        "description": "다른 사람과의 상호작용 및 의사소통 기술",
        "color": "#DDA0DD",
    },
    {
        "id": "domain_motor",
        "name": "소근육발달(Fine Motor)",
        "description": "손가락, 손, 팔의 정교한 움직임 발달",
        "color": "#FFB6C1",
    },
    {
        "id": "domain_gross_motor",
        "name": "대근육발달(Gross Motor)",
        "description": "머리, 몸통, 팔, 다리의 큰 근육 발달",
        "color": "#87CEEB",
    },
    {
        "id": "domain_play",
        "name": "놀이(Play Skills)",
        "description": "혼자 또는 타인과 놀이하는 기술",
        "color": "#FFD700",
    },
    {
        "id": "domain_academic",
        "name": "학업기초(Academic Skills)",
        "description": "읽기, 쓰기, 수학 등 학업 기초 기술",
        "color": "#87CEEB",
    },
    {
        "id": "domain_self_care",
        "name": "생활기술(Self-Care)",
        "description": "식사, 화장실 사용, 옷 입기 등 자조 기술",
        "color": "#90EE90",
    },
    {
        "id": "domain_behavior",
        "name": "행동관리(Behavior Management)",
        "description": "행동 제어 및 자기조절 기술",
        "color": "#FFA07A",
    },
    {
        "id": "domain_compliance",
        "name": "지시따르기(Compliance)",
        "description": "성인의 지시를 따르는 기술",
        "color": "#FF8C00",
    },
    {
        "id": "domain_attention",
        "name": "주의집중(Attention)",
        "description": "특정 자극에 주의를 기울이는 기술",
        "color": "#4169E1",
    },
]

# Define LTOs for each domain
DOMAIN_LTOS = {
    "domain_mand": [
        {"order": 1, "name": "일반적인 물건 요청하기", "goal": "단어나 문장으로 원하는 물건을 요청"},
        {"order": 2, "name": "음식/음료 요청하기", "goal": "원하는 음식이나 음료를 명확히 요청"},
        {"order": 3, "name": "활동 요청하기", "goal": "원하는 활동을 명시적으로 요청"},
        {"order": 4, "name": "도움 요청하기", "goal": "도움이 필요할 때 도움을 청하기"},
        {"order": 5, "name": "휴식 요청하기", "goal": "쉬고 싶을 때 휴식을 요청"},
        {"order": 6, "name": "'더' 요청하기", "goal": "더 많은 것을 요청하기"},
        {"order": 7, "name": "주의 요청하기", "goal": "타인의 주의를 끌기 위해 요청"},
        {"order": 8, "name": "정보 요청하기(질문)", "goal": "정보나 설명을 요청하는 질문하기"},
        {"order": 9, "name": "거절/싫음 표현하기", "goal": "원하지 않는 것을 명확히 거절"},
        {"order": 10, "name": "선호 표현하기", "goal": "선호하는 것을 명확히 표현"},
        {"order": 11, "name": "허락 요청하기", "goal": "무언가를 해도 되는지 물어보기"},
        {"order": 12, "name": "화장실 사용 요청하기", "goal": "화장실을 가고 싶을 때 요청"},
        {"order": 13, "name": "이야기 해주기 요청", "goal": "이야기나 책을 읽어달라고 요청"},
        {"order": 14, "name": "친구와 함께 놀기 요청", "goal": "함께 놀 것을 제안하고 요청"},
        {"order": 15, "name": "먹을 것/음료 제공받기", "goal": "음식이나 음료를 받기 위해 요청"},
        {"order": 16, "name": "물건 주기/주고받기", "goal": "물건을 나누고 주고받기를 요청"},
        {"order": 17, "name": "복잡한 문장으로 요청하기", "goal": "여러 단어 또는 문장으로 구체적 요청"},
        {"order": 18, "name": "사회적 상황에서 요청하기", "goal": "여러 사람이 있는 상황에서 적절히 요청"},
    ],
    "domain_tact": [
        {"order": 1, "name": "일반 사물 명명하기", "goal": "흔한 물건의 이름 말하기"},
        {"order": 2, "name": "동물 명명하기", "goal": "다양한 동물의 이름 말하기"},
        {"order": 3, "name": "음식 명명하기", "goal": "여러 음식의 이름 말하기"},
        {"order": 4, "name": "신체부위 명명하기", "goal": "자신과 타인의 신체 부위 명명"},
        {"order": 5, "name": "색깔 명명하기", "goal": "다양한 색깔 구분하고 명명"},
        {"order": 6, "name": "모양 명명하기", "goal": "원, 네모, 삼각형 등 모양 명명"},
        {"order": 7, "name": "행동 명명하기", "goal": "다양한 행동을 동사로 표현"},
        {"order": 8, "name": "느낌/감정 명명하기", "goal": "감정 상태를 단어로 표현"},
        {"order": 9, "name": "위치 명명하기", "goal": "물건의 위치를 설명"},
        {"order": 10, "name": "숫자 명명하기", "goal": "1부터 10까지 숫자 말하기"},
        {"order": 11, "name": "글자 명명하기", "goal": "알파벳 또는 한글 글자 말하기"},
        {"order": 12, "name": "사람 명명하기", "goal": "자신 또는 타인의 이름 말하기"},
        {"order": 13, "name": "날씨 명명하기", "goal": "날씨 상태 설명"},
        {"order": 14, "name": "옷 명명하기", "goal": "의류 이름 명명"},
        {"order": 15, "name": "그림 설명하기", "goal": "그림의 내용을 단어로 설명"},
        {"order": 16, "name": "사진 설명하기", "goal": "사진의 내용을 말로 표현"},
        {"order": 17, "name": "복잡한 장면 설명하기", "goal": "여러 요소가 있는 상황 설명"},
        {"order": 18, "name": "추상적 개념 명명하기", "goal": "시간, 크기 등 추상 개념 표현"},
    ],
    "domain_intraverbal": [
        {"order": 1, "name": "간단한 질문에 대답하기", "goal": "기본 질문('뭐야?', '누가?')에 대답"},
        {"order": 2, "name": "자신에 대한 질문 대답하기", "goal": "이름, 나이 등 기본 정보 대답"},
        {"order": 3, "name": "좋아하는 것 말하기", "goal": "선호하는 물건/활동/사람 말하기"},
        {"order": 4, "name": "싫어하는 것 말하기", "goal": "싫어하는 것 표현하기"},
        {"order": 5, "name": "경험 공유하기", "goal": "과거 경험을 대답으로 공유"},
        {"order": 6, "name": "이유 설명하기", "goal": "'왜?'라는 질문에 이유로 대답"},
        {"order": 7, "name": "계속하기/마무리하기", "goal": "대화를 이어가거나 마무리"},
        {"order": 8, "name": "예/아니오 대답하기", "goal": "예/아니오 질문에 정확히 대답"},
        {"order": 9, "name": "선택하기(A vs B)", "goal": "두 가지 선택 중 하나 고르기"},
        {"order": 10, "name": "유사성 발견하기", "goal": "두 사물의 같은 점 찾기"},
        {"order": 11, "name": "차이점 찾기", "goal": "두 사물의 다른 점 찾기"},
        {"order": 12, "name": "분류하기", "goal": "같은 범주끼리 분류하기"},
        {"order": 13, "name": "관련 물건 말하기", "goal": "한 물건과 관련된 다른 물건 말하기"},
        {"order": 14, "name": "반대 개념 말하기", "goal": "반대 의미의 단어 말하기"},
        {"order": 15, "name": "함수적 관계 이해하기", "goal": "'손 씻으면 깨끗해진다' 등 인과관계 설명"},
        {"order": 16, "name": "계절/시간 관련 답하기", "goal": "계절, 시간에 관련된 질문 대답"},
        {"order": 17, "name": "복잡한 질문 이해하고 대답하기", "goal": "다단계 질문 정확히 이해하고 대답"},
        {"order": 18, "name": "대화의 흐름 따라가기", "goal": "주제를 유지하며 대화 지속"},
    ],
    "domain_echoic": [
        {"order": 1, "name": "단음절 따라 말하기", "goal": "한 글자 또는 음절 따라 말하기"},
        {"order": 2, "name": "두음절 단어 따라 말하기", "goal": "두 글자 단어 따라 말하기"},
        {"order": 3, "name": "세음절 이상 단어 따라 말하기", "goal": "긴 단어를 정확히 따라 말하기"},
        {"order": 4, "name": "간단한 문장 따라 말하기", "goal": "2-3단어 문장 따라 말하기"},
        {"order": 5, "name": "중간 길이 문장 따라 말하기", "goal": "4-6단어 문장 따라 말하기"},
        {"order": 6, "name": "긴 문장 따라 말하기", "goal": "7단어 이상 긴 문장 따라 말하기"},
        {"order": 7, "name": "새로운 단어 따라 말하기", "goal": "처음 들어본 단어 따라 말하기"},
        {"order": 8, "name": "자동 따라 말하기", "goal": "자극 없이도 자동으로 따라 말하기"},
        {"order": 9, "name": "음운 구분하기", "goal": "유사한 음을 구분하여 따라 말하기"},
        {"order": 10, "name": "음성 톤 모방하기", "goal": "다양한 톤으로 따라 말하기"},
        {"order": 11, "name": "복잡한 음성 패턴 모방", "goal": "복잡한 발음 정확히 따라 말하기"},
        {"order": 12, "name": "속도 조절하며 따라 말하기", "goal": "느리거나 빠른 속도로 따라 말하기"},
        {"order": 13, "name": "음악/리듬 따라 하기", "goal": "노래나 리듬에 맞춰 따라 말하기"},
        {"order": 14, "name": "의성어 따라 말하기", "goal": "동물 소리나 사물 소리 따라 하기"},
        {"order": 15, "name": "감정 표현 따라 말하기", "goal": "느낌을 담아 따라 말하기"},
        {"order": 16, "name": "다른 언어 음 따라 말하기", "goal": "영어 등 다른 언어 음 따라 말하기"},
        {"order": 17, "name": "방언이나 특수 발음 따라하기", "goal": "특별한 발음 패턴 따라 하기"},
        {"order": 18, "name": "높은 수준의 음성 모방", "goal": "미묘한 발음 차이까지 따라 말하기"},
    ],
    "domain_receptive": [
        {"order": 1, "name": "자신의 이름에 반응하기", "goal": "이름을 부르면 반응"},
        {"order": 2, "name": "'예'/'아니오' 이해하기", "goal": "긍정/부정 이해"},
        {"order": 3, "name": "간단한 지시 따르기", "goal": "'앉아', '일어나' 등 단순 지시 이해"},
        {"order": 4, "name": "두 가지 지시 따르기", "goal": "'일어나서 앉아' 등 2단계 지시 이해"},
        {"order": 5, "name": "사물 인식하기(지적)", "goal": "가리켜지는 물건 찾기"},
        {"order": 6, "name": "신체부위 찾기", "goal": "자신 또는 타인의 신체부위 가리키기"},
        {"order": 7, "name": "색깔 구분하기", "goal": "색깔 이름으로 물건 선택"},
        {"order": 8, "name": "모양 구분하기", "goal": "모양 이름으로 물건 선택"},
        {"order": 9, "name": "크기 이해하기", "goal": "'크다/작다' 지시 이해"},
        {"order": 10, "name": "위치/방향 이해하기", "goal": "'위/아래', '앞/뒤' 이해"},
        {"order": 11, "name": "동작 지시 이해하기", "goal": "다양한 행동 지시 따르기"},
        {"order": 12, "name": "수량 이해하기", "goal": "'하나/둘/많다' 등 수량 이해"},
        {"order": 13, "name": "문장으로 된 지시 따르기", "goal": "여러 단어 문장 지시 따르기"},
        {"order": 14, "name": "선택적 청취력", "goal": "배경 소음 속에서도 지시 따르기"},
        {"order": 15, "name": "성 구분하기", "goal": "남성/여성 목소리나 사람 구분"},
        {"order": 16, "name": "감정 톤 이해하기", "goal": "행복/슬픔 등 감정 톤 구분"},
        {"order": 17, "name": "복잡한 지시 이해하기", "goal": "조건부 지시 이해"},
        {"order": 18, "name": "맥락에서 의미 파악", "goal": "상황에 맞는 언어 이해"},
    ],
    "domain_social": [
        {"order": 1, "name": "눈맞춤하기", "goal": "타인과 안정적으로 눈맞춤"},
        {"order": 2, "name": "인사하기(손 흔들기)", "goal": "입장/퇴장 시 인사"},
        {"order": 3, "name": "인사말 말하기(안녕)", "goal": "'안녕하세요' 등 인사말 사용"},
        {"order": 4, "name": "감사 표현하기(고마워)", "goal": "감사할 때 고마움 표현"},
        {"order": 5, "name": "사과하기(미안해)", "goal": "잘못했을 때 사과"},
        {"order": 6, "name": "허락 구하기(괜찮아?)", "goal": "무언가 하기 전에 물어보기"},
        {"order": 7, "name": "차례 기다리기", "goal": "자신의 차례를 기다릴 수 있음"},
        {"order": 8, "name": "공유하기", "goal": "장난감이나 음식 나누기"},
        {"order": 9, "name": "도와주기", "goal": "타인을 도와주려는 의지 보이기"},
        {"order": 10, "name": "친구 이름 부르기", "goal": "친구를 이름으로 부르기"},
        {"order": 11, "name": "함께 놀기 제안하기", "goal": "함께 하고 싶은 활동 제안"},
        {"order": 12, "name": "상대방 말 경청하기", "goal": "타인이 말할 때 귀 기울이기"},
        {"order": 13, "name": "턴테이킹(차례 교대)", "goal": "대화 또는 활동에서 차례 지키기"},
        {"order": 14, "name": "감정 공감하기", "goal": "타인의 기분에 반응"},
        {"order": 15, "name": "칭찬하기", "goal": "타인을 칭찬하고 격려"},
        {"order": 16, "name": "거절 받아들이기", "goal": "원하는 것을 거절받아도 화내지 않기"},
        {"order": 17, "name": "게임 규칙 따르기", "goal": "정해진 게임 규칙 지키기"},
        {"order": 18, "name": "집단 활동 참여하기", "goal": "여러 사람과 함께 활동 참여"},
    ],
    "domain_motor": [
        {"order": 1, "name": "손가락 들기", "goal": "손가락을 개별적으로 움직이기"},
        {"order": 2, "name": "핸들 돌리기", "goal": "손목 회전으로 핸들 돌리기"},
        {"order": 3, "name": "페달 밟기", "goal": "삼륜차 또는 자전거 페달 밟기"},
        {"order": 4, "name": "포개기", "goal": "적목/좌우 조정하여 물건 쌓기"},
        {"order": 5, "name": "누르기", "goal": "정밀한 압력 조정으로 누르기"},
        {"order": 6, "name": "집기(핀셀그립)", "goal": "엄지와 검지로 집기"},
        {"order": 7, "name": "나사 조이기/풀기", "goal": "나사 돌려 조이거나 풀기"},
        {"order": 8, "name": "버튼 누르기", "goal": "버튼을 정확히 누르기"},
        {"order": 9, "name": "자르기(가위)", "goal": "가위로 종이나 실 자르기"},
        {"order": 10, "name": "색칠하기", "goal": "색연필로 그림 칠하기"},
        {"order": 11, "name": "선 따라 그리기", "goal": "점선이나 선 따라 그리기"},
        {"order": 12, "name": "원 그리기", "goal": "대략적인 원 그리기"},
        {"order": 13, "name": "글자 따라 그리기", "goal": "점선 글자 따라 그리기"},
        {"order": 14, "name": "끼우기/빼기", "goal": "구슬을 끈에 끼우거나 빼기"},
        {"order": 15, "name": "쌓기(적목)", "goal": "블록을 적목하여 쌓기"},
        {"order": 16, "name": "손가락 페인팅", "goal": "손가락으로 그림 그리기"},
        {"order": 17, "name": "딱딱거리기/터치", "goal": "스크린이나 버튼 터치하기"},
        {"order": 18, "name": "미세한 물건 집어 놓기", "goal": "작은 물건을 정확한 위치에 놓기"},
    ],
    "domain_gross_motor": [
        {"order": 1, "name": "목 통제", "goal": "목을 안정적으로 세우기"},
        {"order": 2, "name": "뒤집기", "goal": "누웠다가 옆으로 뒤집기"},
        {"order": 3, "name": "앉기", "goal": "지지 없이 앉기"},
        {"order": 4, "name": "네발기기", "goal": "손과 무릎으로 움직이기"},
        {"order": 5, "name": "일어서기(끌어당기며)", "goal": "물건을 잡고 일어서기"},
        {"order": 6, "name": "설 때 균형 잡기", "goal": "도움 없이 서 있기"},
        {"order": 7, "name": "걷기", "goal": "안정적으로 걷기"},
        {"order": 8, "name": "계단 올라가기(도움)", "goal": "손을 잡고 계단 오르기"},
        {"order": 9, "name": "계단 내려가기(도움)", "goal": "손을 잡고 계단 내려오기"},
        {"order": 10, "name": "뛰기", "goal": "두 발을 모두 떨어뜨려 뛰기"},
        {"order": 11, "name": "양발 도약하기", "goal": "한쪽 발로 뛰어가기"},
        {"order": 12, "name": "한발로 서기", "goal": "균형을 잡고 한발로 서기"},
        {"order": 13, "name": "던지기(상향)", "goal": "공을 위로 던지기"},
        {"order": 14, "name": "던지기(수평)", "goal": "공을 앞으로 던지기"},
        {"order": 15, "name": "차기", "goal": "공이나 물건 차기"},
        {"order": 16, "name": "점프하기(제자리)", "goal": "제자리에서 점프"},
        {"order": 17, "name": "자전거 타기", "goal": "페달로 자전거 타기"},
        {"order": 18, "name": "스키, 스케이트 등", "goal": "스키나 스케이트 타기"},
    ],
    "domain_play": [
        {"order": 1, "name": "물건 탐색하기", "goal": "새로운 물건 탐색"},
        {"order": 2, "name": "감각 놀이(까꿍)", "goal": "짧은 감각 놀이 참여"},
        {"order": 3, "name": "혼자 놀이하기", "goal": "지시 없이 혼자 장난감 가지고 놀기"},
        {"order": 4, "name": "병렬 놀이(나란히)", "goal": "타인 근처에서 함께 놀기"},
        {"order": 5, "name": "모방 놀이", "goal": "성인이 하는 행동 모방하며 놀기"},
        {"order": 6, "name": "기능적 놀이", "goal": "물건을 정상적으로 사용하며 놀기"},
        {"order": 7, "name": "상징적 놀이", "goal": "막대를 총처럼 가정하여 놀기"},
        {"order": 8, "name": "협력 놀이", "goal": "다른 아이와 함께 협력하며 놀기"},
        {"order": 9, "name": "게임 규칙 이해하기", "goal": "간단한 게임 규칙 따르기"},
        {"order": 10, "name": "역할 놀이", "goal": "가족, 병원 등 역할 맡아 놀이"},
        {"order": 11, "name": "상상 놀이", "goal": "현실이 아닌 상황으로 가정하여 놀이"},
        {"order": 12, "name": "스포츠/운동 게임", "goal": "축구, 술래잡기 등 게임 참여"},
        {"order": 13, "name": "음악 놀이", "goal": "악기 연주하며 놀기"},
        {"order": 14, "name": "실외 놀이", "goal": "미끄럼틀, 그네 등 실외 시설 이용"},
        {"order": 15, "name": "장난감 교환하기", "goal": "장난감을 나누며 놀기"},
        {"order": 16, "name": "팀 게임 참여하기", "goal": "팀을 나누어 게임 하기"},
        {"order": 17, "name": "경쟁 수용하기", "goal": "경쟁에서 지거나 이겨도 반응 조절"},
        {"order": 18, "name": "복합 규칙 게임", "goal": "여러 규칙이 있는 게임 이해하고 참여"},
    ],
    "domain_academic": [
        {"order": 1, "name": "책 관심 보이기", "goal": "책에 관심 가지고 참여"},
        {"order": 2, "name": "그림 가리키기", "goal": "책 속 그림 가리키기"},
        {"order": 3, "name": "글자 인식하기", "goal": "익숙한 글자 인식"},
        {"order": 4, "name": "자신의 이름 읽기", "goal": "자신의 이름 글자 읽기"},
        {"order": 5, "name": "단어 읽기(CVC)", "goal": "간단한 3글자 단어 읽기"},
        {"order": 6, "name": "문장 읽기(3단어)", "goal": "간단한 문장 읽기"},
        {"order": 7, "name": "색칠 안에 칠하기", "goal": "정해진 영역 내에 칠하기"},
        {"order": 8, "name": "직선 긋기", "goal": "직선을 따라 긋기"},
        {"order": 9, "name": "원 그리기", "goal": "점선 원 따라 그리기"},
        {"order": 10, "name": "글자 쓰기(대문자)", "goal": "대문자 글자 쓰기"},
        {"order": 11, "name": "글자 쓰기(소문자)", "goal": "소문자 글자 쓰기"},
        {"order": 12, "name": "간단한 단어 쓰기", "goal": "받침없는 단어 쓰기"},
        {"order": 13, "name": "1부터 10까지 세기", "goal": "순서대로 숫자 세기"},
        {"order": 14, "name": "수 인식(1-5)", "goal": "1부터 5까지 수 인식"},
        {"order": 15, "name": "수 인식(1-10)", "goal": "1부터 10까지 수 인식"},
        {"order": 16, "name": "더하기(1+1)", "goal": "간단한 덧셈 이해"},
        {"order": 17, "name": "빼기(2-1)", "goal": "간단한 뺄셈 이해"},
        {"order": 18, "name": "패턴 인식하기", "goal": "색상 또는 도형 패턴 이해"},
    ],
    "domain_self_care": [
        {"order": 1, "name": "물 마시기(컵)", "goal": "컵에서 물 마시기"},
        {"order": 2, "name": "수저로 먹기", "goal": "수저로 음식 집어먹기"},
        {"order": 3, "name": "포크로 먹기", "goal": "포크로 음식 집어먹기"},
        {"order": 4, "name": "입 닦기", "goal": "냅킨으로 입 닦기"},
        {"order": 5, "name": "손 씻기(도움)", "goal": "물에 손 적시고 씻기"},
        {"order": 6, "name": "손 말리기", "goal": "타올로 손 말리기"},
        {"order": 7, "name": "얼굴 씻기", "goal": "따뜻한 물로 얼굴 씻기"},
        {"order": 8, "name": "양치질하기(도움)", "goal": "칫솔로 이 닦기"},
        {"order": 9, "name": "머리 감기(도움)", "goal": "샴푸로 머리 감기"},
        {"order": 10, "name": "팬츠 내리기", "goal": "화장실 사용 전 옷 내리기"},
        {"order": 11, "name": "화장실 사용하기(도움)", "goal": "화장실에 앉아 용변보기"},
        {"order": 12, "name": "화장지 사용하기(도움)", "goal": "화장지로 닦기"},
        {"order": 13, "name": "물 내리기", "goal": "변기 물 내리기"},
        {"order": 14, "name": "팬츠 올리기", "goal": "화장실 후 옷 올리기"},
        {"order": 15, "name": "셔츠 벗기(도움)", "goal": "옷 벗을 때 협력"},
        {"order": 16, "name": "셔츠 입기(도움)", "goal": "옷 입을 때 협력"},
        {"order": 17, "name": "신발 신고 벗기(도움)", "goal": "신발 신고 벗기"},
        {"order": 18, "name": "양말 신기(도움)", "goal": "양말 신기 시도"},
    ],
    "domain_behavior": [
        {"order": 1, "name": "주의 전환하기", "goal": "한 활동에서 다른 활동으로 관심 전환"},
        {"order": 2, "name": "기다리기(짧은 시간)", "goal": "짧은 시간 기다리기"},
        {"order": 3, "name": "기다리기(긴 시간)", "goal": "더 오래 기다릴 수 있음"},
        {"order": 4, "name": "차례 양보하기", "goal": "타인의 차례를 인정하고 양보"},
        {"order": 5, "name": "화내지 않기(가벼운 거절)", "goal": "작은 거절에 화내지 않기"},
        {"order": 6, "name": "화내지 않기(큰 거절)", "goal": "원하던 것을 거절받아도 침착"},
        {"order": 7, "name": "좌절감 다루기", "goal": "어려운 과제에서 좌절감 표현 조절"},
        {"order": 8, "name": "손 올렸다 내리기", "goal": "손 들었다 자제력으로 내리기"},
        {"order": 9, "name": "목소리 낮추기", "goal": "큰 목소리를 낮추기"},
        {"order": 10, "name": "안 되는 것 받아들이기", "goal": "'안 돼' 말을 받아들이기"},
        {"order": 11, "name": "도움 받아들이기", "goal": "필요할 때 도움 받기"},
        {"order": 12, "name": "실수 수용하기", "goal": "자신의 실수를 인정"},
        {"order": 13, "name": "건강한 방법으로 스트레스 표현", "goal": "적절한 방법으로 감정 표현"},
        {"order": 14, "name": "깊은 숨쉬기", "goal": "진정하기 위해 깊이 숨쉬기"},
        {"order": 15, "name": "신체 이완하기", "goal": "근육 이완으로 진정하기"},
        {"order": 16, "name": "타임아웃 받아들이기", "goal": "타임아웃이 필요할 때 받아들이기"},
        {"order": 17, "name": "과제 완료하기", "goal": "주어진 과제 완료 후 멈추기"},
        {"order": 18, "name": "전환 준비하기", "goal": "다음 활동 준비 신호에 응하기"},
    ],
    "domain_compliance": [
        {"order": 1, "name": "간단한 지시 따르기(1단계)", "goal": "'앉아' 등 한 가지 지시 따르기"},
        {"order": 2, "name": "두 가지 지시 따르기", "goal": "'일어나서 손 들어' 등 2단계 지시"},
        {"order": 3, "name": "세 가지 지시 따르기", "goal": "3단계 이상 지시 따르기"},
        {"order": 4, "name": "제한된 시간 내 따르기", "goal": "시간 제한이 있는 지시 따르기"},
        {"order": 5, "name": "그룹 지시 따르기", "goal": "단체 상황에서 지시 따르기"},
        {"order": 6, "name": "새로운 성인의 지시 따르기", "goal": "처음 만나는 성인 지시 따르기"},
        {"order": 7, "name": "어려운 과제 지시 따르기", "goal": "도전적인 과제 완료 지시 따르기"},
        {"order": 8, "name": "'아니오' 지시 따르기", "goal": "'하지 마' 등 금지 지시 따르기"},
        {"order": 9, "name": "조건부 지시 따르기", "goal": "'먼저...하면...해' 지시 따르기"},
        {"order": 10, "name": "지연된 지시 따르기", "goal": "지시 후 시간이 지난 후 따르기"},
        {"order": 11, "name": "문제 행동 멈추기", "goal": "부적절한 행동 지시에 따라 멈추기"},
        {"order": 12, "name": "차이가 나는 지시 따르기", "goal": "예상과 다른 지시 수용하기"},
        {"order": 13, "name": "복잡한 문장 지시 이해하기", "goal": "복잡한 표현의 지시 이해"},
        {"order": 14, "name": "비언어적 지시 따르기(손가락)", "goal": "손가락질로 방향 지시 따르기"},
        {"order": 15, "name": "시각적 지시 따르기", "goal": "그림이나 이미지 지시 따르기"},
        {"order": 16, "name": "제스처 이해하기(흔들기)", "goal": "흔드는 제스처 이해"},
        {"order": 17, "name": "제스처 이해하기(가리키기)", "goal": "가리키는 제스처 이해"},
        {"order": 18, "name": "맥락에서 지시 추론하기", "goal": "상황에서 지시 읽어내기"},
    ],
    "domain_attention": [
        {"order": 1, "name": "음성에 반응하기", "goal": "음성에 고개를 돌리기"},
        {"order": 2, "name": "얼굴에 주의 기울이기", "goal": "성인 얼굴 바라보기"},
        {"order": 3, "name": "손가락질 따라보기", "goal": "손가락질 한 방향 바라보기"},
        {"order": 4, "name": "같은 곳 여러 번 주시하기", "goal": "제시된 물건에 반복 주시"},
        {"order": 5, "name": "활동에 참여하기(짧은 시간)", "goal": "30초 정도 활동 참여"},
        {"order": 6, "name": "활동에 참여하기(중간 시간)", "goal": "1-2분 활동 참여"},
        {"order": 7, "name": "활동에 참여하기(긴 시간)", "goal": "3-5분 이상 참여"},
        {"order": 8, "name": "여러 자극 중 선택적 주의", "goal": "배경 소음 중 특정 소리 반응"},
        {"order": 9, "name": "중단 후 재개하기", "goal": "중단했던 활동 다시 집중"},
        {"order": 10, "name": "시각적 추적(좌우)", "goal": "좌우로 움직이는 물건 추적"},
        {"order": 11, "name": "시각적 추적(상하)", "goal": "위아래로 움직이는 물건 추적"},
        {"order": 12, "name": "새로운 자극에 주의", "goal": "새 물건이 나타나면 주시"},
        {"order": 13, "name": "자극 변화 감지", "goal": "달라진 점 감지"},
        {"order": 14, "name": "점진적 길이 증가에 따르기", "goal": "점점 더 오래 집중"},
        {"order": 15, "name": "복합 자극 중 주의", "goal": "여러 자극이 있을 때 한 가지에 집중"},
        {"order": 16, "name": "시각적 검색", "goal": "여러 물건 중 특정 물건 찾기"},
        {"order": 17, "name": "청각 인식(방향)", "goal": "음성의 출처 파악"},
        {"order": 18, "name": "지속적 주의력", "goal": "반복적인 과제에 계속 집중"},
    ],
}

def generate_sto_list(lto_name: str, lto_order: int) -> List[Dict[str, Any]]:
    """Generate STOs (Short-Term Objectives) for each LTO."""
    base_sto = [
        {
            "order": 1,
            "name": f"{lto_name} - 보조 있이 시도",
            "description": f"성인의 신체적/언어적 보조로 {lto_name} 시도"
        },
        {
            "order": 2,
            "name": f"{lto_name} - 부분적 독립",
            "description": f"최소한의 보조로 {lto_name} 수행"
        },
        {
            "order": 3,
            "name": f"{lto_name} - 독립적 수행",
            "description": f"보조 없이 {lto_name} 독립적으로 수행"
        },
        {
            "order": 4,
            "name": f"{lto_name} - 일반화",
            "description": f"다양한 상황에서 {lto_name} 적용"
        },
    ]
    return base_sto

def generate_teaching_tips(domain_name: str, lto_name: str) -> Dict[str, str]:
    """Generate teaching tips for each LTO."""
    return {
        "prompt_hierarchy": "1. 모델링 → 2. 신체적 보조 → 3. 언어적 힌트 → 4. 점진적 보조 감소",
        "reinforcement": "행동 직후 즉시 강화(칭찬, 상/활동)",
        "error_correction": "오류 발생 시 즉시 모델링으로 교정하고 다시 시도",
        "generalization": "다양한 환경, 사람, 물건으로 일반화 훈련",
        "data_collection": "ABC 데이터(선행사건-행동-결과) 매일 기록",
        "prerequisite": "선수 기술 확인 후 교수 시작",
        "motivation": "선호하는 강화물 사용하여 동기 유발",
        "family_involvement": "부모에게 가정에서 시행할 방법 교육",
    }

def main():
    """Generate complete curriculum data."""
    curriculum = {
        "version": "1.0",
        "lastUpdated": "2024-04-26",
        "totalDomains": len(DOMAINS),
        "domains": []
    }

    total_ltos = 0

    for domain in DOMAINS:
        domain_id = domain["id"]
        ltos_for_domain = DOMAIN_LTOS.get(domain_id, [])
        total_ltos += len(ltos_for_domain)

        domain_data = {
            "id": domain["id"],
            "name": domain["name"],
            "description": domain["description"],
            "color": domain["color"],
            "ltoCount": len(ltos_for_domain),
            "ltos": []
        }

        for lto in ltos_for_domain:
            lto_data = {
                "id": f"{domain_id}_lto{lto['order']:02d}",
                "order": lto["order"],
                "name": lto["name"],
                "goal": lto["goal"],
                "stoCount": 4,
                "stos": generate_sto_list(lto["name"], lto["order"]),
                "teachingTips": generate_teaching_tips(domain["name"], lto["name"]),
            }
            domain_data["ltos"].append(lto_data)

        curriculum["domains"].append(domain_data)

    curriculum["totalLTOs"] = total_ltos

    # Write to file
    output_path = "e:\\kinder-management\\frontend\\src\\data\\curriculum.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(curriculum, f, ensure_ascii=False, indent=2)

    print(f"✅ Curriculum generated successfully!")
    print(f"   📊 Domains: {curriculum['totalDomains']}")
    print(f"   📚 Total LTOs: {curriculum['totalLTOs']}")
    print(f"   ✏️ Total STOs: {curriculum['totalLTOs'] * 4}")
    print(f"   📝 Output: {output_path}")

if __name__ == "__main__":
    main()
