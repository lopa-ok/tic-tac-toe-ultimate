document.addEventListener('DOMContentLoaded', () => {
    const mainBoard = document.getElementById('main-board');
    const playerTurn = document.createElement('div');
    playerTurn.id = 'player-turn';
    playerTurn.innerText = 'Player X\'s turn';
    document.body.insertBefore(playerTurn, mainBoard);

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

    const handleClick = (e) => {
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
            game.mainBoardWinners[mainIndex] = winner;
        }

        game.nextPlayableBoard = game.mainBoardWinners[subIndex] ? null : subIndex;

        switchPlayer();
    };

    const createCell = (mainIndex, subIndex) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-main-index', mainIndex);
        cell.setAttribute('data-sub-index', subIndex);
        cell.addEventListener('click', handleClick);
        return cell;
    };

    const createSubBoard = (index) => {
        const subBoard = document.createElement('div');
        subBoard.className = 'sub-board';
        subBoard.id = `sub-board-${index}`;

        for (let i = 0; i < 9; i++) {
            subBoard.appendChild(createCell(index, i));
        }

        return subBoard;
    };

    for (let i = 0; i < 9; i++) {
        mainBoard.appendChild(createSubBoard(i));
    }
});
