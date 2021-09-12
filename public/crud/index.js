/*

possible improvement to UX: 
- disable filter input if less than 2 names
- empty state message like "enter a name to ..."
- create button is disabled unless name inputs both have values

possible improvement to performance:
- updateListBox is expensive

*/

let selected = null;
let filteredNames = null;

const listBoxQuery = "ol#listBox";
const names = new Set();

const elems = {
  filter: document.querySelector("input#filter"),
  name: document.querySelector("input#name"),
  surname: document.querySelector("input#surname"),
  listBox: document.querySelector(listBoxQuery),
  create: document.querySelector("button#create"),
  delete: document.querySelector("button#delete"),
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
  const filter = elems.filter.value;

  return isValidInput(filter);
}

// formatting --------------------------------------------
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNameInputValues() {
  const name = elems.name.value;
  const surname = elems.surname.value;

  return `${capitalize(surname)}, ${capitalize(name)}`;
}

// getters --------------------------------------------
function getLis() {
  return document.querySelectorAll(`${listBoxQuery} li`);
}

function getLastName(name) {
  const [last] = name.split(", ");
  return last;
}

function getFilterRegex() {
  const value = elems.filter.value;
  const pattern = `^${value}`;

  return new RegExp(pattern);
}

// setters --------------------------------------------
function clearInputs() {
  elems.filter.value = "";
  elems.name.value = "";
  elems.surname.value = "";
}

function applySelectStyles(elem) {
  elem.style.cursor = "default";
  elem.style.color = "var(--background-color)";
  elem.style.background = "var(--text-color)";
}

function removeSelectStyles(elem) {
  elem.style.cursor = "pointer";
  elem.style.color = "var(--text-color)";
  elem.style.background = "none";
}

function updateListBox() {
  removeAllLis();
  addLisFromNames();
}

function addName() {
  const name = formatNameInputValues();
  names.add(name);
}

function removeName() {
  names.delete(selected);
}

function removeAllLis() {
  getLis().forEach((li) => {
    li.addEventListener("click", onNameClick);
    li.parentNode.removeChild(li);
  });
}

function addLisFromNames() {
  Array.from(filteredNames || names)
    .sort()
    .map((name) => {
      const li = document.createElement("li");
      const content = document.createTextNode(name);

      li.appendChild(content);
      li.addEventListener("click", onNameClick);

      elems.listBox.appendChild(li);
    });
}

function calcFilteredNames() {
  filteredNames = Array.from(names)
    .filter((name) => getFilterRegex().test(name.toLowerCase()))
    .sort();
}

function clearFilter() {
  if (filteredNames) {
    filteredNames = null;
  }

  elems.filter.value = "";
}

// selecting --------------------------------------------
function select(elem, name) {
  applySelectStyles(elem);
  elem.removeEventListener("click", onNameClick);
  selected = name;

  elems.delete.disabled = false;
  elems.update.disabled = false;
}

function clearSelect() {
  if (!selected) {
    return;
  }

  getLis().forEach((elem) => {
    if (elem.innerHTML === selected) {
      removeSelectStyles(elem);
      elem.addEventListener("click", onNameClick);
    }
  });

  elems.delete.disabled = true;
  elems.update.disabled = true;
}

// event handlers --------------------------------------------
function onNameClick(event) {
  const elem = event.target;
  const name = elem.innerHTML;

  clearSelect();
  select(elem, name);
}

function onCreateButtonClick() {
  if (isValidNameInputValues()) {
    clearFilter();
    addName();
    updateListBox();
    clearInputs();
  }
}

function onDeleteClick() {
  clearFilter();
  removeName();
  clearSelect();
  updateListBox();
}

function onUpdateClick() {
  if (isValidNameInputValues()) {
    clearFilter();
    removeName();
    clearSelect();
    addName();
    updateListBox();
    clearInputs();
  }
}

function onFilterInput() {
  if (!isValidFilterInputValue()) {
    clearFilter();
    updateListBox();
    return;
  }

  calcFilteredNames();
  updateListBox();

  if (selected && !filteredNames.includes(selected)) {
    clearSelect();
  }
}
