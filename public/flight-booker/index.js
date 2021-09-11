const oneWayOrReturnValues = {
  oneWay: "oneWay",
  returnFlight: "returnFlight",
};

const colors = {
  red: "tomato",
  white: "white",
};

const inputFormatRegex = /^(\d{2})\.(\d{2}).(\d{4})$/;

const states = {
  oneWay: {
    badDepartureFormat: "oneWay.BadDepartureFormat",
    valid: "oneWay.valid",
  },
  returnFlight: {
    badDepartureFormat: "returnFlight.badDepartureFormat",
    badReturnFormat: "returnFlight.badReturnFormat",
    earlyReturn: "returnFlight.earlyReturn",
    valid: "returnFlight.valid",
  },
};

let state = states.oneWay.valid;

const elems = {
  departure: document.querySelector("input#departure"),
  oneWayOrReturn: document.querySelector("select#oneWayOrReturn"),
  return: document.querySelector("input#return"),
  submit: document.querySelector("button"),
};

// validator ---------------------------------------------------------
function isInputBadFormat(dateInput) {
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

function isDepartureBadFormat() {
  return isInputBadFormat(elems.departure.value);
}

function isReturnBadFormat() {
  return isInputBadFormat(elems.return.value);
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

// setters ---------------------------------------------------------
function colorInput(input) {
  input.style.background = colors.red;
}

function uncolorInput(input) {
  input.style.background = colors.white;
}

function colorDeparture() {
  colorInput(elems.departure);
}

function colorReturn() {
  colorInput(elems.return);
}

function uncolorDeparture() {
  uncolorInput(elems.departure);
}

function uncolorReturn() {
  uncolorInput(elems.return);
}

function enableReturn() {
  elems.return.disabled = false;
}

function disableReturn() {
  elems.return.disabled = true;
}

function enableSubmit() {
  elems.submit.disabled = false;
}

function disableSubmit() {
  elems.submit.disabled = true;
}

// state ---------------------------------------------------------
function calcState() {
  if (isOneWay()) {
    state = isDepartureBadFormat() ? states.oneWay.badDepartureFormat : states.oneWay.valid;
    return;
  }

  if (isDepartureBadFormat()) {
    state = states.returnFlight.badDepartureFormat;
    return;
  }

  if (isReturnBadFormat()) {
    state = states.returnFlight.badReturnFormat;
    return;
  }

  if (isEarlyReturn()) {
    state = states.returnFlight.earlyReturn;
    return;
  }

  state = states.returnFlight.valid;
}

function reactToStateChange() {
  if (state === states.oneWay.badDepartureFormat) {
    disableSubmit();
    disableReturn();
    colorDeparture();
    uncolorReturn();
    return;
  }

  if (state === states.oneWay.valid) {
    enableSubmit();
    disableReturn();
    uncolorDeparture();
    uncolorReturn();
    return;
  }

  if (state === states.returnFlight.badDepartureFormat) {
    disableSubmit();
    enableReturn();
    colorDeparture();
    uncolorReturn();
    return;
  }

  if (state === states.returnFlight.badReturnFormat) {
    disableSubmit();
    enableReturn();
    uncolorDeparture();
    colorReturn();
    return;
  }

  if (state === states.returnFlight.earlyReturn) {
    disableSubmit();
    enableReturn();
    uncolorDeparture();
    colorReturn();
    return;
  }

  if (state === states.returnFlight.valid) {
    enableSubmit();
    enableReturn();
    uncolorDeparture();
    uncolorReturn();
    return;
  }

  throw Error(`Unknown state: ${state}`);
}

// DOM listeners ---------------------------------------------------------
function onInput() {
  calcState();
  reactToStateChange();
}

function onSubmit(event) {
  event.preventDefault();

  const message =
    elems.oneWayOrReturn.value === oneWayOrReturnValues.oneWay
      ? `You have booked a one-way flight on ${elems.departure.value}.`
      : `You have booked a return flight, departing on ${elems.departure.value} & returning on ${elems.return.value}.`;

  window.alert(message);
}
