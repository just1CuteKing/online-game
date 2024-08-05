// script.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Game state
  let gameState = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameId = 'multiplayer-game';
  let playerSymbol = null;
  
  // Reference to game data in Firebase
  const gameRef = database.ref(gameId);
  
  // Create the game board
  const board = document.getElementById('board');
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('click', () => makeMove(i));
    board.appendChild(cell);
  }
  
  // Function to make a move
  function makeMove(index) {
    if (gameState[index] === null && playerSymbol === currentPlayer) {
      gameState[index] = currentPlayer;
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateGame();
    }
  }
  
  // Function to update game state in Firebase
  function updateGame() {
    gameRef.set({
      gameState: gameState,
      currentPlayer: currentPlayer
    });
  }
  
  // Listen for game state changes
  gameRef.on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      gameState = data.gameState;
      currentPlayer = data.currentPlayer;
      renderBoard();
      checkGameOver();
    }
  });
  
  // Function to render the game board
  function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      cell.textContent = gameState[index];
    });
  }
  
  // Function to check if the game is over
  function checkGameOver() {
    const winner = getWinner();
    const status = document.getElementById('status');
    if (winner) {
      status.textContent = `${winner} wins!`;
    } else if (!gameState.includes(null)) {
      status.textContent = `It's a tie!`;
    } else {
      status.textContent = `Player ${currentPlayer}'s turn`;
    }
  }
  
  // Function to get the winner
  function getWinner() {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
        return gameState[a];
      }
    }
    return null;
  }
  
  // Assign player symbol based on URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  playerSymbol = urlParams.get('symbol') || 'X';
  