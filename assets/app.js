const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Decorative images on the field
const goblinsImg = new Image();
goblinsImg.src = 'assets/images/goblins.png';

const knightsImg = new Image();
knightsImg.src = 'assets/images/knights.png';

const caveImg = new Image();
caveImg.src = 'assets/images/cave.png';

const castleImg = new Image();
castleImg.src = 'assets/images/castle.png';

// Game config
const MAX_WAVE = 100; // количество волн
const AUTO_NEXT_WAVE = 15000; // время до автоматического запуска следующей волны

let gold = 600;                              // Стартовое золото
let lives = 15;                              // Жизни игрока

const TAUNT_DELAY = 3000; // задержка перед началом фраз гоблина/рыцаря при загрузке игры (до первой волны)
const TAUNT_DELAY_AFTER_WAVE = 7000; // задержка перед началом фраз после окончания волны

// Скейлинг врагов по волнам
const SCALING_HP_PER_WAVE = 0.055;           // +5.5% HP за каждую волну
const SCALING_HP_RAMP_START = 5;             // С какой волны начинается плавный рост HP
const SCALING_HP_RAMP_WAVES = 20;            // За сколько волн рост достигает максимума (×2)
const SCALING_BOSS_HP_MULT = 3;              // Множитель HP боссов (поверх остального)
const SCALING_BOSS_LATE_WAVE = 80;           // С какой волны боссы получают доп. усиление
const SCALING_BOSS_LATE_HP_MULT = 1.3;       // Доп. множитель HP боссов после SCALING_BOSS_LATE_WAVE
const SCALING_BOSS_LATE_SPEED_MULT = 1.2;    // Доп. множитель скорости боссов после SCALING_BOSS_LATE_WAVE
const SCALING_SPEED_PER_WAVE = 0.01;         // +1% скорости за каждую волну
const SCALING_REWARD_PER_TIER = 0.15;        // +15% награды за каждые 10 волн

// Состояние игры
let wave = 0;                                // Текущая волна
let score = 0;                               // Очки
let selectedTower = 'tower1';                 // Выбранный тип башни
let waveInProgress = false;                  // Волна сейчас идёт
let gameOver = false;                        // Игра окончена
let isPaused = false;                        // Пауза
let lastPauseTime = 0;                       // Время начала паузы
let totalPausedTime = 0;                     // Общее время на паузе (для корректировки игровых часов)
let sellMode = false;                        // Режим продажи башен
let nextWaveTimer = null;                       // ID таймера автозапуска следующей волны
let nextWaveTimerDuration = AUTO_NEXT_WAVE;  // Осталось мс до автозапуска волны

// Система фраз (тонтов) между волнами
let lastWaveEndTime = 0;                     // Время окончания последней волны
let tauntIntervalId = null;                  // ID интервала показа фраз
let currentTauntIndex = 0;                   // Общий индекс текущей фразы (синхронный для гоблина и рыцаря)
let tauntsWereShowing = false;               // Показывались ли фразы (для показа "Finally..." при старте волны)
let isGoblinTurn = true;                     // Чья очередь говорить (true = гоблин, false = рыцарь)

// Ротация фраз рыцарей после завершения волны (knightsOverlay)
let currentKnightMessageIndex = 0;           // Индекс текущей фразы рыцаря после волны


// cost — стоимость постройки
// upgradeCost — стоимость апгрейда одной ячейки
// cells — количество ячеек (стволов)
// damage — урон (по уровням)
// range — радиус поражения (по уровням)
// fireRate — скорострельность в мс, меньше = быстрее (по уровням)

// Tower 1 — базовые
const TOWER1_COST = 80;
const TOWER1_UPGRADE_COST = 100;
const TOWER1_CELLS = 1;

// Tower 1 — урон по уровням
const TOWER1_DAMAGE_LVL_1 = 20;
const TOWER1_DAMAGE_LVL_2 = 30;
const TOWER1_DAMAGE_LVL_3 = 40;

// Tower 1 — радиус по уровням
const TOWER1_RANGE_LVL_1 = 70;
const TOWER1_RANGE_LVL_2 = 77;
const TOWER1_RANGE_LVL_3 = 84;

// Tower 1 — скорострельность по уровням (мс)
const TOWER1_FIRE_RATE_LVL_1 = 300;
const TOWER1_FIRE_RATE_LVL_2 = 270;
const TOWER1_FIRE_RATE_LVL_3 = 243;

// Tower 2 — базовые
const TOWER2_COST = 150;
const TOWER2_UPGRADE_COST = 170;
const TOWER2_CELLS = 2;

// Tower 2 — урон по уровням
const TOWER2_DAMAGE_LVL_1 = 25;
const TOWER2_DAMAGE_LVL_2 = 38;
const TOWER2_DAMAGE_LVL_3 = 50;

// Tower 2 — радиус по уровням (lvl 1 = Tower 1 макс. уровень)
const TOWER2_RANGE_LVL_1 = 84;
const TOWER2_RANGE_LVL_2 = 92;
const TOWER2_RANGE_LVL_3 = 101;

// Tower 2 — скорострельность по уровням (мс)
const TOWER2_FIRE_RATE_LVL_1 = 500;
const TOWER2_FIRE_RATE_LVL_2 = 450;
const TOWER2_FIRE_RATE_LVL_3 = 405;

// Tower 3 — базовые
const TOWER3_COST = 250;
const TOWER3_UPGRADE_COST = 300;
const TOWER3_CELLS = 3;

// Tower 3 — урон по уровням
const TOWER3_DAMAGE_LVL_1 = 30;
const TOWER3_DAMAGE_LVL_2 = 45;
const TOWER3_DAMAGE_LVL_3 = 60;

// Tower 3 — радиус по уровням (lvl 1 = Tower 2 макс. уровень)
const TOWER3_RANGE_LVL_1 = 101;
const TOWER3_RANGE_LVL_2 = 111;
const TOWER3_RANGE_LVL_3 = 121;

// Tower 3 — скорострельность по уровням (мс)
const TOWER3_FIRE_RATE_LVL_1 = 1000;
const TOWER3_FIRE_RATE_LVL_2 = 900;
const TOWER3_FIRE_RATE_LVL_3 = 810;

