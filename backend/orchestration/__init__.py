"""
BMAD × LangGraph Orchestration Module
Full-stack collaborative planning system for Kinder ABA Management System.

This module provides:
- Typed state schema for artifact persistence (state.py)
- LangChain tools for agent coordination (tools.py)
- BMAD agent personas for each role (agents.py)
- 4-phase orchestration graph with interrupts (graph.py)
- Runner for executing and resuming pipelines (run.py)

Quick Start:
    from orchestration.run import run_orchestration
    result = run_orchestration("Project Name", "Description")

Phases:
    1. Analysis: Analyst reviews requirements and risks
    2. Planning: PM & Architect plan backend approach
    3. Solutioning: Architect designs, SM decomposes into stories
    4. Implementation: Dev codes, QA reviews, iterate

Human-in-the-Loop:
    Execution pauses at each phase for human approval via interrupt()
    allowing review before proceeding to next phase.

Checkpointing:
    All artifacts persisted in typed state. Use thread_id to resume.
    Supports long-running orchestrations across multiple sessions.
"""

from .state import FullStackState
from .agents import get_all_agents
from .graph import get_graph
from .run import run_orchestration, resume_orchestration

__all__ = [
    "FullStackState",
    "get_all_agents",
    "get_graph",
    "run_orchestration",
    "resume_orchestration",
]
