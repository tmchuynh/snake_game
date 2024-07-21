const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 15,
  snakeY = 15;
let velocityX = 0,
  velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let highScore = parseInt(localStorage.getItem("high-score")) || 0;
const foodColors = {
  red: 1, // Red
  green: 2, // Green
  blue: 3, // Blue
  yellow: 4, // Yellow
  purple: 5 // Magenta
};

let foodColor = "red";
let foodPoints;
let numOfSegments;

let lastFoodColor = "green";

highScoreElement.innerText = `High Score: ${highScore}`;

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach((button) =>
  button.addEventListener("click", () =>
    changeDirection({ key: button.dataset.key })
  )
);

const initGame = () => {
  if (gameOver) return handleGameOver();

  // Create HTML for food and special food
  let html = `<div class="food" style="background-color: ${foodColor}; grid-area: ${foodY} / ${foodX}"></div>`;

  if (snakeX === foodX && snakeY === foodY) {
    numOfSegments = foodColors[foodColor]; // The same number of points gained is how many segments gets added to the snake's body
    for (i = 0; i < numOfSegments; i++ ) {
      
    snakeBody.push({ x: snakeX, y: snakeY, color: foodColor });
    }
    lastFoodColor = foodColor;
    score += foodPoints; // Add points based on food color
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    updateFoodPosition();
  }

  // Update snake's head position based on current velocity
  snakeX += velocityX;
  snakeY += velocityY;

  // Shift snake body segments
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
    snakeBody[i].color = lastFoodColor;
  }

  // Update the first segment with the new head position
  snakeBody[0] = {
    x: snakeX,
    y: snakeY,
    color: lastFoodColor
  };

  // Check for collision with walls
  if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    return (gameOver = true);
  }

  // Check for collision with itself
  for (let i = 0; i < snakeBody.length; i++) {
    html += `<div class="head" style="background-color: ${lastFoodColor}; grid-area: ${snakeBody[i].y} / ${snakeBody[i].x}"></div>`;

    if (
      i !== 0 &&
      snakeBody[0].x === snakeBody[i].x &&
      snakeBody[0].y === snakeBody[i].y
    ) {
      gameOver = true;
    }
  }

  playBoard.innerHTML = html;
};

const updateFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
  foodColor = getRandomColor();
  foodPoints = foodColors[foodColor]; // Get points based on color
};

const getRandomColor = () => {
  const colors = Object.keys(foodColors);
  return colors[Math.floor(Math.random() * colors.length)];
};

const handleGameOver = () => {
  clearInterval(setIntervalId);
  alert("Game Over! Press OK to replay ...");
  resetGame();
};

const resetGame = () => {
  // Reset all necessary variables and state
  gameOver = false;
  snakeX = 15;
  snakeY = 15;
  velocityX = 0;
  velocityY = 0;
  snakeBody = [];
  lastFoodColor = "green";
  score = 0;
  updateFoodPosition();
  setIntervalId = setInterval(initGame, 200);
};

const changeDirection = (e) => {
  // Changing velocity value based on key press
  if (e.key === "ArrowUp" && velocityY != 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY != -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.key === "ArrowLeft" && velocityX != 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX != -1) {
    velocityX = 1;
    velocityY = 0;
  }
};

updateFoodPosition();
setIntervalId = setInterval(initGame, 200);
document.addEventListener("keyup", changeDirection);
