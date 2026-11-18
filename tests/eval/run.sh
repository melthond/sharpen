#!/usr/bin/env bash
# Manual eval: run one prompt headless in the current project with Sharpen on, edits blocked.
# usage: cd <some project> && bash <sharpen>/tests/eval/run.sh <id> "<prompt>"   (costs real API usage)
#   SHARPEN_PLUGIN_DIR=<checkout>  test another checkout (e.g. main vs your branch); default: this one
#   SHARPEN_EVAL_ARM=baseline      run without Sharpen, for the no-plugin arm
set -u
ROOT="${SHARPEN_PLUGIN_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
PLUGIN=(--plugin-dir "$ROOT")
[ "${SHARPEN_EVAL_ARM:-}" = baseline ] && PLUGIN=()
OUT="${SHARPEN_EVAL_OUT:-${TMPDIR:-/tmp}/sharpen-eval}"
mkdir -p "$OUT/home" && echo '{"on":true}' > "$OUT/home/state.json"
SHARPEN_HOME="$OUT/home" timeout 300 claude -p "$2" "${PLUGIN[@]}" \
  --disallowedTools "Edit Write NotebookEdit Bash PowerShell" --max-turns 6 \
  --output-format stream-json --verbose > "$OUT/$1.jsonl" 2>/dev/null
node -e '
const L=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const text=L.filter(m=>m.type==="assistant").flatMap(m=>m.message.content.filter(c=>c.type==="text").map(c=>c.text)).join("\n---\n");
const r=L.find(m=>m.type==="result")||{};
console.log(`=== ${process.argv[2]}: ${process.argv[3]}\n${text}\n[${r.subtype} $${(r.total_cost_usd||0).toFixed(2)}]\n`);' "$OUT/$1.jsonl" "$1" "$2"