// Таблицы апгрейдов (индекс = уровень - 1)
const TOWER_STATS = {
    tower1: {
        damage: [TOWER1_DAMAGE_LVL_1, TOWER1_DAMAGE_LVL_2, TOWER1_DAMAGE_LVL_3],
        range:  [TOWER1_RANGE_LVL_1,  TOWER1_RANGE_LVL_2,  TOWER1_RANGE_LVL_3],
        fireRate: [TOWER1_FIRE_RATE_LVL_1, TOWER1_FIRE_RATE_LVL_2, TOWER1_FIRE_RATE_LVL_3]
    },
    tower2: {
        damage: [TOWER2_DAMAGE_LVL_1, TOWER2_DAMAGE_LVL_2, TOWER2_DAMAGE_LVL_3],
        range:  [TOWER2_RANGE_LVL_1,  TOWER2_RANGE_LVL_2,  TOWER2_RANGE_LVL_3],
        fireRate: [TOWER2_FIRE_RATE_LVL_1, TOWER2_FIRE_RATE_LVL_2, TOWER2_FIRE_RATE_LVL_3]
    },
    tower3: {
        damage: [TOWER3_DAMAGE_LVL_1, TOWER3_DAMAGE_LVL_2, TOWER3_DAMAGE_LVL_3],
        range:  [TOWER3_RANGE_LVL_1,  TOWER3_RANGE_LVL_2,  TOWER3_RANGE_LVL_3],
        fireRate: [TOWER3_FIRE_RATE_LVL_1, TOWER3_FIRE_RATE_LVL_2, TOWER3_FIRE_RATE_LVL_3]
    }
};

const towerTypes = {
    tower1: {cost: TOWER1_COST, upgradeCost: TOWER1_UPGRADE_COST, cells: TOWER1_CELLS, name: 'Tower 1'},
    tower2: {cost: TOWER2_COST, upgradeCost: TOWER2_UPGRADE_COST, cells: TOWER2_CELLS, name: 'Tower 2'},
    tower3: {cost: TOWER3_COST, upgradeCost: TOWER3_UPGRADE_COST, cells: TOWER3_CELLS, name: 'Tower 3'}
};

// Настройки врагов
// hp — здоровье
// speed — скорость передвижения
// reward — награда за убийство (золото)
// color — цвет отрисовки
// size — размер (радиус)

// Basic — обычный враг
const BASIC_HP = 160;
const BASIC_SPEED = 2.2;
const BASIC_REWARD = 6;
const BASIC_COLOR = '#c23a3a';
const BASIC_SIZE = 10;

// Fast — быстрый враг
const FAST_HP = 90;
const FAST_SPEED = 4.5;
const FAST_REWARD = 8;
const FAST_COLOR = '#d4762c';
const FAST_SIZE = 8;

// Tank — танк
const TANK_HP = 450;
const TANK_SPEED = 1.5;
const TANK_REWARD = 20;
const TANK_COLOR = '#6a3a9a';
const TANK_SIZE = 14;

// Boss — босс
const BOSS_HP = 1170;
const BOSS_SPEED = 1.2;
const BOSS_REWARD = 50;
const BOSS_COLOR = '#d4326c';
const BOSS_SIZE = 20;

const enemyTypes = {
    basic: {hp: BASIC_HP, speed: BASIC_SPEED, reward: BASIC_REWARD, color: BASIC_COLOR, size: BASIC_SIZE},
    fast: {hp: FAST_HP, speed: FAST_SPEED, reward: FAST_REWARD, color: FAST_COLOR, size: FAST_SIZE},
    tank: {hp: TANK_HP, speed: TANK_SPEED, reward: TANK_REWARD, color: TANK_COLOR, size: TANK_SIZE},
    boss: {hp: BOSS_HP, speed: BOSS_SPEED, reward: BOSS_REWARD, color: BOSS_COLOR, size: BOSS_SIZE}
};

// Path waypoints - adjusted for vertical A5 format
const path = [
    {x: 40, y: 80},
    {x: 150, y: 80},
    {x: 150, y: 200},
    {x: 480, y: 200},
    {x: 480, y: 320},
    {x: 150, y: 320},
    {x: 150, y: 440},
    {x: 480, y: 440},
    {x: 480, y: 560},
    {x: 300, y: 560},
    {x: 300, y: 660}
];

// Game objects
let towers = [];
let enemies = [];
let projectiles = [];
let particles = [];

// Grid for tower placement
const gridSize = 40;
const grid = [];
for (let x = 0; x < canvas.width / gridSize; x++) {
    grid[x] = [];
    for (let y = 0; y < canvas.height / gridSize; y++) {
        grid[x][y] = {occupied: false, isPath: false};
    }
}

// Mark path cells and nearby cells
function markPathCells() {
    // First mark the path itself
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];
        const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) / 10;

        for (let j = 0; j <= steps; j++) {
            const t = j / steps;
            const x = Math.floor((start.x + (end.x - start.x) * t) / gridSize);
            const y = Math.floor((start.y + (end.y - start.y) * t) / gridSize);
            if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
                grid[x][y].isPath = true;
            }
        }
    }

    // Then mark cells adjacent to path as nearPath
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            if (grid[x][y].isPath) {
                // Mark all 8 neighbors as nearPath
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[0].length) {
                            if (!grid[nx][ny].isPath) {
                                grid[nx][ny].nearPath = true;
                            }
                        }
                    }
                }
            }
        }
    }
}

markPathCells();

// Hide all message overlays
function hideAllOverlays() {
    var overlays = ['attackOverlay', 'doneOverlay', 'oneOverlay', 'pauseOverlay', 'tempOverlay', 'finallyOverlay', 'knightsOverlay', 'knightsTempOverlay'];
    overlays.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('show');
    });
}

// Taunting messages system
var tauntMessages = [
    'Are you scared?',
    'You are so weak and naive )))',
    'I feel your fear ))'
];

function showTaunt() {
    if (waveInProgress || gameOver) {
        stopTaunts();
        return;
    }

    var tempOverlay = document.getElementById('tempOverlay');
    var knightsTempOverlay = document.getElementById('knightsTempOverlay');

    if (isGoblinTurn) {
        // Hide knight overlay, show goblin overlay
        if (knightsTempOverlay) knightsTempOverlay.classList.remove('show');

        if (tempOverlay) {
            var textElements = tempOverlay.querySelectorAll(':scope > .pause-text');
            textElements.forEach(function (el, i) {
                el.style.display = (i === currentTauntIndex % textElements.length) ? 'block' : 'none';
            });
            tempOverlay.classList.add('show');
            tauntsWereShowing = true;
        }
    } else {
        // Hide goblin overlay, show knight overlay
        if (tempOverlay) tempOverlay.classList.remove('show');

        if (knightsTempOverlay) {
            var knightTextElements = knightsTempOverlay.querySelectorAll(':scope > .pause-text');
            knightTextElements.forEach(function (el, i) {
                el.style.display = (i === currentTauntIndex % knightTextElements.length) ? 'block' : 'none';
            });
            knightsTempOverlay.classList.add('show');
            tauntsWereShowing = true;
        }

        // Advance shared index after both goblin and knight showed the same phrase
        var maxLen = Math.max(
            tempOverlay ? tempOverlay.querySelectorAll(':scope > .pause-text').length : 1,
            knightsTempOverlay ? knightsTempOverlay.querySelectorAll(':scope > .pause-text').length : 1
        );
        currentTauntIndex = (currentTauntIndex + 1) % maxLen;
    }

    isGoblinTurn = !isGoblinTurn;
}

