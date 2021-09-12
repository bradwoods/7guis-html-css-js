let elapsedTimeMS = 0;
let durationMS = 0;
let intervalID = null;

const STEP_MS = 100;

const elems = {
  duration: document.querySelector("output#duration"),
  progress: document.querySelector("#progressInner"),
};

function setDurationDisplay() {
  const currentValue = elems.duration.innerHTML;
  const newValue = `${elapsedTimeMS / 1000}s`;

  if (currentValue !== newValue) {
    elems.duration.innerHTML = newValue;
  }
}

function setProgressDisplay() {
  const currentValue = elems.progress.style.width;
  const widthFraction = Math.min(elapsedTimeMS / durationMS, 1);
  const newValue = `${widthFraction * 100}%`;

  if (currentValue !== newValue) {
    elems.progress.style.width = newValue;
  }
}

function setDisplayValues() {
  setDurationDisplay();
  setProgressDisplay();
}

function onValuesChange() {
  setDisplayValues();

  if (elapsedTimeMS >= durationMS) {
    stopTimer();
    return;
  }

  startTimer();
}

function stopTimer() {
  if (intervalID) {
    clearInterval(intervalID);
    intervalID = null;
  }
}

function startTimer() {
  if (!intervalID) {
    intervalID = setInterval(() => {
      elapsedTimeMS += STEP_MS;
      onValuesChange();
    }, STEP_MS);
  }
}

function onDurationInput(event) {
  const { value } = event.target;

  durationMS = value * 1000;
  onValuesChange();
}

function onResetButtonClick() {
  elapsedTimeMS = 0;
  onValuesChange();
}
