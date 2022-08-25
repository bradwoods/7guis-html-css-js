const ARIA_INVALID = "aria-invalid";

const oneWayOrReturnValues = {
  oneWay: "oneWay",
  returnFlight: "returnFlight",
};

const elems = {
  departure: document.querySelector("#departure"),
  oneWayOrReturn: document.querySelector("#oneWayOrReturn"),
  return: document.querySelector("#return"),
  book: document.querySelector("#book"),
};

// DOM setters ---------------------------------------------------------
function setError(elem) {
  elem.setAttribute(ARIA_INVALID, true);
}

function clearError(elem) {
  elem.setAttribute(ARIA_INVALID, false);
}

function disable(elem) {
  elem.disabled = true;
}

function enable(elem) {
  elem.disabled = false;
}

function showConfirmation() {
  const message =
    elems.oneWayOrReturn.value === oneWayOrReturnValues.oneWay
      ? `You have booked a one-way flight on ${elems.departure.value}.`
      : `You have booked a return flight, departing on ${elems.departure.value} & returning on ${elems.return.value}.`;

  window.alert(message);
}

// Validators ---------------------------------------------------------
function isOneWay() {
  return elems.oneWayOrReturn.value === oneWayOrReturnValues.oneWay;
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

function inputValueToDate(value) {
  const split = value.split(".");
  const [day, month, year] = split;

  return new Date(`${year}-${month}-${day}`);
}

function isBadFormat(value) {
  const split = value.split(".");

  if (split.length !== 3) return true;

  const date = inputValueToDate(value);

  return !isValidDate(date);
}

function isEarlyReturn() {
  const start = inputValueToDate(elems.departure.value).valueOf();
  const end = inputValueToDate(elems.return.value).valueOf();

  return end < start;
}

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

function onStateChange(state) {
  switch (state) {
    case states.oneWay.badDepartureFormat:
      disable(elems.book);
      disable(elems.return);
      setError(elems.departure);
      clearError(elems.return);
      break;

    case states.oneWay.valid:
      enable(elems.book);
      disable(elems.return);
      clearError(elems.departure);
      clearError(elems.return);
      break;

    case states.returnFlight.badDepartureAndReturnFormat:
      disable(elems.book);
      enable(elems.return);
      setError(elems.departure);
      setError(elems.return);
      break;

    case states.returnFlight.badDepartureFormat:
      disable(elems.book);
      enable(elems.return);
      setError(elems.departure);
      clearError(elems.return);
      break;

    case states.returnFlight.badReturnFormat:
      disable(elems.book);
      enable(elems.return);
      clearError(elems.departure);
      setError(elems.return);
      break;

    case states.returnFlight.earlyReturn:
      disable(elems.book);
      enable(elems.return);
      clearError(elems.departure);
      setError(elems.return);
      break;

    case states.returnFlight.valid:
      enable(elems.book);
      enable(elems.return);
      clearError(elems.departure);
      clearError(elems.return);
      break;

    default:
      throw Error(`Unknown state: ${state}`);
  }
}

function calcState() {
  const isBadDepart = isBadFormat(elems.departure.value);
  const isBadReturn = isBadFormat(elems.return.value);

  if (isOneWay()) {
    return isBadDepart ? states.oneWay.badDepartureFormat : states.oneWay.valid;
  }

  if (isBadDepart && isBadReturn) {
    return states.returnFlight.badDepartureAndReturnFormat;
  }

  if (isBadDepart) {
    return states.returnFlight.badDepartureFormat;
  }

  if (isBadReturn) {
    return states.returnFlight.badReturnFormat;
  }

  if (isEarlyReturn()) {
    return states.returnFlight.earlyReturn;
  }

  return states.returnFlight.valid;
}

function onInputChange() {
  const state = calcState();
  onStateChange(state);
}

// DOM listeners ---------------------------------------------------------
elems.oneWayOrReturn.onchange = onInputChange;
elems.departure.oninput = onInputChange;
elems.return.oninput = onInputChange;

elems.book.onclick = function (event) {
  event.preventDefault();
  showConfirmation();
};
