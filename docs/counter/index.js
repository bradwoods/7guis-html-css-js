const counterOutput = document.querySelector("#counterOutput");

function countButtonClicked() {
  const currentVal = parseInt(counterOutput.innerHTML);
  const newVal = currentVal + 1;

  counterOutput.innerHTML = newVal;
}
