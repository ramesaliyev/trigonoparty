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
    name,
    {
      toFixed,
      updateOnResize,
      updateOnEveryFrame,
    } = {}
  ) => {
    const rangeInput = $el[`${name}Range`];
    const textInput = $el[`${name}Input`];
    const label = $el[`${name}Title`];

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

      if (label) {
        label.innerText = `${key} (${value})`;  
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

  createControlCluster('degree', 'state', 'degree', {
    toFixed: 0, updateOnEveryFrame: true,
  });

  createControlCluster('radius', 'config', 'radius', {
    toFixed: 0, updateOnResize: true,
  });

  createControlCluster('step', 'config', 'step');

  DOM.on($el.togglePlay, 'click', () => {
    tp.config.play = !tp.config.play;
    $el.togglePlay.innerText = tp.config.play ? 'Stop' : 'Start';
    //tp.draw();
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