var tauntTimeoutId = null;

function startTauntTimer(delay) {
    // Clear any existing timers first
    stopTaunts();

    lastWaveEndTime = Date.now();

    // Wait then start showing taunts
    tauntTimeoutId = setTimeout(function () {
        if (!waveInProgress && !gameOver) {
            console.log('Starting taunts');
            showTaunt();
            tauntIntervalId = setInterval(showTaunt, 4000);
        }
    }, delay || TAUNT_DELAY);
}

function stopTaunts() {
    if (tauntTimeoutId) {
        clearTimeout(tauntTimeoutId);
        tauntTimeoutId = null;
    }
    if (tauntIntervalId) {
        clearInterval(tauntIntervalId);
        tauntIntervalId = null;
    }
    isGoblinTurn = true;
    var tempOverlay = document.getElementById('tempOverlay');
    if (tempOverlay) tempOverlay.classList.remove('show');
    var knightsTempOverlay = document.getElementById('knightsTempOverlay');
    if (knightsTempOverlay) knightsTempOverlay.classList.remove('show');
}

// Game started flag
let gameStarted = false;

// Toggle play/pause (unified button)
function togglePlayPause() {
    if (gameOver) return;
    const btn = document.getElementById('playPauseBtn');
    const pauseOverlay = document.getElementById('pauseOverlay');

    if (!gameStarted) {
        // First press — start the game + first wave
        gameStarted = true;
        spawnWave();
        btn.textContent = 'Pause';
        updateNextWaveBtn();
        updatePauseBtn();
        // Attack overlay is shown in spawnWave with Finally logic
        return;
    }

    isPaused = !isPaused;

    const attackOverlay = document.getElementById('attackOverlay');

    if (isPaused) {
        lastPauseTime = performance.now();
        btn.textContent = 'Resume';
        btn.classList.add('paused');
        pauseOverlay.classList.add('show');
        attackOverlay.classList.remove('show');
        var finallyOv = document.getElementById('finallyOverlay');
        if (finallyOv) finallyOv.classList.remove('show');
    } else {
        totalPausedTime += performance.now() - lastPauseTime;
        btn.textContent = 'Pause';
        btn.classList.remove('paused');
        pauseOverlay.classList.remove('show');
        attackOverlay.classList.add('show');
    }
    updatePauseBtn();
}

// Legacy alias so keyboard shortcut still works
function togglePause() {
    if (!gameStarted) return;
    togglePlayPause();
}

// Update Next Wave button state
function updateNextWaveBtn() {
    const btn = document.getElementById('nextWaveBtn');
    btn.disabled = waveInProgress || !gameStarted || gameOver;
    if (!waveInProgress && nextWaveTimer === null) {
        btn.textContent = 'Next Wave';
    }
}

// Update Pause button state - disabled when no wave is in progress
function updatePauseBtn() {
    const btn = document.getElementById('playPauseBtn');
    // Pause is available only when game started, wave is in progress, and game is not over
    // Also allow unpause when paused
    btn.disabled = !gameStarted || (!waveInProgress && !isPaused) || gameOver;
}

// Toggle sell mode
function toggleSellMode() {
    sellMode = !sellMode;
    const sellBtn = document.getElementById('sellBtn');

    if (sellMode) {
        sellBtn.textContent = 'Cancel Sell';
        sellBtn.classList.add('sell-active');
        canvas.style.cursor = 'not-allowed';
    } else {
        sellBtn.textContent = 'Sell Mode';
        sellBtn.classList.remove('sell-active');
        canvas.style.cursor = 'crosshair';
    }
}

