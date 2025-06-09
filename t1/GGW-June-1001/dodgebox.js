//////////////////////
// 화면 및 조작 세팅 //
//////////////////////

const game_container = document.getElementById("game_container");

// 게임 화면 크기
const game_area_width = 800;
const game_area_height = 600;

// 키보드 세팅
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

function handle_key_down(event) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
  }
}
function handle_key_up(event) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false;
  }
}

document.addEventListener("keydown", handle_key_down);
document.addEventListener("keyup", handle_key_up);

document.addEventListener("keydown", function (e) {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", function (e) {
  keys[e.key.toLowerCase()] = false;
});

// 게임 캔버스 세팅
const my_game_area = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = game_area_width;
    this.canvas.height = game_area_height;
    this.context = this.canvas.getContext("2d");
    if (!this.canvas.parentElement) {
      game_container.appendChild(this.canvas);
    }
    clearInterval(game_update_interval);
    game_update_interval = setInterval(update_game_area, 20);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

//////////////////
// 플레이어 세팅 //
//////////////////

let player = {
  x: game_area_width / 2,
  y: game_area_height / 2,
  radius: 20,
  color: "rgba(255,255,255,0.6)",
  speed: 6,

  trail: [],
  max_trail_length: 15,

  move: function () {
    if ((keys.ArrowUp || keys.w) && this.y - this.radius > 0) {
      this.y -= this.speed;
    }
    if ((keys.ArrowDown || keys.s) && this.y + this.radius < game_area_height) {
      this.y += this.speed;
    }
    if ((keys.ArrowLeft || keys.a) && this.x - this.radius > 0) {
      this.x -= this.speed;
    }
    if ((keys.ArrowRight || keys.d) && this.x + this.radius < game_area_width) {
      this.x += this.speed;
    }
  },

  update: function () {
    const ctx = my_game_area.context;

    if (this.x !== this.prev_x || this.y !== this.prev_y) {
      this.trail.push({ x: this.x, y: this.y, alpha: 1 });

      if (this.trail.length > this.max_trail_length) {
        this.trail.shift();
      }
    }

    this.trail.forEach((t, i) => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.shadowColor = "rgba(255,255,255,0.3)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
      t.alpha = (i / this.max_trail_length) ** 3;
    });

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgba(255,255,255,0.3)";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  },
};

/////////////
// 적 세팅 //
/////////////

let obstacles = [];

const rainbow_colors = [
  "rgba(231, 52, 52, 0.9)",
  "rgba(230, 130, 34, 0.9)",
  "rgba(241, 196, 15, 0.9)",
  "rgba(39, 174, 96, 0.9)",
  "rgba(0, 180, 170, 0.9)",
  "rgba(80, 130, 255, 0.9)",
  "rgba(155, 89, 182, 0.9)",
];

class Opponent {
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.xspeed = Math.sign(Math.random() - 0.5) * (Math.random() * 3.5 + 0.3);
    this.yspeed = Math.sign(Math.random() - 0.5) * (Math.random() * 3.5 + 0.3);
    this.color_index = Math.floor(Math.random() * rainbow_colors.length);
  }

  move() {
    const next_x = this.x + this.xspeed;
    const next_y = this.y + this.yspeed;
    if (next_x > game_area_width - this.width || next_x < 0) {
      this.xspeed = -Math.sign(this.xspeed) * (Math.random() * 3.5 + 0.3);
      this.color_index = (this.color_index + 1) % rainbow_colors.length;
    }
    if (next_y > game_area_height - this.height || next_y < 0) {
      this.yspeed = -Math.sign(this.yspeed) * (Math.random() * 3.5 + 0.3);
      this.color_index = (this.color_index + 1) % rainbow_colors.length;
    }
    this.x += this.xspeed;
    this.y += this.yspeed;
  }

  update() {
    const ctx = my_game_area.context;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowColor = rainbow_colors[this.color_index];
    ctx.shadowBlur = 15;
    ctx.fillStyle = rainbow_colors[this.color_index];
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}

///////////////////
// 적 스폰 시스템 //
///////////////////

// 적 생성 시 점수 +10 텍스트 표시
let floating_texts = [];

function add_floating_text(x, y, text = "+10") {
  floating_texts.push({
    x,
    y,
    text,
    opacity: 1,
    life: 50,
  });
}

function update_floating_texts(ctx) {
  for (let i = floating_texts.length - 1; i >= 0; i--) {
    const t = floating_texts[i];
    ctx.globalAlpha = t.opacity;
    ctx.font = "bold 20px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgb(255, 255, 255)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    t.y -= 0.5;
    t.opacity -= 1 / t.life;
    if (t.opacity <= 0) {
      floating_texts.splice(i, 1);
    }
  }
}

// 스폰 타이머, 다 그려지면 삭제하고 그 위치에 적을 생성

let spawn_timers = [];
const score_display = document.getElementById("score_display");

