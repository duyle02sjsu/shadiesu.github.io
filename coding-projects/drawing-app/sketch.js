let bgc;

// Global variables for UI elements
let toggleBtn;
let containerDiv;     // Holds sliders and labels wrapper
let sliderControls;   // Holds left side sliders text/inputs
let colorPreviewBox;  // Pure DOM element color block
let hSlider, sSlider, vSlider;
let sizeLabel;        // Text element to show current brush size
let slidersVisible = false; // Tracks visibility state
let drawingCanvas;
let drawingOnCanvas = false;

// Tool State & Brush Settings
let activeTool = '1'; // Remembers your tool ('1' through '7') even when changing brush size
let brushSize = 5;    // Default brush thickness
let smoothedMouseX = 0;
let smoothedMouseY = 0;
const BRUSH_SMOOTHING = 0.35;

// History state stacks for Undo/Redo
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 20; // Limits memory consumption

// Smart Sticky Timers
let historyCooldown = 0;
let holdTimer = 0;        // Counts how many frames a key has been held down
const HOLD_THRESHOLD = 20; // Frames to wait before entering "continuous hold" mode (approx. 0.33s)
const COOLDOWN_RATE = 10;  // Frames to wait between actions once in continuous mode

// Independent Slow Cooldown for Brush Size Key Holding
let sizeKeyTimer = 0;
const SIZE_HOLD_SPEED = 7; // Changes brush size only once every 5 frames (slower, more controlled)

function setup() {
    drawingCanvas = createCanvas(800, 600);
    background(255);
    smooth();
    strokeCap(ROUND);
    strokeJoin(ROUND);
    bgc = color(255);

    // Save initial clean background canvas state
    saveState();

    // Locked in the page 
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'z')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    // Create the master toggle button
    toggleBtn = createButton('🎨 Adjust Color');
    toggleBtn.position(100, 226);
    toggleBtn.mousePressed(toggleSliders);
    toggleBtn.style('padding', '6px 12px');
    toggleBtn.style('font-weight', 'bold');

    // brush size  text
    sizeLabel = createSpan('Brush Size: ' + brushSize + 'px (Press [ or ] to change)');
    sizeLabel.position(110, 790);
    sizeLabel.style('font-family', 'sans-serif');
    sizeLabel.style('font-size', '14px');

    // Create a container division to hold everything together horizontally
    containerDiv = createDiv('');
    containerDiv.position(100, 250);
    containerDiv.style('display', 'flex'); // Side-by-side flex layout
    containerDiv.style('align-items', 'center');
    containerDiv.style('gap', '20px');
    containerDiv.hide(); // Hidden by default

    // Create a sub-wrapper left side for the sliders text/inputs
    sliderControls = createDiv('');
    sliderControls.parent(containerDiv);

    let heading = createP('<strong>HSV Brush Controls </strong>');
    heading.parent(sliderControls);
    
    let hSpan = createSpan('Hue: ');
    hSpan.parent(sliderControls);
    hSlider = createSlider(0, 360, 180);
    hSlider.parent(sliderControls);
    createP('').parent(sliderControls); // Line break

    let sSpan = createSpan('Saturation: ');
    sSpan.parent(sliderControls);
    sSlider = createSlider(0, 100, 100);
    sSlider.parent(sliderControls);
    createP('').parent(sliderControls); // Line break

    let vSpan = createSpan('Value: ');
    vSpan.parent(sliderControls);
    vSlider = createSlider(0, 100, 100);
    vSlider.parent(sliderControls);

    // Create a dedicated DOM element block for the color preview window
    colorPreviewBox = createDiv('');
    colorPreviewBox.parent(containerDiv);
    colorPreviewBox.style('width', '60px');
    colorPreviewBox.style('height', '90px');
    colorPreviewBox.style('border', '2px solid #000');
    colorPreviewBox.style('border-radius', '4px');
}

function toggleSliders() {
    slidersVisible = !slidersVisible;
    if (slidersVisible) {
        containerDiv.show();
        toggleBtn.html('❌');
    } else {
        containerDiv.hide();
        toggleBtn.html('🎨 Adjust Color');
    }
}

