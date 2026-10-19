// Array to store the fireflies
let fireflies = [];

function setup() {
  createCanvas(700, 600);
  
  // Start with a small initial group of fireflies
  for (let i = 0; i < 5; i++) {
    spawnFirefly(random(50, width - 50), random(50, height - 50));
  }
}

function draw() {
  ffDrawBackground();

  // Update and display every firefly 
  for (let i = 0; i < fireflies.length; i++) {
    let f = fireflies[i];

    // Vector Bounce Behavior 
    f.x += f.speedX;
    f.y += f.speedY;

    if (f.x < 30 || f.x > width - 30) {
      f.speedX = -f.speedX;
    }
    if (f.y < 30 || f.y > height - 30) {
      f.speedY = -f.speedY;
    }

    // flapping calculation for each firefly
    let flapVal = sin(frameCount * f.flapspeed) * 18;

    // random glow calculation
    let glowVal = map(sin(frameCount * f.glowSpeed + f.glowOffset), -1, 1, 40, 255);

    // Draw either Type A or Type B parent creature based on its type property
    if (f.type === 0) {
      ffFireflyA(f.x, f.y, f.speedX * 10, f.scaleFactor, flapVal, glowVal, f.col);
    } else {
      ffFireflyB(f.x, f.y, f.speedX * 10, f.scaleFactor, flapVal, glowVal, f.col);
    }
  }
}

// Function to handle spawning a new firefly when clicked
function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    spawnFirefly(mouseX, mouseY);
  }
}

function spawnFirefly(startX, startY) {
  let f = {
    x: startX,
    y: startY,
    speedX: random(-2, 2),
    speedY: random(-1.5, 1.5),
    scaleFactor: random(0.3, 0.8),
    flapspeed: random(0.08, 0.2),
    glowSpeed: random(0.03, 0.1),     
    glowOffset: random(100),          
    type: floor(random(2)),           // Randomly picks 0 (Type A) or 1 (Type B)
    col: color(random(190, 250), random(200, 230), random(60, 120))
  };
  fireflies.push(f);
}



// CUSTOM FUNCTIONS WITHOUT ARGUMENTS

function ffDrawBackground() {
  // Blank background with a subtle border frame
  background(15);
  stroke(30);
  strokeWeight(2);
  noFill();
  rect(10, 10, width - 20, height - 20);
}

// PARENT FUNCTIONS WITH ARGUMENTS (2 Variations)

// Parent Variation A: Standard Firefly (Core + Wings)
function ffFireflyA(lx, ly, rot, sc, flapVal, glowVal, k) {
  push();
  translate(lx, ly);
  rotate(radians(rot));
  scale(sc);
  
  ffCore(0, 0, 0, 1, glowVal, k);                  
  ffWing(-12, 0, -20, 1, flapVal, glowVal, k);       
  ffWing(12, 0, 20, -1, -flapVal, glowVal, k);        
  
  pop();
}

// Parent Variation B: Antennae Firefly (Different child composition!)
function ffFireflyB(lx, ly, rot, sc, flapVal, glowVal, k) {
  push();
  translate(lx, ly);
  rotate(radians(rot));
  scale(sc);
  
  ffCore(0, 0, 0, 1, glowVal, k);                  
  ffWing(-12, 0, -20, 1, flapVal, glowVal, k);       
  ffWing(12, 0, 20, -1, -flapVal, glowVal, k);
  
  // Unique child components for Variation B
  ffAntenna(-8, -10, -45, 1, glowVal, k);
  ffAntenna(8, -10, 45, -1, glowVal, k);
  
  pop();
}

// CHILD FUNCTIONS WITH ARGUMENTS

function ffCore(lx, ly, rot, sc, glowVal, k) {
  push();
  translate(lx, ly);
  rotate(radians(rot));
  scale(sc);
  
  noStroke();
  fill(red(k), green(k), blue(k), glowVal * 0.7);
  ellipse(0, 0, 26, 26);
  
  fill(255, 255, 210, glowVal);
  ellipse(0, 0, 10, 10);
  
  pop();
}

function ffWing(lx, ly, rot, sc, flapAmount, glowVal, k) {
  push();
  translate(lx, ly);
  rotate(radians(rot + flapAmount));
  scale(sc);
  
  fill(red(k), green(k), blue(k), glowVal * 0.5);
  noStroke();
  ellipse(20, 0, 40, 14);
  
  stroke(255, glowVal * 0.6);
  strokeWeight(1);
  line(-3, 0, 35, 0);
  
  pop();
}

function ffAntenna(lx, ly, rot, sc, glowVal, k) {
  push();
  translate(lx, ly);
  rotate(radians(rot));
  scale(sc);
  
  // Small antenna child component
  stroke(255, glowVal * 0.5);
  strokeWeight(1.5);
  line(0, 0, 0, -15);
  
  noStroke();
  fill(255, glowVal * 0.8);
  ellipse(0, -15, 4, 4);
  
  pop();
}