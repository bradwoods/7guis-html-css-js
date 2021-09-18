let selected = null;

const letters = [
  `A`,
  `B`,
  `C`,
  `D`,
  `E`,
  `F`,
  `G`,
  `H`,
  `I`,
  `J`,
  `K`,
  `L`,
  `M`,
  `N`,
  `O`,
  `P`,
  `Q`,
  `R`,
  `S`,
  `T`,
  `U`,
  `V`,
  `W`,
  `X`,
  `Y`,
  `Z`,
];
const ROW_COUNT = 100;
const FORMULA_SYMBOL = `=`;
const ERROR = "error";
const operators = [`+`, `-`, `*`, `/`];

const classes = {
  rowHeading: "rowHeading",
};

const keyCodes = {
  enter: 13,
  escape: 27,
};

// cells values in format:
// {
//   computedValue: 1,
//   elem: <input />,
//   dependents: array of cellIds that depend on the value of this cell,
//   formula: null || 'A1 + B1'
// }
const cells = {};

const elems = {
  colHeadingsRow: document.querySelector("#cells tr#colHeadings"),
  table: document.querySelector("#cells table"),
  tBody: document.querySelector("#cells tbody"),
};

function getCellValue(id) {
  return cells[id]?.computedValue || 0;
}

function isCellId(symbol) {
  const regex = new RegExp(/^([A-Za-z])([0-9]{1}|[0-9]{2})$/);
  return regex.test(symbol);
}

function recalcCell(id) {
  const formula = cells[id]?.formula;

  if (!formula) {
    return;
  }

  let computedValue;

  try {
    const { value } = evaluateFormula(formula);
    computedValue = value;
  } catch (error) {
    computedValue = ERROR;
  }

  cells[id] = {
    ...cells[id],
    computedValue,
  };

  cells[id].elem.value = computedValue;

  cells[id].dependents?.forEach((id) => {
    recalcCell(id);
  });
}

// dependents ----------------------------------------
// the child listens to the parent
function addDependent(parentId, childId) {
  const dependents = cells[parentId]?.dependents || [];

  if (dependents.includes(childId)) {
    return;
  }

  dependents.push(childId);

  cells[parentId] = {
    ...cells[parentId],
    dependents,
  };
}

function removeDependent(parentId, childId) {
  const dependents = cells[parentId]?.dependents || [];

  if (!dependents.includes(childId)) {
    return;
  }

  cells[parentId].dependents = dependents.filter((id) => id !== childId);
}

function removeCellParentDependents(id) {
  const formula = cells[id]?.formula;

  if (!formula) {
    return;
  }

  getFormulaCellIds(formula).forEach((parentId) => {
    removeDependent(parentId, id);
  });
}

function recalcDependents(id) {
  cells[id]?.dependents?.forEach((childId) => {
    recalcCell(childId);
  });
}

// formula ----------------------------------------
function isFormula(value) {
  return isNaN(value);
}

function splitFormula(formula) {
  return formula
    .replace(/\s+/g, "")
    .split(/(=|\+|\-|\*|\/)/)
    .filter((char) => char !== "");
}

function evaluateFormula(formula) {
  const [firstSymbol, ...rest] = splitFormula(formula);

  if (firstSymbol !== FORMULA_SYMBOL) {
    throw Error();
  }

  const dependentCellIds = [];
  const replaceCellsWithValues = rest.map((symbol) => {
    if (isCellId(symbol)) {
      dependentCellIds.push(symbol);
      return getCellValue(symbol);
    }

    return symbol;
  });

  const value = eval(replaceCellsWithValues.join(""));

  if (isNaN(value)) {
    throw Error();
  }

  return {
    value,
    dependentCellIds,
  };
}

function getFormulaCellIds(formula) {
  return splitFormula(formula).filter((symbol) => isCellId(symbol));
}

// handling different inputs --------------------------------------------
function handleEmptyInput(elem) {
  const { id } = elem;

  removeCellParentDependents(id);

  cells[id] = {
    ...cells[id],
    formula: null,
    computedValue: null,
  };

  recalcDependents(id);
}

function handleFormulaInput(elem, formula) {
  let computedValue;
  const { id } = elem;
  removeCellParentDependents(id);

  try {
    const { value, dependentCellIds } = evaluateFormula(formula);

    computedValue = value;
    dependentCellIds.forEach((parentId) => {
      addDependent(parentId, id);
    });
  } catch (error) {
    computedValue = ERROR;
  }

  cells[id] = {
    ...cells[id],
    computedValue,
    elem,
    formula,
  };

  elem.value = computedValue;
  recalcDependents(id);
}

function handleNumberInput(elem, number) {
  const { id } = elem;

  removeCellParentDependents(id);

  cells[id] = {
    ...cells[id],
    computedValue: number,
    formula: null,
  };

  recalcDependents(id);
}

function parseInput(elem) {
  const { id, value: newValue } = elem;
  const oldValue = cells[id]?.formula || cells[id]?.computedValue;

  if (newValue === "" && !oldValue) {
    return;
  }

  if (newValue === oldValue) {
    elem.value = cells[id].computedValue;
    return;
  }

  if (newValue === "") {
    handleEmptyInput(elem);
  } else if (isFormula(newValue)) {
    handleFormulaInput(elem, newValue);
  } else {
    handleNumberInput(elem, newValue);
  }
}

// DOM manipulation ----------------------------------------
function setReadOnly(elem) {
  elem.setAttribute("readonly", "readonly");
}

function removeReadOnly(elem) {
  elem.removeAttribute("readonly");
}

// DOM listeners -------------------------------------------
function onDoubleClick(event) {
  const elem = event.target;
  selected = elem;
  const formula = cells[elem.id]?.formula;

  removeReadOnly(elem);

  if (formula) {
    elem.value = formula;
  }
}

function onBlur(event) {
  const elem = event.target;

  if (elem === selected) {
    parseInput(elem);
    setReadOnly(elem);
    selected = null;
  }
}

function onKeyUp(event) {
  if (Object.values(keyCodes).includes(event.keyCode)) {
    onBlur(event);
  }
}

// rendering -------------------------------------------
function renderColHeadings() {
  letters.forEach((letter) => {
    const th = document.createElement("th");

    th.textContent = letter;
    elems.colHeadingsRow.appendChild(th);
  });
}

function renderRows() {
  Array(ROW_COUNT)
    .fill(undefined)
    .forEach((_, i) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");

      th.textContent = `${i}`;
      th.classList.add(classes.rowHeading);
      tr.appendChild(th);

      letters.forEach((letter) => {
        const td = document.createElement("td");
        const input = document.createElement("input");

        input.id = `${letter}${i}`;
        input.setAttribute("readonly", "readonly");
        input.addEventListener("dblclick", onDoubleClick);
        input.addEventListener("blur", onBlur);
        input.addEventListener("keyup", onKeyUp);

        td.appendChild(input);
        tr.appendChild(td);
      });

      elems.tBody.appendChild(tr);
    });
}

function render() {
  renderColHeadings();
  renderRows();
}

render();
