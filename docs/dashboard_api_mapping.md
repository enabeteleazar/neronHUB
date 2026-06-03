# Dashboard API Mapping

Audit date: 2026-06-03

Scope: routes FastAPI mounted by `core/app.py`. The dashboard must call Neron Core through `NERON_API_URL` via the dashboard proxy `/api/neron/*`; it must not read Core files directly.

The main dashboard snapshot is exposed by the dashboard backend at `GET /api/neron/status`. The frontend calls this dashboard route, not `localhost:8010`, to avoid CORS and to keep Core API credentials server-side.

## Configuration

| Variable | Value | Usage |
| --- | --- | --- |
| `NERON_API_URL` | `http://localhost:8010` | Base URL used by the dashboard server proxy. No Core URL is hard-coded in React. |
| `NERON_API_KEY` | optional | Forwarded as `X-API-Key` when protected Core endpoints require it. |

## Aggregated Dashboard Endpoint

| Endpoint | Method | Description | Returned data | Dashboard usage |
| --- | --- | --- | --- | --- |
| `/api/neron/status` | GET | Dashboard backend aggregation of Core endpoints. | `{ok, coreUrl, checkedAt, data, missing}` where each `data` entry contains `endpoint`, `ok`, `status`, `data`, and optional `error`. | JARVIS/home snapshot and service health cards. |

Aggregated Core endpoints:

| Key | Core endpoint | Status on 2026-06-03 |
| --- | --- | --- |
| `health` | `/health` | OK |
| `healthCenter` | `/health-center/status` | Missing: 404 |
| `selfModelStatus` | `/self-model/status` | OK |
| `selfModelContext` | `/self-model/context` | OK |
| `worldModelStatus` | `/world-model/status` | OK |
| `evolutionStatus` | `/evolution/status` | OK with `NERON_API_KEY` |
| `evolutionRuns` | `/evolution/runs` | OK with `NERON_API_KEY` |
| `runtimeStatus` | `/runtime/status` | Missing: 404 |
| `agents` | `/agents` | OK with `NERON_API_KEY` |
| `goals` | `/goals` | OK |

## Endpoints Used By The Dashboard

| Endpoint | Method | Description | Returned data | Dashboard usage |
| --- | --- | --- | --- | --- |
| `/health` | GET | Basic Core liveness. | `{status, version}` | Global health badge and JARVIS health status. |
| `/self-model/status` | GET | Compact Self Model state. | `health`, `runtime_mode`, `last_update`, `diagnostics`. | Cognitive dashboard and JARVIS cognitive status. |
| `/self-model/context` | GET | Full Self Model context. | `identity`, `health`, `goal`, `tasks`, `diagnostics`, `recommendations`, `runtime`, `services`, `capabilities`, `cognitive_state`, `last_activity`. | Health dashboard, Cognitive dashboard, LLM/service status fallback, JARVIS. |
| `/world-model/status` | GET | Compact World Model status. | `environment_status`, `diagnostics`, `last_update`. | Cognitive dashboard and JARVIS world status. |
| `/world-model/context` | GET | Full persisted World Model state. | Full world model state dictionary. | Cognitive deep inspection. |
| `/world-model/summary` | GET | Human-readable World Model summary. | `{summary}`. | Cognitive summary panel. |
| `/runtime/governor/policy` | GET | Runtime Governor policy. | `{policy, global_context}`. | Runtime dashboard and JARVIS runtime panel. |
| `/tasks/status` | GET | Task manager summary. | Task status counters/summary from TaskManager. | Runtime task overview. |
| `/tasks/running` | GET | Running tasks. | `{tasks}`. | Runtime active tasks. |
| `/tasks/next` | GET | Next pending task. | `{task}`. | Runtime queue panel. |
| `/goals` | GET | Goal list. | `{goals}`. | Goals dashboard list/progress. |
| `/goals/active` | GET | Active goal. | `{active_goal}`. | Cognitive, Goals, JARVIS active objective. |
| `/goal` | POST | Alias to run a goal immediately. | Goal orchestrator result. | Submit `/goal {texte}` from dashboard. |
| `/planner/status` | GET | Planner availability/configuration. | Planner mode, enabled routes, execution settings. | Runtime planner status. |
| `/planner/history` | GET | Recent plans. | `{count, limit, plans}`. | Goals history, Runtime recent events substitute, Console. |
| `/actions/history` | GET | Recent action history. | `{items}`. | Console terminal view. |
| `/critic/history` | GET | Recent critic history. | `{items}`. | Console diagnostics view. |
| `/agents` | GET | Runtime agent list. | `{count, agents}`. | Runtime and JARVIS agents. |
| `/evolution/status` | GET | Evolution supervisor status. | Supervisor status dictionary. | Evolution active cycle, Codex, validation status. |
| `/evolution/proposals` | GET | Latest evolution proposals. | `{count, proposals}`. | Evolution proposals panel. |
| `/evolution/runs` | GET | Evolution run history. | `{count, runs}`. | Evolution history. |
| `/input/text` | POST | Main text input to Core routing. | `CoreResponse`: response, intent, agent, confidence, timestamp, execution time, metadata. | JARVIS command console/chat. |

