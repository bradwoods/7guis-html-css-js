(function () {
  const button = document.querySelector("button");
  const output = document.querySelector("output");

  let count = 0;

  button.onclick = function () {
    count++;
    output.textContent = count;
  };
})();