class spawn_timer {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.progress = 0;
  }

  update() {
    const ctx = my_game_area.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2 * this.progress);
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = 12;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();
  }

  spawn() {
    if (this.progress < 1.04) {
      this.progress += 0.02;
      return false;
    } else {
      obstacles.push(
        new Opponent(this.size, this.size, this.x - this.size / 2, this.y - this.size / 2)
      );
      score += 10;
      score_display.textContent = `점수: ${score}`;
      add_floating_text(this.x, this.y, "+10");
      return true;
    }
  }
}

function create_spawn_timer() {
  if (!game_running) {
    return;
  }

  const size = 30 + Math.random() * 30;
  const x = size + Math.random() * (game_area_width - size * 2);
  const y = size + Math.random() * (game_area_height - size * 2);

  const timer = new spawn_timer(x, y, size);
  spawn_timers.push(timer);
}

function start_spawning() {
  create_spawn_timer();
  spawn_timer_interval = setInterval(create_spawn_timer, 2000);
}

///////////////
// 게임 시작 //
///////////////

let game_running = false;
let score = 0;
let score_counter = 0;
let spawn_timer_interval;
let game_update_interval;
const center_overlay = document.getElementById("center_overlay");
const video = document.getElementById("background_video");

function start_game() {
  clearInterval(spawn_timer_interval);
  clearInterval(game_update_interval);
  start_btn.style.display = "none";
  center_overlay.style.display = "none";
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
  obstacles = [];
  spawn_timers = [];
  floating_texts = [];
  player.trail = [];
  score = 0;
  score_counter = 0;
  game_running = true;
  score_display.textContent = `점수: ${score}`;
  start_spawning();
  my_game_area.start();

  video.style.display = "block";
  video.play();
}

function update_game_area() {
  my_game_area.clear();
  if (!game_running) return;

  score_counter++;
  if (score_counter >= 5) {
    score++;
    score_counter = 0;
    score_display.textContent = `점수: ${score}`;
  }

  player.move();
  player.update();

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].move();
    obstacles[i].update();
  }

  for (let i = spawn_timers.length - 1; i >= 0; i--) {
    spawn_timers[i].update();
    if (spawn_timers[i].spawn()) {
      spawn_timers.splice(i, 1);
    }
  }

  update_floating_texts(my_game_area.context);
  check_collisions();
}

////////////////////////
// 게임 오버 및 초기화 //
////////////////////////

function check_collisions() {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const closest_x = Math.max(obs.x, Math.min(player.x, obs.x + obs.width));
    const closest_y = Math.max(obs.y, Math.min(player.y, obs.y + obs.height));
    const distance_x = player.x - closest_x;
    const distance_y = player.y - closest_y;
    if (Math.sqrt(distance_x ** 2 + distance_y ** 2) < player.radius) {
      game_over();
      return;
    }
  }
}

const final_score_display = document.getElementById("final_score");

function game_over() {
  game_running = false;
  center_overlay.style.display = "block";
  score_display.textContent = "";
  final_score_display.textContent = `점수: ${score}`;
  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
}

function restart_game() {
  center_overlay.style.display = "none";
  start_btn.style.display = "block";
  score_display.textContent = "";
  game_running = false;
  clearInterval(spawn_timer_interval);
  clearInterval(game_update_interval);
  obstacles = [];
  spawn_timers = [];
  floating_texts = [];
  my_game_area.clear();

  video.pause();
  video.style.display = "none";

  show_div(comment_start, start_btn);
  show_div(comment_restart, center_overlay);
}

const start_btn = document.getElementById("start_button");
const restart_btn = document.getElementById("restart_button");

const comment_start = document.getElementById("comment_start");
const comment_restart = document.getElementById("comment_restart");

function is_block(element) {
  return getComputedStyle(element).display === "block";
}

function show_div(div, menu) {
  if (is_block(menu)) {
    div.style.display = "block";
  } else {
    div.style.display = "none";
  }
}
show_div(comment_start, start_btn);
show_div(comment_restart, center_overlay);

start_btn.addEventListener("click", start_game);
restart_btn.addEventListener("click", restart_game);

document.addEventListener("keydown", function (event) {
  if (event.code !== "Space") {
    return;
  }
  if (is_block(start_btn)) {
    event.preventDefault();
    start_game();
    return;
  }
  if (is_block(center_overlay)) {
    event.preventDefault();
    restart_game();
    return;
  }
});

////////////////////////////////
// 보고있지 않을 때 게임 멈추기 //
////////////////////////////////

let is_game_active = true;

function pause_game() {
  clearInterval(game_update_interval);
  clearInterval(spawn_timer_interval);
  video.pause();
  is_game_active = false;
}

function resume_game() {
  if (!is_game_active && game_running) {
    game_update_interval = setInterval(update_game_area, 20);
    spawn_timer_interval = setInterval(create_spawn_timer, 2000);
    video.play();
    is_game_active = true;
  }
}

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    pause_game();
  } else {
    resume_game();
  }
});

window.addEventListener("blur", function () {
  pause_game();
});

window.addEventListener("focus", function () {
  resume_game();
});
