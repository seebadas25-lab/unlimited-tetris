var TETROMINOES = {
    I: {
        shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        color: '#00f3ff', // Cyan
        glow: '0 0 15px #00f3ff'
    },
    J: {
        shape: [
            [0, 2, 0],
            [0, 2, 0],
            [2, 2, 0]
        ],
        color: '#0055ff', // Blue
        glow: '0 0 15px #0055ff'
    },
    L: {
        shape: [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ],
        color: '#ffaa00', // Orange
        glow: '0 0 15px #ffaa00'
    },
    O: {
        shape: [
            [4, 4],
            [4, 4]
        ],
        color: '#ffe600', // Yellow
        glow: '0 0 15px #ffe600'
    },
    S: {
        shape: [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ],
        color: '#00ff00', // Green
        glow: '0 0 15px #00ff00'
    },
    T: {
        shape: [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]
        ],
        color: '#bc13fe', // Purple
        glow: '0 0 15px #bc13fe'
    },
    Z: {
        shape: [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ],
        color: '#ff0055', // Red
        glow: '0 0 15px #ff0055'
    }
};

var COLORS = [
    null,
    '#00f3ff', // I
    '#0055ff', // J
    '#ffaa00', // L
    '#ffe600', // O
    '#00ff00', // S
    '#bc13fe', // T
    '#ff0055'  // Z
];

var GLOWS = [
    null,
    '0 0 15px #00f3ff',
    '0 0 15px #0055ff',
    '0 0 15px #ffaa00',
    '0 0 15px #ffe600',
    '0 0 15px #00ff00',
    '0 0 15px #bc13fe',
    '0 0 15px #ff0055'
];
