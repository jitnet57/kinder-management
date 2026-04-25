"""
BMAD × LangGraph Orchestration Runner
Entry point for executing the full-stack collaborative planning pipeline.
"""

from datetime import datetime
from uuid import uuid4
from .state import FullStackState
from .graph import get_graph


def initialize_state(project_name: str, description: str) -> FullStackState:
    """Initialize fresh orchestration state."""
    return FullStackState(
        project_name=project_name,
        project_description=description,
        tech_stack={
            "frontend": "React 18 + TypeScript + Tailwind CSS",
            "backend": "Hono + Node.js 18+",
            "database": "PostgreSQL 14+ (Supabase)",
            "deployment": "Vercel (FE) + Railway/Fly.io (BE)",
        },
        user_request="Implement complete backend for ABA child management system",
        conversation_history=[],
        phase1={},
        phase2={},
        phase3={},
        phase4={},
        current_phase="initialization",
        phase_approvals={},
        pending_approvals=["phase1_analysis"],
        started_at=datetime.now(),
        last_updated=datetime.now(),
        checkpoints=[],
        errors=[],
        generated_files=[],
        code_stats={},
        next_actions=[
            "Analyst: Review requirements and identify risks",
            "PM: Create backend PRD",
            "Architect: Design Prisma schema and Hono structure",
            "SM: Decompose into stories with acceptance criteria",
            "Dev: Implement backend services (4 sprints)",
            "QA: Review and validate implementation",
        ],
        blocked_on=None,
    )


def run_orchestration(project_name: str, description: str, thread_id: str = None):
    """
    Execute the BMAD × LangGraph orchestration pipeline.

    Args:
        project_name: Project name
        description: Project description
        thread_id: Optional thread ID for resuming from checkpoint

    Usage:
        # Start fresh orchestration
        result = run_orchestration(
            "Kinder ABA Management System",
            "Full-stack ABA child management web application"
        )

        # Resume from checkpoint
        result = run_orchestration(
            "Kinder ABA Management System",
            "...",
            thread_id="abc123def456"
        )
    """
    if not thread_id:
        thread_id = str(uuid4())

    print(f"\n🚀 Starting BMAD × LangGraph Orchestration")
    print(f"   Project: {project_name}")
    print(f"   Thread ID: {thread_id}")
    print(f"   Started: {datetime.now().isoformat()}\n")

    # Initialize state
    state = initialize_state(project_name, description)
    state["checkpoints"].append(thread_id)

    # Get compiled graph
    graph = get_graph()

    # Run orchestration with streaming
    print("=" * 70)
    print("PHASE 1: ANALYSIS")
    print("=" * 70)
    print("Analyst is reviewing requirements and identifying risks...\n")

    try:
        # Stream execution
        for step in graph.stream(state, config={"configurable": {"thread_id": thread_id}}):
            print(f"Step: {step}")

        print("\n✅ Orchestration completed successfully!")
        print(f"Generated artifacts in phase 1-4")
        print(f"Next: Review Phase 1 output, approve, and proceed to Phase 2")

    except Exception as e:
        print(f"\n❌ Error during orchestration: {str(e)}")
        state["errors"].append({
            "phase": "main",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })
        raise


def resume_orchestration(thread_id: str):
    """
    Resume orchestration from checkpoint.

    Usage:
        result = resume_orchestration("abc123def456")
    """
    print(f"\n📋 Resuming orchestration from checkpoint: {thread_id}")

    graph = get_graph()

    try:
        # Resume from checkpoint
        for step in graph.stream(
            None,  # State will be loaded from checkpoint
            config={"configurable": {"thread_id": thread_id}}
        ):
            print(f"Step: {step}")

        print("\n✅ Orchestration resumed and completed")

    except Exception as e:
        print(f"\n❌ Error resuming orchestration: {str(e)}")
        raise


def get_orchestration_status(thread_id: str) -> dict:
    """Get current orchestration status from checkpoint."""
    graph = get_graph()
    # In real implementation, query checkpoint storage
    return {
        "thread_id": thread_id,
        "status": "in_progress",
        "current_phase": "analysis",
        "message": "Awaiting Phase 1 approval",
    }


if __name__ == "__main__":
    # Example usage
    print("""
    BMAD × LangGraph Orchestration for Kinder ABA Management System
    ================================================================

    This is a multi-agent collaborative planning system that:
    1. Analyzes requirements (Analyst)
    2. Plans backend PRD (PM)
    3. Designs architecture (Architect)
    4. Decomposes into stories (Scrum Master)
    5. Implements backend (Developer)
    6. Reviews implementation (QA)

    To run:
      python -m orchestration.run

    To integrate with your project:
      from orchestration.run import run_orchestration
      result = run_orchestration("Project Name", "Description")

    To resume from checkpoint:
      from orchestration.run import resume_orchestration
      result = resume_orchestration("thread-id-here")
    """)

    # Example: Start fresh orchestration
    # run_orchestration(
    #     "Kinder ABA Management System",
    #     "Full-stack ABA child management system with React frontend, Hono backend, PostgreSQL"
    # )
