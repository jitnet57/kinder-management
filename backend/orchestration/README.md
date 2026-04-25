# BMAD × LangGraph Orchestration

Multi-agent full-stack planning system for the Kinder ABA Management System.

## 🎯 Overview

This orchestration system automates collaborative planning using:

- **BMAD Methodology**: 4-phase framework (Analysis → Planning → Solutioning → Implementation)
- **LangGraph Runtime**: Stateful multi-agent graph with checkpointing and human-in-the-loop interrupts
- **8 Agent Roles**: Analyst, PM, UX Designer, Architect, Scrum Master, Developer, QA, Tech Writer
- **Typed State**: Persistent artifact storage across sessions via thread IDs

The system orchestrates agents through phases, pausing for human approval at each gate.

## 📊 Architecture

```
┌──────────────────── BMAD METHODOLOGY ──────────────────┐
│  Phase 1: Analysis    → project_brief, risks            │
│  Phase 2: Planning    → prd, api_spec                   │
│  Phase 3: Solutioning → architecture, stories           │
│  Phase 4: Implementation → source_files, qa_report      │
└───────────────────────────────────────────────────────┘
                     ↓ (maps to)
┌──────────────────── LANGGRAPH RUNTIME ─────────────────┐
│  StateGraph: 4 phase nodes + 3 approval gates           │
│  Checkpointer: InMemorySaver (dev) → PostgresSaver (prod)│
│  Supervisor: Routes work within each phase              │
│  Tools: 8 shared tools for all agents                   │
└───────────────────────────────────────────────────────┘
```

## 🔧 Project Structure

```
backend/orchestration/
├── __init__.py          # Module exports
├── state.py             # FullStackState TypedDict
├── agents.py            # BMAD agent personas (6 agents)
├── tools.py             # LangChain tools for coordination
├── graph.py             # Phase subgraphs + main graph
├── run.py               # Entry point & orchestration runner
└── README.md            # This file
```

## 📋 State Schema

The `FullStackState` TypedDict contains:

```python
{
    # Project Context
    "project_name": str,
    "tech_stack": dict,
    
    # Phase Artifacts (Typed subdicts)
    "phase1": ArtifactPhase1,  # Analysis output
    "phase2": ArtifactPhase2,  # Planning output
    "phase3": ArtifactPhase3,  # Architecture + stories
    "phase4": ArtifactPhase4,  # Implementation + QA
    
    # Existing Docs (for reference)
    "existing_project_brief": str,
    "existing_architecture": str,
    ...
    
    # Orchestration State
    "current_phase": str,
    "phase_approvals": dict,
    "pending_approvals": list,
    
    # Execution Metadata
    "errors": list,
    "checkpoints": list,
    "generated_files": list,
}
```

## 🚀 Usage

### Start Fresh Orchestration

```python
from orchestration.run import run_orchestration

result = run_orchestration(
    project_name="Kinder ABA Management System",
    description="Full-stack ABA child management web app"
)
```

### Resume from Checkpoint

```python
from orchestration.run import resume_orchestration

result = resume_orchestration(thread_id="abc123def456")
```

### Access the Compiled Graph

```python
from orchestration.graph import get_graph

graph = get_graph()
# Use with LangGraph API directly
```

## 🔄 Workflow

### Phase 1: Analysis (Analyst)
- Reviews project brief and architecture
- Identifies backend requirements and risks
- **Output**: Analysis summary, risk assessment, go/no-go recommendation
- **Gate**: Human approval required before Phase 2

### Phase 2: Planning (PM & Architect)
- PM creates backend PRD
- Architect previews design approach
- **Output**: Backend requirements, API contract outline
- **Gate**: Human approval required before Phase 3

### Phase 3: Solutioning (Architect & Scrum Master)
- Architect designs complete system (Prisma schema, Hono routes, service layer)
- Scrum Master decomposes into stories with acceptance criteria
- **Output**: Architecture spec, 20-25 stories, sprint plan
- **Gate**: Human approval required before Phase 4

### Phase 4: Implementation (Dev & QA)
- Developer implements backend code
- QA reviews for bugs, security, performance
- **Output**: Source files, test files, QA report
- **Final**: Code ready for production

## 🛠️ Agent Roles

