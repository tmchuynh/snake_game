const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const description = document.querySelector(".description");
const controls = document.querySelectorAll(".controls i");
const obstaclesNum = document.querySelector(".obstacles");
const increaseObstaclesNum = document.querySelector(".increase");
const decreaseObstaclesNum = document.querySelector(".decrease");
const peacefulMode = document.getElementById("peacefulMode");
const obstaclesMove = document.getElementById("obstaclesMove");

// TODO: High Score based on how many obstacles there was in the board during the game played
// ?: Leaderboard ? with button to show leaderboard ?

// TODO: Peaceful Mode --> go through walls ???? 

// ?: Explosion image for snake head on collision

// ! game-details needs to be styled better

// ! snake continues moving if it's moving while numOfObstacles gets updated o.O

// Buttons to automatically adjust the number of obstacles
const easy = document.querySelector(".easy");
const medium = document.querySelector(".medium");
const hard = document.querySelector(".hard");

let level = "easy";
let ratio = 5;
let obstacle;
let foodX, foodY;
let gameOver = false;
let snakeX = 15, snakeY = 15;
let velocityX = 0, velocityY = 0;
let obstacleX = 25, obstacleY = 17;
let numOfObstacles = 4; // default
let snakeBody = [];

let lastFoodColor = "green";
let obstacles = [];
let positionChange = false;
let peaceful = false;
let score = 0;
let setIntervalId, gameOverInterval;
let highScore = parseInt(localStorage.getItem("high-score")) || 0;
let foodColors = generateRandomFoodColors(5); // Object of the colors and point values
let foodColor = Object.keys(foodColors)[0];
let foodPoints = Object.values(foodColors)[0];
console.log(foodColor, foodPoints);
console.log(foodColors);

highScoreElement.innerText = `High Score: ${highScore}`;

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button =>
  button.addEventListener("click", () =>
    changeDirection({ key: button.dataset.key })
  )
);

