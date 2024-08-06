document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const singleplayerBtn = document.getElementById('singleplayer-btn');
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const difficultySelection = document.getElementById('difficulty-selection');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const gameContainer = document.getElementById('game-container');
    const mainBoard = document.getElementById('main-board');
    const playerTurn = document.getElementById('player-turn');

    let gameMode = 'singleplayer'; 
    let aiDifficulty = 'easy'; 

    const game = {
        currentPlayer: 'X',
        mainBoard: Array(9).fill(null).map(() => Array(9).fill(null)),
        mainBoardWinners: Array(9).fill(null),
        nextPlayableBoard: null
    };

    singleplayerBtn.addEventListener('click', () => {
        gameMode = 'singleplayer';
        difficultySelection.style.display = 'block';
    });

    multiplayerBtn.addEventListener('click', () => {
        gameMode = 'multiplayer';
        startGame();
    });

    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            aiDifficulty = e.target.getAttribute('data-difficulty');
            startGame();
        });
    });

    const startGame = () => {
        mainMenu.style.display = 'none';
        difficultySelection.style.display = 'none';
        gameContainer.style.display = 'block';
        playerTurn.innerText = `Player ${game.currentPlayer}'s turn`;
        createBoard();
    };

    const switchPlayer = () => {
        game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
        playerTurn.innerText = `Player ${game.currentPlayer}'s turn`;
    };

    const checkWinner = (board) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const getRandomMove = (board) => {
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(cell => cell !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    const getMediumMove = (board) => {
        
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(cell => cell !== null);
        
        
        for (const move of availableMoves) {
            board[move] = 'O';
            if (checkWinner(board) === 'O') {
                board[move] = null;
                return move;
            }
            board[move] = null;
        }

        
        for (const move of availableMoves) {
            board[move] = 'X';
            if (checkWinner(board) === 'X') {
                board[move] = null;
                return move;
            }
            board[move] = null;
        }

        
        return getRandomMove(board);
    };

    const minimax = (board, depth, isMaximizing) => {
        const winner = checkWinner(board);
        if (winner === 'X') return -10 + depth;
        if (winner === 'O') return 10 - depth;
        if (board.every(cell => cell !== null)) return 0; 

        const scores = [];
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(cell => cell !== null);

        availableMoves.forEach(move => {
            board[move] = isMaximizing ? 'O' : 'X';
            const score = minimax(board, depth + 1, !isMaximizing);
            scores.push(score);
            board[move] = null;
        });

        return isMaximizing
            ? Math.max(...scores)
            : Math.min(...scores);
    };

    const findBestMove = (board) => {
        let bestScore = -Infinity;
        let bestMove = -1;

        board.forEach((cell, index) => {
            if (cell === null) {
                board[index] = 'O';
                const score = minimax(board, 0, false);
                board[index] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = index;
                }
            }
        });

        return bestMove;
    };

    const makeAIMove = () => {
        const validBoards = game.mainBoardWinners.map((winner, index) => winner === null ? index : null).filter(index => index !== null);
        let targetBoardIndex = game.nextPlayableBoard;

        if (!validBoards.includes(targetBoardIndex)) {
            targetBoardIndex = validBoards[Math.floor(Math.random() * validBoards.length)];
        }

        const currentBoard = game.mainBoard[targetBoardIndex];
        let bestMove;

        switch (aiDifficulty) {
            case 'easy':
                bestMove = getRandomMove(currentBoard);
                break;
            case 'medium':
                bestMove = getMediumMove(currentBoard);
                break;
            case 'hard':
                bestMove = findBestMove(currentBoard);
                break;
        }

        if (bestMove !== -1) {
            currentBoard[bestMove] = game.currentPlayer;
            const cell = document.querySelector(`.cell[data-main-index="${targetBoardIndex}"][data-sub-index="${bestMove}"]`);
            cell.innerText = game.currentPlayer;
            cell.classList.add('disabled');
            
            const winner = checkWinner(currentBoard);

            if (winner) {
                const subBoardElement = document.getElementById(`sub-board-${targetBoardIndex}`);
                subBoardElement.classList.add('disabled');

                const winnerMark = document.createElement('div');
                winnerMark.className = 'winner-mark';
                winnerMark.innerText = winner;
                subBoardElement.appendChild(winnerMark);

                game.mainBoardWinners[targetBoardIndex] = winner;
            }

            game.nextPlayableBoard = bestMove === -1 || game.mainBoardWinners[bestMove] !== null ? null : bestMove;
            switchPlayer();
        }
    };

    const handleClick = (e) => {
        if (gameMode === 'singleplayer' && game.currentPlayer === 'O') return;

        const cell = e.target;
        const mainIndex = parseInt(cell.getAttribute('data-main-index'));
        const subIndex = parseInt(cell.getAttribute('data-sub-index'));

        if (cell.innerText || (game.nextPlayableBoard !== null && game.nextPlayableBoard !== mainIndex && game.mainBoardWinners[mainIndex] === null)) {
            return;
        }

        game.mainBoard[mainIndex][subIndex] = game.currentPlayer;
        cell.innerText = game.currentPlayer;
        cell.classList.add('disabled');

        const winner = checkWinner(game.mainBoard[mainIndex]);

        if (winner) {
            const subBoardElement = document.getElementById(`sub-board-${mainIndex}`);
            subBoardElement.classList.add('disabled');

            const winnerMark = document.createElement('div');
            winnerMark.className = 'winner-mark';
            winnerMark.innerText = winner;
            subBoardElement.appendChild(winnerMark);

            game.mainBoardWinners[mainIndex] = winner;
        }

        game.nextPlayableBoard = winner ? null : subIndex;
        if (game.mainBoardWinners[subIndex] !== null) {
            game.nextPlayableBoard = null;
        }
        switchPlayer();

        if (gameMode === 'singleplayer' && game.currentPlayer === 'O') {
            setTimeout(makeAIMove, 500); // Small delay for AI move
        }
    };

    const createBoard = () => {
        mainBoard.innerHTML = '';
        game.mainBoard = Array(9).fill(null).map(() => Array(9).fill(null));
        game.mainBoardWinners = Array(9).fill(null);
        game.currentPlayer = 'X';
        game.nextPlayableBoard = null;

        for (let i = 0; i < 9; i++) {
            const subBoard = document.createElement('div');
            subBoard.id = `sub-board-${i}`;
            subBoard.className = 'sub-board';
            subBoard.addEventListener('click', handleClick);

            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('data-main-index', i);
                cell.setAttribute('data-sub-index', j);
                subBoard.appendChild(cell);
            }

            mainBoard.appendChild(subBoard);
        }
    };

    mainMenu.style.display = 'block';
    difficultySelection.style.display = 'none';
    gameContainer.style.display = 'none';
});
