{
  // DOM Helpers
  const DOM = {
    getById: id => document.getElementById(id),
    on: (element, event, fn) => element.addEventListener(event, fn),
  };
  
  const toFixed = (value, to = 3, force) => (
    (tp.config.roundNumbers || force) ? (+value).toFixed(to).padEnd(to, 0) : value
  );

  // DOM Collections.
  const checkboxElements = [
    'roundNumbers',
    'drawNoNames', 'drawFullNames',
    'drawRadius', 'drawXAxis', 'drawYAxis',
    'drawSin', 'drawCos', 'drawTan',
    'drawCot', 'drawSec', 'drawCsc',
    'drawNameRadius', 'drawNameFPS', 'drawNameCredits',
    'drawNameSin', 'drawNameCos', 'drawNameTan',
    'drawNameCot', 'drawNameSec', 'drawNameCsc',
  ];

  const elements = [
    'togglePlay',
    'stateDeg', 'stateRad', 'stateQua',
    'stateSin', 'stateCos', 'stateTan',
    'stateCot', 'stateSec', 'stateCsc',
    'degreeTitle', 'degreeRange', 'degreeInput',
    'radiusTitle', 'radiusRange', 'radiusInput',
    'stepTitle', 'stepRange', 'stepInput',
    ...checkboxElements,
  ];

  const $el = {};
  
  // Collect all elements.
  elements.forEach(id => $el[id] = DOM.getById(id))

  // 
  const createControlCluster = (
    key,
    collection,
    label,
    {
      fixTo,
      updateOnResize,
      updateOnEveryFrame,
    } = {}
  ) => {
    const rangeInput = $el[`${key}Range`];
    const textInput = $el[`${key}Input`];
    const labelEl = $el[`${key}Title`];

    const eventListener = (event, updateSelfOnly) => {
      const value = toFixed(event.target.value, fixTo);

      if (!updateSelfOnly) {
        window.tp[collection][key] = +value;
      }

      if (rangeInput && event.target !== rangeInput) {
        rangeInput.value = value;
      }

      if (textInput && event.target !== textInput) {
        textInput.value = value;
      }

      if (labelEl) {
        labelEl.innerText = typeof label === 'function' ? 
          label(value, key) : `${key} (${value})`;  
      }
    };
  
    const getAndSetValue = () => {
      eventListener({ target: { value: tp[collection][key] } }, true);

      if (updateOnEveryFrame) {
        window.requestAnimationFrame(getAndSetValue);
      }
    };

    if (rangeInput) {
      DOM.on(rangeInput, 'change', eventListener);
      DOM.on(rangeInput, 'input', eventListener);
    }

    if (textInput) {
      DOM.on(textInput, 'change', eventListener);
      DOM.on(textInput, 'input', eventListener);
    }

    getAndSetValue();

    updateOnResize && window.addEventListener('resize', () => setTimeout(getAndSetValue));
  }

  createControlCluster(
    'degree', 'state',
    value => `angle θ (${value}deg)`,
    { fixTo: 0, updateOnEveryFrame: true, }
  );

  createControlCluster(
    'radius', 'config',
    value => `radius scale (x${value})`,
    { fixTo: 0, updateOnResize: true, }
  );

  createControlCluster(
    'step', 'config',
    value => `step by frame (${value}deg)`,
    { fixTo: 2, }
  );

  DOM.on($el.togglePlay, 'click', () => {
    tp.togglePlay();
    $el.togglePlay.innerText = tp.config.play ? 'Stop' : 'Start';
  });

  const updateStateValues = () => {
    const sin = +toFixed(tp.state.sin);
    const cos = +toFixed(tp.state.cos);

    $el.stateDeg.value = toFixed(tp.state.degree);
    $el.stateRad.value = toFixed(tp.state.degreeInRad);
    $el.stateQua.value = tp.state.quadrant;
    $el.stateSin.value = toFixed(sin);
    $el.stateCos.value = toFixed(cos);
    $el.stateTan.value = cos === 0 ? 'Undefined' : toFixed(sin / cos);
    $el.stateCot.value = sin === 0 ? 'Undefined' : toFixed(cos / sin);
    $el.stateSec.value = cos === 0 ? 'Undefined' : toFixed(1 / cos);
    $el.stateCsc.value = sin === 0 ? 'Undefined' : toFixed(1 / sin);

    window.requestAnimationFrame(updateStateValues);
  };
  updateStateValues();

  checkboxElements.forEach(checkbox => {
    DOM.on($el[checkbox], 'change', function() {
      window.tp.config[checkbox] = this.checked;
    });
  });
}
