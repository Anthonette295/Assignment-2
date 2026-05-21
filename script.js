
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


let currentDirection = {x: 0, y: 0};
let canMove = true;

// Player = 'P', Wall = '*', Enemy = 'E', Point = ' '
let maze = [
    ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
    ['*', 'P', ' ', '*', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', '*', '*', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', '*', '*', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', '*', '*', '*'],
    ['*', ' ', ' ', '*', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', '*', ' ', '*'],
    ['*', ' ', '*', ' ', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*']
];

function addGhost() {
    const row = Math.floor(Math.random() * maze.length);
    const column = Math.floor(Math.random() * maze[row].length);


    if(maze[row][column] === ' ') {
       maze[row][column] = 'E'; 

   } else {
       addGhost();

   }
}
addGhost();
addGhost();
addGhost();

function buildMaze() {
    main.innerHTML = '';
}

// Populates the maze
maze.forEach((row) => {
    row.forEach((cell) => {

        let block = document.createElement('div')
        block.classList = 'block'

        switch (cell) {
            case '*':
                block.classList.add('wall')
                break;
            case 'P':
                block.id = 'player';
                break;
            case 'E':
                block.classList.add('enemy');
                break
            default:
                block.classList.add('point')
        }
        
        main.appendChild(block)
    });
});

player = document.querySelector('#player');
enemies = document.querySelectorAll('.enemy');

buildMaze();


let player = document.querySelector('#player');
let enemies = document.querySelectorAll('.enemy');

let playerTop = 0;
let playerLeft = 0;

const livesDisplay = document.createElement('div');
livesDisplay.classList.add('lives');
document.body.appendChild(livesDisplay);

function updateLives() {
    livesDisplay.textContent = "Lives:" + lives;
}

updateLives();


function saveScore() {
    const name = prompt("Enter your name:");

    if (!name) return;

    let scores = JSON.parse(localStorage.getItem("pacmanScores")) || [];

    scores.push({ name, score});

    scores.sort((a,b) => b.score - a.score);

    scores = scores.slice(0,5);

    localStorage.setItem("pacmanScores", JSON.stringify(scores));

    displayLeaderboard();
}

function displayLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("pacmanScores")) || [];

    leaderboardDiv.innerHTML = "<h3>Leaderboard</h3>";

    scores.forEach((entry, i) => {
        const p = document.createElement("p");

        p.textContent = `${i + 1}. ${entry.name} - ${entry.score}`;

        leaderboardDiv.appendChild(p);
    });
}

displayLeaderboard();


startBtn.addEventListener('click', () => {
    gameStarted = true;
    startBtn.style.display = 'none';
});

document.addEventListener('keydown', (e) => {

    if (!gameStarted || gameOver) return;

    if (e.key === 'ArrowUp') currentDirection = { x:0, y: -1};
    if (e.key === 'ArrowDown') currentDirection = { x: 0, y: 1};
    if (e.key === 'ArrowLeft') currentDirection = { x: -1, y: 0};
    if (e.key === 'ArrowRight') currentDirection = { x: 1, y: 0};
});


function isColliding(a, b) {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();

    return !(
        r1.right < r2.left ||
        r1.left < r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

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

    if (lives <= 0) {
        endGame("Game Over!");
    }
}

function checkCollisions() {

    document.querySelectorAll('.point').forEach(point => {

        if (isColliding(player, point))

            point.remove();

            score++;

            scoreDisplay.textContent = "Score: " + score;
    });
}

    if (document.querySelectorAll('.point').length === 0) {
        nextLevel();
    }

    enemies.forEach(enemy => {

        if (isColliding(player, enemy)) {
            hitPlayer();
        }
    });

    const directions = [
        { x: 0, y: -1},
        { x: 0, y: 1},
        { x: -1, y: 0},
        { x: 1, y: 0}
    ];

    function moveEnemies() {

        if (gameOver) return;

        enemies.forEach(enemy => {

            if(!enemy.dir) {
                enemy.dir = directions[Math.floor(Math.random() * directions.length)];
            }

            let nextTop = enemy.offsetTop + enemy.dir.y * enemySpeed;
            let nextLeft = enemy.offsetLeft + enemy.dir.x * enemySpeed;

            enemy.style.top = nextTop + "px";
            enemy.style.top = nextLeft + "px";

            let hitWall = false;

            document.querySelectorAll('.wall').forEach(wall => {

                if (isColliding(enemy, wall)) {
                    hitWall = true;
                }
            });

            if (hitWall) {
                enemy.dir = directions[Math.floor(Math.random() * directions.length)];
            }
        });
    }


function movePlayer() {
    if (! gameStarted  || gameOver ) return;

    let nextTop = playerTop + currentDirection.y * speed;
    let nextLeft = playerLeft + currentDirection.x * speed;

    player.style.top = nextTop + 'px';
    player.style.left = nextLeft + 'px';

    let hitWall = false;

    document.querySelectorAll('.wall').forEach(wall => {

        if (isColliding(player, wall)) {
            hitWall = true;
        }
    });

    if (!hitWall) {

        playerTop = nextTop;
        playerLeft = nextLeft;


    } else {

        player.style.top = playerTop + 'px';
        player.style.left = playerLeft + 'px';
    }
} 

function nextLevel() {

    level++;

    score += 100;

    alert("Level" + level);

    addGhost();

    buildMaze();

    gameStarted = true;
}

function gameLoop() {

    movePlayer();

    moveEnemies();

    checkCollisions();

    requestAnimationFrame(gameLoop);
}

gameLoop();

function endGame(message) {

    gameOver = true;

    gameStarted = false;

    saveScore();

    startBtn.style.display = 'block';
    
    startBtn.textContent = message;
}

startBtn.addEventListener('click', () => {
    location.reload();
});