| Agent | Phase | Role | Deliverable |
|-------|-------|------|-------------|
| **Analyst** (Mary) | 1 | Reviews scope & risks | Analysis summary |
| **PM** (John) | 2 | Plans backend requirements | Backend PRD |
| **UX** (Sally) | 2 | Not active (frontend done) | — |
| **Architect** (Winston) | 3 | Designs system | Architecture + schema |
| **Scrum Master** (Bob) | 3 | Decomposes work | Stories + sprint plan |
| **Developer** (Amelia) | 4 | Implements code | Source files + tests |
| **QA** (Quinn) | 4 | Reviews quality | QA report + findings |
| **Tech Writer** | 4 | Documents APIs | API docs |

## 🧰 Available Tools

All agents have access to:

1. **read_project_document(doc_name)** - Read existing docs (project-brief, prd, architecture, etc.)
2. **analyze_requirements_gap()** - Identify missing backend specs
3. **generate_prisma_schema_template()** - Database schema starter
4. **generate_hono_project_structure()** - Backend directory structure
5. **estimate_implementation_effort()** - Story points and timeline
6. **coordinate_with_team(message, recipient)** - Inter-agent communication
7. **save_artifact(phase, artifact_type, content)** - Persist to state
8. **list_available_tools()** - This list

## 💾 Checkpointing & Resumability

The graph compiles with `InMemorySaver` (development) or `PostgresSaver` (production).

Benefits:
- **Long-running orchestrations**: 4-5 week backend development tracked in phases
- **Resumable from interrupts**: Pause at approval gates, resume when ready
- **Artifact persistence**: All generated docs/code saved in typed state
- **Thread safety**: Each orchestration gets unique `thread_id` for independent tracking

Usage:
```python
# Start
thread_id = run_orchestration("Project", "Description")  # Returns thread ID

# Later: Resume from checkpoint
resume_orchestration(thread_id)

# Query status
status = get_orchestration_status(thread_id)
```

## 📈 Expected Outputs

By Phase 4 completion, you'll have:

### Phase 1 Artifacts
- Analysis summary (requirements coverage, risks, go/no-go)

### Phase 2 Artifacts
- Backend PRD (API endpoints, data requirements, performance targets)
- API specification (request/response formats, validation rules)

### Phase 3 Artifacts
- **architecture.md**: System design, middleware stack, error handling
- **Prisma schema**: 6 tables with fields, relationships, indexes
- **Hono routes spec**: 35+ endpoints with middleware
- **Stories**: 20-25 stories with acceptance criteria (110+ story points)
- **Sprint plan**: 4-5 weeks allocated to sprints

### Phase 4 Artifacts
- **Backend source code** (Hono + Prisma + services)
- **Database migrations** (Prisma Migrate files)
- **Test suite** (unit + integration tests, >80% coverage)
- **QA report** (security audit, performance analysis, code quality)
- **Deployment config** (Railway/Fly.io setup)

## 🔐 Code Quality Standards

Agents follow MAFIA code conventions:

- ✅ No `any` type (TypeScript strict mode)
- ✅ Single Responsibility Principle (functions <50 lines)
- ✅ No magic numbers (extract constants)
- ✅ Clear naming (no abbreviations)
- ✅ Error handling at source
- ✅ Guards separated (ADR-002: AuthGuard vs RolesGuard)
- ✅ Standard API response format (ADR-001)

## 🚨 Error Handling

Errors are captured in state:

```python
state["errors"].append({
    "phase": "3",
    "agent": "architect",
    "error": "Schema conflicts with business logic",
    "timestamp": "2026-04-26T10:30:00"
})
```

Agents review errors and iterate.

## 📚 References

- **BMAD Methodology**: Role-based planning with 4 phases and 8 agents
- **LangGraph**: Stateful multi-agent orchestration with checkpointing
- **Kinder Project**: ABA child management system (React frontend + Hono backend)
- **Code Conventions**: docs/code-convention.yaml
- **Architecture Decisions**: docs/adr.yaml

## 🔗 Integration

To integrate with your existing kinder-management project:

```python
# In your main script
from backend.orchestration import run_orchestration

# Start orchestration
result = run_orchestration(
    "Kinder ABA Management System",
    "Full-stack ABA management web app"
)
```

The orchestration will read your existing docs and generate backend specifications and code.

## 🤝 Contributing

To add new agents, tools, or phases:

1. **New agent**: Add persona function in `agents.py`
2. **New tool**: Add function in `tools.py` and register in `get_tools()`
3. **New phase**: Add subgraph in `graph.py` and chain in main graph
4. **Update state**: Add fields to `FullStackState` in `state.py`

---

**Version**: 0.1.0  
**Status**: Prototype (in-memory checkpointing)  
**Tech**: LangChain + LangGraph + Claude 3.5 Sonnet
