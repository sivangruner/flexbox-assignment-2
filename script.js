// Level data: instruction text, dog/owner pairs, starting layout, and target flex layout
var levels = [
    {
        instruction: "Two owners are waiting on the left side of the park. Guide both dogs to them.",
        pairs: [{ dog: "dog1.png" }, { dog: "dog2.png" }],
        startLayout: { "justify-content": "flex-end", "align-items": "flex-start" },
        targetLayout: { "justify-content": "flex-start" }
    },
    {
        instruction: "The owners are standing at the bottom of the trail, in the center. Guide the dogs down to meet them.",
        pairs: [{ dog: "dog2.png" }, { dog: "dog3.png" }],
        startLayout: { "justify-content": "flex-end", "align-items": "flex-start" },
        targetLayout: { "flex-direction": "column", "justify-content": "flex-end", "align-items": "center" }
    },
    {
        instruction: "Two owners are in the bottom-right corner. Reunite both dogs with them.",
        pairs: [{ dog: "dog1.png" }, { dog: "dog3.png" }],
        startLayout: { "justify-content": "flex-start", "align-items": "flex-start" },
        targetLayout: { "justify-content": "flex-end", "align-items": "flex-end" }
    },
    {
        instruction: "Three owners are lined up down the left side. Guide each dog to its matching owner (same colored border).",
        pairs: [{ dog: "dog1.png" }, { dog: "dog2.png" }, { dog: "dog3.png" }],
        startLayout: { "justify-content": "flex-end", "align-items": "flex-start" },
        targetLayout: { "flex-direction": "column", "justify-content": "flex-start", "align-items": "flex-start" }
    },
    {
        instruction: "Three owners stand in a centered column, bottom to top: pink, blue, then orange.",
        pairs: [{ dog: "dog1.png" }, { dog: "dog2.png" }, { dog: "dog3.png" }],
        startLayout: { "justify-content": "flex-end", "align-items": "flex-start" },
        targetLayout: { "flex-direction": "column-reverse", "justify-content": "center", "align-items": "center" }
    },
    {
        instruction: "Six dogs need to spread across the park. There are too many to fit in one row!",
        pairs: [
            { dog: "dog1.png" }, { dog: "dog2.png" }, { dog: "dog3.png" },
            { dog: "dog1.png" }, { dog: "dog2.png" }, { dog: "dog3.png" }
        ],
        startLayout: { "justify-content": "flex-start", "align-items": "flex-start" },
        targetLayout: { "flex-wrap": "wrap", "justify-content": "space-around" }
    }
];

var currentLevel = 0;
var attempts = 0;
var maxLevel = 0;

var instructionText = document.getElementById("instruction-text");
var levelIndicator = document.getElementById("level-indicator");
var userBoard = document.getElementById("user-container");
var targetBoard = document.getElementById("target-container");
var messageBox = document.getElementById("message-box");
var attemptsCounter = document.getElementById("attempts-counter");

var flexSelects = {
    "flex-direction": document.getElementById("sel-direction"),
    "justify-content": document.getElementById("sel-justify"),
    "align-items": document.getElementById("sel-align"),
    "flex-wrap": document.getElementById("sel-wrap")
};

function getPairClass(filename) {
    return "pair-" + filename.replace(".png", "");
}

function addDog(filename) {
    var img = document.createElement("img");
    img.src = "images/" + filename;
    img.className = "character-token " + getPairClass(filename);
    img.alt = "Dog";
    return img;
}

function addOwner(filename) {
    var img = document.createElement("img");
    img.src = "images/owner.png";
    img.className = "character-token owner-token " + getPairClass(filename);
    img.alt = "Owner";
    return img;
}

function applyFlexToBoard(board, layout) {
    var props = ["flex-direction", "justify-content", "align-items", "flex-wrap"];
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        board.style[prop] = layout[prop] || "";
    }
}

function updateUserBoard() {
    var level = levels[currentLevel];
    var layout = {};

    for (var prop in flexSelects) {
        if (flexSelects[prop].value) {
            layout[prop] = flexSelects[prop].value;
        } else if (level.startLayout[prop]) {
            layout[prop] = level.startLayout[prop];
        }
    }

    applyFlexToBoard(userBoard, layout);
}

