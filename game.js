class Game {
    constructor(canvas, nextCanvas, holdCanvas, onUpdate) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        this.holdCanvas = holdCanvas;
        this.holdCtx = holdCanvas.getContext('2d');
        this.onUpdate = onUpdate;

        this.cols = 12; // Slightly wider for ease
        this.rows = 20;
        this.scale = 20;

        // Visual adjustment for canvases
        this.canvas.width = this.cols * this.scale;
        this.canvas.height = this.rows * this.scale;

        this.reset();
    }

    reset() {
        this.grid = this.createGrid(this.cols, this.rows);
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.isGameOver = false;
        this.isPaused = false;

        this.piece = this.randomPiece();
        this.nextPiece = this.randomPiece();
        this.holdPiece = null;
        this.canHold = true;

        this.onUpdate(this.score, this.lines, this.level);
    }

    createGrid(w, h) {
        return Array.from({ length: h }, () => Array(w).fill(0));
    }

    randomPiece() {
        const types = 'IJLOSTZ';
        const type = types[Math.floor(Math.random() * types.length)];
        // Access global TETROMINOES
        const shape = TETROMINOES[type].shape;
        // Center the piece
        const x = Math.floor((this.cols - shape[0].length) / 2);
        return {
            matrix: shape,
            pos: { x, y: 0 },
            type: type,
            colorIndex: 'IJLOSTZ'.indexOf(type) + 1
        };
    }

    handleInput(key) {
        if (this.isGameOver) {
            if (key === 'Enter') this.reset();
            return;
        }

        if (key === 'Escape' || key === ' ' || key === 'p' || key === 'P') {
            this.togglePause();
            return;
        }

        if (this.isPaused) return;

        // Support Arrow keys, WASD, and legacy mapping
        if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'Left') {
            this.move(-1);
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'Right') {
            this.move(1);
        } else if (key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Down') {
            this.drop();
        } else if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'Up') {
            this.rotate();
        } else if (key === 'c' || key === 'C' || key === 'Shift') {
            this.hold();
        }
    }

    hold() {
        if (!this.canHold) return;

        if (!this.holdPiece) {
            this.holdPiece = this.piece;
            this.piece = this.nextPiece;
            this.nextPiece = this.randomPiece();
        } else {
            const temp = this.piece;
            this.piece = this.holdPiece;
            this.holdPiece = temp;
        }

        // Reset position needed for the new piece
        this.piece.pos.y = 0;
        this.piece.pos.x = Math.floor((this.cols - this.piece.matrix[0].length) / 2);

        this.canHold = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        // Use document.getElementById directly as we are closely coupled to DOM in this simple script
        const overlay = document.getElementById('game-overlay');
        const title = document.getElementById('overlay-title');
        const btn = document.getElementById('start-btn');

        if (this.isPaused) {
            overlay.classList.remove('hidden');
            title.textContent = 'PAUSED';
            btn.textContent = 'RESUME';
        } else {
            overlay.classList.add('hidden');
        }
    }

    move(dir) {
        this.piece.pos.x += dir;
        if (this.collide(this.grid, this.piece)) {
            this.piece.pos.x -= dir;
        }
    }

    rotate() {
        const pos = this.piece.pos.x;
        let offset = 1;
        this._rotateMatrix(this.piece.matrix, 1);
        while (this.collide(this.grid, this.piece)) {
            this.piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.piece.matrix[0].length) {
                this._rotateMatrix(this.piece.matrix, -1);
                this.piece.pos.x = pos;
                return;
            }
        }
    }

    _rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    }

    drop() {
        this.piece.pos.y++;
        if (this.collide(this.grid, this.piece)) {
            this.piece.pos.y--;
            this.merge(this.grid, this.piece);
            this.arenaSweep();
            this.resetPiece();
            this.dropCounter = 0; // Reset drop counter for next piece
        } else {
            this.dropCounter = 0; // Reset drop counter if manually dropped (soft drop)
        }
    }

    update(deltaTime) {
        if (this.isGameOver || this.isPaused) return;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }

        this.draw();
    }

    merge(grid, piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + piece.pos.y][x + piece.pos.x] = piece.colorIndex;
                }
            });
        });
    }

    resetPiece() {
        this.piece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.piece.pos.y = 0;
        this.piece.pos.x = Math.floor((this.cols - this.piece.matrix[0].length) / 2);
        this.canHold = true;

        if (this.collide(this.grid, this.piece)) {
            this.isGameOver = true;
            document.getElementById('game-overlay').classList.remove('hidden');
            document.getElementById('overlay-title').textContent = 'GAME OVER';
            document.getElementById('start-btn').textContent = 'RESTART';
        }
    }

    collide(grid, piece) {
        const m = piece.matrix;
        const o = piece.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    arenaSweep() {
        let rowCount = 0;
        outer: for (let y = this.grid.length - 1; y > 0; --y) {
            for (let x = 0; x < this.grid[y].length; ++x) {
                if (this.grid[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            ++y;
            rowCount++;
        }

        if (rowCount > 0) {
            // Scoring
            const pointMap = [0, 100, 300, 500, 800];
            this.score += pointMap[rowCount] * this.level;
            this.lines += rowCount;

            // Level logic: level up every 10 lines
            // Unlimited: Speed gets faster and faster
            const nextLevel = Math.floor(this.lines / 10) + 1;
            if (nextLevel > this.level) {
                this.level = nextLevel;
                // Faster!
                this.dropInterval = Math.max(50, 1000 - (this.level * 50));
            }

            this.onUpdate(this.score, this.lines, this.level);
        }
    }

    draw() {
        // Draw Main Board
        this.ctx.fillStyle = '#0d0f1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Access global COLORS / GLOWS
        // Pass them implicitly or rely on global scope inside helper
        this.drawMatrix(this.grid, { x: 0, y: 0 }, this.ctx);
        this.drawMatrix(this.piece.matrix, this.piece.pos, this.ctx);

        // Draw Next
        this.nextCtx.fillStyle = '#0d0f1a';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.drawPreview(this.nextPiece, this.nextCtx, this.nextCanvas);

        // Draw Hold
        this.holdCtx.fillStyle = '#0d0f1a';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        if (this.holdPiece) {
            this.drawPreview(this.holdPiece, this.holdCtx, this.holdCanvas);
        }
    }

    drawMatrix(matrix, offset, context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(context, x + offset.x, y + offset.y, value);
                }
            });
        });
    }

    drawPreview(piece, context, canvas) {
        const matrix = piece.matrix;
        // Calculate center
        const matrixW = matrix[0].length * this.scale;
        const matrixH = matrix.length * this.scale;
        const offsetX = (canvas.width - matrixW) / 2 / this.scale;
        const offsetY = (canvas.height - matrixH) / 2 / this.scale;

        this.drawMatrix(matrix, { x: offsetX, y: offsetY }, context);
    }

    drawBlock(ctx, x, y, colorIndex) {
        // Access global COLORS / GLOWS
        const color = COLORS[colorIndex];
        const glow = GLOWS[colorIndex];

        ctx.fillStyle = color;
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);

        // Reset shadow for performance cleanup if needed, but we want the glow
        // Bevel effect
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x * this.scale, y * this.scale, this.scale, 2);
        ctx.fillRect(x * this.scale, y * this.scale, 2, this.scale);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x * this.scale + 2, y * this.scale + this.scale - 2, this.scale - 2, 2);
        ctx.fillRect(x * this.scale + this.scale - 2, y * this.scale + 2, 2, this.scale - 2);

        // Inner square
        ctx.fillStyle = color;
        ctx.fillRect(x * this.scale + 4, y * this.scale + 4, this.scale - 8, this.scale - 8);
    }
}
