/*

possible improvement to UX: 
- disable filter input if less than 2 names
- empty state message like "enter a name to ..."
- create button is disabled unless name inputs both have values

*/

(function () {
  let selected = null;

  const classes = {
    hide: "hide",
    selected: "selected",
  };

  const names = {};

  const elems = {
    create: document.querySelector("button#create"),
    delete: document.querySelector("button#delete"),
    filter: document.querySelector("input#filter"),
    listBox: document.querySelector("ol#listBox"),
    name: document.querySelector("input#name"),
    surname: document.querySelector("input#surname"),
    update: document.querySelector("button#update"),
  };

  // validators ------------------------------------------
  function isValidInput(value) {
    return typeof value === "string" && value.length > 0;
  }

  function isValidNameInputValues() {
    const name = elems.name.value;
    const surname = elems.surname.value;

    return isValidInput(name) && isValidInput(surname);
  }

  function isValidFilterInputValue() {
    const { value } = elems.filter;

    return isValidInput(value);
  }

  function isNameAvailable(name) {
    return !names[name];
  }

  // formatting --------------------------------------------
  function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

  function formatNameInputValues() {
    const name = elems.name.value;
    const surname = elems.surname.value;

    return `${capitalize(surname)}, ${capitalize(name)}`;
  }

  function getFilterRegex() {
    const { value } = elems.filter;
    const pattern = `^${value.toLowerCase()}`;

    return new RegExp(pattern);
  }

  function clearInputs() {
    elems.filter.value = "";
    elems.name.value = "";
    elems.surname.value = "";
  }

  function addName(name) {
    const li = document.createElement("li");
    const content = document.createTextNode(name);

    li.append(content);
    li.onclick = onNameClick;

    names[name] = {
      value: name,
      elem: li,
    };

    renderNames();
  }

  function removeName() {
    const { elem } = names[selected];

    elem.onclick = null;
    elems.listBox.removeChild(elem);
    delete names[selected];

    clearSelect();
  }

  function derenderNames() {
    const items = elems.listBox.children;

    for (let i = 0; i < items; i++) {
      elems.listBox.removeChild(items[i]);
    }
  }

  function renderNames() {
    derenderNames();

    Object.keys(names)
      .sort()
      .forEach((name) => {
        elems.listBox.append(names[name].elem);
      });
  }

  // Filter ---------------------------------------------------
  function clearFilterInput() {
    elems.filter.value = "";
  }

  function clearFilteredNames() {
    const items = document.querySelectorAll("ol#listBox > .hide");

    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("hide");
    }

    elems.filter.value = "";
  }

  function clearFilter() {
    clearFilterInput();
    clearFilteredNames();
  }

  // Select ---------------------------------------------------
  function select(name) {
    clearSelect();
    selected = name;
    names[name].elem.classList.add(classes.selected);

    elems.delete.disabled = false;
    elems.update.disabled = false;
  }

  function clearSelect() {
    if (!selected) {
      return;
    }

    names[selected]?.elem.classList.remove(classes.selected);
    elems.delete.disabled = true;
    elems.update.disabled = true;
  }

  // DOM listeners --------------------------------------------
  function onNameClick(event) {
    const name = event.target.textContent;
    select(name);
  }

  function onCreateButtonClick() {
    if (isValidNameInputValues()) {
      const formatted = formatNameInputValues();

      if (isNameAvailable(formatted)) {
        addName(formatted);
        clearInputs();
        clearFilter();
      }
    }
  }

  function onDeleteClick() {
    removeName();
  }

  function onUpdateClick() {
    if (isValidNameInputValues()) {
      const formatted = formatNameInputValues();

      if (isNameAvailable(formatted)) {
        removeName();
        addName(formatted);
        clearInputs();
        clearFilter();
      }
    }
  }

  function onFilterInput() {
    if (isValidFilterInputValue()) {
      const items = elems.listBox.children;
      const filter = getFilterRegex();

      clearSelect();

      for (let i = 0; i < items.length; i++) {
        const elem = items[i];
        const name = elem.textContent;

        if (filter.test(name.toLowerCase())) {
          elem.classList.remove(classes.hide);
        } else {
          elem.classList.add(classes.hide);
        }
      }

      return;
    }

    clearFilteredNames();
  }

  function addEventListeners() {
    elems.create.onclick = onCreateButtonClick;
    elems.update.onclick = onUpdateClick;
    elems.delete.onclick = onDeleteClick;
    elems.filter.oninput = onFilterInput;
  }

  addEventListeners();
})();
