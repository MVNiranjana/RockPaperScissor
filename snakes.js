const NS = "http://www.w3.org/2000/svg";
const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
const snakeColors = ["#16a34a", "#dc2626", "#7c3aed", "#ea580c", "#0891b2"];
const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const board = document.getElementById("board");
const statusText = document.getElementById("statusText");
const diceEl = document.getElementById("dice");
const rollBtn = document.getElementById("rollBtn");
const newBtn = document.getElementById("newBtn");

let pos, over, busy, tokens;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function el(name, attrs, parent = board) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}

function center(n) {
  const i = n - 1, r = Math.floor(i / 10);
  const c = r % 2 === 0 ? i % 10 : 9 - (i % 10);
  return { x: c * 60 + 30, y: (9 - r) * 60 + 30 };
}

function drawLadder(a, b) {
  const p = center(a), q = center(b);
  const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, nx = -uy * 8, ny = ux * 8;
  [1, -1].forEach((s) => {
    el("line", { x1: p.x + nx * s, y1: p.y + ny * s, x2: q.x + nx * s, y2: q.y + ny * s, stroke: "#8b5a2b", "stroke-width": 5, "stroke-linecap": "round" });
  });
  for (let d = 14; d < len - 6; d += 18) {
    const cx = p.x + ux * d, cy = p.y + uy * d;
    el("line", { x1: cx + nx, y1: cy + ny, x2: cx - nx, y2: cy - ny, stroke: "#c98a45", "stroke-width": 4, "stroke-linecap": "round" });
  }
}

function drawSnake(head, tail, color) {
  const h = center(head), t = center(tail);
  const dx = t.x - h.x, dy = t.y - h.y, len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len, amp = Math.min(30, len * 0.22);
  const m1 = { x: h.x + dx / 3, y: h.y + dy / 3 };
  const m2 = { x: h.x + (2 * dx) / 3, y: h.y + (2 * dy) / 3 };
  const c1 = { x: h.x + dx / 6 + nx * amp, y: h.y + dy / 6 + ny * amp };
  const d = `M${h.x},${h.y} Q${c1.x},${c1.y} ${m1.x},${m1.y} T${m2.x},${m2.y} T${t.x},${t.y}`;
  el("path", { d, fill: "none", stroke: "#14532d", "stroke-width": 16, "stroke-linecap": "round" });
  el("path", { d, fill: "none", stroke: color, "stroke-width": 11, "stroke-linecap": "round" });
  el("path", { d, fill: "none", stroke: "rgba(255,255,255,0.6)", "stroke-width": 3, "stroke-dasharray": "4 9" });
  el("circle", { cx: h.x, cy: h.y, r: 12, fill: color, stroke: "#14532d", "stroke-width": 2 });
  [-4, 4].forEach((o) => {
    el("circle", { cx: h.x + o, cy: h.y - 3, r: 3.2, fill: "#fff" });
    el("circle", { cx: h.x + o, cy: h.y - 3, r: 1.5, fill: "#000" });
  });
}

function drawBoard() {
  board.innerHTML = "";
  for (let n = 1; n <= 100; n++) {
    const { x, y } = center(n);
    const r = Math.floor((n - 1) / 10), c = Math.round((x - 30) / 60);
    const fill = n === 100 ? "#fcd34d" : (r + c) % 2 ? "#fef3c7" : "#d1fae5";
    el("rect", { x: x - 30, y: y - 30, width: 60, height: 60, fill, stroke: "#94a3b8", "stroke-width": 1 });
    const t = el("text", { x: x - 27, y: y - 17, "font-size": 11, fill: "#475569" });
    t.textContent = n;
  }
  const st = el("text", { x: 100, y: 626, "font-size": 14, fill: "#475569" });
  st.textContent = "START";
  Object.keys(ladders).forEach((a) => drawLadder(+a, ladders[a]));
  Object.keys(snakes).forEach((h, i) => drawSnake(+h, snakes[h], snakeColors[i % snakeColors.length]));
  tokens = {};
  [["you", "#dc2626"], ["comp", "#2563eb"]].forEach(([who, color]) => {
    const g = el("g", { class: "token" });
    el("circle", { cx: 0, cy: 0, r: 10, fill: color, stroke: "#fff", "stroke-width": 3 }, g);
    tokens[who] = g;
    place(who);
  });
}

function place(who) {
  const n = pos[who];
  let p;
  if (n === 0) p = { x: who === "you" ? 30 : 65, y: 622 };
  else {
    const c = center(n);
    p = { x: c.x + (who === "you" ? -10 : 10), y: c.y + 8 };
  }
  tokens[who].style.transform = `translate(${p.x}px, ${p.y}px)`;
}

async function turn(who) {
  const name = who === "you" ? "You" : "Computer";
  const dice = Math.floor(Math.random() * 6) + 1;
  diceEl.textContent = faces[dice - 1];
  let msg = `${name} rolled ${dice}.`;
  const target = pos[who] + dice;

  if (target > 100) {
    statusText.textContent = msg + " Need exact number.";
    return;
  }
  for (let i = pos[who] + 1; i <= target; i++) {
    pos[who] = i;
    place(who);
    await sleep(180);
  }
  if (snakes[target]) {
    msg += ` 🐍 Snake! ${target} → ${snakes[target]}`;
    await sleep(300);
    pos[who] = snakes[target];
    place(who);
    await sleep(500);
  } else if (ladders[target]) {
    msg += ` 🪜 Ladder! ${target} → ${ladders[target]}`;
    await sleep(300);
    pos[who] = ladders[target];
    place(who);
    await sleep(500);
  }
  statusText.textContent = msg;

  if (pos[who] === 100) {
    over = true;
    statusText.textContent = who === "you" ? "🎉 You won!" : "💻 Computer won!";
  }
}

rollBtn.addEventListener("click", async () => {
  if (busy || over) return;
  busy = true;
  rollBtn.disabled = true;
  await turn("you");
  if (!over) {
    await sleep(700);
    await turn("comp");
  }
  busy = false;
  if (!over) rollBtn.disabled = false;
});

function newGame() {
  pos = { you: 0, comp: 0 };
  over = false;
  busy = false;
  rollBtn.disabled = false;
  diceEl.textContent = "⚀";
  statusText.textContent = "Your turn: roll the dice";
  drawBoard();
}
newBtn.addEventListener("click", newGame);
newGame();