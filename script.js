var levels = [
    {
        text: "Two owners are waiting on the left side of the park. Guide both dogs to them.",
        dogs: ["dog1.png", "dog2.png"],
        start: { "justify-content": "flex-end", "align-items": "flex-start" },
        target: { "justify-content": "flex-start" }
    },
    {
        text: "The owners are at the bottom center of the trail. Guide the dogs down to meet them.",
        dogs: ["dog2.png", "dog3.png"],
        start: { "justify-content": "flex-end", "align-items": "flex-start" },
        target: { "flex-direction": "column", "justify-content": "flex-end", "align-items": "center" }
    },
    {
        text: "Two owners are in the bottom-right corner. Reunite both dogs with them.",
        dogs: ["dog1.png", "dog3.png"],
        start: { "justify-content": "flex-start", "align-items": "flex-start" },
        target: { "justify-content": "flex-end", "align-items": "flex-end" }
    },
    {
        text: "Three owners are lined up down the left side. Match each dog to its owner color.",
        dogs: ["dog1.png", "dog2.png", "dog3.png"],
        start: { "justify-content": "flex-end", "align-items": "flex-start" },
        target: { "flex-direction": "column", "justify-content": "flex-start", "align-items": "flex-start" }
    },
    {
        text: "Three owners stand in a centered column, bottom to top: pink, blue, then orange.",
        dogs: ["dog1.png", "dog2.png", "dog3.png"],
        start: { "justify-content": "flex-end", "align-items": "flex-start" },
        target: { "flex-direction": "column-reverse", "justify-content": "center", "align-items": "center" }
    },
    {
        text: "Twelve dogs fill the park crate and will not fit in one row",
        dogs: [
            "dog1.png", "dog2.png", "dog3.png",
            "dog1.png", "dog2.png", "dog3.png",
            "dog1.png", "dog2.png", "dog3.png",
            "dog1.png", "dog2.png", "dog3.png"
        ],
        start: { "justify-content": "flex-start", "align-items": "flex-start" },
        target: { "flex-wrap": "wrap", "justify-content": "space-around" },
        wrapLevel: true
    }
];

var flexProps = ["flex-direction", "justify-content", "align-items", "flex-wrap"];
var selects = {
    "flex-direction": document.getElementById("sel-direction"),
    "justify-content": document.getElementById("sel-justify"),
    "align-items": document.getElementById("sel-align"),
    "flex-wrap": document.getElementById("sel-wrap")
};

var currentLevel = 0;
var attempts = 0;

var userBoard = document.getElementById("user-board");
var targetBoard = document.getElementById("target-board");
var board = document.getElementById("board");
var message = document.getElementById("message");
var attemptsEl = document.getElementById("attempts");

function pairClass(dogFile) {
    return "pair-" + dogFile.replace(".png", "");
}

function createDog(dogFile) {
    var img = document.createElement("img");
    img.src = "images/" + dogFile;
    img.className = "token " + pairClass(dogFile);
    img.alt = "Dog";
    return img;
}

function createOwner(dogFile) {
    var img = document.createElement("img");
    img.src = "images/owner.png";
    img.className = "token owner " + pairClass(dogFile);
    img.alt = "Owner";
    return img;
}

function getUserLayout() {
    var level = levels[currentLevel];
    var layout = {};
    var i;

    for (i = 0; i < flexProps.length; i++) {
        var prop = flexProps[i];
        if (selects[prop].value) {
            layout[prop] = selects[prop].value;
        } else if (level.start[prop]) {
            layout[prop] = level.start[prop];
        }
    }

    return layout;
}

function applyLayout(element, layout) {
    var i;

    for (i = 0; i < flexProps.length; i++) {
        element.style[flexProps[i]] = layout[flexProps[i]] || "";
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

function hideMessage() {
    message.className = "message hidden";
}

function updateNavButtons() {
    document.getElementById("btn-prev").disabled = currentLevel === 0;
    document.getElementById("btn-next").disabled = currentLevel === levels.length - 1;
}

function showSuccessImage() {
    targetBoard.innerHTML = "";
    userBoard.innerHTML = "";
    userBoard.className = "layer user success-state";

    var img = document.createElement("img");
    img.src = "images/success.png";
    img.className = "success-image";
    img.alt = "Dogs reunited with owners";
    userBoard.appendChild(img);
}

function updateUserBoard() {
    applyLayout(userBoard, getUserLayout());
}

function loadLevel() {
    var level = levels[currentLevel];
    var i;

    document.getElementById("level-label").textContent = "Level " + (currentLevel + 1) + " of " + levels.length;
    document.getElementById("instruction").textContent = level.text;

    for (var prop in selects) {
        selects[prop].value = "";
    }

    attempts = 0;
    attemptsEl.textContent = attempts;
    hideMessage();

    userBoard.innerHTML = "";
    targetBoard.innerHTML = "";
    userBoard.className = "layer user";
    board.className = level.wrapLevel ? "board wrap-level" : "board";

    for (i = 0; i < level.dogs.length; i++) {
        userBoard.appendChild(createDog(level.dogs[i]));
        targetBoard.appendChild(createOwner(level.dogs[i]));
    }

    applyLayout(targetBoard, level.target);
    updateUserBoard();
    updateNavButtons();
}

function resetLevel() {
    loadLevel();
}

function isMatch(dog, owner) {
    var dogBox = dog.getBoundingClientRect();
    var ownerBox = owner.getBoundingClientRect();

    return Math.abs(dogBox.left + dogBox.width / 2 - (ownerBox.left + ownerBox.width / 2)) < 12 &&
        Math.abs(dogBox.top + dogBox.height / 2 - (ownerBox.top + ownerBox.height / 2)) < 12;
}

function checkSolution() {
    var dogs = userBoard.querySelectorAll(".token:not(.owner)");
    var owners = targetBoard.querySelectorAll(".token.owner");
    var i;

    attempts++;
    attemptsEl.textContent = attempts;
    updateUserBoard();

    requestAnimationFrame(function () {
        for (i = 0; i < dogs.length; i++) {
            if (!isMatch(dogs[i], owners[i])) {
                showMessage("Not quite right. Keep trying!", "error");
                return;
            }
        }

        showSuccessImage();
        showMessage("Success! The dogs found their owners!", "success");

        if (currentLevel < levels.length - 1) {
            setTimeout(function () {
                currentLevel++;
                loadLevel();
            }, 1500);
        } else {
            setTimeout(function () {
                showMessage("You completed all 6 levels!", "success");
            }, 400);
        }
    });
}

for (var key in selects) {
    selects[key].addEventListener("change", updateUserBoard);
}

document.getElementById("btn-check").addEventListener("click", checkSolution);
document.getElementById("btn-reset").addEventListener("click", resetLevel);

document.getElementById("btn-prev").addEventListener("click", function () {
    if (currentLevel > 0) {
        currentLevel--;
        loadLevel();
    }
});

document.getElementById("btn-next").addEventListener("click", function () {
    if (currentLevel < levels.length - 1) {
        currentLevel++;
        loadLevel();
    }
});

loadLevel();
