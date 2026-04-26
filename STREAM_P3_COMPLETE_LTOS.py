#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AKMS Phase 2 Stream P3: 사회 및 생활 도메인 LTO 생성
총 60개의 LTO (Social 15, Play 15, Self-Care 15, Safety 15)
"""

import json

# Import from the generated modules
exec(open('/e/kinder-management/generate_stream_p3_ltos.py').read())
exec(open('/e/kinder-management/generate_stream_p3_ltos_part2.py').read())

# Create complete output structure
output = {
    "title": "AKMS Phase 2 Stream P3 - 사회 및 생활 도메인 LTO",
    "description": "총 60개의 LTO 생성 (4개 도메인 × 15개)",
    "domains": {
        "domain_social": {
            "name": "사회성 (Social)",
            "order": 1,
            "ltos": social_ltos
        },
        "domain_play": {
            "name": "놀이 (Play)",
            "order": 2,
            "ltos": play_ltos
        },
        "domain_selfcare": {
            "name": "자기관리 (Self-Care)",
            "order": 3,
            "ltos": selfcare_ltos
        },
        "domain_safety": {
            "name": "안전 (Safety)",
            "order": 4,
            "ltos": safety_ltos
        }
    }
}

# Write to file
with open('/e/kinder-management/STREAM_P3_COMPLETE_LTOS.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("STREAM P3 LTO generation completed!")
print(f"Total LTOs generated: {sum(len(output['domains'][d]['ltos']) for d in output['domains'])}")
print(f"Output file: /e/kinder-management/STREAM_P3_COMPLETE_LTOS.json")

# Print summary
print("\n=== Stream P3 결과 요약 ===")
print(f"\n총 4개 도메인에서 60개의 LTO 생성 완료:")
for domain_key, domain_data in output['domains'].items():
    print(f"  - {domain_data['name']}: {len(domain_data['ltos'])}개")
