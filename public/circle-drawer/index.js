/* assumptions
new circle diameter is 24px
diameter should change in steps of 1px
min diameter is 8, max diameter is 100

// disable creating circle when menu or form is open

disable undo if no changes
disable redo if nothing to redo
*/

// TODO - add states to prevent creating circles when menu's open

let selected = null;

const DEFAULT_DIAMETER = 24;
const SVG_NAME_SPACE = "http://www.w3.org/2000/svg";

const changes = [];
let changesUndone = [];

const changeTypes = {
  circleAdded: "circleAdded",
  diameterChange: "diameterChange",
};

const elems = {
  undoButton: document.querySelector("button#undo"),
  redoButton: document.querySelector("button#redo"),
  form: document.querySelector("form#adjustDiameter"),
  label: document.querySelector("label"),
  diameterInput: document.querySelector("input#diameter"),
  svg: document.querySelector("svg"),
  menu: document.querySelector("section#menu"),
  redo: document.querySelector("button#redo"),
  undo: document.querySelector("button#undo"),
};

function hide(elem) {
  elem.style.display = "none";
}

function show(elem) {
  elem.style.display = "flex";
}

function enable(elem) {
  elem.disabled = false;
}

function disable(elem) {
  elem.disabled = true;
}

function select(circle) {
  circle.setAttribute("fill", "gray");
  selected = {
    circle,
    diameter: circle.getAttribute("r") * 2,
  };
}

function loadForm() {
  const x = selected.circle.getAttribute("cx");
  const y = selected.circle.getAttribute("cy");

  elems.diameterInput.value = selected.diameter;
  elems.label.innerHTML = `Adjust diameter of circle at (${x}, ${y}).`;

  show(elems.form);
}

// undo / redo ------------------------------------------
function undoDiameterChange(change) {
  const { oldDiameter } = change;
  change.circle.setAttribute("r", oldDiameter / 2);
}

function redoDiameterChange(change) {
  const { newDiameter } = change;
  change.circle.setAttribute("r", newDiameter / 2);
}

function onUndoClick() {
  if (changes.length > 0) {
    const change = changes.pop();
    changesUndone.push(change);

    switch (change.type) {
      case changeTypes.circleAdded:
        removeCircle(change.circle);
        break;

      case changeTypes.diameterChange:
        undoDiameterChange(change);
        break;

      default:
        throw Error(`Unknown change type: ${change.type}.`);
    }
  }

  if (changes.length === 0) {
    disable(elems.undo);
  }

  enable(elems.redo);
}

function onRedoClick() {
  if (changesUndone.length > 0) {
    const change = changesUndone.pop();
    changes.push(change);

    switch (change.type) {
      case changeTypes.circleAdded:
        addCircle(change.circle);
        break;

      case changeTypes.diameterChange:
        redoDiameterChange(change);
        break;

      default:
        throw Error(`Unknown change type: ${change.type}.`);
    }
  }

  if (changesUndone.length === 0) {
    disable(elems.redo);
  }

  enable(elems.undo);
}

function resetChangesUndone() {
  changesUndone = [];
  disable(elems.redo);
}

// Logging ----------------------------------------------------------
function logChange(change) {
  changes.push(change);
  enable(elems.undo);
}

function logCircleAdd(circle) {
  logChange({
    type: changeTypes.circleAdded,
    circle,
  });
}

function logDiameterChange() {
  const newDiameter = selected.circle.getAttribute("r") * 2;
  const oldDiameter = selected.diameter;

  if (newDiameter !== oldDiameter) {
    logChange({
      type: changeTypes.diameterChange,
      circle: selected.circle,
      oldDiameter,
      newDiameter,
    });

    resetChangesUndone();
  }
}

// Circle ------------------------------------------------------------
function mouseToSvgCoords(event) {
  const invertedSVGMatrix = elems.svg.getScreenCTM().inverse();
  const point = elems.svg.createSVGPoint();

  point.x = event.clientX;
  point.y = event.clientY;

  return point.matrixTransform(invertedSVGMatrix);
}

function removeCircle(circle) {
  circle.removeEventListener("click", onCircleClick);
  circle.removeEventListener("mouseover", onCircleMouseOver);
  circle.removeEventListener("mouseout", onCircleMouseOut);
  circle.removeEventListener("contextmenu", onCircleRightClick);

  elems.svg.removeChild(circle);
}

function addCircle(circle) {
  circle.addEventListener("click", onCircleClick);
  circle.addEventListener("mouseover", onCircleMouseOver);
  circle.addEventListener("mouseout", onCircleMouseOut);
  circle.addEventListener("contextmenu", onCircleRightClick);

  elems.svg.appendChild(circle);
}

function createCircle(coords) {
  const { x, y } = coords;
  const id = `${x}${y}`;
  const circle = document.createElementNS(SVG_NAME_SPACE, "circle");

  circle.setAttribute("id", id);
  circle.setAttribute("r", DEFAULT_DIAMETER);
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("fill", "transparent");
  circle.setAttribute("stroke", "black");

  return circle;
}

// event listeners ---------------------------------------------------------
function onSvgLeftClick(event) {
  const coords = mouseToSvgCoords(event);

  const circle = createCircle(coords);
  addCircle(circle);
  logCircleAdd(circle);
  resetChangesUndone();
}

function onCircleMouseOver(event) {
  select(event.target);
}

function onCircleMouseOut(event) {
  // we don't remove the value for 'selected' here in case the user is attempting to change the circle's diameter
  event.target.setAttribute("fill", "transparent");
}

function onCircleClick(event) {
  event.stopPropagation();
}

function onCircleRightClick(event) {
  event.preventDefault();
  show(elems.menu);
}

function onAdjustDiameterClick() {
  loadForm();
  hide(elems.menu);
}

function onMenuCloseClick() {
  hide(elems.menu);
}

function onDiameterInput(event) {
  const { value } = event.target;
  selected.circle.setAttribute("r", value / 2);
}

function onFormCloseClick() {
  hide(elems.form);
  logDiameterChange();
}
