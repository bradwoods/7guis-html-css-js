const celsiusInput = document.querySelector("input#celsius");
const fahrenheitInput = document.querySelector("input#fahrenheit");

function celsiusToFahrenheit(temp) {
  return (temp * 9) / 5 + 32;
}

function fahrenheitToCelsius(temp) {
  return ((temp - 32) * 5) / 9;
}

function onCelsiusInput(event) {
  const { value } = event.target;
  fahrenheitInput.value = celsiusToFahrenheit(value).toFixed(2);
}

function onFahrenheitInput(event) {
  const { value } = event.target;
  celsiusInput.value = fahrenheitToCelsius(value).toFixed(2);
}
