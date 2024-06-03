//Classes
class Structure {
  constructor(x, y, emitamt, delay) {
    this.x = x;
    this.y = y;
    this.emitamt = emitamt;
    this.delay = delay;
    this.active = true;
    this.MakeWater();
  }

  async MakeWater() {
    while (this.active) {
      if (this.emitamt >= 0)
        matrix[this.y][this.x].amt = Math.max(this.emitamt, matrix[this.y][this.x].amt)
      else
        matrix[this.y][this.x].amt = Math.min(this.emitamt, matrix[this.y][this.x].amt)
      await sleep(this.delay * gameSpeed / 100);
    }
  }
}

class Tile {
  constructor(x, y, gridEl) {
    this.x = x;
    this.y = y;
    this.amt = 0;
    this.origAmt = 0;
    this.gridElement = gridEl;
    this.text = gridEl.childNodes[0];
    this.structure = null;

    gridEl.onclick = () => {
      this.InteractWithGrid();
      this.ShowInfo();
    }
    gridEl.oncontextmenu = (e) => {
      e.preventDefault();
      if (this.structure == null) return;
      this.DestroyStructure();
      this.ShowInfo();
    };
    gridEl.onmouseover = () => this.ShowInfo();
  }

  InteractWithGrid() {
    if (toCreate == "liquid")
      matrix[this.y][this.x].amt = parseFloat(LqdAmtTxt.value);
    else
      CreateStructure(this.x, this.y, parseFloat(StrAmtTxt.value), parseFloat(StrDelayTxt.value));
  }

  DestroyStructure() {
    if (this.structure == null) return;
    this.structure.active = false;
    structures.splice(structures.indexOf(this.structure), 1);
    this.structure = null;
    this.text.textContent = "";
    const structTxt = this.gridElement.querySelector('.structure');
    structTxt.remove();
  }

  ShowInfo() {
    if (this.structure == null) {
      infoStrAmtTxt.textContent = "No structure here";
      infoStrDelayTxt.textContent = "No structure here";
    }
    else {
      infoStrAmtTxt.textContent = `Generating ${this.structure.emitamt}`;
      infoStrDelayTxt.textContent = `${this.structure.delay} ms delay`;
    }
  }
}

//Initialization
const gridEl = document.getElementById('grid');
const resetBtn = document.getElementById('reset');
const clearLqdBtn = document.getElementById('lqdClear');
const clearStrBtn = document.getElementById('strClear');
const heightTxt = document.getElementById('height');
const widthTxt = document.getElementById('width');
const StrAmtTxt = document.getElementById('strAmt');
const StrDelayTxt = document.getElementById('strDelay');
const StrCreateBtn = document.getElementById('strCreate');
const LqdAmtTxt = document.getElementById('lqdAmt');
const LqdCreateBtn = document.getElementById('lqdCreate');
const HelpBtn = document.getElementById('help');
const infoCreationTxt = document.getElementById('infoCreation');
const infoStrAmtTxt = document.getElementById('infoStrAmt');
const infoStrDelayTxt = document.getElementById('infoStrDelay');
let h = heightTxt.value;
let w = widthTxt.value;
let toCreate = "liquid";
const ds = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const cellTxt = document.createElement('p');
const cellBt = document.createElement('button')
const cellEl = document.createElement('td');
cellTxt.className = "text";
cellBt.appendChild(cellTxt);
cellEl.appendChild(cellBt);
let matrix = [];
let structures = [];

//Settings
const gameSpeed = 100; //in ms, default is 100
const spreadAmount = 0.2; //percentage each cell takes from neighbors. NO HIGHER THAN .25 unless you like strange results
const minToSpread = 0.2; //minimum amount needed to be able to spread to a neighbouring tile
const EvaporateThresh = 0.014; //minimum amount needed to not evaporate, should be higher than minToSpread