function loadLevel() {
    var level = levels[currentLevel];
    var i;

    attempts = 0;
    attemptsCounter.textContent = attempts;
    hideMessage();

    levelIndicator.textContent = "Level " + (currentLevel + 1) + " of " + levels.length;
    instructionText.textContent = level.instruction;

    userBoard.innerHTML = "";
    targetBoard.innerHTML = "";
    userBoard.className = "flex-layer user-layer";

    for (i = 0; i < level.pairs.length; i++) {
        userBoard.appendChild(addDog(level.pairs[i].dog));
        targetBoard.appendChild(addOwner(level.pairs[i].dog));
    }

    resetLevel();

    applyFlexToBoard(targetBoard, level.targetLayout);
    updateNavButtons();
}

function resetLevel() {
    var prop;
    for (prop in flexSelects) {
        flexSelects[prop].value = "";
    }
    updateUserBoard();
    hideMessage();
}

function isAligned(dog, owner) {
    var dogBox = dog.getBoundingClientRect();
    var ownerBox = owner.getBoundingClientRect();
    var dogX = dogBox.left + dogBox.width / 2;
    var dogY = dogBox.top + dogBox.height / 2;
    var ownerX = ownerBox.left + ownerBox.width / 2;
    var ownerY = ownerBox.top + ownerBox.height / 2;

    return Math.abs(dogX - ownerX) < 12 && Math.abs(dogY - ownerY) < 12;
}

function checkAlignment() {
    var dogs = userBoard.querySelectorAll("img.character-token:not(.owner-token)");
    var owners = targetBoard.querySelectorAll("img.owner-token");
    var i;

    if (dogs.length !== owners.length) {
        return false;
    }

    for (i = 0; i < dogs.length; i++) {
        if (!isAligned(dogs[i], owners[i])) {
            return false;
        }
    }

    return true;
}

function validateSolution() {
    attempts++;
    attemptsCounter.textContent = attempts;
    updateUserBoard();

    requestAnimationFrame(function () {
        if (checkAlignment()) {
            onLevelComplete();
        } else {
            showMessage("Not quite right. Keep trying!", "error");
        }
    });
}

function onLevelComplete() {
    showSuccessImage();
    showMessage("Success! The dogs found their owners!", "success");

    if (currentLevel >= maxLevel) {
        maxLevel = Math.min(currentLevel + 1, levels.length - 1);
        localStorage.setItem("dogGame_maxLevel", maxLevel);
    }

    localStorage.setItem("dogGame_level", currentLevel);

    if (currentLevel < levels.length - 1) {
        setTimeout(function () {
            currentLevel++;
            localStorage.setItem("dogGame_level", currentLevel);
            loadLevel();
        }, 1500);
    } else {
        setTimeout(function () {
            showMessage("You completed all 6 levels!", "success");
        }, 400);
    }
}

function showSuccessImage() {
    targetBoard.innerHTML = "";
    userBoard.innerHTML = "";
    userBoard.className = "flex-layer user-layer success-state";

    var img = document.createElement("img");
    img.src = "images/success.png";
    img.className = "success-image";
    img.alt = "Dogs reunited with owners";
    userBoard.appendChild(img);
}

function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = "feedback-box " + type;
}

function hideMessage() {
    messageBox.className = "feedback-box hidden";
}

function updateNavButtons() {
    document.getElementById("btn-prev").disabled = currentLevel === 0;
    document.getElementById("btn-next").disabled = currentLevel >= maxLevel;
}

// Event listeners
for (var prop in flexSelects) {
    flexSelects[prop].addEventListener("change", updateUserBoard);
}

document.getElementById("btn-check").addEventListener("click", validateSolution);
document.getElementById("btn-reset").addEventListener("click", resetLevel);

document.getElementById("btn-prev").addEventListener("click", function () {
    if (currentLevel > 0) {
        currentLevel--;
        localStorage.setItem("dogGame_level", currentLevel);
        loadLevel();
    }
});

document.getElementById("btn-next").addEventListener("click", function () {
    if (currentLevel < maxLevel) {
        currentLevel++;
        localStorage.setItem("dogGame_level", currentLevel);
        loadLevel();
    }
});

// Load saved progress
var savedLevel = localStorage.getItem("dogGame_level");
var savedMax = localStorage.getItem("dogGame_maxLevel");
if (savedLevel !== null) {
    currentLevel = parseInt(savedLevel, 10);
}
if (savedMax !== null) {
    maxLevel = parseInt(savedMax, 10);
}

loadLevel();
