/**
 * EvoCell creates art using a simple genetic algorithm
 * @copyright Copyright (C) 2017 Schuyler B. Kelley
 *
 * @license GPL-3.0
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * EvoCell uses third-party software packages, each of which is provided under
 * its own license.
 *
 * Contact:
 * @author Schuyler B. Kelley <zalethon@gmail.com>
 */

    // TODO: improve javascript
    //       improve documentation
    //       improve everything

    // Necessary globals...
'use strict'
var   w
    , h

    // Changable in GUI
    , deadTint
    , deadOpacity = 110
    , cellSize
    , targetV = 1.5
    , mutRate = 25
    , respawnRate = .8
    , deadViable = true
    , target       // Cell object. target.color is settable in GUI
    , diagNeighbors = false

    // GUI variables
    , guiDisp
    , guiSim
    , guiInfo
    , guiVisible = true

    // non-GUI variables
    , cells = []
    , deadc = []    // ARR  cellSize, cells, dead
    , MAX_FITNESS = dist3d(0,0,0,255,255,255);

function setup() {
  // Initialize some globals
  // TODO: make width and height settable in the GUI
  w           = displayWidth;
  h           = displayHeight
  target      = new Cell(-1,-1,rColor()); // set up a random cell with a target color. Not sure why

  // Create the canvas, and do some other initializing
  createCanvas(w,h);
  frameRate(60);

  // Initialize some GUIs
  guiDisp = QuickSettings.create(100,100,'Display')
  .addColor('Dead Cell Tint', "#000000",          function(val) { deadTint = color(val); } )
  .addRange('Dead Cell Opacity', 0, 255, 110, 1,  function(val) { deadOpacity = val; } )
  .addDropDown('Cell Size (Pixels)', allcd(w, h), initCells );

  guiSim = QuickSettings.create(100, 100 + guiDisp._content.clientHeight + guiDisp._titleBar.clientHeight, 'Simulation')
  .addColor('Target Color', rgb2hex(target.color.levels[0], target.color.levels[1], target.color.levels[2]),
                                                              function(val) { target.color = color(val); })
  .addRange('Mutation Rate', 0, 255, 25, 1,                   function(val) { mutRate = val; })
  .addRange('Extinction Frequency (Minutes)', 0, 60, 1.5, .5, function(val) { targetV = val; })
  .addRange('Respawn Rate', 0, 1, .2, .05,                    function(val) { respawnRate = 1 - val; })
  .addBoolean('Dead Cells Viable', true,                      function(val) { deadViable = !deadViable; })
  .addBoolean('Count Diagonal Neighbors', false,              function(val) { diagNeighbors = !diagNeighbors; })
  .addButton('Reset',                                         initCells );

  guiInfo = QuickSettings.create(w - 300, 100, 'Information')
  .addText("FPS", frameRate())
  .addText("Extinction Countdown", ((targetV * 60 * 60) - frameCount % (targetV * 60 * 60)));

  // Initialize some more globals
  deadTint = color(guiDisp.getValue('Dead Cell Tint'));
  guiDisp.setValue('Cell Size (Pixels)', {index:8});
  // Target colour set in target's assignment above
  // Other globals are set at declaration

  noLoop(); // Don't auto-start
}

// Main draw() loop, looped by p5
function draw() {
  var reshow = []
    , active
    , i = 0
    , lim = (w / cellSize * h / cellSize / 16)
    , phoenix;

  // If it's time for extinction, change the target and update the gui
  if (!(frameCount % (targetV * 60 * 60)) && targetV > 0) {
    target.color = rColor();
    guiSim.setValue('Target Color', rgb2hex(target.color.levels[0], target.color.levels[1], target.color.levels[2]))
  }

  // Main sub-loop
  for ( ; i < lim ; i++ ) {
    active = cells[floor(random(cells.length))];
    if (random() > fitness(active,target.color) && !active.dead) {
      active.dead = true;
      reshow.push(active);
      deadc.push(active);
    }

    if (random() > respawnRate && deadc.length > 0) {
      active = deadc.splice(floor(random(deadc.length)),1)[0];
      phoenix = active.regrow();
      if (phoenix) {
        reshow.push(phoenix);
      } else if (active) {
        deadc.push(active);
      }
    }
  }

  for ( i of reshow ) {
    i.show();
  }

}