// Tower class - multi-cell with individual upgrades and shooting
class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        const stats = towerTypes[type];
        this.cellCount = stats.cells;
        this.upgradeCost = stats.upgradeCost;
        this.statsTable = TOWER_STATS[type];

        // Each cell has its own data: level, lastFire, position
        this.cells = [];
        const cellSize = 14;
        const spacing = cellSize + 2;
        const totalWidth = this.cellCount * cellSize + (this.cellCount - 1) * 2;
        const startX = this.x - totalWidth / 2 + cellSize / 2;

        for (let i = 0; i < this.cellCount; i++) {
            this.cells.push({
                level: 1,
                lastFire: 0,
                x: startX + i * spacing,
                y: this.y,
                target: null
            });
        }

        this.showRange = false;
    }

    // Радиус — среднее значение по уровням всех ячеек
    get range() {
        const totalRange = this.cells.reduce((sum, c) => sum + this.statsTable.range[c.level - 1], 0);
        return totalRange / this.cellCount;
    }

    // Скорострельность ячейки по её уровню
    getCellFireRate(cellIndex) {
        const level = this.cells[cellIndex].level;
        return this.statsTable.fireRate[level - 1];
    }

    // Урон ячейки по её уровню
    getCellDamage(cellIndex) {
        const level = this.cells[cellIndex].level;
        return this.statsTable.damage[level - 1];
    }

    // Upgrade specific cell
    upgradeCell(cellIndex) {
        if (cellIndex < 0 || cellIndex >= this.cellCount) return false;
        if (this.cells[cellIndex].level >= 3) return false;
        if (gold < this.upgradeCost) return false;

        gold -= this.upgradeCost;
        this.cells[cellIndex].level++;
        updateUI();
        return true;
    }

    // Check if click is on a specific cell and return its index
    getCellAtPosition(clickX, clickY) {
        const cellSize = 14;
        const halfSize = cellSize / 2 + 4; // добавляем немного для удобства клика

        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (Math.abs(clickX - cell.x) < halfSize && Math.abs(clickY - cell.y) < halfSize) {
                return i;
            }
        }
        return -1;
    }

    getUpgradeCost() {
        return this.upgradeCost;
    }

    // Calculate sell value (50% of total investment)
    getSellValue() {
        const baseCost = towerTypes[this.type].cost;
        let totalUpgradeCost = 0;

        // Calculate upgrade costs for each cell
        for (const cell of this.cells) {
            // Each level above 1 costs upgradeCost
            totalUpgradeCost += (cell.level - 1) * this.upgradeCost;
        }

        const totalInvestment = baseCost + totalUpgradeCost;
        return Math.floor(totalInvestment * 0.5);
    }

    // Find target for a specific cell
    findTargetForCell(cellIndex) {
        const cell = this.cells[cellIndex];
        let closest = null;
        let closestDist = this.range;

        for (const enemy of enemies) {
            const dist = Math.hypot(enemy.x - cell.x, enemy.y - cell.y);
            if (dist < closestDist) {
                closest = enemy;
                closestDist = dist;
            }
        }
        return closest;
    }

    update(time) {
        // Each cell independently finds target and fires
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            cell.target = this.findTargetForCell(i);

            if (cell.target) {
                const fireRate = this.getCellFireRate(i);
                if (time - cell.lastFire > fireRate) {
                    this.fireFromCell(i);
                    cell.lastFire = time;
                }
            }
        }
    }

    fireFromCell(cellIndex) {
        const cell = this.cells[cellIndex];
        if (!cell.target) return;

        projectiles.push(new Projectile(
            cell.x, cell.y,
            cell.target,
            this.getCellDamage(cellIndex),
            '#cc2222',
            this.type
        ));
    }

    draw() {
        const cellSize = 14;
        const half = cellSize / 2;
        const color = '#cc2222';

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw each cell
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            const cellX = cell.x;
            const cellY = cell.y;
            const level = cell.level;

            // Pre-computed wobble for this cell (stable)
            const seed = cellX * 100 + cellY + i * 50;
            const w1 = Math.sin(seed * 0.1) * 1;
            const w2 = Math.cos(seed * 0.2) * 1;
            const w3 = Math.sin(seed * 0.3) * 1;
            const w4 = Math.cos(seed * 0.4) * 1;

            // Draw square (hand-drawn wobbly)
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(cellX - half + w1, cellY - half + w2);
            ctx.lineTo(cellX + half + w2, cellY - half + w3);
            ctx.lineTo(cellX + half + w3, cellY + half + w4);
            ctx.lineTo(cellX - half + w4, cellY + half + w1);
            ctx.closePath();
            ctx.stroke();

            // Draw X inside
            const inset = 2;
            ctx.beginPath();
            ctx.moveTo(cellX - half + inset + w2, cellY - half + inset + w1);
            ctx.lineTo(cellX + half - inset + w4, cellY + half - inset + w3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cellX + half - inset + w3, cellY - half + inset + w2);
            ctx.lineTo(cellX - half + inset + w1, cellY + half - inset + w4);
            ctx.stroke();

            // Level indicators - dots above each cell
            const dotSpacing = 4;
            const totalDotsWidth = (level - 1) * dotSpacing;
            const dotStartX = cellX - totalDotsWidth / 2;
            for (let j = 0; j < level; j++) {
                ctx.beginPath();
                ctx.arc(dotStartX + j * dotSpacing, cellY - half - 4, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }

        // Range indicator on hover/selection
        if (this.showRange) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = sellMode ? '#c23a3a' : '#0000ff';
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Show sell value in sell mode
            if (sellMode) {
                const sellValue = this.getSellValue();
                ctx.font = '16px Solena, cursive';
                ctx.fillStyle = '#2a7a4a';
                ctx.textAlign = 'center';
                ctx.fillText('+' + sellValue + ' gold', this.x, this.y - 25);
            }
        }
    }
}

// Projectile class
class Projectile {
    constructor(x, y, target, damage, color, type) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.type = type;
        this.speed = 8;
        this.size = 5;
    }

    update() {
        if (!this.target || this.target.hp <= 0) {
            return false;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
            this.hit();
            return false;
        }

        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
        return true;
    }

    hit() {
        // Simple damage to target
        this.target.takeDamage(this.damage);

        // Hit particles
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(this.x, this.y, this.color, 'hit'));
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Trail - ink streak
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        ctx.lineTo(this.x - Math.cos(angle) * 12, this.y - Math.sin(angle) * 12);
        ctx.strokeStyle = this.color + '88';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Enemy class
class Enemy {
    constructor(type) {
        const stats = enemyTypes[type];
        this.type = type;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.speed = stats.speed;
        this.baseSpeed = stats.speed;
        this.reward = stats.reward;
        this.color = stats.color;
        this.size = stats.size;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.slowTimer = 0;
        this.slowAmount = 1;
    }

    update() {
        if (this.pathIndex >= path.length - 1) {
            lives--;
            updateUI();

            // Show "Good... ha, ha, ha!!!" when enemy passes through
            hideAllOverlays();
            var oneOverlay = document.getElementById('oneOverlay');
            if (oneOverlay) {
                oneOverlay.classList.add('show');
                setTimeout(function () {
                    oneOverlay.classList.remove('show');
                    // Return attackOverlay if wave is still in progress
                    if (waveInProgress && !isPaused && !gameOver) {
                        document.getElementById('attackOverlay').classList.add('show');
                    }
                }, 2000);
            }

            if (lives <= 0) {
                endGame();
            }
            return false;
        }

        // Slow effect
        if (this.slowTimer > 0) {
            this.slowTimer--;
            this.speed = this.baseSpeed * this.slowAmount;
        } else {
            this.speed = this.baseSpeed;
        }

        const target = path[this.pathIndex + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        return this.hp > 0;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            gold += this.reward;
            score += this.reward * 10;
            updateUI();
            // Death particles
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(this.x, this.y, this.color, 'death'));
            }
        }
    }

    draw() {
        // Body - hand drawn circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner detail
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        // HP bar - notebook style
        const hpPercent = this.hp / this.maxHp;
        const barWidth = this.size * 2.5;
        const barHeight = 4;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 12, barWidth, barHeight);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, this.y - this.size - 12, barWidth, barHeight);

        const hpColor = hpPercent > 0.5 ? '#2a7a4a' : hpPercent > 0.25 ? '#d4762c' : '#c23a3a';
        ctx.fillStyle = hpColor;
        ctx.fillRect(this.x - barWidth / 2 + 1, this.y - this.size - 11, (barWidth - 2) * hpPercent, barHeight - 2);

        // Slow indicator - blue swirl
        if (this.slowTimer > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#1a4a7a66';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

// Particle class
class Particle {
    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.life = 1;
        this.decay = type === 'explosion' ? 0.03 : 0.05;
        const angle = Math.random() * Math.PI * 2;
        const speed = type === 'explosion' ? Math.random() * 5 + 2 : Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = type === 'explosion' ? Math.random() * 4 + 2 : Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.95;
        this.vy *= 0.95;
        return this.life > 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(this.life * 255).toString(16).padStart(2, '0');
        ctx.fill();
    }
}

