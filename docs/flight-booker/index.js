const ARIA_INVALID = "aria-invalid";

const oneWayOrReturnValues = {
  oneWay: "oneWay",
  returnFlight: "returnFlight",
};

const inputFormatRegex = /^(\d{2})\.(\d{2}).(\d{4})$/;

const elems = {
  departure: document.querySelector("input#departure"),
  oneWayOrReturn: document.querySelector("select#oneWayOrReturn"),
  return: document.querySelector("input#return"),
  submit: document.querySelector("button"),
};

// State --------------------------------------------------------------
const states = {
  oneWay: {
    badDepartureFormat: "oneWay.BadDepartureFormat",
    valid: "oneWay.valid",
  },
  returnFlight: {
    badDepartureFormat: "returnFlight.badDepartureFormat",
    badReturnFormat: "returnFlight.badReturnFormat",
    badDepartureAndReturnFormat: "returnFlight.badDepartureAndReturnFormat",
    earlyReturn: "returnFlight.earlyReturn",
    valid: "returnFlight.valid",
  },
};

// Using an initState function to ensure the state value can't be changed unless through state.set(), ensuring 'onStateChange' is triggered
// a 'setter' could have been used here however:
//  - it introduces a new API, increasing complexity
//  - a setter property can be changed without calling the set function, making it more brittle than the below approach
function initState() {
  const returnVal = {
    value: states.oneWay.valid,
    set: (newState) => {
      returnVal.value = newState;
      onStateChange(newState);
    },
  };

  return returnVal;
}

const state = initState();

function onStateChange(value) {
  switch (value) {
    case states.oneWay.badDepartureFormat:
      disable(elems.submit);
      disable(elems.return);
      setInvalid(elems.departure);
      setValid(elems.return);
      break;

    case states.oneWay.valid:
      enable(elems.submit);
      disable(elems.return);
      setValid(elems.departure);
      setValid(elems.return);
      break;

    case states.returnFlight.badDepartureAndReturnFormat:
      disable(elems.submit);
      enable(elems.return);
      setInvalid(elems.departure);
      setInvalid(elems.return);
      break;

    case states.returnFlight.badDepartureFormat:
      disable(elems.submit);
      enable(elems.return);
      setInvalid(elems.departure);
      setValid(elems.return);
      break;

    case states.returnFlight.badReturnFormat:
      disable(elems.submit);
      enable(elems.return);
      setValid(elems.departure);
      setInvalid(elems.return);
      break;

    case states.returnFlight.earlyReturn:
      disable(elems.submit);
      enable(elems.return);
      setValid(elems.departure);
      setInvalid(elems.return);
      break;

    case states.returnFlight.valid:
      enable(elems.submit);
      enable(elems.return);
      setValid(elems.departure);
      setValid(elems.return);
      break;

    default:
      throw Error(`Unknown state: ${state}`);
  }
}

function calcState() {
  const isBadDepart = isBadFormat(elems.departure.value);
  const isBadReturn = isBadFormat(elems.return.value);

  if (isOneWay()) {
    state.set(isBadDepart ? states.oneWay.badDepartureFormat : states.oneWay.valid);
    return;
  }

  if (isBadDepart && isBadReturn) {
    state.set(states.returnFlight.badDepartureAndReturnFormat);
    return;
  }

  if (isBadDepart) {
    state.set(states.returnFlight.badDepartureFormat);
    return;
  }

  if (isBadReturn) {
    state.set(states.returnFlight.badReturnFormat);
    return;
  }

  if (isEarlyReturn()) {
    state.set(states.returnFlight.earlyReturn);
    return;
  }

  state.set(states.returnFlight.valid);
}

// Validators ---------------------------------------------------------
function isBadFormat(dateInput) {
  if (typeof dateInput === "string") {
    const date = dateInput.match(inputFormatRegex);

    if (date) {
      const [, day, month, year] = dateInput.match(inputFormatRegex);

      // Could go deeper on this (using month to calc day upper limit, compare date to today's date to ensure it equal to or above)
      if (day > 0 && month > 0 && year > 0 && day < 32 && month < 13) {
        return false;
      }
    }
  }

  return true;
}

function dateInputToTimestamp(dateInput) {
  const [, day, month, year] = dateInput.match(inputFormatRegex);

  return new Date(`${year}-${month}-${day}`).getTime();
}

function isEarlyReturn() {
  return dateInputToTimestamp(elems.return.value) < dateInputToTimestamp(elems.departure.value);
}

function isOneWay() {
  return elems.oneWayOrReturn.value === oneWayOrReturnValues.oneWay;
}

// DOM setters ---------------------------------------------------------
function setInvalid(elem) {
  elem.setAttribute(ARIA_INVALID, true);
}

function setValid(elem) {
  elem.setAttribute(ARIA_INVALID, false);
}

function disable(elem) {
  elem.disabled = true;
}

function enable(elem) {
  elem.disabled = false;
}

function showConfirmationMessage() {
  const message =
    elems.oneWayOrReturn.value === oneWayOrReturnValues.oneWay
      ? `You have booked a one-way flight on ${elems.departure.value}.`
      : `You have booked a return flight, departing on ${elems.departure.value} & returning on ${elems.return.value}.`;

  window.alert(message);
}

// DOM listeners ---------------------------------------------------------
function onInput() {
  calcState();
}

function onSubmit(event) {
  event.preventDefault();
  showConfirmationMessage();
}