## Existing Mounted Endpoints Not Yet Used

| Endpoint | Method | Description | Returned data | Possible dashboard usage |
| --- | --- | --- | --- | --- |
| `/` | GET | Core root metadata. | service, version, status. | About/status footer. |
| `/status` | GET | Legacy global world model status. | `world_model.get()`. | Backward-compatible global state panel. |
| `/metrics` | GET | Prometheus metrics. | Prometheus text format. | Future metrics exporter view. |
| `/ha/reload` | POST | Reload Home Assistant entities. | `{status, entities, timestamp}`. | Home Assistant control button. |
| `/memory` | GET | Conversation memory entries. | `{entries, count, timestamp}`. | Memory view. |
| `/personality/state` | GET | Personality module state. | `{status, state, timestamp}`. | Personality dashboard. |
| `/personality/history` | GET | Personality history. | `{status, history, count, timestamp}`. | Personality history. |
| `/personality/reset` | POST | Reset selected personality fields. | Reset result. | Admin action. |
| `/nlp/parse` | POST | NLP parse. | Intent/entities/confidence dictionary. | Debug console. |
| `/input/stream` | POST | Streamed Core input. | Streaming response. | Future streaming console. |
| `/input/audio` | POST | Audio input. | `CoreResponse`. | Voice dashboard. |
| `/input/voice` | POST | Voice input response. | Audio/text response depending Core flow. | Voice dashboard. |
| `/tasks` | GET/POST | List or create tasks. | Task list or created task. | Task management. |
| `/tasks/schema` | GET | Valid statuses and priorities. | `{statuses, priorities}`. | Task forms. |
| `/tasks/{task_id}` | GET/DELETE | Read/delete a task. | Task or deletion result. | Task detail page. |
| `/tasks/{task_id}/status` | PATCH | Update task status. | `{task}`. | Task controls. |
| `/tasks/{task_id}/start` | POST | Start task. | `{task}`. | Task controls. |
| `/tasks/{task_id}/complete` | POST | Complete task. | `{task}`. | Task controls. |
| `/tasks/{task_id}/fail` | POST | Fail task. | `{task}`. | Task controls. |
| `/tasks/{task_id}/cancel` | POST | Cancel task. | `{task}`. | Task controls. |
| `/tasks/done/clear` | DELETE | Clear done tasks. | `{removed}`. | Maintenance control. |
| `/goals/run` | POST | Run goal with `{objective}`. | Orchestrator result. | Alternate goal submission. |
| `/goals` | POST | Create a stored goal. | `{goal}`. | Goal creation form. |
| `/goals/{goal_id}/complete` | POST | Mark goal completed. | `{goal}`. | Goal controls. |
| `/goals/{goal_id}/fail` | POST | Mark goal failed. | `{goal}`. | Goal controls. |
| `/goals/{goal_id}/progress` | POST | Update progress. | `{goal}`. | Goal progress control. |
| `/goals/active/task` | POST | Create task from active goal. | `{created, source, goal, task}`. | Goal-to-task action. |
| `/planner/create` | POST | Create a plan from a goal. | Plan dictionary. | Planner controls. |
| `/planner/last` | GET | Last saved plan. | Plan dictionary or 404. | Planner detail. |
| `/planner/approve/{plan_id}` | POST | Approve plan. | Plan dictionary. | Planner controls. |
| `/planner/execute/{plan_id}` | POST | Execute plan after risk evaluation. | Execution result. | Planner controls. |
| `/planner/execute-approved/{plan_id}` | POST | Execute approved plan. | Execution result. | Planner controls. |
| `/planner/from-goal` | POST | Create plan from active goal. | Plan dictionary. | Goal planner action. |
| `/planner/risk/{plan_id}` | GET | Risk evaluation. | Risk dictionary. | Planner risk panel. |
| `/planner/cleanup-duplicates` | POST | Planner storage cleanup. | Cleanup result. | Maintenance. |
| `/planner/generate-tasks/{plan_id}` | POST | Generate tasks from plan. | Task generation result. | Planner-to-task action. |
| `/planner/sync-tasks` | POST | Sync plan/task status. | Sync result. | Maintenance. |
| `/planner/ready` | GET | Ready plans. | Ready plan list. | Planner queue. |
| `/projects` | GET | Project list. | `{count, projects}`. | Projects dashboard. |
| `/projects/search` | GET | Search projects. | `{count, projects}`. | Project search. |
| `/projects/diagnostics/failures` | GET | Recent project failures. | Diagnostics dictionary. | Diagnostics panel. |
| `/projects/{project_id}` | GET | Project detail. | `{project}`. | Project detail page. |
| `/agents/build` | POST | Build agent from request. | Build result. | Agent factory controls. |
| `/evolution/propose` | POST | Generate and submit proposals. | `{count, proposals, message}`. | Evolution control. |
| `/evolution/accept/{proposal_id}` | POST | Accept proposal. | Acceptance result. | Evolution control. |
| `/evolution/reject/{proposal_id}` | POST | Reject proposal. | Rejection result. | Evolution control. |
| `/evolution/stop` | POST | Stop active evolution run. | Stop result. | Evolution control. |
| `/code-awareness/map` | GET | Code map. | Code awareness result. | Developer diagnostics. |
| `/code-awareness/tree` | GET | Project tree. | Tree result. | Developer diagnostics. |
| `/code-awareness/read` | GET | Read a code file through guarded API. | File content result. | Developer diagnostics. |
| `/code-awareness/search` | GET | Search code. | Search results. | Developer diagnostics. |
| `/code-awareness/analyze` | GET | Analyze file/module. | Analysis result. | Developer diagnostics. |
| `/code-awareness/dependencies` | GET | Dependency map. | Dependency result. | Developer diagnostics. |
| `/code-awareness/architecture` | GET | Architecture map. | Architecture result. | Developer diagnostics. |

