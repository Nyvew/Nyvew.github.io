let maxZ = window.innerWidth * 2;

const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  maxZ = window.innerWidth * 2;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initStars(); // vai existir no Bloco B
});

resizeCanvas();

const stars = [];
const STAR_COUNT = 250;

let speed = 2;
const MAX_SPEED = 6;
const ACCEL = 0.03;

function randomStar() {
  return {
    x: (Math.random() - 0.5) * window.innerWidth,
    y: (Math.random() - 0.5) * window.innerHeight,
    z: Math.random() * maxZ + 1
  };
}

function initStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(randomStar());
  }
}

function drawStar(star) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  const focal = 300;
  const scale = focal / star.z;

  const x2d = star.x * scale + cx;
  const y2d = star.y * scale + cy;

  const radius = scale * 0.4;

  const alpha = Math.max(0, Math.min(1, 1 - star.z / maxZ));
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;

  if (x2d < 0 || x2d > window.innerWidth || y2d < 0 || y2d > window.innerHeight)
    return;

  ctx.beginPath();
  ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  speed = Math.min(speed + ACCEL, MAX_SPEED);

  for (const star of stars) {
    star.z -= speed;

    if (star.z <= 1) {
      star.x = (Math.random() - 0.5) * window.innerWidth;
      star.y = (Math.random() - 0.5) * window.innerHeight;
      star.z = maxZ;
    }

    drawStar(star);
  }

  requestAnimationFrame(animate);
}

initStars();
animate();

window.addEventListener("load", () => {
  document.getElementById("titulo").classList.add("show");
  document.getElementById("frase").classList.add("show");
  document.querySelector(".timer").classList.add("show");
});
// ===== FRASES + COUNTDOWN (America/Sao_Paulo) =====
const countdownEl = document.getElementById("countdown");
const fraseEl = document.getElementById("frase");

// --- Data/hora em São Paulo (parts) ---
function getSaoPauloParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const obj = {};
  for (const p of parts) {
    if (p.type !== "literal") obj[p.type] = p.value;
  }

  return {
    year: Number(obj.year),
    month: Number(obj.month),
    day: Number(obj.day),
    hour: Number(obj.hour),
    minute: Number(obj.minute),
    second: Number(obj.second)
  };
}

function saoPauloNowUtcMs() {
  const p = getSaoPauloParts(new Date());
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

function nextSaoPauloMidnightUtcMs() {
  const p = getSaoPauloParts(new Date());
  return Date.UTC(p.year, p.month - 1, p.day + 1, 0, 0, 0);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// --- Projeto: começa HOJE e termina dia 15 do mês ---
// ⚠️ Se "hoje" não for 03/03/2026 pra você, troque os números abaixo:
const END_DAY_OF_MONTH = 15; // termina dia 15 do mês (SP)

function getOrCreateStartDateSP() {
  const key = "pedido_start_sp_v1";
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const obj = JSON.parse(saved);
      if (obj && obj.year && obj.month && obj.day) return obj;
    } catch (e) {
      // se der erro, a gente recria abaixo
    }
  }

  // primeira vez: grava o "hoje" em São Paulo
  const p = getSaoPauloParts(new Date());
  const start = { year: p.year, month: p.month, day: p.day };
  localStorage.setItem(key, JSON.stringify(start));
  return start;
}

const START_DATE_SP = getOrCreateStartDateSP();
const START_UTC_MS = Date.UTC(
  START_DATE_SP.year,
  START_DATE_SP.month - 1,
  START_DATE_SP.day,
  0,
  0,
  0
);
const END_UTC_MS = Date.UTC(
  START_DATE_SP.year,
  START_DATE_SP.month - 1,
  END_DAY_OF_MONTH,
  0,
  0,
  0
);

// total de dias do projeto (inclui hoje e o dia 15)
const TOTAL_DIAS = Math.floor((END_UTC_MS - START_UTC_MS) / 86400000) + 1;

// Frases do projeto por índice:
// idx = 1 (hoje) ... idx = TOTAL_DIAS-1 (dia 14)
// idx = TOTAL_DIAS (dia 15) -> TEXTO_FINAL_DIA_15
const frasesPorDia = {
  1: "Eu te amo muito, muito obrigado por me mostrar que posso amar e me sentir amado",
  2: "Amo você todos os dias após te conhecer, quero você na minha vida pra sempre",
  3: "Escolho te amar todos os dias e te auxiliar se precisar a todo instante, sou seu amor",
  4: "Quero te dar amor e carinho sempre que puder, te amo muito meu amor",
  5: "Quero te ganhar todos os dias e por isso fiz isso, pra mostrar que você é amada sim",
  6: "Espero que esteja lendo ainda, dedico tudo a você",
  7: "9 é meu numero da sorte, e acredito que desde que você apareceu na minha vida, todos os dias estão sendo meu dia de sorte",
  8: "Te amo infinitamente e nunca esqueça disso, nunca vou parar de te lembrar",
  9: "Espero que você seja minha mulher, a mãe dos meus filhos e minha companheira",
  10: "Vou falar que te amo novamente porque é o que sinto, Te amo meu amor",
  11: "Bom ta chegando, mas eu amei fazer esse site pra você, espero que você ainda esteja me amando nesse dia ainda kkkk",
  12: "Amor muito obrigado mesmo, por tudo, sem você eu provavelmente nunca mais acreditaria no amor"
};

const TEXTO_FINAL_DIA_15 =
  "Eu te amo muito, e espero que você seja muito feliz comigo todos os dias da sua vida, ta chegando o dia desse site nunca mais ser aberto, mas que fique guardado na sua mente";

function projetoDayIndex() {
  const nowParts = getSaoPauloParts(new Date());
  const now0Utc = Date.UTC(
    nowParts.year,
    nowParts.month - 1,
    nowParts.day,
    0,
    0,
    0
  );
  const diffDays = Math.floor((now0Utc - START_UTC_MS) / 86400000);
  return diffDays + 1; // hoje = 1
}

function updateFraseDoDia() {
  const idx = projetoDayIndex();

  if (idx < 1) {
    fraseEl.textContent = "❤️";
    return;
  }

  if (idx > TOTAL_DIAS) {
    fraseEl.textContent = "Amo você pra todo sempre";
    return;
  }

  // Último dia do projeto (dia 15 do mês)
  if (idx === TOTAL_DIAS) {
    fraseEl.textContent = TEXTO_FINAL_DIA_15;
    return;
  }

  // Dias normais
  fraseEl.textContent = frasesPorDia[idx] || "❤️";
}

function updateCountdown() {
  const now = saoPauloNowUtcMs();
  const next = nextSaoPauloMidnightUtcMs();
  let diffMs = next - now;
  if (diffMs < 0) diffMs = 0;

  const totalSec = Math.floor(diffMs / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;

  countdownEl.textContent = `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;

  // quando virar o dia, troca a frase
  if (diffMs <= 1000) updateFraseDoDia();
}

// Inicializa
updateFraseDoDia();
updateCountdown();
setInterval(updateCountdown, 1000);

const toggleBtn = document.getElementById("toggleSpotify");
const spotifyBox = document.getElementById("spotifyBox");

if (toggleBtn && spotifyBox) {
  toggleBtn.addEventListener("click", () => {
    const opened = spotifyBox.classList.toggle("open");
    toggleBtn.textContent = opened
      ? "🎵 Fechar Cornfield Chase"
      : "🎵 Tocar Cornfield Chase";
  });
}