function draw() {
    // Tick down timers
    if (historyCooldown > 0) historyCooldown--;
    if (sizeKeyTimer > 0) sizeKeyTimer--;

    // Sticky key situation 
    if (keyIsPressed) {
        handleStickyKeys();
    } else {
        holdTimer = 0;
    }
    
    // 2. Trigger active drawing tools
    if (mouseIsPressed && drawingOnCanvas) {
        if (mouseY < height) {
            let nextX = lerp(smoothedMouseX, mouseX, BRUSH_SMOOTHING);
            let nextY = lerp(smoothedMouseY, mouseY, BRUSH_SMOOTHING);
            drawChoice(nextX, nextY, smoothedMouseX, smoothedMouseY);
            smoothedMouseX = nextX;
            smoothedMouseY = nextY;
        }
    }
    
    // 3. UI Update Flow
    if (slidersVisible) {
        let h = hSlider.value();
        let s = sSlider.value();
        let v = vSlider.value();
        colorPreviewBox.style('background-color', `hsl(${h}, ${s}%, ${v / 2}%)`);
    }
}

// Handling holding behaviors frame-by-frame
function handleStickyKeys() {
    // Slow the brush size adjustment 
    if (key === '[') {
        if (sizeKeyTimer === 0) {
            brushSize = max(1, brushSize - 1); 
            sizeLabel.html('Brush Size: ' + brushSize + 'px (Press [ or ] to change)');
            sizeKeyTimer = SIZE_HOLD_SPEED; // Reset slow delay rate
        }
    } else if (key === ']') {
        if (sizeKeyTimer === 0) {
            brushSize = min(100, brushSize + 1); 
            sizeLabel.html('Brush Size: ' + brushSize + 'px (Press [ or ] to change)');
            sizeKeyTimer = SIZE_HOLD_SPEED; // Reset slow delay rate
        }
    }

    // Undo/Redo sticky operations
    if (keyIsDown(CONTROL) || keyIsDown(91)) {
        if (keyIsDown(90)) { 
            holdTimer++; 
            if (holdTimer > HOLD_THRESHOLD && historyCooldown === 0) { 
                if (keyIsDown(SHIFT)) {
                    handleRedo();
                } else {
                    handleUndo();
                }
                historyCooldown = COOLDOWN_RATE; 
            }
        } else {
            holdTimer = 0;
        }
    }
}

// Automatically fires the instant the mouse is released after drawing
function mouseReleased() {
    if (drawingOnCanvas && mouseY < height) {
        drawChoice(mouseX, mouseY, smoothedMouseX, smoothedMouseY);
        saveState();
    }
    drawingOnCanvas = false;
}

function mousePressed(event) {
    drawingOnCanvas = event.target === drawingCanvas.elt;
    if (drawingOnCanvas) {
        smoothedMouseX = mouseX;
        smoothedMouseY = mouseY;
    }
}

// Custom function to trap discrete key actions (once per press)
function keyPressed() {
    if (key >= '1' && key <= '7') {
        activeTool = key; 
    }

    if (key === 'x' || key === 'X') {
        background(255);
        saveState();
    }

    // Immediate action on initial bracket press so there's no lag on a single tap
    if (key === '[') {
        brushSize = max(1, brushSize - 1);
        sizeLabel.html('Brush Size: ' + brushSize + 'px (Press [ or ] to change)');
        sizeKeyTimer = SIZE_HOLD_SPEED;
    } else if (key === ']') {
        brushSize = min(100, brushSize + 1);
        sizeLabel.html('Brush Size: ' + brushSize + 'px (Press [ or ] to change)');
        sizeKeyTimer = SIZE_HOLD_SPEED;
    }

    // Run EXACTLY once instantly on initial key down stroke for undo
    if (keyIsDown(CONTROL) || keyIsDown(91)) { 
        if (keyCode === 90) { 
            holdTimer = 0; 
            if (keyIsDown(SHIFT)) {
                handleRedo();
            } else {
                handleUndo();
            }
            return false; 
        }
    }
}

function saveState() {
    let snapshot = get();
    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift(); 
    }
    redoStack = []; 
}

