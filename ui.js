{
  // DOM Helpers
  const DOM = {
    getById: id => document.getElementById(id),
    on: (element, event, fn) => element.addEventListener(event, fn),
  };
  
  // DOM Collections.
  const checkboxElements = [
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
      toFixed,
      updateOnResize,
      updateOnEveryFrame,
    } = {}
  ) => {
    const rangeInput = $el[`${key}Range`];
    const textInput = $el[`${key}Input`];
    const labelEl = $el[`${key}Title`];

    const eventListener = (event, updateSelfOnly) => {
      const value = event.target.value;

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
      let initialValue = tp[collection][key];

      if (typeof toFixed !== 'undefined') {
        initialValue = initialValue.toFixed(toFixed)
      }
      
      eventListener({ target: { value: initialValue } }, true);

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
    { toFixed: 0, updateOnEveryFrame: true, }
  );

  createControlCluster(
    'radius', 'config',
    value => `radius scale (x${value})`,
    { toFixed: 0, updateOnResize: true, }
  );

  createControlCluster(
    'step', 'config',
    value => `step by frame (${value}deg)`
  );

  DOM.on($el.togglePlay, 'click', () => {
    tp.togglePlay();
    $el.togglePlay.innerText = tp.config.play ? 'Stop' : 'Start';
  });

  const updateStateValues = () => {
    const sin = +tp.state.sin.toFixed(3);
    const cos = +tp.state.cos.toFixed(3);

    $el.stateDeg.value = tp.state.degree.toFixed(3);
    $el.stateRad.value = tp.state.degreeInRad.toFixed(3);
    $el.stateQua.value = tp.state.quadrant;
    $el.stateSin.value = sin.toFixed(3);
    $el.stateCos.value = cos.toFixed(3);
    $el.stateTan.value = cos === 0 ? 'Undefined' : (sin / cos).toFixed(3);
    $el.stateCot.value = sin === 0 ? 'Undefined' : (cos / sin).toFixed(3);
    $el.stateSec.value = cos === 0 ? 'Undefined' : (1 / cos).toFixed(3);
    $el.stateCsc.value = sin === 0 ? 'Undefined' : (1 / sin).toFixed(3);

    window.requestAnimationFrame(updateStateValues);
  };
  updateStateValues();

  checkboxElements.forEach(checkbox => {
    DOM.on($el[checkbox], 'change', function() {
      const configName = checkbox[4].toLowerCase() + checkbox.substr(5);
      window.tp.config.draw[configName] = this.checked;
    });
  });
}
