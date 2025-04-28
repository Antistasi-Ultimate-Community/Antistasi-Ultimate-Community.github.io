document.addEventListener('DOMContentLoaded', () => {
  const gameSection = document.getElementById('pong-game-section');
  const gameStartScreen = document.getElementById('game-start-screen');
  const gameDiv = document.getElementById('pong-game');
  const scoreDisplay = document.getElementById('score');
  const gameEndScreen = document.getElementById('game-end-screen');
  const gameEndMessage = document.getElementById('game-end-message');
  const finalScore = document.getElementById('final-score');
  const playAgainBtn = document.getElementById('play-again-btn');

  // Create paddles and ball elements
  const playerPaddle = document.createElement('div');
  const ball = document.createElement('div');
  const aiPaddle = document.createElement('div');

  playerPaddle.classList.add('paddle');
  ball.classList.add('ball');
  aiPaddle.classList.add('paddle');

  gameDiv.appendChild(playerPaddle);
  gameDiv.appendChild(ball);
  gameDiv.appendChild(aiPaddle);

  // Game variables
  let ballSpeedX = 6;
  let ballSpeedY = 6;
  let playerSpeed = 0;
  let playerPosition = gameDiv.offsetHeight / 2 - 50;
  let aiSpeed = 5;  // AI speed (increased for difficulty)
  let aiPosition = gameDiv.offsetHeight / 2 - 50;
  let ballX = gameDiv.offsetWidth / 2 - 7.5;
  let ballY = gameDiv.offsetHeight / 2 - 7.5;
  let gameStarted = false;
  let playerScore = 0;
  let aiScore = 0;
  const scoreLimit = 10;

  let lastPaddleHit = 0; // Timer to limit speed increase rate
  let gameLoopId; // Variable to store the game loop ID

  // Paddle sizes and game area
  const paddleWidth = 15;
  const paddleHeight = 100;

  // Update positions of paddles and ball
  function updateGame() {
    if (!gameStarted) return;

    // Move the player paddle with the mouse
    playerPaddle.style.top = playerPosition + 'px';
    playerPaddle.style.left = '0px';  // Player paddle is on the left side

    // AI paddle movement with smoothing factor
    const aiTargetY = ballY - paddleHeight / 2;
    const aiMoveSpeed = 1.1;  // Smoothing factor for AI movement
    aiPosition += Math.sign(aiTargetY - aiPosition) * aiSpeed * aiMoveSpeed;

    // Keep AI within the game area
    if (aiPosition < 0) aiPosition = 0;
    if (aiPosition > gameDiv.offsetHeight - paddleHeight) aiPosition = gameDiv.offsetHeight - paddleHeight;

    aiPaddle.style.top = aiPosition + 'px';
    aiPaddle.style.left = gameDiv.offsetWidth - paddleWidth + 'px';  // AI paddle is on the right side

    // Move the ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top and bottom
    if (ballY <= 0 || ballY >= gameDiv.offsetHeight - 15) {
      ballSpeedY = -ballSpeedY;
    }

    // Ball collision with paddles
    if (
      (ballX <= paddleWidth && ballY >= playerPosition && ballY <= playerPosition + paddleHeight) || // Player paddle collision
      (ballX >= gameDiv.offsetWidth - paddleWidth - 15 && ballY >= aiPosition && ballY <= aiPosition + paddleHeight) // AI paddle collision
    ) {
      // Check if enough time has passed since the last paddle hit
      if (Date.now() - lastPaddleHit > 500) {
        lastPaddleHit = Date.now();
        ballSpeedX = -ballSpeedX; // Reverse the ball's direction

        // Slightly increase ball speed after each paddle hit (but more gently)
        ballSpeedX *= 1.03; // Increase speed a little less drastically
        ballSpeedY *= 1.03; // Increase speed a little less drastically
      }
    }

    // Reset ball if it goes off screen (left or right)
    if (ballX <= 0) {
      aiScore++;
      if (aiScore >= scoreLimit) {
        showGameOver('Game Over! AI Wins!');
        return;
      }
      resetBall();
    } else if (ballX >= gameDiv.offsetWidth - 15) {
      playerScore++;
      if (playerScore >= scoreLimit) {
        showGameOver('You Win!');
        return;
      }
      resetBall();
    }

    // Update the score display
    scoreDisplay.textContent = `Player: ${playerScore} | AI: ${aiScore}`;

    // Update ball position on screen
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
  }

  // Reset ball position after scoring
  function resetBall() {
    ballX = gameDiv.offsetWidth / 2 - 7.5;
    ballY = gameDiv.offsetHeight / 2 - 7.5;
    ballSpeedX = 6; // Reset ball speed
    ballSpeedY = 6; // Reset ball speed
  }

  // Show game over screen
  function showGameOver(message) {
    gameEndScreen.style.display = 'flex';
    gameEndMessage.textContent = message;
    finalScore.textContent = `Final Score: Player ${playerScore} - AI ${aiScore}`;
    cancelAnimationFrame(gameLoopId); // Stop the game loop
  }

  // Play again functionality
  playAgainBtn.addEventListener('click', () => {
    gameEndScreen.style.display = 'none';
    playerScore = 0;
    aiScore = 0;
    ballSpeedX = 6;
    ballSpeedY = 6;
    aiSpeed = 1.1;
    resetBall();
    gameStarted = false;
    gameStartScreen.style.display = 'flex';
  });

  // Start game when the screen is clicked
  gameSection.addEventListener('click', () => {
    if (!gameStarted) {
      gameStarted = true;
      gameStartScreen.style.display = 'none';
      gameLoopId = requestAnimationFrame(gameLoop); // Start the game loop
    }
  });

  // Mouse movement for controlling the player paddle
  gameSection.addEventListener('mousemove', (e) => {
    playerPosition = e.clientY - gameDiv.offsetTop - paddleHeight / 2;
    if (playerPosition < 0) playerPosition = 0;
    if (playerPosition > gameDiv.offsetHeight - paddleHeight) playerPosition = gameDiv.offsetHeight - paddleHeight;
  });

  // Game loop
  function gameLoop() {
    updateGame();
    if (gameStarted) {
      gameLoopId = requestAnimationFrame(gameLoop); // Continue the game loop only if the game is still active
    }
  }

  // Start the game loop
  gameLoop();
});