// Generate offset path with intermediate points for hand-drawn effect
function generateOffsetPathDetailed(originalPath, offset) {
    const result = [];

    for (let i = 0; i < originalPath.length; i++) {
        const curr = originalPath[i];
        let perpX, perpY;

        if (i === 0) {
            const next = originalPath[1];
            const dist = Math.hypot(next.x - curr.x, next.y - curr.y);
            perpX = -(next.y - curr.y) / dist;
            perpY = (next.x - curr.x) / dist;
        } else if (i === originalPath.length - 1) {
            const prev = originalPath[i - 1];
            const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
            perpX = -(curr.y - prev.y) / dist;
            perpY = (curr.x - prev.x) / dist;
        } else {
            const prev = originalPath[i - 1];
            const next = originalPath[i + 1];

            const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
            const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);

            const p1x = -(curr.y - prev.y) / d1;
            const p1y = (curr.x - prev.x) / d1;
            const p2x = -(next.y - curr.y) / d2;
            const p2y = (next.x - curr.x) / d2;

            perpX = (p1x + p2x) / 2;
            perpY = (p1y + p2y) / 2;
            const len = Math.hypot(perpX, perpY);
            if (len > 0) {
                perpX /= len;
                perpY /= len;
            }
        }

        result.push({
            x: curr.x + perpX * offset,
            y: curr.y + perpY * offset,
            isCorner: i > 0 && i < originalPath.length - 1
        });

        // Add intermediate points between corners for wobble
        if (i < originalPath.length - 1) {
            const next = originalPath[i + 1];
            const dist = Math.hypot(next.x - curr.x, next.y - curr.y);
            const segments = Math.floor(dist / 40); // One point every 40px

            let nextPerpX, nextPerpY;
            if (i + 1 === originalPath.length - 1) {
                nextPerpX = perpX;
                nextPerpY = perpY;
            } else {
                const nextNext = originalPath[i + 2];
                const d1 = Math.hypot(next.x - curr.x, next.y - curr.y);
                const d2 = Math.hypot(nextNext.x - next.x, nextNext.y - next.y);
                const p1x = -(next.y - curr.y) / d1;
                const p1y = (next.x - curr.x) / d1;
                const p2x = -(nextNext.y - next.y) / d2;
                const p2y = (nextNext.x - next.x) / d2;
                nextPerpX = (p1x + p2x) / 2;
                nextPerpY = (p1y + p2y) / 2;
                const len = Math.hypot(nextPerpX, nextPerpY);
                if (len > 0) {
                    nextPerpX /= len;
                    nextPerpY /= len;
                }
            }

            for (let j = 1; j <= segments; j++) {
                const t = j / (segments + 1);
                const midX = curr.x + (next.x - curr.x) * t;
                const midY = curr.y + (next.y - curr.y) * t;
                const midPerpX = perpX + (nextPerpX - perpX) * t;
                const midPerpY = perpY + (nextPerpY - perpY) * t;

                result.push({
                    x: midX + midPerpX * offset,
                    y: midY + midPerpY * offset,
                    isCorner: false
                });
            }
        }
    }
    return result;
}

// Two parallel lines forming the path edges
const pathWidth = 18;
const leftPath = generateOffsetPathDetailed(path, -pathWidth);
const rightPath = generateOffsetPathDetailed(path, pathWidth);

// Pre-generate random offsets for hand-drawn effect (stable, not every frame)
const leftWobble = leftPath.map((p, i) => {
    const wobbleAmount = p.isCorner ? 1 : 1.5;
    return {
        x: (Math.sin(i * 3.7 + 0.5) * wobbleAmount) + (Math.cos(i * 7.1) * wobbleAmount * 0.3),
        y: (Math.cos(i * 4.3 + 0.3) * wobbleAmount) + (Math.sin(i * 5.9) * wobbleAmount * 0.3)
    };
});
const rightWobble = rightPath.map((p, i) => {
    const wobbleAmount = p.isCorner ? 1 : 1.5;
    return {
        x: (Math.sin(i * 2.9 + 1.2) * wobbleAmount) + (Math.cos(i * 6.3) * wobbleAmount * 0.3),
        y: (Math.cos(i * 3.1 + 0.8) * wobbleAmount) + (Math.sin(i * 4.7) * wobbleAmount * 0.3)
    };
});

// Draw a path with rounded corners at corner points only, lineTo for others
function drawRoundedPathWithWobble(points, wobble, radius) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x + wobble[0].x, points[0].y + wobble[0].y);

    for (let i = 1; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const w = wobble[i];
        const wNext = wobble[i + 1];

        if (curr.isCorner) {
            // Use arcTo for corners
            ctx.arcTo(
                curr.x + w.x,
                curr.y + w.y,
                next.x + wNext.x,
                next.y + wNext.y,
                radius
            );
        } else {
            // Use lineTo for regular points
            ctx.lineTo(curr.x + w.x, curr.y + w.y);
        }
    }

    const last = points.length - 1;
    ctx.lineTo(points[last].x + wobble[last].x, points[last].y + wobble[last].y);
}

// Draw cave at the start of the path (enemy spawn point)
function drawCave() {
    if (!caveImg.complete || !caveImg.naturalWidth) return;

    const caveX = path[0].x;
    const caveY = path[0].y;
    const cw = 150;
    const ch = cw * (caveImg.naturalHeight / caveImg.naturalWidth);

    ctx.drawImage(caveImg, caveX - cw / 2 + 18, caveY - ch + 56, cw, ch);
}

// Draw epic castle at the end of the path (player base to defend)
function drawCastle() {
    if (!castleImg.complete || !castleImg.naturalWidth) return;

    const castleX = path[path.length - 1].x;
    const castleY = path[path.length - 1].y;
    const cw = 210;
    const ch = cw * (castleImg.naturalHeight / castleImg.naturalWidth);

    ctx.drawImage(castleImg, castleX - cw / 2, canvas.height - ch, cw, ch);
}

