"""
BMAD × LangGraph State Schema
Typed state for full-stack orchestration with artifact persistence.
"""

from typing import TypedDict, Optional, List, Any
from datetime import datetime


class ArtifactPhase1(TypedDict, total=False):
    """Phase 1: Analysis - Project Brief & Requirements"""
    project_brief: str
    scope_analysis: str
    stakeholder_summary: str
    risk_assessment: str


class ArtifactPhase2(TypedDict, total=False):
    """Phase 2: Planning - Requirements & Design Specs"""
    prd_backend: str
    api_specification: str
    data_model_refined: str
    deployment_strategy: str


class ArtifactPhase3(TypedDict, total=False):
    """Phase 3: Solutioning - Architecture & Decomposition"""
    backend_architecture: str
    prisma_schema: str
    hono_routes_spec: str
    database_indexes: str
    service_layer_design: str
    error_handling_strategy: str
    epics_backend: str
    stories_backend: str


class ArtifactPhase4(TypedDict, total=False):
    """Phase 4: Implementation - Code & QA"""
    source_files: dict  # {filepath: content}
    migration_files: dict  # {name: sql_content}
    test_files: dict  # {filepath: test_content}
    qa_report: str
    performance_report: str
    security_checklist: str
    implementation_summary: str


class FullStackState(TypedDict, total=False):
    """Complete state for BMAD × LangGraph orchestration"""

    # Project Context
    project_name: str
    project_description: str
    tech_stack: dict  # {frontend, backend, database, deployment}

    # User Input & Preferences
    user_request: str
    conversation_history: List[dict]

    # Phase Artifacts
    phase1: ArtifactPhase1
    phase2: ArtifactPhase2
    phase3: ArtifactPhase3
    phase4: ArtifactPhase4

    # Referenced Existing Docs
    existing_project_brief: Optional[str]
    existing_prd: Optional[str]
    existing_ux_spec: Optional[str]
    existing_architecture: Optional[str]
    existing_epics_stories: Optional[str]
    existing_code_conventions: Optional[str]
    existing_adr: Optional[str]

    # Orchestration State
    current_phase: str  # "analysis", "planning", "solutioning", "implementation"
    phase_approvals: dict  # {phase: approved_at_timestamp}
    pending_approvals: List[str]

    # Agent Decisions & Notes
    architect_notes: Optional[str]
    developer_notes: Optional[str]
    qa_notes: Optional[str]
    blocker_notes: Optional[str]

    # Execution Metadata
    started_at: datetime
    last_updated: datetime
    checkpoints: List[str]
    errors: List[dict]  # [{phase, agent, error, timestamp}]

    # Output Tracking
    generated_files: List[str]
    code_stats: dict  # {lines_of_code, functions, components, coverage}

    # Next Steps
    next_actions: List[str]
    blocked_on: Optional[str]
    estimated_completion: Optional[datetime]
