const board = document.querySelector("#board");
const context = board.getContext("2d");
const colorPicker = document.querySelector("#color-picker");
const brushSize = document.querySelector("#brush-size");
const clearButton = document.querySelector("#clear-button");
const fillButton = document.querySelector("#fill-button");
const downloadButton = document.querySelector("#download-button");
const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");
const brushButton = document.querySelector("#brush-button");
const eraserButton = document.querySelector("#eraser-button");

let isDrawing = false;
let isEraser = false;

const history = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

board.addEventListener("pointerdown", () => { isDrawing = true; });

board.addEventListener("pointerup", () => {
    if (!isDrawing) return;
    isDrawing = false;
    context.beginPath();
    saveState();
});

board.addEventListener("pointerout", () => {
    if (!isDrawing) return;
    isDrawing = false;
    context.beginPath();
    saveState();
});

board.addEventListener("pointermove", draw);
board.style.touchAction = "none";

clearButton.addEventListener("click", clearCanvas);
fillButton.addEventListener("click", fillCanvas);
downloadButton.addEventListener("click", downloadImage);
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
brushButton.addEventListener("click", () => setEraser(false));
eraserButton.addEventListener("click", () => setEraser(true));

document.addEventListener("keydown", (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (ctrl && key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
    }
    if (ctrl && (key === "y" || (key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
    }

    if (!ctrl && key === "e") {
        setEraser(!isEraser);
    } else if (!ctrl && key === "b") {
        setEraser(false);
    }
});

function setEraser(value) {
    isEraser = value;
    brushButton.classList.toggle("active", !isEraser);
    eraserButton.classList.toggle("active", isEraser);
}

function draw(e) {
    if (!isDrawing) return;

    context.lineWidth = brushSize.value;
    context.lineCap = "round";
    context.strokeStyle = isEraser ? "#ffffff" : colorPicker.value;

    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    context.beginPath();
    context.moveTo(e.offsetX, e.offsetY);
}

function clearCanvas() {
    context.clearRect(0, 0, board.width, board.height);
    saveState();
}

function fillCanvas() {
    context.fillStyle = colorPicker.value;
    context.fillRect(0, 0, board.width, board.height);
    saveState();
}

function downloadImage() {
    const imageLink = document.createElement("a");
    imageLink.download = `tickey-${Date.now()}.png`;
    imageLink.href = board.toDataURL("image/png");
    imageLink.click();
}

function saveState() {
    history.splice(historyIndex + 1);
    history.push(context.getImageData(0, 0, board.width, board.height));
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateButtons();
}

function restoreState(index) {
    context.putImageData(history[index], 0, 0);
}

function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    restoreState(historyIndex);
    updateButtons();
}

function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    restoreState(historyIndex);
    updateButtons();
}

function updateButtons() {
    undoButton.disabled = historyIndex <= 0;
    redoButton.disabled = historyIndex >= history.length - 1;
}

saveState();