// Draw path - two parallel blue pen lines with rounded corners and hand-drawn effect
function drawPath() {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cornerRadius = 15;

    // Left edge line
    drawRoundedPathWithWobble(leftPath, leftWobble, cornerRadius);
    ctx.strokeStyle = '#2255cc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Left edge - second stroke for pen effect
    drawRoundedPathWithWobble(leftPath, leftWobble.map(w => ({x: w.x + 0.5, y: w.y + 0.5})), cornerRadius);
    ctx.strokeStyle = 'rgba(34, 85, 204, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Right edge line
    drawRoundedPathWithWobble(rightPath, rightWobble, cornerRadius);
    ctx.strokeStyle = '#2255cc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right edge - second stroke for pen effect
    drawRoundedPathWithWobble(rightPath, rightWobble.map(w => ({x: w.x + 0.5, y: w.y + 0.5})), cornerRadius);
    ctx.strokeStyle = 'rgba(34, 85, 204, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// Draw grid - notebook paper style
// Draw decorative images on the field
function drawFieldDecor() {
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Goblins — top-right
    if (goblinsImg.complete && goblinsImg.naturalWidth) {
        const gw = 138;
        const gh = gw * (goblinsImg.naturalHeight / goblinsImg.naturalWidth);
        ctx.drawImage(goblinsImg, canvas.width - gw - 15, 10, gw, gh);
    }

    // Knights — bottom-left
    if (knightsImg.complete && knightsImg.naturalWidth) {
        const kw = 170;
        const kh = kw * (knightsImg.naturalHeight / knightsImg.naturalWidth);
        ctx.drawImage(knightsImg, 15, canvas.height - kh - 15, kw, kh);
    }

    ctx.restore();

    ctx.globalAlpha = 1;
}

function drawGrid() {
    const smallGrid = 16; // Small visual grid for notebook look

    // Horizontal blue lines
    ctx.strokeStyle = 'rgba(140, 180, 220, 0.6)';
    ctx.lineWidth = 0.5;

    for (let y = 0; y <= canvas.height; y += smallGrid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Vertical lines - same blue
    ctx.strokeStyle = 'rgba(140, 180, 220, 0.5)';
    for (let x = 0; x <= canvas.width; x += smallGrid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

// Draw placement preview
function drawPlacementPreview() {
    if (mouseX <= 0 || mouseY <= 0) return;

    const canPlace = canPlaceTowerAt(mouseX, mouseY) && gold >= towerTypes[selectedTower].cost;
    const cellCount = towerTypes[selectedTower].cells;
    const cellSize = 14;
    const spacing = cellSize + 2;
    const totalWidth = cellCount * cellSize + (cellCount - 1) * 2;
    const startX = mouseX - totalWidth / 2 + cellSize / 2;
    const color = '#cc2222';

    if (canPlace) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw each cell
        for (let i = 0; i < cellCount; i++) {
            const cellX = startX + i * spacing;
            const half = cellSize / 2;

            // Draw square
            ctx.beginPath();
            ctx.moveTo(cellX - half, mouseY - half);
            ctx.lineTo(cellX + half, mouseY - half);
            ctx.lineTo(cellX + half, mouseY + half);
            ctx.lineTo(cellX - half, mouseY + half);
            ctx.closePath();
            ctx.stroke();

            // Draw X inside
            const inset = 2;
            ctx.beginPath();
            ctx.moveTo(cellX - half + inset, mouseY - half + inset);
            ctx.lineTo(cellX + half - inset, mouseY + half - inset);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cellX + half - inset, mouseY - half + inset);
            ctx.lineTo(cellX - half + inset, mouseY + half - inset);
            ctx.stroke();
        }

        // Preview range
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, towerTypes[selectedTower].range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 34, 34, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    } else {
        // Invalid placement - small red X
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#c23a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 8, mouseY - 8);
        ctx.lineTo(mouseX + 8, mouseY + 8);
        ctx.moveTo(mouseX + 8, mouseY - 8);
        ctx.lineTo(mouseX - 8, mouseY + 8);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

// Spawn wave
let spawnIntervalId = null;

function spawnWave() {
    if (waveInProgress || gameOver) return;
    if (wave >= MAX_WAVE) {
        winGame(); // Show victory when already at last wave (e.g. just completed it)
        return;
    }

    if (nextWaveTimer) {
        clearInterval(nextWaveTimer);
        nextWaveTimer = null;
    }
    document.getElementById('nextWaveBtn').textContent = 'Next Wave';

    wave++;
    waveInProgress = true;
    updateNextWaveBtn();
    updatePauseBtn();
    updateUI();

    // Show "Attack...!!!" when wave starts (hide all other overlays)
    var showFinally = tauntsWereShowing;
    stopTaunts();
    hideAllOverlays();
    tauntsWereShowing = false;

    if (showFinally) {
        // Show "Finally..." for 3 seconds, then show Attack
        var finallyOverlay = document.getElementById('finallyOverlay');
        if (finallyOverlay) {
            finallyOverlay.classList.add('show');
            setTimeout(function () {
                finallyOverlay.classList.remove('show');
                if (waveInProgress && !isPaused && !gameOver) {
                    document.getElementById('attackOverlay').classList.add('show');
                }
            }, 500);
        } else {
            document.getElementById('attackOverlay').classList.add('show');
        }
    } else {
        document.getElementById('attackOverlay').classList.add('show');
    }

    // === Состав волн ===
    // Каждая 10-я волна — босс-волна (особый состав)
    const isBossWave = wave % 10 === 0;
    const bossWaveTier = wave / 10;              // Уровень босс-волны (1, 2, 3...)

    const spawnQueue = [];
    const enemyCount = Math.floor(6 + wave * 2.2); // Кол-во врагов растёт с каждой волной

    if (isBossWave) {
        // Босс-волна: N боссов + N×2 танков (N = номер босс-волны)
        // Волна 10: 1 босс + 2 танка, волна 20: 2 босса + 4 танка, и т.д.
        for (let i = 0; i < bossWaveTier; i++) spawnQueue.push('boss');
        for (let i = 0; i < bossWaveTier * 2; i++) spawnQueue.push('tank');
    } else if (wave > 60) {
        // Волны 61-99: тяжёлый микс — 35% боссы, 30% танки, 35% быстрые
        for (let i = 0; i < enemyCount; i++) {
            const rand = Math.random();
            if (rand < 0.35) spawnQueue.push('boss');
            else if (rand < 0.65) spawnQueue.push('tank');
            else spawnQueue.push('fast');
        }
    } else if (wave > 40) {
        // Волны 41-60: танковый микс — 10% боссы, 45% танки, 30% быстрые, 15% обычные
        for (let i = 0; i < enemyCount; i++) {
            const rand = Math.random();
            if (rand < 0.10) spawnQueue.push('boss');
            else if (rand < 0.55) spawnQueue.push('tank');
            else if (rand < 0.85) spawnQueue.push('fast');
            else spawnQueue.push('basic');
        }
    } else if (wave > 20) {
        // Волны 21-40: без обычных — 35% танки, 65% быстрые
        for (let i = 0; i < enemyCount; i++) {
            const rand = Math.random();
            if (rand < 0.35) {
                spawnQueue.push('tank');
            } else {
                spawnQueue.push('fast');
            }
        }
    } else {
        // Волны 1-20: обычный микс с постепенным появлением новых типов
        // Волна 1: только basic
        // С волны 2: шанс 35% на fast
        // С волны 3: шанс 25% на tank
        // С волны 5: шанс 15% на boss (только последний враг в волне)
        for (let i = 0; i < enemyCount; i++) {
            let type = 'basic';
            const rand = Math.random();
            if (wave >= 2 && rand < 0.35) type = 'fast';
            if (wave >= 3 && rand < 0.25) type = 'tank';
            if (wave >= 5 && rand < 0.15 && i === enemyCount - 1) type = 'boss';
            spawnQueue.push(type);
        }
    }

    let spawned = 0;

    spawnIntervalId = setInterval(() => {
        if (isPaused) return;

        if (spawned >= spawnQueue.length || gameOver) {
            clearInterval(spawnIntervalId);
            spawnIntervalId = null;
            return;
        }

        const type = spawnQueue[spawned];

        // === Скейлинг врагов по волнам ===
        const enemy = new Enemy(type);

        // 1) Базовый скейлинг HP за волну
        enemy.hp *= 1 + (wave - 1) * SCALING_HP_PER_WAVE;

        // 2) Плавный рост HP (линейная интерполяция ×1 → ×2)
        if (wave > SCALING_HP_RAMP_START) {
            const bonusMult = Math.min((wave - SCALING_HP_RAMP_START) / SCALING_HP_RAMP_WAVES, 1.0);
            enemy.hp *= 1 + bonusMult;
        }

        // 3) Множитель HP боссов
        if (type === 'boss') {
            enemy.hp *= SCALING_BOSS_HP_MULT;
        }

        // 4) Позднее усиление боссов (HP + скорость)
        if (wave > SCALING_BOSS_LATE_WAVE && type === 'boss') {
            enemy.hp *= SCALING_BOSS_LATE_HP_MULT;
            enemy.speed *= SCALING_BOSS_LATE_SPEED_MULT;
            enemy.baseSpeed = enemy.speed;
        }

        // 5) Скейлинг скорости за волну
        enemy.speed *= 1 + (wave - 1) * SCALING_SPEED_PER_WAVE;
        enemy.baseSpeed = enemy.speed;

        enemy.maxHp = enemy.hp;

        // 6) Скейлинг награды за тир (каждые 10 волн)
        const tier = Math.floor((wave - 1) / 10);
        enemy.reward = Math.floor(enemy.reward * (1 + tier * SCALING_REWARD_PER_TIER));

        enemies.push(enemy);
        spawned++;
    }, isBossWave ? 1200 : 800 - Math.min(wave * 30, 500));
}

function startNextWaveTimer() {
    if (nextWaveTimer) {
        clearInterval(nextWaveTimer);
    }
    nextWaveTimerDuration = AUTO_NEXT_WAVE;
    const btn = document.getElementById('nextWaveBtn');

    nextWaveTimer = setInterval(() => {
        if (isPaused) return;

        nextWaveTimerDuration -= 1000;
        const seconds = Math.round(nextWaveTimerDuration / 1000);
        btn.textContent = `Next Wave in ${seconds}s`;

        if (nextWaveTimerDuration <= 0) {
            clearInterval(nextWaveTimer);
            nextWaveTimer = null;
            btn.textContent = 'Next Wave';
            spawnWave();
        }
    }, 1000);
}

// Check wave complete
function checkWaveComplete() {
    if (!waveInProgress || enemies.length !== 0 || spawnIntervalId !== null) return;

    waveInProgress = false;

    // Hide "Attack...!!!" overlay when wave ends
    document.getElementById('attackOverlay').classList.remove('show');

    // Victory: show immediately after last wave is cleared
    if (wave >= MAX_WAVE) {
        winGame();
        updateNextWaveBtn();
        return;
    }

    gold += 20 + Math.min(wave * 3, 80);

    // Recover +2 lives after boss waves (every 10th wave)
    if (wave % 10 === 0 && lives < 15) {
        lives = Math.min(lives + 2, 15);
    }

    updateUI();
    updateNextWaveBtn();
    updatePauseBtn();

    // Show "Done!!!" and knights overlay
    hideAllOverlays();
    var doneOverlay = document.getElementById('doneOverlay');
    var knightsOverlay = document.getElementById('knightsOverlay');
    if (doneOverlay) {
        doneOverlay.classList.add('show');
        setTimeout(function () {
            doneOverlay.classList.remove('show');
        }, 1000);
    }
    // Show knights overlay near the knight image (one message per wave, rotating)
    if (knightsOverlay) {
        var knightMessages = knightsOverlay.querySelectorAll('.pause-text');
        // Hide all messages, show only current one
        knightMessages.forEach(function (el, i) {
            el.style.display = (i === currentKnightMessageIndex) ? 'block' : 'none';
        });
        // Move to next message for next wave
        currentKnightMessageIndex = (currentKnightMessageIndex + 1) % knightMessages.length;

        knightsOverlay.classList.add('show');
        setTimeout(function () {
            knightsOverlay.classList.remove('show');
        }, 2000);
    }

    // Start idle taunt timer after wave
    startTauntTimer(TAUNT_DELAY_AFTER_WAVE);
    startNextWaveTimer();
}

// Win game
function winGame() {
    gameOver = true;
    document.getElementById('victoryScore').textContent = score;
    document.getElementById('victoryScreen').classList.add('show');
}

// Update UI
function updateUI() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('lives').textContent = lives;
    document.getElementById('wave').textContent = wave + ' / ' + MAX_WAVE;
    document.getElementById('score').textContent = score;
}

// End game
function endGame() {
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.add('show');
}

// Check if position is too close to path
function isTooCloseToPath(x, y, minDist = 30) {
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        // Distance from point to line segment
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len2 = dx * dx + dy * dy;

        let t = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / len2));
        const nearX = start.x + t * dx;
        const nearY = start.y + t * dy;

        const dist = Math.hypot(x - nearX, y - nearY);
        if (dist < minDist) return true;
    }
    return false;
}

