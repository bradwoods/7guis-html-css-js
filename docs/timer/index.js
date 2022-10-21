let intervalID = null;

const STEP_MS = 100;

const elems = {
  durationInput: document.querySelector("#durationInput"),
  durationOutput: document.querySelector("#durationOutput"),
  progress: document.querySelector("progress"),
  reset: document.querySelector("button"),
};

// Displaying values ---------------------------------------------------------
function setDurationDisplay() {
  const { elapsedTimeMS } = values;
  const currentValue = elems.durationOutput.textContent;
  const newValue = `${elapsedTimeMS / 1000}s`;

  if (currentValue !== newValue) {
    elems.durationOutput.textContent = newValue;
  }
}

function setProgressDisplay() {
  const { durationMS, elapsedTimeMS } = values;
  const currentValue = elems.progress.value;
  const newValue = durationMS === 0 ? 0 : Math.min(elapsedTimeMS / durationMS, 1) * 100;

  if (currentValue !== newValue) {
    elems.progress.value = newValue;
    elems.progress.textContent = `${newValue}%`;
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
  set durationMS(value) {
    this._durationMS_ = value;
    onValuesChange();
  },
  set elapseTimeMS(value) {
    this._elapsedTimeMS_ = value;
    onValuesChange();
  },
  get durationMS() {
    return this._durationMS_ || 0;
  },
  get elapsedTimeMS() {
    return this._elapsedTimeMS_ || 0;
  },
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

      values.elapseTimeMS = elapsedTimeMS + STEP_MS;
    }, STEP_MS);
  }
}

// DOM listeners -------------------------------------------------
elems.durationInput.oninput = function (event) {
  const { value } = event.target;
  values.durationMS = value * 1000;
};

elems.reset.onclick = function () {
  values.elapseTimeMS = 0;
};
