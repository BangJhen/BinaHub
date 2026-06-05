#!/usr/bin/env bash
# =============================================================================
#  BinaHub Dev Runner
#  Usage: ./dev.sh [all|web|backend|stop|status|help]
# =============================================================================
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RESET='\033[0m'; BOLD='\033[1m'
GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m';   BLUE='\033[0;34m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.dev-pids"

_log()     { echo -e "${BOLD}${BLUE}▶${RESET} $*"; }
_ok()      { echo -e "${GREEN}✔${RESET} $*"; }
_warn()    { echo -e "${YELLOW}⚠${RESET} $*"; }
_error()   { echo -e "${RED}✖${RESET} $*" >&2; }
_section() { echo -e "\n${BOLD}$*${RESET}"; }


# ── Dependency checks ─────────────────────────────────────────────────────────
_check_deps() {
    local ok=1
    command -v node    &>/dev/null || { _error "node not found (install via https://nodejs.org)"; ok=0; }
    command -v npm     &>/dev/null || { _error "npm not found";  ok=0; }
    command -v python3 &>/dev/null || command -v python &>/dev/null \
        || { _error "python3 not found"; ok=0; }
    [[ $ok -eq 1 ]] || { _error "Install missing dependencies and retry."; exit 1; }
}


# ── Start web (Next.js) ───────────────────────────────────────────────────────
_start_web() {
    _log "Starting web (Next.js) on http://localhost:3000 ..."

    # Install deps if node_modules is missing
    if [[ ! -d "$ROOT_DIR/apps/web/node_modules" ]]; then
        _warn "node_modules not found — running npm install..."
        (cd "$ROOT_DIR/apps/web" && npm install)
    fi

    (cd "$ROOT_DIR/apps/web" && npm run dev) &
    local pid=$!
    echo "web:$pid" >> "$PID_FILE"
    _ok "Web started → http://localhost:3000  (PID $pid)"
}


# ── Start backend (FastAPI) ───────────────────────────────────────────────────
_start_backend() {
    _log "Starting backend (FastAPI) on http://localhost:8001 ..."

    local venv="$ROOT_DIR/apps/backend/.venv"
    if [[ ! -d "$venv" ]]; then
        _warn "No .venv found at apps/backend/.venv"
        _warn "Run the following to create it:"
        echo ""
        echo "  cd apps/backend"
        echo "  python3 -m venv .venv"
        echo "  .venv/bin/pip install -r requirements.txt"
        echo ""
        return 1
    fi

    if [[ ! -f "$ROOT_DIR/apps/backend/.env" ]]; then
        _warn "apps/backend/.env not found — copy .env.example and fill in your values"
        return 1
    fi

    (cd "$ROOT_DIR/apps/backend" && "$venv/bin/python" run.py) &
    local pid=$!
    echo "backend:$pid" >> "$PID_FILE"
    _ok "Backend started → http://localhost:8001  (PID $pid)"
    _ok "API docs → http://localhost:8001/docs"
}


# ── Stop all services ─────────────────────────────────────────────────────────
_stop_all() {
    if [[ ! -f "$PID_FILE" ]]; then
        _warn "No running services found (.dev-pids missing)."
        return 0
    fi
    _log "Stopping all services..."
    while IFS=: read -r name pid; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null && _ok "Stopped $name (PID $pid)" \
                                    || _warn "Could not stop $name (PID $pid)"
        else
            _warn "$name (PID $pid) is not running"
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
    echo ""
    _ok "All services stopped."
}


# ── Status ────────────────────────────────────────────────────────────────────
_show_status() {
    if [[ ! -f "$PID_FILE" ]]; then
        echo "No services registered (run ./dev.sh to start)."
        return 0
    fi
    _section "BinaHub Service Status"
    printf "  %-12s %-8s %s\n" "SERVICE" "PID" "STATUS"
    printf "  %-12s %-8s %s\n" "-------" "---" "------"
    while IFS=: read -r name pid; do
        if kill -0 "$pid" 2>/dev/null; then
            printf "  %-12s %-8s ${GREEN}running${RESET}\n" "$name" "$pid"
        else
            printf "  %-12s %-8s ${RED}stopped${RESET}\n" "$name" "$pid"
        fi
    done < "$PID_FILE"
    echo ""
}


# ── Help ──────────────────────────────────────────────────────────────────────
_show_help() {
    echo ""
    echo -e "  ${BOLD}BinaHub Dev Runner${RESET}"
    echo ""
    echo "  Usage: ./dev.sh [command]"
    echo ""
    echo -e "  ${BOLD}Commands:${RESET}"
    printf "  %-18s %s\n" "all  (default)"  "Start web + backend in parallel"
    printf "  %-18s %s\n" "web"             "Start Next.js only  → http://localhost:3000"
    printf "  %-18s %s\n" "backend"         "Start FastAPI only  → http://localhost:8001"
    printf "  %-18s %s\n" "stop"            "Stop all running services"
    printf "  %-18s %s\n" "status"          "Show running process status"
    printf "  %-18s %s\n" "help"            "Show this message"
    echo ""
    echo -e "  ${BOLD}First-time setup:${RESET}"
    echo "  # Web"
    echo "  cd apps/web && npm install"
    echo ""
    echo "  # Backend"
    echo "  cd apps/backend"
    echo "  python3 -m venv .venv"
    echo "  .venv/bin/pip install -r requirements.txt"
    echo "  cp .env.example .env   # fill in OPENAI/AZURE keys + SUPABASE creds"
    echo ""
    echo -e "  ${BOLD}Or via npm:${RESET}"
    echo "  npm run dev            # = ./dev.sh all"
    echo "  npm run dev:web        # Next.js only"
    echo "  npm run dev:backend    # FastAPI only"
    echo ""
}


# ── Signal handler: clean up on Ctrl+C ───────────────────────────────────────
_on_exit() {
    echo ""
    _stop_all
    exit 0
}


# ── Main ──────────────────────────────────────────────────────────────────────
CMD="${1:-all}"
_check_deps

case "$CMD" in
    all)
        rm -f "$PID_FILE"
        _section "BinaHub — Starting All Services"
        _start_backend || _warn "Backend failed to start; web will still launch."
        _start_web
        echo ""
        _ok "Services running. Press ${BOLD}Ctrl+C${RESET}${GREEN} to stop all.${RESET}"
        trap '_on_exit' INT TERM
        wait
        ;;
    web)
        rm -f "$PID_FILE"
        _start_web
        trap '_on_exit' INT TERM
        wait
        ;;
    backend)
        rm -f "$PID_FILE"
        _start_backend
        trap '_on_exit' INT TERM
        wait
        ;;
    stop)
        _stop_all
        ;;
    status)
        _show_status
        ;;
    help|--help|-h)
        _show_help
        ;;
    *)
        _error "Unknown command: $CMD"
        _show_help
        exit 1
        ;;
esac
