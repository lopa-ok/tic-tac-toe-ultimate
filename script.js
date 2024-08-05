document.addEventListener('DOMContentLoaded', () => {
    const mainBoard = document.getElementById('main-board');
    const playerTurn = document.getElementById('player-turn');

    const game = {
        currentPlayer: 'X',
        mainBoard: Array(9).fill(null).map(() => Array(9).fill(null)),
        mainBoardWinners: Array(9).fill(null),
        nextPlayableBoard: null
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
        if (game.nextPlayableBoard === null) return;

        const currentBoard = game.mainBoard[game.nextPlayableBoard];
        const bestMove = findBestMove(currentBoard);

        if (bestMove !== -1) {
            currentBoard[bestMove] = game.currentPlayer;
            const cell = document.querySelector(`.cell[data-main-index="${game.nextPlayableBoard}"][data-sub-index="${bestMove}"]`);
            cell.innerText = game.currentPlayer;
            cell.classList.add('disabled');
            
            const winner = checkWinner(currentBoard);

            if (winner) {
                const subBoardElement = document.getElementById(`sub-board-${game.nextPlayableBoard}`);
                subBoardElement.classList.add('disabled');

                const winnerMark = document.createElement('div');
                winnerMark.className = 'winner-mark';
                winnerMark.innerText = winner;
                subBoardElement.appendChild(winnerMark);

                game.mainBoardWinners[game.nextPlayableBoard] = winner;
            }

            game.nextPlayableBoard = bestMove === -1 ? null : bestMove;
            switchPlayer();
        }
    };

    const handleClick = (e) => {
        if (game.currentPlayer === 'O') return;

        const cell = e.target;
        const mainIndex = parseInt(cell.getAttribute('data-main-index'));
        const subIndex = parseInt(cell.getAttribute('data-sub-index'));

        if (game.mainBoard[mainIndex][subIndex] || (game.nextPlayableBoard !== null && game.nextPlayableBoard !== mainIndex)) {
            return;
        }

        game.mainBoard[mainIndex][subIndex] = game.currentPlayer;
        cell.innerText = game.currentPlayer;
        cell.classList.add('disabled');

        const subBoard = game.mainBoard[mainIndex];
        const winner = checkWinner(subBoard);

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
        switchPlayer();

        if (game.currentPlayer === 'O') {
            setTimeout(makeAIMove, 500); 
        }
    };

    const createBoard = () => {
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

    createBoard();
});