const initGame = () => {
  if (gameOver) return handleGameOver();

  if (obstaclesMove.checked) {
    positionChange = true;
  } else {
    positionChange = false;
  }

  if (peacefulMode.checked) {
    peaceful = true;
  } else {
    peaceful = false;
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
  checkGameState(); // Add this here to ensure game state is checked

  // Add obstacles to the HTML
  obstacles.forEach(obstacle => {
    html += `<i class="bi bi-exclamation-diamond-fill obstacle gradient-text" style="grid-area: ${obstacle.y} / ${obstacle.x}"></i>`;
  });

  playBoard.innerHTML = html;

};

const updateFoodPosition = () => {
  if (level !== "easy") {
    const foodPosition = updateFoodPositionWithSafeBox();
    foodX = foodPosition.x;
    foodY = foodPosition.y;
  } else {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
  }
  foodColor = getRandomColor();
  foodPoints = foodColors[foodColor]; // Set points based on color
};

const updateFoodPositionWithSafeBox = () => {
  let validPosition = false;
  let foodPosition;
  const foodSafeRatio = Math.floor(ratio * 1.5);

  while (!validPosition) {
    foodPosition = {
      x: Math.floor(Math.random() * 30) + 1,
      y: Math.floor(Math.random() * 30) + 1
    };
    validPosition = true;

    // Check if the food is within the "safe box" around the snake's position
    snakeBody.forEach(segment => {
      if (
        (foodPosition.x >= segment.x - foodSafeRatio && foodPosition.x <= segment.x + foodSafeRatio &&
          foodPosition.y >= segment.y - foodSafeRatio && foodPosition.y <= segment.y + foodSafeRatio)
      ) {
        validPosition = false;
      }
    });
  }

  return foodPosition;
};


const updateObstaclePositions = () => {
  obstacles = [];
  let obstaclePosition;
  for (let i = 0; i < numOfObstacles; i++) {
    let validPosition = false;
    while (!validPosition) {
      obstaclePosition = updateObstaclePosition();
      validPosition = true;

      // Check if the obstacle is within the "safe box" around the snake's initial position
      snakeBody.forEach(segment => {
        if (
          (obstaclePosition.x >= segment.x - ratio && obstaclePosition.x <= segment.x + ratio &&
            obstaclePosition.y >= segment.y - ratio && obstaclePosition.y <= segment.y + ratio) ||
          (obstaclePosition.x === segment.x && obstaclePosition.y === segment.y)
        ) {
          validPosition = false;
        }
      });

      // Check if the obstacle is within the "safe box" around the food position
      if (
        (obstaclePosition.x >= foodX - ratio && obstaclePosition.x <= foodX + ratio &&
          obstaclePosition.y >= foodY - ratio && obstaclePosition.y <= foodY + ratio)
      ) {
        validPosition = false;
      }
    }
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
  description.innerHTML = `Color is ${foodColor} and it has ${foodPoints} points!`
  console.log(foodColor, foodPoints);
  console.log(foodColors);
  const colors = Object.keys(foodColors); // Array of just the colors
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
  calculateRatio();
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
})

decreaseObstaclesNum.addEventListener("click", () => {
  numOfObstacles--;
  calculateRatio();
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
})

easy.addEventListener("click", () => {
  numOfObstacles = 0;
  calculateRatio();
  level = "easy";
  description.innerHTML = `Level: ${level} Ratio: ${ratio}`;
  setTimeout(function () {
    description.innerHTML = "";
  }, 300);
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
});

medium.addEventListener("click", () => {
  numOfObstacles = 5;
  calculateRatio();
  level = "medium";
  description.innerHTML = `Level: ${level} Ratio: ${ratio}`;
  setTimeout(function () {
    description.innerHTML = "";
  }, 300);
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
});

hard.addEventListener("click", () => {
  numOfObstacles = 10;
  calculateRatio();
  level = "hard";
  description.innerHTML = `Level: ${level} Ratio: ${ratio}`;
  setTimeout(function () {
    description.innerHTML = "";
  }, 300);
  obstaclesNum.innerHTML = numOfObstacles;
  updateAll();
});

peacefulMode.addEventListener("click", () => {
  peaceful = !peaceful;
  updateAll();
});

obstaclesMove.addEventListener("click", () => {
  positionChange = !positionChange;
  updateAll();
});

function calculateRatio() {
  if (numOfObstacles >= 0 && numOfObstacles <= 5) {
    level = "easy";
    ratio = 5;
  } else if (numOfObstacles >= 6 && numOfObstacles <= 10) {
    level = "medium";
    ratio = 3;
  } else if (numOfObstacles > 10) {
    level = "hard";
    ratio = 0;
  } else {
    alert("Not a valid number of obstacles!!!")
  }
}

const resetGame = () => {
  // Reset all necessary variables and state
  gameOver = false;
  velocityX = 0;
  velocityY = 0;
  score = 0;
  numOfObstacles = 4; // default
  level = "easy";
  ratio = 5;
  obstaclesNum.innerHTML = numOfObstacles;
  snakeBody = [];
  foodColor = "#8A4FFF";
  lastFoodColor = "green";
  obstacles = [];
  positionChange = false;
  peaceful = false;
  highScore = parseInt(localStorage.getItem("high-score")) || 0;
  highScoreElement.innerText = `High Score: ${highScore}`;
  setIntervalId = setInterval(initGame, 200);
  updateAll();
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

resetGame();
setIntervalId = setInterval(initGame, 400);
setIntervalId = setInterval(checkGameState, 200);
document.addEventListener("keyup", changeDirection);


function updateAll() {
  updateFoodPosition();
  updateSnakePosition();
  updateObstaclePositions();
  foodColors = generateRandomFoodColors(5);
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
    description.innerHTML = `You gained ${foodPoints} points!`
    setTimeout(function () {
      description.innerHTML = "";
    }, 3000);
    // Prevent the snake from growing into obstacles
    const numOfSegments = foodPoints; // Number of segments added is based on food color
    for (let i = 0; i < numOfSegments; i++) {
      // Check if the new segment would overlap with an obstacle
      if (!obstacles.forEach(obstacle => snakeX === obstacle.x && snakeY === obstacle.y)) {
        snakeBody.push({ x: snakeX, y: snakeY, color: foodColor });
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
      if (level !== "easy") {
        // TODO: Add a "warning" that says that the food color may not be the same point value if it appears again
        foodColors = generateRandomFoodColors(5);
      }
      updateObstaclePositions();
    }
  }
}

// Generate a set of random colors and associate them with point values
function generateRandomFoodColors(numColors) {
  const colors = randomColors(numColors); // Array of random colors
  shuffle(colors);
  const pointValues = generateUniqueRandomNumbers(numColors, 1, 7);
  shuffle(pointValues);
  const foodColors = arrayToObject(colors, pointValues);
  return foodColors;
};

function generateHSLColor(hue = Math.floor(Math.random() * 360), saturation = 100, lightness = Math.floor(Math.random() * 80) + 30) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function randomColors(count) {
  const colors = new Set();

  while (colors.size < count) {
    const hue = Math.floor(Math.random() * 360); // Random hue between 0 and 359
    colors.add(generateHSLColor(hue));
  }

  return Array.from(colors);
}


function arrayToObject(keys, values) {
  const result = {};
  keys.forEach((key, index) => {
    result[key] = values[index] || null; // Assign value, or null if no corresponding value
  });
  return result;
}

function generateUniqueRandomNumbers(count, min, max) {
  if (max - min <= count) {
    max += Math.floor(count / 1.3);
  }
  const uniqueNumbers = new Set();

  while (uniqueNumbers.size < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    uniqueNumbers.add(randomNum);
  }

  return Array.from(uniqueNumbers);
}

// Shuffle array function
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const showModal = (message) => {
  // Example: Assuming you have a modal element
  const modal = document.querySelector(".modal");
  const modalMessage = modal.querySelector(".modal-message");
  modalMessage.innerText = message;
  modal.style.display = "block"; // Show the modal
};