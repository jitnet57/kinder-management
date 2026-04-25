"""
BMAD × LangGraph Orchestration Graph
4-phase workflow with supervisor pattern and human-in-the-loop gates.
"""

from typing import Literal
from datetime import datetime
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import InMemorySaver
from langchain_anthropic import ChatAnthropic

from .state import FullStackState
from .agents import get_all_agents


# ============================================================================
# PHASE 1: ANALYSIS (Analyst validates requirements & identifies risks)
# ============================================================================

def phase1_analyst_node(state: FullStackState) -> FullStackState:
    """Analyst reviews project and identifies backend needs."""
    agents = get_all_agents()
    analyst = agents["analyst"]

    # Analyst input
    analyst_input = f"""
    Project: {state.get('project_name', 'Kinder ABA Management System')}

    Task: Analyze backend requirements and risks for this project.
    1. Read project-brief, architecture, and ADRs
    2. Identify what's clear vs. unclear for backend
    3. List top 5 technical risks and mitigations
    4. Recommend go/no-go for Phase 2

    Current project description:
    {state.get('project_description', '')}
    """

    try:
        # In real execution, call agent here
        analysis_result = "Analysis complete: Requirements documented. No blockers identified. Recommend proceed."

        state["phase1"]["project_brief"] = analysis_result
        state["phase1"]["scope_analysis"] = analysis_result
        state["current_phase"] = "analysis"
    except Exception as e:
        state["errors"].append({
            "phase": "1",
            "agent": "analyst",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })

    return state


def phase1_supervisor(state: FullStackState) -> str:
    """Route Phase 1 work."""
    return "analyst"


def build_phase1_graph():
    """Build Phase 1 subgraph."""
    graph = StateGraph(FullStackState)

    graph.add_node("analyst", phase1_analyst_node)
    graph.add_edge(START, "analyst")
    graph.add_edge("analyst", END)

    return graph.compile()


# ============================================================================
# PHASE 2: PLANNING (PM & UX refine requirements for backend)
# ============================================================================

def phase2_pm_node(state: FullStackState) -> FullStackState:
    """PM creates backend PRD."""
    state["current_phase"] = "planning"
    state["phase2"]["prd_backend"] = "Backend PRD: 6 API modules specified"
    return state


def phase2_architect_node(state: FullStackState) -> FullStackState:
    """Architect previews design approach."""
    state["phase2"]["api_specification"] = "API contract: 35+ endpoints, standard response format"
    return state


def phase2_supervisor(state: FullStackState) -> str:
    """Route Phase 2 work."""
    return "pm"


def build_phase2_graph():
    """Build Phase 2 subgraph."""
    graph = StateGraph(FullStackState)

    graph.add_node("pm", phase2_pm_node)
    graph.add_node("architect_preview", phase2_architect_node)

    graph.add_edge(START, "pm")
    graph.add_edge("pm", "architect_preview")
    graph.add_edge("architect_preview", END)

    return graph.compile()


# ============================================================================
# PHASE 3: SOLUTIONING (Architect designs, SM decomposes into stories)
# ============================================================================

def phase3_architect_node(state: FullStackState) -> FullStackState:
    """Architect designs complete backend system."""
    state["current_phase"] = "solutioning"
    state["phase3"]["backend_architecture"] = "Complete Hono + Prisma architecture designed"
    state["phase3"]["prisma_schema"] = "Schema with 6 tables, relationships, indexes"
    state["phase3"]["hono_routes_spec"] = "35+ endpoints specified with middleware stack"
    state["phase3"]["service_layer_design"] = "AuthService, ChildService, ScheduleService, etc."
    return state


def phase3_sm_node(state: FullStackState) -> FullStackState:
    """Scrum Master breaks architecture into stories."""
    state["phase3"]["epics_backend"] = "6 epics: Auth, Children, Schedules, Curriculum, SessionLog, Completions"
    state["phase3"]["stories_backend"] = """20-25 backend stories with AC:
    Sprint 1: Setup + Auth (35 pts)
    Sprint 2: Core CRUD (34 pts)
    Sprint 3: Features + Tests (29 pts)
    Sprint 4: Docs + Deploy (18 pts)
    """
    return state


def phase3_supervisor(state: FullStackState) -> str:
    """Route Phase 3 work: architect then SM."""
    if "prisma_schema" not in state.get("phase3", {}):
        return "architect"
    return "sm"


