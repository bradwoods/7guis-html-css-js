(function () {
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

  const classes = {
    rowHeading: "rowHeading",
  };

  const keyCodes = {
    enter: 13,
    escape: 27,
  };

  // Naming convention:
  // "children listen to parents"
  // parent refers to a cell who has it's value read by other cells
  // child refers to a cell who needs to read from other cells to calculate it's value

  // cells values in format:
  // {
  //   computedValue: 1,
  //   elem: <input />,
  //   children: [C8, D0],
  //   formula: simple excel formula '=A1 + B1' or null
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
      const value = evaluateFormula(formula);
      computedValue = value;
    } catch (error) {
      computedValue = ERROR;
    }

    cells[id] = {
      ...cells[id],
      computedValue,
    };

    cells[id].elem.value = computedValue;

    cells[id].children?.forEach((id) => {
      recalcCell(id);
    });
  }

  // children ----------------------------------------
  function addChild(parentId, childId) {
    const children = cells[parentId]?.children || [];

    if (children.includes(childId)) {
      return;
    }

    children.push(childId);

    cells[parentId] = {
      ...cells[parentId],
      children,
    };
  }

  function removeChild(parentId, childId) {
    const children = cells[parentId]?.children || [];

    if (!children.includes(childId)) {
      return;
    }

    cells[parentId].children = children.filter((id) => id !== childId);
  }

  function removeCellParents(id) {
    const formula = cells[id]?.formula;

    if (!formula) {
      return;
    }

    getFormulaParents(formula).forEach((parentId) => {
      removeChild(parentId, id);
    });
  }

  function recalcChildren(id) {
    cells[id]?.children?.forEach((childId) => {
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

    const replaceCellsWithValues = rest.map((symbol) => (isCellId(symbol) ? getCellValue(symbol) : symbol));
    const value = eval(replaceCellsWithValues.join(""));

    if (isNaN(value)) {
      throw Error();
    }

    return value;
  }

  function getFormulaParents(formula) {
    return splitFormula(formula).filter((symbol) => isCellId(symbol));
  }

  // handling different inputs --------------------------------------------
  function handleEmptyInput(elem) {
    const { id } = elem;

    removeCellParents(id);

    cells[id] = {
      ...cells[id],
      formula: null,
      computedValue: null,
    };

    recalcChildren(id);
  }

  function handleFormulaInput(elem, formula) {
    let computedValue;
    const { id } = elem;
    removeCellParents(id);

    try {
      const value = evaluateFormula(formula);
      const parents = getFormulaParents(formula);

      computedValue = value;
      parents.forEach((parentId) => {
        addChild(parentId, id);
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
    recalcChildren(id);
  }

  function handleNumberInput(elem, number) {
    const { id } = elem;

    removeCellParents(id);

    cells[id] = {
      ...cells[id],
      computedValue: number,
      formula: null,
    };

    recalcChildren(id);
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
      elems.colHeadingsRow.append(th);
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
        tr.append(th);

        letters.forEach((letter) => {
          const td = document.createElement("td");
          const input = document.createElement("input");

          input.id = `${letter}${i}`;
          input.setAttribute("readonly", "readonly");
          input.addEventListener("dblclick", onDoubleClick);
          input.addEventListener("blur", onBlur);
          input.addEventListener("keyup", onKeyUp);

          td.append(input);
          tr.append(td);
        });

        elems.tBody.append(tr);
      });
  }

  function render() {
    renderColHeadings();
    renderRows();
  }

  render();
})();
