// setup runs ( almost) first, runs once


function setup() {
  
// this define canvas size, (width,height)
createCanvas(500,500);
// color of background (greyscale)  0-255 
// where 0 is black and 255 is wh
background(120);
// can you tell when its saved?




// put setup code here
}




// runs second and runs over ... and over... and over......
function draw() {
// put drawing code here
background(120);

let ran = random(-5, 5);
let ran2 = random(-5, 5);


let leftix = constrain(mouseX, 175, 185);
let leftiy = constrain(mouseY, 153, 195);

let leftiXx = constrain(mouseX, 165, 194);
let leftiYy = constrain(mouseY, 140, 208);

let rightix = constrain(mouseX, 295, 305);
let rightiy = constrain(mouseY, 153, 195);

let rightiXx = constrain(mouseX, 285, 315);
let rightiYy = constrain(mouseY, 140, 210);


let mouthY = constrain(mouseY, 50, 150 )



//////////////////////////////////////////////////////////////Start
fill(90);


if (mouseIsPressed) {
fill("lime")
} else {
fill("lightblue");
}
ellipse(240,250,270,400);


 // left
if (mouseIsPressed) {
fill("yellow");
} else {
fill("purple");}
ellipse(180, 175, 70, 100);
// grey, a
if (mouseIsPressed) {
fill("orange");
} else {
fill("black")};
ellipse(leftix + ran2, leftiy, 50, ran + 50);
 // r,g,b,a
if (mouseIsPressed) {
fill("blue");
} else {
fill("red");}
ellipse(leftiXx + ran, leftiYy, 20, ran2 + 20);




// right
if (mouseIsPressed) {
fill("pink");
} else {
 fill(0,0,255);}
 ellipse(300, 175, 70, 100);
// grey, a
if (mouseIsPressed) {
fill("yellow");
} else {
fill("green");}
ellipse(rightix + ran2, rightiy, 50, ran + 50);


 // r,g,b,a
 if (mouseIsPressed) {
fill("blue");
} else {
fill("red");}
ellipse(rightiXx + ran, rightiYy, 20, ran2 + 20);

// mouth
  // r,g,b,a
  if (mouseIsPressed) {
fill("red");
} else {
  fill("orange");}
rect(200, 320 , 90, mouthY ,20);

// nose
if (mouseIsPressed) {
fill("blue");
} else {
fill("grey");}
rect(200, 230 ,90,50,15);

// tear
stroke(255,50,0);
 //x1,y1,x2,y2
 line(160, 210, 160, 325);
 line(160, 210, 160, 325);

}

//////////////////////////////////////////////////////////////End
