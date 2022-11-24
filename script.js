import Grid from "./Grid.js";
import Tile from "./Tile.js";

const gameBoard = document.getElementById("game-board");

const grid = new Grid(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
setupInput();
console.log('column = ', grid.cellsByColumn);


function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput();
        return;
      }
      await moveRight();
      break;
    default:
      await setupInput();
      return;
  }
  // await after animation ends before merge
  grid.cells.forEach(cell => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (!(canMoveUp() || canMoveDown() || canMoveLeft() || canMoveRight())) {
    newTile.waitForTransition
  }

  setupInput();
}

async function moveUp() {
  return slideTiles(grid.cellsByColumn);
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()));
}

function moveLeft() {
  return slideTiles(grid.cellsByRow);
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()));
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(column => {
      const promises = [];
      // top cannot move, so start from 1
      for (let i = 1; i < column.length; i++) {
        const cell = column[i];
        if (!cell.tile)
          continue;
        let lastValidCell;
        for (let j = i - 1; j >= 0; j--) {
          const distCell = column[j];
          if (!distCell.canAccept(cell.tile))
            break;
          lastValidCell = distCell;
        }
        if (lastValidCell) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile) {
            lastValidCell.mergeTile = cell.tile;
          } else {
            lastValidCell.tile = cell.tile;
          }
          cell.tile = null;
        }
      }
      return promises;
    })
  );
}

function canMoveUp() {
  return canMove(grid.cellsByColumn);
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()));
}

function canMoveLeft() {
  return canMove(grid.cellsByRow);
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()));
}

function canMove(cells) {
  return cells.some(gruop => {
    return gruop.some((cell, index) => {
      if (index === 0)
        return false;
      if (!cell.tile)
        return false;
      return gruop[index-1].canAccept(cell.tile);
    })
  })
}

