let headWidth = 300;     
let eyeSize = 60;       

// Cat Settings
let catHeadColor = "#f1f5f9";
let catEyeColor  = "#fde047";
let catNoseColor = "#f43f5e";

// Dog Settings
let dogHeadColor = "#d97706";
let dogEarColor  = "#78350f";
let dogNoseColor = "#1b1918";
let b;
let b2;

let isCat = true;          
let hasSwitched = false;    
let f;
let wordY = -30;
let wordSize = 8;
 
// ==========================================

async function setup() {
  f = await loadFont("images/tronical-elyps/TronicalElyps.otf");
  createCanvas(500, 500);
  noStroke();
  frameRate(60);
  b = await loadImage("images/fish.png");
  b2 = await loadImage("images/bone.png");
}

function draw() {
  // ----------------------------------------------------
  // LAYER 1: VERTICAL BACKGROUND NOISE STRIPES
  // ----------------------------------------------------
  background(15, 23, 42);
  noStroke();

  for (let i = 0; i < width; i += 40) {
    for (let j = 0; j < height; j += 4) {
      let randr = noise(frameCount * 0.01, j * 0.05) * 255;
      let randg = noise(frameCount * 0.01 + 100, j * 0.01) * 255; 
      let randb = noise(frameCount * 0.01 + 1000, j * 0.01) * 255; 

      fill(randr, randg, randb);
      ellipse(i, j, 1000, 1);
    } 
  } 

  // ----------------------------------------------------
  // LAYER 2: THE FACES
  // ----------------------------------------------------
  let mouthY = map(mouseY, 0, height, 15, 60);

  if (isCat) {
    // CAT FACE
    // Ears
    fill(catHeadColor);
    stroke(0, 0, 0);
    triangle(120, 190, 170, 150, 130, 70); 
    triangle(380, 190, 330, 150, 370, 70); 

    // Base Head
    fill(catHeadColor);
    ellipse(250, 250, headWidth, 260);

    // Eyes
    fill(catEyeColor);
    ellipse(180, 220, eyeSize, eyeSize - 15);
    ellipse(320, 220, eyeSize, eyeSize - 15);
    
    // Pupils
    let catLeftX  = constrain(mouseX, 170, 190);
    let catLeftY  = constrain(mouseY, 214, 226);
    let catRightX = constrain(mouseX, 310, 330);
    let catRightY = constrain(mouseY, 214, 226);
    
    fill("#000000");
    noStroke();
    ellipse(catLeftX, catLeftY, 12, eyeSize - 25);
    ellipse(catRightX, catRightY, 12, eyeSize - 25);

    // Nose
    fill(catNoseColor);
    triangle(240, 260, 260, 260, 250, 270);

    // Tongue 
    fill("#f43f5e");
    rect(235, 275, 30, mouthY, 0, 0, 15, 15);

  } else {
    // DOG FACE
    stroke(0, 0, 0);
    // Ears
    fill(dogEarColor);
    ellipse(110, 240, 60, 140);
    ellipse(390, 240, 60, 140);

    // Base Head
    fill(dogHeadColor);
    ellipse(250, 250, headWidth, 280);

    // Eyes
    fill("#ffffff");
    ellipse(185, 210, eyeSize, eyeSize);
    ellipse(315, 210, eyeSize, eyeSize);
    
    // Pupils
    let dogLeftX  = constrain(mouseX, 170, 200);
    let dogLeftY  = constrain(mouseY, 200, 220);
    let dogRightX = constrain(mouseX, 300, 330);
    let dogRightY = constrain(mouseY, 200, 220);
    
    fill("#000000");
    noStroke();
    ellipse(dogLeftX, dogLeftY, 25, 25);
    ellipse(dogRightX, dogRightY, 25, 25);

    // Nose
    fill(dogNoseColor);
    triangle(230, 250, 270, 250, 250, 268);

    // Tongue 
    fill("#f43f5e");
    rect(235, 280, 30, mouthY, 0, 0, 15, 15);
  }

  imageMode(CENTER);
  if (isCat) {
    image(b, mouseX, mouseY, 150, 150);
  } else {
    image(b2, mouseX, mouseY, 150, 150);
  }

  // Words
  wordY = min(wordY + 2, 400);
  wordSize = min(wordSize + 0.5, 115);
  push();
  textFont(f);
  textAlign(CENTER, CENTER);
  textSize(wordSize);
  stroke(15, 23, 42);
  strokeWeight(4);
  fill("#ffee00");
  text(isCat ? "MEOW" : "WOOF", 250, wordY);
  pop();
}
// ----------------------------------------------------
// KEYBOARD INTERACTION
// ----------------------------------------------------
function keyPressed() {
  if (key === 'c' || key === 'C') {
    isCat = true;
    wordY = -30;
    wordSize = 8;
  } else if (key === 'd' || key === 'D') {
    isCat = false;
    wordY = -30;
    wordSize = 8;
  }
}