// (Re-)Initialize cells[] and deadc[]
// Takes an Object passed into it by a quicksettings callback
function initCells(obj) {
  var i = 0
    , lim
    , xy;
  switch (obj.value) {
    case "Reset":
    break;
    default:
      cellSize = obj.value;
    break;
  }
  lim = (w / cellSize) * (h / cellSize);
  cells.splice(0,cells.length);
  deadc.splice(0,deadc.length);

  // Create each Cell and call its show() method
  for ( ; i < lim; i++ ) {
    xy = i2c( i, w / cellSize);
    cells.push(new Cell(xy[0], xy[1], rColor()));
    cells[i].show();
  }
}

function splotch(cell, color, arr, dist) {
  var i;
  cell.color = color;
  cell.mutate(mutRate);
  arr.push(cell);
  cell.show();
  for (i of cell.neighbors()) {
    if (i === null) { continue; }
    if (arr.indexOf(i) < 0 && dist3d(i.x, i.y, 0, arr[0].x, arr[0].y, 0) <= dist) {
      splotch(i, cell.color, arr, dist);
    }
  }
}

function toggleMenu() {
  if (guiVisible) {
    guiDisp.hide();
    guiSim.hide();
    guiInfo.hide();
    loop();
  } else {
    guiDisp.show();
    guiSim.show();
    guiInfo.show();
    guiInfo.setValue('FPS', frameRate());
    guiInfo.setValue('Extinction Countdown', (targetV * 60 * 60) - frameCount % (targetV * 60 * 60));
    noLoop();
  }

  guiVisible = !guiVisible;
}

/*
 * Events handled by p5
 */

function keyPressed() {
  switch (key) {
    case 'I':
      toggleMenu();
    break;
  }
}

function mouseClicked() {
  let arr = [];
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);
  if (!guiVisible) { splotch(cells[c2i([x, y], w / cellSize)], rColor(), arr, floor((w / cellSize) / 16)); }

}

/*
 * Utility Functions
 */

// Return the greatest common factor of a and b
function gcd(a, b) {
  if (a == 0) { return b; } else { return gcd(b % a, a); }
}

// Return an array of all common factors of a and b
function allcd(a, b) {
  let n = gcd(a, b)
    , arr = [1]
    , i = 2;

  for ( ; i <= n / 2; i++) {
    if (n % i === 0) {
        arr.push(i);
      }
    }
  arr.push(n);
  return arr.sort((function(a,b) { return a - b; } ));
}

// Return the distance between two points in a 3D space
function dist3d(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(Math.pow(Math.abs(x1 - x2),2) + Math.pow(Math.abs(y1 - y2),2) + Math.pow(Math.abs(z1 - z2),2));
}

// Return an array index from an array [x, y] representing coordinate
function c2i(xy, cols) {
  return xy[0] + xy[1] * cols;
}

// Return an array [x, y] from an array index
function i2c(i, cols) {
   return [i % cols, floor(i / cols)];
}

// Return a random rgb p5.Color object
function rColor() {
  return color(random(0,256), random(0, 256), random(0,256));
}

/* The following functions were all found at
 * http://stackoverflow.com/a/5624139
 */

// Converts a number to hex with .toString()
function comp2hex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

// Converts three 8-bit numbers to a hex color
function rgb2hex(r, g, b) {
  return "#" + comp2hex(r) + comp2hex(g) + comp2hex(b);
}

// Converts a hex color to RGB values
function hex2rgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
