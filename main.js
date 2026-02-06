const canvas = document.getElementById('game-canvas');
const holdCanvas = document.getElementById('hold-canvas');
const nextCanvas = document.getElementById('next-canvas');

const scoreEl = document.getElementById('score-display');
const linesEl = document.getElementById('lines-display');
const levelEl = document.getElementById('level-display');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('game-overlay');

let game = new Game(canvas, nextCanvas, holdCanvas, updateUI);
let lastTime = 0;
let requestID;

function updateUI(score, lines, level) {
    scoreEl.innerText = score;
    linesEl.innerText = lines;
    levelEl.innerText = level;
}

function loop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    game.update(deltaTime);
    requestID = requestAnimationFrame(loop);
}

document.addEventListener('keydown', event => {
    // Prevent scrolling for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
    game.handleInput(event.key);
});

startBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    startBtn.blur(); // Remove focus from button so keys work for game


    // If game over, reset
    if (game.isGameOver) {
        game.reset();
        game.isGameOver = false; // logic in reset, but explicit here
        game.isPaused = false;
        if (requestID) cancelAnimationFrame(requestID);
        loop();
    } else if (game.isPaused) {
        game.togglePause();
    } else {
        // Initial Start
        game.reset();
        loop();
    }
});

// Initial draw (blank state)
game.draw();
