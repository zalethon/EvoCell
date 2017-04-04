/**
 * @copyright Copyright (C) 2017 Schuyler B. Kelley
 * @license GPL-3.0
 *
 * This file contains code used mostly by or on Cell objects
 */

'use strict'

/** Cell */
function Cell(x, y, color)
{
  this.color = color;
  this.x = x;
  this.y = y;
  this.dead = false;

   /*
   * this.edges is a 4-bit number representing which edges the Cell
   * happens to touch.
   *
   * Bits:
   * 1 - Top
   * 2 - Right
   * 4 - Bottom
   * 8 - Left
   *
   * Some bitwise operators:
   * Cell.edges     = 12 (Bottom and Left)
   * Cell.edges & 1 = 0  (& =    has bit(s))
   * Cell.edges ^ 4 = 8  (^ = toggle bit(s))
   * Cell.edges | 1 = 9  (| =    add bit(s))
   */
  this.edges = 0;
  if (this.y == 0) {
    this.edges = this.edges | 1;
  }
  if (this.x == w / cellSize - 1) {
    this.edges = this.edges | 2;
  }
  if (this.y == h / cellSize - 1) {
    this.edges = this.edges | 4;
  }
  if (this.x == 0) {
    this.edges = this.edges | 8
  }

  // draw/redraw the cell
  this.show = function()
  {
    if (this.dead) {
      fill(deadTint);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
      fill(this.color.levels[0], this.color.levels[1]
        , this.color.levels[2], deadOpacity);
    } else {
      fill(this.color);
    }
    noStroke();
    rect(x * cellSize, y * cellSize, cellSize, cellSize);
    return this.dead;
  }

  // return an array of neighboring cells, starting at the top and
  // going clockwise.
  this.neighbors = function()
  {
    var a = [];
    if (this.edges & 1) {
      a.push(null);
    } else {
      a.push( cells[c2i( [this.x, this.y - 1], w / cellSize )] );
    }
    if (!(this.edges & 3) && diagNeighbors) {
      a.push( cells[c2i( [this.x + 1, this.y - 1], w / cellSize)] );
    } else {
      a.push(null);
    }
    if (this.edges & 2) {
      a.push(null);
    } else {
      a.push( cells[c2i( [this.x + 1, this.y], w / cellSize )] );
    }
    if (!(this.edges & 6) && diagNeighbors) {
      a.push( cells[c2i( [this.x + 1, this.y + 1], w / cellSize)] );
    } else {
      a.push(null);
    }
    if (this.edges & 4) {
      a.push(null);
    } else {
      a.push( cells[c2i( [this.x, this.y + 1], w / cellSize )] );
    }
    if (!(this.edges & 12) && diagNeighbors) {
      a.push( cells[c2i( [this.x - 1, this.y + 1], w / cellSize)] );
    } else {
      a.push(null);
    }
    if (this.edges & 8) {
      a.push(null);
    } else {
      a.push( cells[c2i( [this.x - 1, this.y], w / cellSize )] );
    }
    if (!(this.edges & 9) && diagNeighbors) {
      a.push( cells[c2i( [this.x - 1, this.y - 1], w / cellSize)] );
    } else {
      a.push(null);
    }
    return a;
  }

  // Respawn the cell
  this.regrow = function()
  {
    var n = this.neighbors()
      , p1 = null
      , p2 = null;

    while (p1 === null && n.length > 0) {
      p1 = n.splice( floor( random( n.length ) ), 1)[0];
    }

    while (p2 === null && n.length > 0) {
      p2 = n.splice( floor( random( n.length ) ), 1)[0];
    }

    if (p1 != null && p2 != null
      && ((!(p1.dead)
      && !(p2.dead)) || deadViable) ) {
      this.color = recomb(p1, p2);
      this.dead = false;
      this.mutate(mutRate);
      return this;
    } else {
      return false;
    }
  }

  this.mutate = function(num)
  {
    var i = floor(random(3));
  // p5.Color objects are supposed to be immutable. We'll fix this someday
    this.color.levels[i] = Math.abs(floor((this.color.levels[i] + floor(random(-num, num+1)))) % 255);
  }

  this.red = function()
  {
    return red(this.color);
  }

  this.green = function()
  {
    return green(this.color);
  }

  this.blue = function()
  {
    return blue(this.color);
  }
}

// return a new colour from cellA's' and cellB's colours
function recomb(cellA, cellB)
{
  var arr = []
    , i = 0;

  for ( ; i<3; i++) {
    if(floor(random(2)) >=1) {
      arr.push(cellA.color.levels[i]);
    } else {
      arr.push(cellB.color.levels[i]);
    }
  }
  if (arr === cellA.color.levels || arr === cellB.color.levels) {
    recomb(cellA, cellB);
  } else {
    return color(arr[0], arr[1], arr[2]);
  }
}
// return the fitness of a cell in relation to an OPTimal target.
// (opt is p5.color object)
function fitness(cell, opt, func)
{
  var f = dist3d(opt.levels[0], opt.levels[1], opt.levels[2]
              , cell.color.levels[0], cell.color.levels[1]
              , cell.color.levels[2]);
  if (func === undefined) {
    func = "0";
  }

  switch (func) {
    case "0": // y = log2( m / ( x + 20 )) / log2( m ) * 2.5
      return Math.min( Math.max( Math.log( MAX_FITNESS / (f + 20))
                              / Math.log( MAX_FITNESS ) * 2.5, 0 )
                    , 1);
      break;
    case "1": // y = ( m  - x )^2 / m^2
      return Math.pow( MAX_FITNESS - f, 2 ) / Math.pow( MAX_FITNESS, 2 );
      break;
    case "2": // y = 1 - ( x / m ) - .05
      return Math.max( 1 - f / MAX_FITNESS - .05, 0 );
      break;
  }
}
