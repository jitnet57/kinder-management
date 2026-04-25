"""
LangChain Tools for BMAD agents.
Enables reading docs, code generation, and inter-agent coordination.
"""

from langchain.tools import tool
from pathlib import Path
import json
from typing import Optional


@tool
def read_project_document(doc_name: str) -> str:
    """
    Read existing project documentation.

    Args:
        doc_name: 'project-brief', 'prd', 'ux-spec', 'architecture', 'epics-stories', 'code-conventions', 'adr'

    Returns:
        Content of the document
    """
    doc_map = {
        "project-brief": "e:\\kinder-management\\docs\\project-brief.md",
        "prd": "e:\\kinder-management\\docs\\prd.md",
        "ux-spec": "e:\\kinder-management\\docs\\ux-spec.md",
        "architecture": "e:\\kinder-management\\docs\\architecture.md",
        "epics-stories": "e:\\kinder-management\\docs\\epics-stories.md",
        "code-conventions": "e:\\kinder-management\\docs\\code-convention.yaml",
        "adr": "e:\\kinder-management\\docs\\adr.yaml",
    }

    if doc_name not in doc_map:
        return f"Document '{doc_name}' not found. Available: {', '.join(doc_map.keys())}"

    try:
        with open(doc_map[doc_name], 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading {doc_name}: {str(e)}"


@tool
def analyze_requirements_gap() -> str:
    """
    Analyze gap between existing frontend requirements and backend implementation needs.
    Returns structured analysis of what backend must support.
    """
    return """
    # Backend Requirements Analysis

    ## From Existing Architecture (frontend-centric):
    - 6 API modules: auth, children, schedules, session-logs, completions, curriculum
    - PostgreSQL 14+ with Prisma ORM
    - 6 core tables with specific relationships
    - JWT-based authentication with RBAC

    ## Missing Backend Specifications:
    1. Hono framework setup and routing structure
    2. Detailed Prisma schema with all fields, indexes, and validation
    3. Service layer architecture (error handling, business logic)
    4. Middleware stack (auth, CORS, error handling, logging)
    5. API response format standardization (ADR-001 from MAFIA docs)
    6. Guard layer separation (ADR-002: AuthGuard vs RolesGuard)
    7. State management strategy for server (caching, session)
    8. Database migration strategy (Prisma Migrate vs manual)
    9. Testing strategy (unit, integration, e2e)
    10. Deployment pipeline (Railway/Fly.io configuration)

    ## Required Deliverables:
    - Complete Prisma schema with migrations
    - Hono project scaffolding with route structure
    - Service layer interfaces
    - Guard/middleware implementations
    - 35+ REST endpoint implementations
    - Error handling & logging infrastructure
    - Database seed scripts for test data
    - CI/CD configuration files
    """


@tool
def generate_prisma_schema_template() -> str:
    """
    Generate starter Prisma schema based on architecture spec.
    Includes all entities, relationships, and indexes from data model.
    """
    return """
datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }

    // ========== User Management ==========
    model User {
      id            Int       @id @default(autoincrement())
      email         String    @unique
      passwordHash  String
      role          String    @default("practitioner") // "admin", "practitioner", "viewer"
      name          String?
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt
      deletedAt     DateTime?

      children      Child[]
      schedules     Schedule[]
      sessionLogs   SessionLog[]

      @@index([email])
      @@index([role])
    }

    // ========== Child Management ==========
    model Child {
      id            Int       @id @default(autoincrement())
      userId        Int
      name          String
      dateOfBirth   DateTime
      phone         String?
      address       String?
      notes         String?
      attachments   String?   // JSON array of file URLs
      color         String    @default("pastel-purple") // 8-color palette
      status        String    @default("active") // "active", "inactive", "archived"
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt

      user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
      schedules     Schedule[]
      sessionLogs   SessionLog[]
      assignments   CurriculumAssignment[]
      completions   CompletionLog[]

      @@index([userId])
      @@index([status])
      @@unique([userId, name])
    }

    // ========== Schedule Management ==========
    model Schedule {
      id            Int       @id @default(autoincrement())
      userId        Int
      childId       Int
      sessionName   String
      dayOfWeek     Int       // 0=Monday, 6=Saturday
      startTime     String    // "08:00"
      endTime       String    // "10:00"
      color         String?
      notes         String?
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt

      user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
      child         Child     @relation(fields: [childId], references: [id], onDelete: Cascade)

      @@index([userId, childId])
      @@index([dayOfWeek])
    }

    // ========== Curriculum Management ==========
    model Curriculum {
      id            Int       @id @default(autoincrement())
      userId        Int
      domain        String    // "언어발달", "인지발달", "사회성발달"
      lto           String    // Long-Term Objective
      sto           String    // Short-Term Objective
      description   String?
      status        String    @default("active")
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt

      assignments   CurriculumAssignment[]
      sessionLogs   SessionLog[]

      @@index([domain])
      @@index([status])
    }

    model CurriculumAssignment {
      id            Int       @id @default(autoincrement())
      childId       Int
      curriculumId  Int
      assignedAt    DateTime  @default(now())
      dueDate       DateTime?
      status        String    @default("assigned") // "assigned", "in-progress", "completed"

      child         Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
      curriculum    Curriculum @relation(fields: [curriculumId], references: [id], onDelete: Cascade)

      @@unique([childId, curriculumId])
      @@index([status])
    }

    // ========== Session Logging ==========
    model SessionLog {
      id            Int       @id @default(autoincrement())
      userId        Int
      childId       Int
      curriculumId  Int
      date          DateTime
      score         Int       // 0-100
      notes         String?
      startTime     DateTime?
      endTime       DateTime?
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt

      user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
      child         Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
      curriculum    Curriculum @relation(fields: [curriculumId], references: [id])

      @@index([childId, date])
      @@index([date])
      @@index([curriculumId])
    }

    // ========== Completion Tracking ==========
    model CompletionLog {
      id            Int       @id @default(autoincrement())
      userId        Int
      childId       Int
      taskName      String
      completedAt   DateTime
      status        String    @default("completed") // "completed", "partial", "skipped"
      notes         String?
      createdAt     DateTime  @default(now())

      user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
      child         Child     @relation(fields: [childId], references: [id], onDelete: Cascade)

      @@index([childId, completedAt])
      @@index([completedAt])
    }

    // ========== Audit Trail ==========
    model AuditLog {
      id            Int       @id @default(autoincrement())
      userId        Int?
      action        String    // "CREATE", "UPDATE", "DELETE"
      entity        String    // "Child", "Schedule", "SessionLog"
      entityId      Int
      changes       String?   // JSON diff
      timestamp     DateTime  @default(now())
      ipAddress     String?

      @@index([timestamp])
      @@index([userId])
    }
    """


@tool
def generate_hono_project_structure() -> str:
    """
    Generate recommended Hono backend project structure.
    """
    return """
    backend/
    ├── src/
    │   ├── index.ts                 # Main server entry
    │   ├── env.ts                   # Environment variables validation
    │   │
    │   ├── routes/                  # Route handlers
    │   │   ├── auth.ts              # POST /auth/login, /auth/register, /auth/logout
    │   │   ├── children.ts          # CRUD /children
    │   │   ├── schedules.ts         # CRUD /schedules
    │   │   ├── curriculum.ts        # CRUD /curriculum
    │   │   ├── session-logs.ts      # CRUD /session-logs
    │   │   ├── completions.ts       # GET /completions
    │   │   └── health.ts            # GET /health
    │   │
    │   ├── middleware/              # Express-like middleware
    │   │   ├── auth.ts              # JWT verification
    │   │   ├── roles.ts             # RBAC enforcement
    │   │   ├── errors.ts            # Global error handling
    │   │   ├── cors.ts              # CORS setup
    │   │   ├── logging.ts           # Request/response logging
    │   │   └── validation.ts        # Request body validation
    │   │
    │   ├── services/                # Business logic
    │   │   ├── AuthService.ts       # JWT, password hashing
    │   │   ├── ChildService.ts      # Child CRUD + auto-color
    │   │   ├── ScheduleService.ts   # Schedule logic, conflict detection
    │   │   ├── SessionLogService.ts # Scoring, trend calculation
    │   │   ├── CurriculumService.ts # Hierarchy management
    │   │   └── FileService.ts       # S3/file handling
    │   │
    │   ├── guards/                  # Authentication/Authorization
    │   │   ├── AuthGuard.ts         # JWT token validation
    │   │   ├── RolesGuard.ts        # Role-based access
    │   │   └── OwnershipGuard.ts    # Resource ownership check
    │   │
    │   ├── validators/              # Input validation (zod/joi)
    │   │   ├── auth.ts
    │   │   ├── child.ts
    │   │   ├── schedule.ts
    │   │   └── sessionLog.ts
    │   │
    │   ├── types/                   # Shared types
    │   │   ├── index.ts
    │   │   ├── api.ts
    │   │   ├── domain.ts
    │   │   └── errors.ts
    │   │
    │   ├── utils/                   # Helpers
    │   │   ├── logger.ts
    │   │   ├── crypto.ts
    │   │   ├── errors.ts
    │   │   └── formatters.ts
    │   │
    │   ├── prisma/                  # Database
    │   │   ├── schema.prisma
    │   │   ├── migrations/
    │   │   └── seed.ts              # Test data
    │   │
    │   └── config/                  # Configuration
    │       ├── database.ts
    │       ├── jwt.ts
    │       └── constants.ts
    │
    ├── tests/
    │   ├── unit/                    # Service tests
    │   ├── integration/             # API tests
    │   └── fixtures/
    │
    ├── prisma/
    │   └── schema.prisma
    │
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    └── README.md
    """


@tool
def estimate_implementation_effort() -> str:
    """
    Estimate story points and timeline for backend implementation.
    """
    return """
    # Backend Implementation Effort Estimation

    ## Phase 4 Stories Breakdown (Backend Focus):

    ### Sprint 1 (1-2 weeks, ~35 story points)
    - Story 4.1: Hono project setup + DB connection (5 pts)
    - Story 4.2: User authentication (login/register) (8 pts)
    - Story 4.3: Auth guards (JWT + RBAC) (5 pts)
    - Story 4.4: Child CRUD API (8 pts)
    - Story 4.5: Child color auto-assignment (3 pts)
    - Story 4.6: Error handling middleware (3 pts)
    - Story 4.7: Logging infrastructure (3 pts)

    ### Sprint 2 (1-2 weeks, ~34 story points)
    - Story 4.8: Schedule CRUD API (8 pts)
    - Story 4.9: Schedule conflict detection (5 pts)
    - Story 4.10: Curriculum hierarchy CRUD (8 pts)
    - Story 4.11: Session log CRUD (8 pts)
    - Story 4.12: Trend calculation service (5 pts)

    ### Sprint 3 (1-2 weeks, ~29 story points)
    - Story 4.13: Completion tracking API (5 pts)
    - Story 4.14: Filtering/pagination service (5 pts)
    - Story 4.15: File upload handler (5 pts)
    - Story 4.16: Database seed script (3 pts)
    - Story 4.17: Unit tests (6 pts)
    - Story 4.18: Integration tests (5 pts)

    ### Sprint 4 (1 week, ~18 story points)
    - Story 4.19: API documentation (4 pts)
    - Story 4.20: Deployment configuration (Railway) (6 pts)
    - Story 4.21: Performance optimization + monitoring (5 pts)
    - Story 4.22: Security audit (3 pts)

    **Total**: ~116 story points over 4-5 weeks
    **Velocity**: ~28-30 pts/week for solo dev
    **Realistic Timeline**: 4-5 weeks full-time equivalent

    ## Dependencies:
    - Frontend must finalize API contract (request/response formats)
    - Database credentials and connection string available
    - Code review process established (MAFIA harness ready)
    """


@tool
def coordinate_with_team(message: str, recipient: str) -> str:
    """
    Send coordination message to another agent in the pipeline.

    Args:
        message: Message content
        recipient: 'architect', 'developer', 'qa', 'pm'

    Returns:
        Confirmation of message queued
    """
    return f"Message to {recipient} queued: {message[:50]}..."


@tool
def save_artifact(phase: str, artifact_type: str, content: str) -> str:
    """
    Save phase artifact to state.

    Args:
        phase: "1", "2", "3", "4"
        artifact_type: Name of artifact
        content: Artifact content

    Returns:
        Confirmation
    """
    return f"Artifact saved: Phase {phase}/{artifact_type} ({len(content)} chars)"


@tool
def list_available_tools() -> str:
    """
    List all tools available to agents in this orchestration.
    """
    return """
    Available Tools:
    1. read_project_document(doc_name) - Read existing docs
    2. analyze_requirements_gap() - Identify backend needs
    3. generate_prisma_schema_template() - Database schema starter
    4. generate_hono_project_structure() - Backend structure starter
    5. estimate_implementation_effort() - Story estimates
    6. coordinate_with_team(message, recipient) - Inter-agent communication
    7. save_artifact(phase, artifact_type, content) - Persist artifacts
    """


def get_tools():
    """Return all tools for agent binding."""
    return [
        read_project_document,
        analyze_requirements_gap,
        generate_prisma_schema_template,
        generate_hono_project_structure,
        estimate_implementation_effort,
        coordinate_with_team,
        save_artifact,
        list_available_tools,
    ]