// Check if position is too close to another tower
function isTooCloseToTower(x, y, minDist = 20) {
    for (const tower of towers) {
        const dist = Math.hypot(x - tower.x, y - tower.y);
        if (dist < minDist) return true;
    }
    return false;
}

// Check if position is valid for tower placement
function canPlaceTowerAt(x, y) {
    // Check bounds
    if (x < 15 || x > canvas.width - 15 || y < 15 || y > canvas.height - 15) return false;
    // Check path distance
    if (isTooCloseToPath(x, y, 32)) return false;
    // Check other towers
    if (isTooCloseToTower(x, y, 22)) return false;
    return true;
}

// Place tower
function placeTower(mouseX, mouseY) {
    if (!canPlaceTowerAt(mouseX, mouseY)) return;

    const cost = towerTypes[selectedTower].cost;
    if (gold < cost) return;

    gold -= cost;

    const tower = new Tower(mouseX, mouseY, selectedTower);
    towers.push(tower);
    updateUI();
}

// Sell tower
function sellTower(clickX, clickY) {
    for (let i = 0; i < towers.length; i++) {
        const tower = towers[i];
        const cellIndex = tower.getCellAtPosition(clickX, clickY);
        if (cellIndex >= 0) {
            const sellValue = tower.getSellValue();
            gold += sellValue;

            // Create sell particles
            for (let j = 0; j < 8; j++) {
                particles.push(new Particle(tower.x, tower.y, '#2a7a4a', 'death'));
            }

            towers.splice(i, 1);
            updateUI();
            return true;
        }
    }
    return false;
}

