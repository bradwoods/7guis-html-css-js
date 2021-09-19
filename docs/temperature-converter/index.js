const elems = {
  celsius: document.querySelector("input#celsius"),
  fahrenheit: document.querySelector("input#fahrenheit"),
};

function celsiusToFahrenheit(temp) {
  return (temp * 9) / 5 + 32;
}

function fahrenheitToCelsius(temp) {
  return ((temp - 32) * 5) / 9;
}

function onCelsiusInput(event) {
  const { value } = event.target;
  fahrenheit.value = celsiusToFahrenheit(value).toFixed(2);
}

function onFahrenheitInput(event) {
  const { value } = event.target;
  celsius.value = fahrenheitToCelsius(value).toFixed(2);
}
