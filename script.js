let gameStarted = false;
let gameOver = false;

const main = document.querySelector('main');
const startBtn = document.querySelector('#start');
const scoreDisplay = document.querySelector('.score p');
const leaderboardDiv = document.querySelector('.leaderboard');

let speed = 2;
let enemySpeed = 1.5;

let score = 0;
let lives = 3;
let level = 1;

let currentDirection = { x: 0, y: 0 };
let canMove = true;

let player;
let enemies;

let playerTop = 0;
let playerLeft = 0;

// ---------------- MAZE ----------------
let maze = [
    ['*','*','*','*','*','*','*','*','*','*'],
    ['*','P',' ','*',' ',' ',' ',' ',' ','*'],
    ['*',' ',' ',' ',' ',' ',' ','*','*','*'],
    ['*',' ',' ',' ',' ',' ',' ',' ',' ','*'],
    ['*',' ','*','*',' ',' ',' ',' ',' ','*'],
    ['*',' ',' ',' ',' ',' ',' ','*','*','*'],
    ['*',' ',' ','*',' ',' ',' ',' ',' ','*'],
    ['*',' ',' ',' ',' ',' ',' ','*',' ','*'],
    ['*',' ','*',' ',' ',' ',' ',' ',' ','*'],
    ['*','*','*','*','*','*','*','*','*','*']
];

// ---------------- GHOSTS ----------------
function addGhost() {
    const r = Math.floor(Math.random() * maze.length);
    const c = Math.floor(Math.random() * maze[r].length);

    if (maze[r][c] === ' ') {
        maze[r][c] = 'E';
    } else {
        addGhost();
    }
}

// ---------------- BUILD MAZE ----------------
function buildMaze() {
    main.innerHTML = '';

    maze.forEach(row => {
        row.forEach(cell => {
            const block = document.createElement('div');
            block.classList.add('block');

            if (cell === '*') block.classList.add('wall');
            else if (cell === 'P') block.id = 'player';
            else if (cell === 'E') block.classList.add('enemy');
            else block.classList.add('point');

            main.appendChild(block);
        });
    });

    player = document.querySelector('#player');
    enemies = document.querySelectorAll('.enemy');

    if (player) {
        playerTop = player.offsetTop;
        playerLeft = player.offsetLeft;
    }

    enemies.forEach(e => e.dir = null);
}

// init
addGhost();
addGhost();
addGhost();
buildMaze();

// ---------------- UI ----------------
const livesDisplay = document.createElement('div');
livesDisplay.classList.add('lives');
document.body.appendChild(livesDisplay);

function updateLives() {
    livesDisplay.textContent = "Lives: " + lives;
}
updateLives();

// ---------------- SCORE ----------------
function updateScore() {
    if (scoreDisplay) scoreDisplay.textContent = "Score: " + score;
}

// ---------------- LEADERBOARD ----------------
function saveScore() {
    const name = prompt("Enter your name:");
    if (!name) return;

    let scores = JSON.parse(localStorage.getItem("pacmanScores")) || [];

    scores.push({ name, score });
    scores.sort((a,b) => b.score - a.score);
    scores = scores.slice(0,5);

    localStorage.setItem("pacmanScores", JSON.stringify(scores));
    displayLeaderboard();
}

function displayLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("pacmanScores")) || [];

    leaderboardDiv.innerHTML = "<h3>Leaderboard</h3>";

    scores.forEach((e,i) => {
        const p = document.createElement("p");
        p.textContent = `${i+1}. ${e.name} - ${e.score}`;
        leaderboardDiv.appendChild(p);
    });
}

displayLeaderboard();

// ---------------- START ----------------
startBtn.addEventListener('click', () => {
    gameStarted = true;
    gameOver = false;
    startBtn.style.display = 'none';
});

// ---------------- CONTROLS ----------------
document.addEventListener('keydown', (e) => {
    if (!gameStarted || gameOver) return;

    if (!player) return;

    player.className = '';

    if (e.key === 'ArrowUp') {
        currentDirection = {x:0,y:-1};
        player.classList.add('up');
    }
    if (e.key === 'ArrowDown') {
        currentDirection = {x:0,y:1};
        player.classList.add('down');
    }
    if (e.key === 'ArrowLeft') {
        currentDirection = {x:-1,y:0};
        player.classList.add('left');
    }
    if (e.key === 'ArrowRight') {
        currentDirection = {x:1,y:0};
        player.classList.add('right');
    }
});

// ---------------- COLLISION ----------------
function isColliding(a,b) {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();

    return !(
        r1.right < r2.left ||
        r1.left > r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

// ---------------- HIT ----------------
function hitPlayer() {
    if (!canMove) return;

    lives--;
    updateLives();

    player.classList.add('hit');
    canMove = false;

    setTimeout(() => {
        player.classList.remove('hit');
        canMove = true;
    }, 1500);

    if (lives <= 0) endGame("Game Over");
}

// ---------------- COLLISIONS ----------------
function checkCollisions() {

    document.querySelectorAll('.point').forEach(point => {
        if (isColliding(player, point)) {
            point.remove();
            score++;
            updateScore();
        }
    });

    enemies.forEach(enemy => {
        if (isColliding(player, enemy)) hitPlayer();
    });

    if (document.querySelectorAll('.point').length === 0) {
        nextLevel();
    }
}

// ---------------- ENEMIES ----------------
const directions = [
    {x:0,y:-1},
    {x:0,y:1},
    {x:-1,y:0},
    {x:1,y:0}
];

function moveEnemies() {
    if (gameOver) return;

    enemies.forEach(enemy => {

        if (!enemy.dir) {
            enemy.dir = directions[Math.floor(Math.random()*4)];
        }

        let nextTop = enemy.offsetTop + enemy.dir.y * enemySpeed;
        let nextLeft = enemy.offsetLeft + enemy.dir.x * enemySpeed;

        enemy.style.top = nextTop + "px";
        enemy.style.left = nextLeft + "px";

        let hitWall = false;

        document.querySelectorAll('.wall').forEach(w => {
            if (isColliding(enemy,w)) hitWall = true;
        });

        if (hitWall) {
            enemy.dir = directions[Math.floor(Math.random()*4)];
        }
    });
}

// ---------------- PLAYER ----------------
function movePlayer() {

    if (!gameStarted || gameOver) return;

    let nextTop = playerTop + currentDirection.y * speed;
    let nextLeft = playerLeft + currentDirection.x * speed;

    let hitWall = false;

    document.querySelectorAll('.wall').forEach(w => {
        if (isColliding(player,w)) hitWall = true;
    });

    if (!hitWall) {
        playerTop = nextTop;
        playerLeft = nextLeft;
        player.style.top = playerTop + "px";
        player.style.left = playerLeft + "px";
    }
}

// ---------------- LEVEL ----------------
function nextLevel() {
    level++;
    score += 100;
    updateScore();

    maze.forEach(r=>{
        r.forEach((c,i)=>{
            if (c === 'E') r[i] = ' ';
        });
    });

    addGhost();
    addGhost();
    addGhost();

    buildMaze();
}

// ---------------- LOOP ----------------
function gameLoop() {
    movePlayer();
    moveEnemies();
    checkCollisions();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// ---------------- GAME OVER ----------------
function endGame(msg) {
    gameOver = true;
    gameStarted = false;

    saveScore();

    startBtn.style.display = 'block';
    startBtn.textContent = msg;
}

// ---------------- RESTART ----------------
startBtn.addEventListener('click', () => {
    location.reload();
});