// Check tower click - upgrade specific cell that was clicked
function checkTowerClick(mouseX, mouseY) {
    for (const tower of towers) {
        const cellIndex = tower.getCellAtPosition(mouseX, mouseY);
        if (cellIndex >= 0) {
            tower.upgradeCell(cellIndex);
            return true;
        }
    }
    return false;
}

// Mouse position for hover effects
let mouseX = 0;
let mouseY = 0;

// Canvas click handler
canvas.addEventListener('click', (e) => {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (sellMode) {
        if (sellTower(clickX, clickY)) {
            // Tower sold, optionally exit sell mode
            // toggleSellMode(); // uncomment to auto-exit sell mode after selling
        }
    } else {
        if (!checkTowerClick(clickX, clickY)) {
            placeTower(clickX, clickY);
        }
    }
});

// Canvas hover handler
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    for (const tower of towers) {
        // Check if hovering over any cell
        const cellIndex = tower.getCellAtPosition(mouseX, mouseY);
        tower.showRange = cellIndex >= 0;
    }
});

canvas.addEventListener('mouseleave', () => {
    mouseX = -1;
    mouseY = -1;
    for (const tower of towers) {
        tower.showRange = false;
    }
});

// Tower selection
document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTower = btn.dataset.tower;
    });
});

// Control buttons
document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('nextWaveBtn').addEventListener('click', spawnWave);
document.getElementById('sellBtn').addEventListener('click', toggleSellMode);
document.getElementById('restart').addEventListener('click', () => location.reload());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const keys = {'1': 'tower1', '2': 'tower2', '3': 'tower3'};
    if (keys[e.key]) {
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`[data-tower="${keys[e.key]}"]`).classList.add('selected');
        selectedTower = keys[e.key];
    }
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameStarted) {
            togglePlayPause();
        } else {
            spawnWave();
        }
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З') {
        togglePlayPause();
    }
    if (e.key === 'Escape') {
        if (isPaused) togglePause();
        if (sellMode) toggleSellMode();
    }
    if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
        toggleSellMode();
    }
});

// Game loop
let lastTime = 0;

function gameLoop(time) {
    if (gameOver) return;

    // Adjust time for pauses
    const adjustedTime = time - totalPausedTime;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawFieldDecor();
    drawPath();
    drawCave();
    drawCastle();
    drawPlacementPreview();

    if (!isPaused) {
        // Update towers (firing)
        for (const tower of towers) {
            tower.update(adjustedTime);
        }

        // Update and filter enemies
        enemies = enemies.filter(enemy => enemy.update());

        // Update and filter projectiles
        projectiles = projectiles.filter(proj => proj.update());

        // Update and filter particles
        particles = particles.filter(p => p.update());
    }

    // Check wave complete every frame (so victory shows as soon as last enemy dies)
    checkWaveComplete();

    // Always draw everything
    for (const tower of towers) {
        tower.draw();
    }
    for (const enemy of enemies) {
        enemy.draw();
    }
    for (const proj of projectiles) {
        proj.draw();
    }
    for (const p of particles) {
        p.draw();
    }

    requestAnimationFrame(gameLoop);
}

// Draw tower previews in side panel
function drawTowerPreviews() {
    document.querySelectorAll('.tower-preview').forEach(cvs => {
        const pCtx = cvs.getContext('2d');
        const cellCount = parseInt(cvs.dataset.cells);
        const color = '#cc2222';
        const cellSize = 14;
        const spacing = cellSize + 2;
        const totalWidth = cellCount * cellSize + (cellCount - 1) * 2;
        const startX = cvs.width / 2 - totalWidth / 2 + cellSize / 2;
        const cy = cvs.height / 2;

        pCtx.strokeStyle = color;
        pCtx.lineWidth = 1.5;
        pCtx.lineCap = 'round';
        pCtx.lineJoin = 'round';

        for (let i = 0; i < cellCount; i++) {
            const cx = startX + i * spacing;
            const half = cellSize / 2;

            const seed = i * 73 + 17;
            const w1 = Math.sin(seed * 0.1) * 1;
            const w2 = Math.cos(seed * 0.2) * 1;
            const w3 = Math.sin(seed * 0.3) * 1;
            const w4 = Math.cos(seed * 0.4) * 1;

            // Square
            pCtx.beginPath();
            pCtx.moveTo(cx - half + w1, cy - half + w2);
            pCtx.lineTo(cx + half + w2, cy - half + w3);
            pCtx.lineTo(cx + half + w3, cy + half + w4);
            pCtx.lineTo(cx - half + w4, cy + half + w1);
            pCtx.closePath();
            pCtx.stroke();

            // X inside
            const inset = 3;
            pCtx.beginPath();
            pCtx.moveTo(cx - half + inset + w2, cy - half + inset + w1);
            pCtx.lineTo(cx + half - inset + w4, cy + half - inset + w3);
            pCtx.stroke();

            pCtx.beginPath();
            pCtx.moveTo(cx + half - inset + w3, cy - half + inset + w2);
            pCtx.lineTo(cx - half + inset + w1, cy + half - inset + w4);
            pCtx.stroke();
        }
    });
}

// Start game
drawTowerPreviews();
updateUI();
startTauntTimer(); // Start taunts immediately on load
gameLoop(0);