## Present In Code But Not Mounted In Core App

| Endpoint | Method | Module | Impact |
| --- | --- | --- | --- |
| `/events/recent` | GET | `core/runtime/events/routes.py` | Useful for Console and Runtime recent events, but the router is not included in `core/app.py`. |

## Missing Core Endpoints To Create

| Endpoint | Method | Needed for | Suggested returned data |
| --- | --- | --- | --- |
| `/health-center/status` | GET | Official Health dashboard source. | Global state, CPU, RAM, disk, systemd services, recommendations, diagnostics. Current dashboard uses `/self-model/context` for these fields. |
| `/runtime/status` | GET | Runtime dashboard single source. | Active agents, pending agents, running tasks, recent events, governor policy. Current dashboard composes `/runtime/governor/policy`, `/tasks/*`, `/agents`, `/planner/history`. |
| `/llm/status` | GET | JARVIS and LLM activity panel. | LLM service health, model/provider, latency, queue, errors. Current dashboard only infers service status from `/self-model/context`. |
| `/homeassistant/status` | GET | Home Assistant dashboard. | Connectivity, entity count, last sync, errors. Only `/ha/reload` exists. |
| `/logs/recent` | GET | Console logs. | Recent journal/application log lines with service, level, timestamp. No mounted log endpoint exists. |
| `/events/recent` | GET | Console and runtime events. | Recent event bus/runtime events. Implementation exists but must be mounted in `core/app.py`. |

## Runtime Verification

Runtime verification after deployment:

- `curl http://localhost:8010/health` returned `{"status":"healthy","version":"3.6.0"}`.
- `curl http://localhost:5000/api/neron/status` returned a structured response with real Core data.
- Live missing endpoints: `/health-center/status`, `/runtime/status`.