function handleUndo() {
    if (undoStack.length > 1) {
        let currentItem = undoStack.pop();
        redoStack.push(currentItem);
        let previousState = undoStack[undoStack.length - 1];
        image(previousState, 0, 0);
    }
}

function handleRedo() {
    if (redoStack.length > 0) {
        let nextState = redoStack.pop();
        undoStack.push(nextState);
        image(nextState, 0, 0);
    }
}

function drawChoice(x, y, previousX, previousY) {
    let brushColor = getHSVBrushColor();
    switch (activeTool) {
        case '1':
            drawAirBrush(brushColor, x, y, previousX, previousY);
            break;
        case '2':
            drawHairBrush(brushColor, x, y, previousX, previousY);
            break;
        case '3':
            drawline(brushColor, x, y, previousX, previousY);
            break;
        case '4':
            drawFatLine(brushColor, x, y, previousX, previousY);
            break;
        case '5':
            eraser(bgc, x, y, brushSize * 3); 
            break;
        case '6':
            steveRanBrush(brushColor, x, y, previousX, previousY);
            break;
        case '7':
            drawHSVBrush(x, y, previousX, previousY);
            break;
        default:
            break;
    }
}

function getHSVBrushColor() {
    push();
    colorMode(HSB, 360, 100, 100);
    let brushColor = color(hSlider.value(), sSlider.value(), vSlider.value());
    pop();
    return brushColor;
}

function drawAirBrush(brushColor, x, y, previousX, previousY) {
    let sprayRadius = max(4, brushSize * 2.5);
    let particlesPerStep = max(10, round(brushSize * 2));
    let distance = dist(previousX, previousY, x, y);
    let stepCount = max(1, ceil(distance / max(2, sprayRadius * 0.5)));

    push();
    noStroke();
    for (let step = 0; step <= stepCount; step++) {
        let progress = step / stepCount;
        let centerX = lerp(previousX, x, progress);
        let centerY = lerp(previousY, y, progress);

        for (let particle = 0; particle < particlesPerStep; particle++) {
            let angle = random(TWO_PI);
            let distanceFromCenter = sqrt(random()) * sprayRadius;
            let particleSize = random(1, max(2, brushSize * 0.3));
            fill(brushColor, random(12, 32));
            ellipse(
                centerX + cos(angle) * distanceFromCenter,
                centerY + sin(angle) * distanceFromCenter,
                particleSize,
                particleSize
            );
        }
    }
    pop();
}

function drawHairBrush(brushColor, x, y, previousX, previousY) {
    let strandCount = max(8, round(brushSize * 1.5));
    let strandSpread = max(4, brushSize * 2);
    let angle = atan2(y - previousY, x - previousX);
    let perpendicularX = -sin(angle);
    let perpendicularY = cos(angle);

    push();
    strokeCap(ROUND);
    for (let strand = 0; strand < strandCount; strand++) {
        let offset = random(-strandSpread / 2, strandSpread / 2);
        strokeWeight(random(0.5, max(0.8, brushSize * 0.12)));
        stroke(brushColor, random(130, 220));
        line(
            previousX + perpendicularX * offset,
            previousY + perpendicularY * offset,
            x + perpendicularX * offset,
            y + perpendicularY * offset
        );
    }
    pop();
}

function drawHSVBrush(lx, ly, px, py) {
    push();
    colorMode(HSB, 360, 100, 100);
    let h = hSlider.value();
    let s = sSlider.value();
    let v = vSlider.value();
    strokeWeight(brushSize); 
    stroke(h, s, v);
    line(lx, ly, px, py);
    pop();
}

function drawline(k, lx, ly, px, py) {
    strokeWeight(brushSize); 
    stroke(k);
    line(lx, ly, px, py);
}

function drawFatLine(k, lx, ly, px, py) {
    strokeWeight(10);
    stroke(k);
    line(lx, ly, px, py);
}

function steveRanBrush(brushColor, lx, ly, px, py) {
    strokeWeight(random(1, 35));
    stroke(brushColor);
    line(lx, ly, px, py);
}

function eraser(k, lx, ly, sz) {
    stroke(k);
    fill(k);
    ellipse(lx, ly, sz, sz);
}