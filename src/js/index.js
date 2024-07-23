const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const description = document.querySelector(".description");
const controls = document.querySelectorAll(".controls i");
const obstaclesNum = document.querySelector(".obstacles");
const increaseObstaclesNum = document.querySelector(".increase");
const decreaseObstaclesNum = document.querySelector(".decrease");
const peacefulMode = document.querySelector(".peaceful");
const checkSwitch = document.querySelector(".form-check-input");

// TODO: High Score based on how many obstacles there was in the board during the game played
// ?: Leaderboard ? with button to show leaderboard ?

// ?: Explosion image for snake head on collision

// ! Still needs a title
// ! game-details needs to be styled better

// Buttons to automatically adjust the number of obstacles
const easy = document.querySelector(".easy");
const medium = document.querySelector(".medium");
const hard = document.querySelector(".hard");

let gameOver = false;
let foodX, foodY;
let snakeX = 15, snakeY = 15;
let velocityX = 0, velocityY = 0;
let obstacleX = 25, obstacleY = 17;
let obstacle;
let numOfObstacles = 1; // default
let snakeBody = [];
let setIntervalId, gameOverInterval;
let score = 0;
let highScore = parseInt(localStorage.getItem("high-score")) || 0;
const foodColors = {
  "#D741A7": 1, // pink
  "#8A4FFF": 2, // light purple
  "#0FF4C6": 3, // cyan
  "#F55D3E": 4, // orange
  "#6E7E85": 5, // grey
  "#99621E": 6 // sand
};

let foodColor = "#8A4FFF";
let foodPoints;
let lastFoodColor = "green";
let obstacles = [];
let positionChange = false;
let peaceful = false;

highScoreElement.innerText = `High Score: ${highScore}`;

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button =>
  button.addEventListener("click", () =>
    changeDirection({ key: button.dataset.key })
  )
);

const initGame = () => {
  if (gameOver) return handleGameOver();

  if (checkSwitch.checked) {
    positionChange = true;
  } else {
    positionChange = false;
  }

  let html = "";

  // Create HTML for food
  html += `<div class="food" style="background-color: ${foodColor}; grid-area: ${foodY} / ${foodX}"></div>`;

  eatFood();

  // Update snake's head position based on current velocity
  snakeX += velocityX;
  snakeY += velocityY;

  // Shift snake body segments
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
    snakeBody[i].color = lastFoodColor;
  }

  if (!peaceful) {
    // Check for collision with walls
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
      description.innerHTML = "You ran into a wall!!!"; // ? Is this necessary if use modal instead
      return (gameOver = true);
    }
  } else {
    // NEED TO FIGURE OUT HOW THE SNAKE CAN APPEAR ON THE OTHER SIDE OF THE WALL O.O
  }

  // Update the first segment with the new head position
  snakeBody[0] = {
    x: snakeX,
    y: snakeY,
    color: lastFoodColor,
  };

  // Check for collision with itself
  html = checkSelfCollision(html);

  // Add obstacles to the HTML
  obstacles.forEach(obstacle => {
    html += `<i class="bi bi-exclamation-diamond-fill obstacle gradient-text" style="grid-area: ${obstacle.y} / ${obstacle.x}"></i>`;
  });

  playBoard.innerHTML = html;

};

const updateFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
  foodColor = getRandomColor();
  foodPoints = foodColors[foodColor]; // Set points based on color
};

const updateObstaclePositions = () => {
  obstacles = [];
  let obstaclePosition;
  for (let i = 0; i < numOfObstacles; i++) {
    do {
      obstaclePosition = updateObstaclePosition();
    } while (snakeBody.some(segment => segment.x === obstaclePosition.x && segment.y === obstaclePosition.y));
    obstacles.push(obstaclePosition);
  }
};

const updateObstaclePosition = () => {
  return {
    x: Math.floor(Math.random() * 28) + 2,
    y: Math.floor(Math.random() * 28) + 2
  };
};

const updateSnakePosition = () => {
  snakeX = Math.floor(Math.random() * 20) + 1;
  snakeY = Math.floor(Math.random() * 30) + 1;
};

const getRandomColor = () => {
  const colors = Object.keys(foodColors);
  return colors[Math.floor(Math.random() * colors.length)];
};

const checkGameState = () => {
  // Checking collision between snake and obstacle
  if (obstacles.some(obstacle => snakeX === obstacle.x && snakeY === obstacle.y)) {
    description.innerHTML = "Oh no! You ran into an obstacle"; // ? Is this necessary if use modal instead?
    gameOver = true;
  }
};

const handleGameOver = () => {
  clearInterval(setIntervalId);
  alert("Game Over! Press OK to replay ...");
  resetGame();
};

increaseObstaclesNum.addEventListener("click", () => {
  numOfObstacles++;
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
})

decreaseObstaclesNum.addEventListener("click", () => {
  numOfObstacles--;
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
})

easy.addEventListener("click", () => {
  numOfObstacles = 0;
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
});

medium.addEventListener("click", () => {
  numOfObstacles = 3;
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
});

hard.addEventListener("click", () => {
  numOfObstacles = 10;
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
});

peacefulMode.addEventListener("click", () => {
  // Toggle peaceful mode
  peaceful = !peaceful;
});

const resetGame = () => {
  // Reset all necessary variables and state
  gameOver = false;
  velocityX = 0;
  velocityY = 0;
  snakeBody = [];
  lastFoodColor = "green";
  score = 0;
  highScore = parseInt(localStorage.getItem("high-score")) || 0;
  highScoreElement.innerText = `High Score: ${highScore}`;
  updateAll();
  setIntervalId = setInterval(initGame, 200);
};

const changeDirection = (e) => {
  // Changing velocity value based on key press
  if (e.key === "ArrowUp" && velocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.key === "ArrowLeft" && velocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
};

obstaclesNum.innerHTML = numOfObstacles;
updateAll();
setIntervalId = setInterval(initGame, 200);
setIntervalId = setInterval(checkGameState, 200);
document.addEventListener("keyup", changeDirection);


function updateAll() {
  updateFoodPosition();
  updateSnakePosition();
  updateObstaclePositions();
}

function checkSelfCollision(html) {
  for (let i = 0; i < snakeBody.length; i++) {
    html += `<div class="head" style="background-color: ${snakeBody[i].color}; grid-area: ${snakeBody[i].y} / ${snakeBody[i].x}"></div>`;

    if (i !== 0 && snakeBody[0].x === snakeBody[i].x && snakeBody[0].y === snakeBody[i].y) {
      gameOver = true;
    }
  }
  return html;
}

function eatFood() {
  if (snakeX === foodX && snakeY === foodY) {
    console.log(snakeBody);
    // Prevent the snake from growing into obstacles
    const numOfSegments = foodColors[foodColor]; // Number of segments added is based on food color
    for (let i = 0; i < numOfSegments; i++) {
      // Check if the new segment would overlap with an obstacle
      if (!obstacles.some(obstacle => snakeX === obstacle.x && snakeY === obstacle.y)) {
        snakeBody.push({ x: snakeX, y: snakeY, color: foodColor }); // ! An obstacle cannot spawn too close to a food item
      }
    }
    lastFoodColor = foodColor;
    score += foodPoints;
    highScore = Math.max(score, highScore);
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    updateFoodPosition();
    if (positionChange) {
      updateObstaclePositions();
    }
  }
}

