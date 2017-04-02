/** This file contains code used mostly by or on Cell objects */

'use strict'

/** Cell */
function Cell(x, y, color) {

  this.color = color;
  this.x = x;
  this.y = y;
  this.dead = false;

  this.show = function() { // draw/redraw the cell
    if (this.dead) {
      fill(deadTint);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
      fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], deadOpacity);
    } else {
      fill(this.color);
    }
    noStroke();
    rect(x * cellSize, y * cellSize, cellSize, cellSize);
    return this.dead;
  }

  this.neighbors = function() { // return an array[top, right, bottom, left] of neighboring cells, and set this.ns[]
    let a = []; // array of neighboring Cell objects
    if (this.y != 0) { a.push(cells[c2i([this.x, this.y-1], w / cellSize)]); } else { a.push(null); }
    if (this.x != w / cellSize - 1) { a.push(cells[c2i([this.x+1, this.y], w / cellSize)]); } else { a.push(null); }
    if (this.y != h / cellSize - 1) { a.push(cells[c2i([this.x, this.y+1], w / cellSize)]); } else { a.push(null); }
    if (this.x != 0) { a.push(cells[c2i([this.x-1, this.y], w / cellSize)]); } else { a.push(null); }
    return a;
  }

  this.regrow = function() { // Regrow a cell.
    let n = this.neighbors();
    let p1 = null
      , p2 = null;

    while (p1 === null && n.length > 0) {
      p1 = n.splice( floor( random( n.length ) ), 1)[0];
    }

    while (p2 === null && n.length > 0) {
      p2 = n.splice( floor( random( n.length ) ), 1)[0];
    }

    if (p1 != null && p2 != null) {
      this.color = recomb(p1, p2);
      this.dead = false;
      this.mutate(mutRate);
      return this;
    } else {
      return false;
    }
  }

  this.mutate = function(obj, num) {
    let i = floor(random(3))
  // p5.Color objects are supposed to be immutable. We'll fix this someday
    this.color.levels[i] = Math.abs(floor((this.color.levels[i] + floor(random(-num, num+1)))) % 255);
  }

  this.red = function() {
    return red(this.color);
  }

  this.green = function() {
    return green(this.color);
  }

  this.blue = function() {
    return blue(this.color);
  }
}

function recomb(cellA, cellB) { // return a new colour from cellA's' and cellB's colours
  var arr = []
    , i = 0; //  return lerpColor(cellA.color, cellB.color, amt);  // gradient

  for ( ; i<3; i++) {

    if(floor(random(2)) >=1) {
      arr.push(cellA.color.levels[i]);
    } else{
      arr.push(cellB.color.levels[i]);
    }
  }
  if (arr === cellA.color.levels || arr === cellB.color.levels) {
    recomb(cellA, cellB);
  } else {
    return color(arr[0], arr[1], arr[2]);
  }
}

function fitness(cell, opt, func) { // return the fitness of a cell in relation to an OPTimal target. (opt is p5.color object)
  var f = dist3d(opt.levels[0],opt.levels[1],opt.levels[2],cell.color.levels[0],cell.color.levels[1],cell.color.levels[2]);
  if (func === undefined) {
    func = "0";
  }

  switch (func) {
    case "0":
      return Math.min( Math.max( Math.log( MAX_FITNESS / (f + 20)) / Math.log( MAX_FITNESS ) * 2.5, 0 ), 1);
      break;
    case "1":
      return Math.pow( MAX_FITNESS - f, 2 ) / Math.pow( MAX_FITNESS, 2 );
      break;
    case "2":
      return Math.max( 1 - f / MAX_FITNESS - .05, 0 );
      break;
  }
}
