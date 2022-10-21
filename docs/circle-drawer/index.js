(function () {
  const DEFAULT_DIAMETER = 24;
  const SVG_NAME_SPACE = "http://www.w3.org/2000/svg";

  const classes = {
    disabled: "disabled",
    selected: "selected",
  };

  const changes = [];

  const changeTypes = {
    circleAdded: "circleAdded",
    diameterChange: "diameterChange",
  };

  const elems = {
    form: document.querySelector("form#adjustDiameter"),
    input: document.querySelector("input#diameter"),
    label: document.querySelector("label[for='diameter']"),
    menu: document.querySelector("section#menu"),
    redo: document.querySelector("button#redo"),
    svg: document.querySelector("svg"),
    undo: document.querySelector("button#undo"),
    closeForm: document.querySelector("button#closeForm"),
    closeMenu: document.querySelector("button#closeMenu"),
    openAdjustDiameter: document.querySelector("button#openAdjustDiameter"),
  };

  let selected = null;
  let changesUndone = [];

  function hide(elem) {
    elem.classList.add("hide");
  }

  function show(elem) {
    elem.classList.remove("hide");
  }

  function enable(elem) {
    elem.disabled = false;
  }

  function disable(elem) {
    elem.disabled = true;
  }

  function select(circle) {
    circle.classList.add(classes.selected);
    selected = {
      circle,
      diameter: circle.getAttribute("r") * 2,
    };
  }

  function deselect() {
    selected.circle.classList.remove(classes.selected);
    selected = null;
  }

  function loadForm() {
    const x = selected.circle.getAttribute("cx");
    const y = selected.circle.getAttribute("cy");

    elems.input.value = selected.diameter;
    elems.label.textContent = `Adjust diameter of circle at (${x}, ${y}).`;

    show(elems.form);
  }

  function disableSvg() {
    elems.svg.classList.add(classes.disabled);
  }

  function enableSvg() {
    elems.svg.classList.remove(classes.disabled);
  }

  // Undo / redo ------------------------------------------
  function undoDiameterChange(change) {
    const { oldDiameter } = change;
    change.circle.setAttribute("r", oldDiameter / 2);
  }

  function redoDiameterChange(change) {
    const { newDiameter } = change;
    change.circle.setAttribute("r", newDiameter / 2);
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
    circle.onclick = null;
    circle.contextmenu = null;

    elems.svg.removeChild(circle);
  }

  function addCircle(circle) {
    circle.onclick = onCircleClick;
    circle.oncontextmenu = onCircleRightClick;

    elems.svg.append(circle);
  }

  function createCircle(coords) {
    const { x, y } = coords;
    const circle = document.createElementNS(SVG_NAME_SPACE, "circle");

    circle.setAttribute("r", DEFAULT_DIAMETER);
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", "black");

    return circle;
  }

  // State ---------------------------------------------------------
  const states = {
    default: "default",
    menuOpen: "menuOpen",
    formOpen: "formOpen",
  };

  const state = {
    set change(value) {
      this.value = value;
      onStateChange(value);
    },
    value: states.default,
  };

  function onStateChange(state) {
    switch (state) {
      case states.default:
        if (changes.length > 0) {
          enable(elems.undo);
        }
        if (changesUndone.length > 0) {
          enable(elems.redo);
        }

        enableSvg();
        deselect();
        hide(elems.menu);
        hide(elems.form);
        break;

      case states.menuOpen:
        show(elems.menu);
        disable(elems.undo);
        disable(elems.redo);
        disableSvg();
        break;

      case states.formOpen:
        break;

      default:
        throw Error(`Unknown state: ${state}`);
    }
  }

  // DOM listeners ---------------------------------------------------------
  function onSvgClick(event) {
    const coords = mouseToSvgCoords(event);
    const circle = createCircle(coords);
    addCircle(circle);
    logCircleAdd(circle);
    resetChangesUndone();
  }

  function onCircleClick(event) {
    event.stopPropagation();
  }

  function onCircleRightClick(event) {
    event.preventDefault();
    select(event.target);
    state.change = states.menuOpen;
  }

  function onAdjustDiameterClick() {
    loadForm();
    hide(elems.menu);
    state.change = states.formOpen;
  }

  function onMenuCloseClick() {
    state.change = states.default;
  }

  function onDiameterInput(event) {
    const { value } = event.target;
    selected.circle.setAttribute("r", value / 2);
  }

  function onFormCloseClick() {
    logDiameterChange();
    state.change = states.default;
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

  function addEventListeners() {
    elems.undo.onclick = onUndoClick;
    elems.redo.onclick = onRedoClick;
    elems.svg.onclick = onSvgClick;
    elems.input.oninput = onDiameterInput;
    elems.closeForm.onclick = onFormCloseClick;
    elems.closeMenu.onclick = onMenuCloseClick;
    elems.openAdjustDiameter.onclick = onAdjustDiameterClick;
  }

  addEventListeners();
})();