//Events
resetBtn.onclick = () => ResetGrid();
clearLqdBtn.onclick = () => ClearLiquids();
clearStrBtn.onclick = () => DestroyStructures();
StrCreateBtn.onclick = () => {
  toCreate = "structure";
  infoCreationTxt.textContent = "Creating structure on click";
}
LqdCreateBtn.onclick = () => {
  toCreate = "liquid";
  infoCreationTxt.textContent = "Creating liquid on click";
}
HelpBtn.onclick = () =>
  alert("Game info:\n" +
    "Before you there is a grid, you can change its size to any length.\n" +
    "Larger grids could result in slower operations though.\n" +
    "Every tile here is able to hold a number and a structure.\n" +
    "Numbers represent the amount of 'liquid' there currently is on a tile and will spread to its cardinal neighbours. (This can be negative)\n\n" +
    "To create liquid just enter the amount you want, press 'Create Liquid', and click a tile.\n" +
    "Structures do this for you automatically every x amount of milliseconds, just press 'Create Structure' and click a tile to create one. (These can hold negative values too. No, not the timer)\n" +
    "You'll notice an x has appeared on that tile, it's there to indicate there's a structure located there.\n" +
    "Want to get rid of it? Simply right click the tile and it'll poof.\n" +
    "If you want to see how much liquid is on a tile, hover over it and it'll tell you.\n" +
    `Liquid is also able to evaporate, if its absolute value is below ${EvaporateThresh}.\n\n` +
    "That's about everything, 'reset' and 'clear liquids' should be self explanatory.");

//Single line functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const CellExists = (x, y) => x >= 0 && x < w && y >= 0 && y < h;

//Single calls
RunGame();

//Functions
async function RunGame() {
  ResetGrid();
  while (true) {
    await sleep(gameSpeed);
    SetOriginalValues();
    FindNeighbors();
    Evaporate();
    DisplayNumbers();
    UpdateColors();
    //console.log(matrix.reduce((total, rowV) => total + rowV.reduce((sum, cell) => sum + cell.amt, 0), 0));
  }
}

function CreateGrid() {
  matrix = [];
  const grid = [];
  for (let y = 0; y < h; y++) {
    matrix.push([]);
    let tr = document.createElement('tr');
    for (let x = 0; x < w; x++) {
      const clonedEl = cellEl.cloneNode(true);
      matrix[y].push(new Tile(x, y, clonedEl.childNodes[0]));
      tr.appendChild(clonedEl);
    }
    grid.push(tr);
  }
  gridEl.replaceChildren(...grid);
}

function ResetGrid() {
  h = heightTxt.value;
  w = widthTxt.value;
  DestroyStructures();
  CreateGrid();
  //create structures on reset here
  // CreateStructure(0, 0, 50, 1000);
  // CreateStructure(6, 7, 20, 50);
  // CreateStructure(w - 1, h - 1, -100, 1000);
  // CreateStructure(7, 2, -75, 2000);
  // //set amounts on reset here
  // matrix[0][0].amt = 4000;
  // matrix[h - 1][w - 1].amt = -200;
  DisplayNumbers();
}

function ClearLiquids() {
  matrix.forEach(row =>
    row.forEach(cell =>
      cell.amt = 0));
}

function CreateStructure(x, y, emitamt, delay) {
  const tile = matrix[y][x];
  if (tile.structure == null) {
    const structure = new Structure(x, y, emitamt, delay);
    tile.structure = structure;
    structures.push(structure);
    const cellX = document.createElement('p');
    cellX.textContent = "X";
    cellX.className = "structure"
    tile.gridElement.prepend(cellX);
  }
  else {
    tile.structure.emitamt = emitamt;
    tile.structure.delay = delay;
  }
}

function DestroyStructures() {
  matrix.forEach(x => x.forEach(y => y.DestroyStructure()));
}

function DisplayNumbers() {
  matrix.forEach(row =>
    row.forEach(cell =>
      cell.text.textContent = Math.round((cell.amt + Number.EPSILON) * 100) / 100));
}

function UpdateColors() {
  matrix.forEach(row =>
    row.forEach(cell => {
      const c = 255 - Math.min(255, cell.amt * Math.sign(cell.amt)) * 5
      cell.gridElement.style.background = cell.amt > 0 ? `rgb(255, ${c}, ${c})` : `rgb(${c}, ${c}, 255)`;
    }))
}

function SetOriginalValues() {
  matrix.forEach(row =>
    row.forEach(cell =>
      cell.origAmt = cell.amt));
}

function FindNeighbors() {
  for (let y = 0; y < h; y++) {
    const row = matrix[y];
    for (let x = 0; x < w; x++) {
      const cell = row[x];
      // if (Math.abs(cell.amt) < minToSpread) continue;
      for (let d of ds) {
        if (!CellExists(x + d[0], y + d[1])) continue;
        const nbor = matrix[y + d[1]][x + d[0]];
        SpreadWater(cell, nbor)
      }
    }
  }
}

function SpreadWater(cell, nbor) {
  let amt = cell.origAmt * spreadAmount;
  nbor.amt += amt;
  cell.amt -= amt;
}

function Evaporate() {
  matrix.forEach(row =>
    row.forEach(cell =>
      cell.amt = Math.abs(cell.amt) < EvaporateThresh ? 0 : cell.amt));
}