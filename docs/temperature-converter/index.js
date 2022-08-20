const CEL_ID = "celsius";
const celInput = document.querySelector(`#${CEL_ID}`);
const farInput = document.querySelector("#fahrenheit");

function celToFar(cel) {
  return (cel * 9) / 5 + 32;
}

function farToCel(far) {
  return ((far - 32) * 5) / 9;
}

function formatVal(value) {
  return value.toFixed(2);
}

function changeInputVal(elem, value) {
  elem.value = formatVal(value);
}

function clearInput(elem) {
  elem.value = "";
}

function onInput(event) {
  const { value, id } = event.target;
  const otherInput = id === CEL_ID ? farInput : celInput;

  if (value === "") {
    clearInput(otherInput);
    return;
  }

  {
    const otherValue = id === CEL_ID ? celToFar(value) : farToCel(value);
    changeInputVal(otherInput, otherValue);
  }
}

celInput.oninput = onInput;
farInput.oninput = onInput;