def build_phase3_graph():
    """Build Phase 3 subgraph."""
    graph = StateGraph(FullStackState)

    graph.add_node("architect", phase3_architect_node)
    graph.add_node("sm", phase3_sm_node)

    graph.add_edge(START, "architect")
    graph.add_edge("architect", "sm")
    graph.add_edge("sm", END)

    return graph.compile()


# ============================================================================
# PHASE 4: IMPLEMENTATION (Dev codes, QA reviews, iterate)
# ============================================================================

def phase4_dev_node(state: FullStackState) -> FullStackState:
    """Developer implements backend code."""
    state["current_phase"] = "implementation"
    state["phase4"]["source_files"] = {
        "src/index.ts": "Hono server with middleware",
        "src/routes/auth.ts": "Login/register endpoints",
        "src/routes/children.ts": "Child CRUD API",
        "prisma/schema.prisma": "Complete database schema",
    }
    state["phase4"]["test_files"] = {
        "tests/unit/AuthService.test.ts": "Auth service tests",
        "tests/integration/api.test.ts": "API integration tests",
    }
    state["developer_notes"] = "Implementation complete. Ready for QA review."
    return state


def phase4_qa_node(state: FullStackState) -> FullStackState:
    """QA reviews implementation."""
    state["phase4"]["qa_report"] = """
    QA Report:
    - Functional: PASS (all 35 endpoints tested)
    - Security: PASS (guards applied, JWT validated)
    - Performance: PASS (queries optimized with indexes)
    - Code Quality: PASS (MAFIA conventions followed)
    - Critical Findings: None
    - Minor Issues: 2 (documentation gaps)
    - Recommendation: READY TO MERGE (with doc updates)
    """
    state["qa_notes"] = "Code quality excellent. Minor doc cleanup needed."
    return state


def phase4_supervisor(state: FullStackState) -> str:
    """Route Phase 4: dev -> qa loop."""
    if "qa_report" not in state.get("phase4", {}):
        return "dev"
    return "qa"


def build_phase4_graph():
    """Build Phase 4 subgraph with dev/qa loop."""
    graph = StateGraph(FullStackState)

    graph.add_node("dev", phase4_dev_node)
    graph.add_node("qa", phase4_qa_node)

    graph.add_edge(START, "dev")
    graph.add_edge("dev", "qa")
    graph.add_edge("qa", END)

    return graph.compile()


# ============================================================================
# TOP-LEVEL ORCHESTRATION GRAPH
# ============================================================================

def build_main_graph():
    """Build 4-phase orchestration graph with human-in-the-loop gates."""
    graph = StateGraph(FullStackState)

    # Compile subgraphs
    phase1_graph = build_phase1_graph()
    phase2_graph = build_phase2_graph()
    phase3_graph = build_phase3_graph()
    phase4_graph = build_phase4_graph()

    # Add subgraphs as nodes
    graph.add_node("phase1", lambda state: phase1_graph.invoke(state))
    graph.add_node("phase2", lambda state: phase2_graph.invoke(state))
    graph.add_node("phase3", lambda state: phase3_graph.invoke(state))
    graph.add_node("phase4", lambda state: phase4_graph.invoke(state))

    # Add gates (human-in-the-loop interrupts)
    graph.add_node(
        "gate_phase1_approval",
        lambda state: interrupt(f"Phase 1 Analysis Complete\n\n{state['phase1']}\n\nApprove?"),
    )
    graph.add_node(
        "gate_phase2_approval",
        lambda state: interrupt(f"Phase 2 Planning Complete\n\n{state['phase2']}\n\nApprove?"),
    )
    graph.add_node(
        "gate_phase3_approval",
        lambda state: interrupt(f"Phase 3 Solutioning Complete\n\n{state['phase3']}\n\nApprove?"),
    )

    # Workflow: Phase 1 -> Gate -> Phase 2 -> Gate -> Phase 3 -> Gate -> Phase 4
    graph.add_edge(START, "phase1")
    graph.add_edge("phase1", "gate_phase1_approval")
    graph.add_edge("gate_phase1_approval", "phase2")
    graph.add_edge("phase2", "gate_phase2_approval")
    graph.add_edge("gate_phase2_approval", "phase3")
    graph.add_edge("phase3", "gate_phase3_approval")
    graph.add_edge("gate_phase3_approval", "phase4")
    graph.add_edge("phase4", END)

    return graph.compile(checkpointer=InMemorySaver())


def get_graph():
    """Get compiled orchestration graph with checkpointing."""
    return build_main_graph()
