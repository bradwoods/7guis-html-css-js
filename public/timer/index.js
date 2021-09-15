let intervalID = null;

const STEP_MS = 100;

const elems = {
  duration: document.querySelector("output#duration"),
  progress: document.querySelector("#progressInner"),
};

// Displaying values ---------------------------------------------------------
function setDurationDisplay() {
  const { elapsedTimeMS } = values;
  const currentValue = elems.duration.innerHTML;
  const newValue = `${elapsedTimeMS / 1000}s`;

  if (currentValue !== newValue) {
    elems.duration.innerHTML = newValue;
  }
}

function setProgressDisplay() {
  const { durationMS, elapsedTimeMS } = values;
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

// Values ---------------------------------------------------------
function onValuesChange() {
  const { durationMS, elapsedTimeMS } = values;

  setDisplayValues();

  if (elapsedTimeMS >= durationMS) {
    stopTimer();
    return;
  }

  startTimer();
}

const values = {
  set setDuration(value) {
    this.durationMS = value;
    onValuesChange();
  },
  set setElapseTime(value) {
    this.elapsedTimeMS = value;
    onValuesChange();
  },
  durationMS: 0,
  elapsedTimeMS: 0,
};

// Timer ---------------------------------------------------------
function stopTimer() {
  if (intervalID) {
    clearInterval(intervalID);
    intervalID = null;
  }
}

function startTimer() {
  if (!intervalID) {
    intervalID = setInterval(() => {
      const { elapsedTimeMS } = values;

      values.setElapseTime = elapsedTimeMS + STEP_MS;
    }, STEP_MS);
  }
}

// DOM listeners -------------------------------------------------
function onDurationInput(event) {
  const { value } = event.target;
  values.setDuration = value * 1000;
}

function onResetButtonClick() {
  values.setElapseTime = 0;
}
