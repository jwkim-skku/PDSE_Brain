// Array of images to be preloaded when all images which are loaded
// on page load or select change are loaded, or when page is refocused
// See allLoaded() for more info
const images = [];

/** I take advantage of the fact JS functions are objects and can have properties to make 'static' variables **/

// The time between frames after the animation starts moving when clicking left/right/up/down
function holdIntervalStatic(func, timer) {
  if (holdIntervalStatic.interval === undefined) {
    holdIntervalStatic.interval = 0;
  }
  holdIntervalStatic.interval = setInterval(function() {
    func();
  }, timer);
}

// The time until the animation goes beyond the first frame when clicking left/right/up/down
function holdTimeoutStatic(func, timer) {
  if (holdTimeoutStatic.timeout === undefined) {
    holdTimeoutStatic.timeout = 0;
  }
  holdTimeoutStatic.timeout = setTimeout(function() {
    func();
  }, timer);
}

// The time between frames when clicking View Labels/Center
function gotoIntervalStatic(func, timer) {
  if (gotoIntervalStatic.interval === undefined) {
    gotoIntervalStatic.interval = 0;
  }
  gotoIntervalStatic.interval = setInterval(function() {
    func();
  }, timer);
}

// The time until the animation will reach the center when clicking View Labels while viewing
// a frame on a different dimension than the labels
// (variable length, unlike the other 3 static functions)
function labelTimeoutStatic(func, timer) {
  if (labelTimeoutStatic.timeout === undefined) {
    labelTimeoutStatic.timeout = 0;
  }
  labelTimeoutStatic.timeout = setTimeout(function() {
    func();
  }, timer);
}

// This canvas is hidden, so why are we drawing on it?
// Because Firefox is 'clever', so if an image is not visible, it is not loaded
// This works around that; even though the canvas is hidden, the image will still be drawn
// It is called when all the images for a particular structure are loaded and when the tab is refocused
// (another time when Firefox discards the images is when you un-focus the tab)
function allLoaded() {
  const canvas = document.getElementById("canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    for (let i = 0; i < images.length; i++) {
      ctx.drawImage(images[i], 0, 0);
    }
  }
}

// If all the images that should be loaded are loaded, draw them all onto the canvas
// (prevents Firefox blinking; comment out allLoaded() to see said blinking)
function drawImages(framesPerDimension) {
  if (images.length === framesPerDimension * 2 + 1) {
    allLoaded();
  }
}

// Create each image element
function createImage(framesPerDimension, newId, startImage, divEl) {
  const newImg = document.createElement("img");
  newImg.src = "http://www.g2conline.org/3dbrain/images/" + newId + ".jpg";
  newImg.alt = "";
  newImg.id = newId;
  newImg.addEventListener("load", function() { drawImages(framesPerDimension); });
  if (startImage !== newId) {
    newImg.className = "hidden";
  } else {
    newImg.className = "visible";
  }
  images.push(newImg);
  divEl.appendChild(newImg);
}

// Create each frame; can't be combined with createImage because this
// creates an id using a method that is not appropriate for the label image
function createFrame(framesPerDimension, i, divEl, startImage, baseImageName, dimension) {
  const newId = baseImageName + "/" + ('00'+i).slice(-2) + "_" + dimension;
  createImage(framesPerDimension, newId, startImage, divEl);
}

// Change the text content to the description of the selected structure and change the images to the ones for the selected structure
function getInfo(baseImageName, pageContents, mapIdToLabelImage, framesPerDimension) {
  // Setting an arrays length to 0 clears it. This allows me to keep the images array as a const
  images.length = 0;
  let startImage;
  const baseStartImage = 'brain/64_lr';
  const imageHolder = document.getElementById("imageHolder");
  const visible = document.getElementsByClassName("visible")[0];
  const textSource = document.getElementById("textSource");
  textSource.innerHTML = pageContents[baseImageName];
  textSource.scrollTop = 0;
  if (visible) {
    imageHolder.innerHTML = "";
    if (visible.id.indexOf("/labels") !== -1) {
      const previousActiveValue = visible.id.replace("/labels", "");
      startImage = baseImageName + "/" + mapIdToLabelImage[previousActiveValue].replace(/^\D+/g, baseImageName);
    } else {
      startImage = visible.id.replace(/^\D+/g, baseImageName + "/");
    }
  } else {
    startImage = baseStartImage;
  }
  const newId = baseImageName + '/labels';
  createImage(framesPerDimension, newId, "none", imageHolder);
  for (let i = 1; i <= framesPerDimension; i++) {
    createFrame(framesPerDimension, i, imageHolder, startImage, baseImageName, 'lr');
    createFrame(framesPerDimension, i, imageHolder, startImage, baseImageName, 'ud');
  }
}

// Alter the text and images to the ones for the selected structure
function changeHandler(pageContents, mapIdToLabelImage, framesPerDimension) {
  const choices = document.getElementById("choices");
  getInfo(choices.value, pageContents, mapIdToLabelImage, framesPerDimension);
}

// Replace the visible label image with the associated image without labels
function removeLabel(visible, mapIdToLabelImage) {
  const choices = document.getElementById("choices");
  const activeId = choices.value;
  const labelImage = activeId + "/" + mapIdToLabelImage[activeId];
  const newVisible = document.getElementById(labelImage);
  visible.className = "hidden";
  newVisible.className = "visible";
}

// Replace the visible image with the associated label image
function makeLabel() {
  const choices = document.getElementById("choices");
  const baseImageName = choices.value;
  const visible = document.getElementsByClassName("visible")[0];
  const label = document.getElementById(baseImageName + "/labels");
  visible.className = "hidden";
  label.className = "visible";
}

// Hide the current visible image and show the image that is the same on both dimensions
// This way moving along the other dimension can happen smoothly after a quick image swap
function moveHelper(dimension) {
  const visible = document.getElementsByClassName("visible")[0];
  const choices = document.getElementById("choices");
  const baseImageName = choices.value;
  const newVisible = document.getElementById(baseImageName + "/" + "01_" + dimension);
  visible.className = "hidden";
  newVisible.className = "visible";
}

// Move the animation a single 'frame' left/right/up/down (same function can be used for all of them)
function goMoveOnce(mapIdToLabelImage, framesPerDimension, positive, checkIfValue, value, label) {
  let visible = document.getElementsByClassName("visible")[0];
  if (visible.id.indexOf("labels") !== -1) {
    removeLabel(visible, mapIdToLabelImage);
    visible = document.getElementsByClassName("visible")[0];
  }
  const visibleId = visible.id;
  const oldNumber = parseInt(visibleId.replace(/\D/g, ''));
  let integerValue;
  if (positive) {
    integerValue = oldNumber + 1;
    if (integerValue === framesPerDimension + 1) {
      integerValue = 1;
    }
  } else {
    integerValue = oldNumber - 1;
    if (integerValue === 0) {
      integerValue = framesPerDimension;
    }
  }
  const newVisibleId = visibleId.replace(('00'+oldNumber).slice(-2), ('00'+integerValue).slice(-2));
  const newVisible = document.getElementById(newVisibleId);
  visible.className = "hidden";
  newVisible.className = "visible";
  if (checkIfValue) {
    if (integerValue === value) {
      if (label) makeLabel();
      clearInterval(gotoIntervalStatic.interval);
    }
  }
}

// Function to move the animation's frames up/right/left/down until the mouse is released
function goMove(event, mapIdToLabelImage, framesPerDimension, intervalMS, timeoutMS, dimension, positive) {
  event.preventDefault();
  clearTimeout(labelTimeoutStatic.timeout);
  clearInterval(gotoIntervalStatic.interval);
  const choices = document.getElementById("choices");
  const activeId = choices.value;
  const labelImage = activeId + mapIdToLabelImage[activeId];
  const visible = document.getElementsByClassName("visible")[0];
  const otherDimension = ((dimension === 'lr') ? 'ud': 'lr');
  if (visible.id.indexOf('labels') !== -1 && labelImage.indexOf(otherDimension) !== -1) {
    removeLabel(visible, mapIdToLabelImage);
    moveHelper(dimension);
  } else if (visible.id.indexOf(otherDimension) !== -1) {
    moveHelper(dimension);
  }
  goMoveOnce(mapIdToLabelImage, framesPerDimension, positive);
  holdTimeoutStatic(function() { holdIntervalStatic(function() { goMoveOnce(mapIdToLabelImage, framesPerDimension, positive); }, intervalMS); }, timeoutMS);
}

// Function to move the animation to the center using as few frames as possible
function goCenter(mapIdToLabelImage, framesPerDimension, intervalMS) {
  clearTimeout(labelTimeoutStatic.timeout);
  clearInterval(gotoIntervalStatic.interval);
  let visible = document.getElementsByClassName("visible")[0];
  if(visible.id.indexOf("labels") !== -1) {
    removeLabel(visible, mapIdToLabelImage);
    visible = document.getElementsByClassName("visible")[0];
  }
  const visibleId = visible.id;
  const integerValue = parseInt(visibleId.replace(/\D/g, ''));
  if (integerValue === 1) {
    return;
  }
  gotoIntervalStatic(function() { goMoveOnce(mapIdToLabelImage, framesPerDimension, (integerValue > framesPerDimension / 2), true, 1); }, intervalMS);
}

// Once this function is run, the anmation will be on a frame in the same dimension as the label image,
// or on the central frame that is the same between dimensions
// Keep moving the animation until it reaches the image the labels are drawn on, then switch to showing the image with the labels
function finishLabel(mapIdToLabelImage, framesPerDimension, intervalMS, dimension, integerValue, target) {
  const visible = document.getElementsByClassName("visible")[0];
  const otherDimension = ((dimension === 'lr') ? 'ud': 'lr');
  if (visible.id.indexOf(otherDimension) !== -1) {
    moveHelper(dimension);
    if (target === 1) {
      makeLabel();
      return;
    }
  }
  let positive = false;
  if (target > framesPerDimension / 2) {
    if (target - framesPerDimension / 2 < integerValue && integerValue <= target) {
      positive = true;
    }
  } else {
    if ((integerValue > target && integerValue - framesPerDimension / 2 >= target) || (integerValue < target)) {
      positive = true;
    }
  }
  gotoIntervalStatic(function() { goMoveOnce(mapIdToLabelImage, framesPerDimension, positive, true, target, true); }, intervalMS);
}

// Helper function to move the animation to the frame with the labels and then show the labels
// Works differently depending what dimension the animation's label is on
function goLabelByDimension(mapIdToLabelImage, framesPerDimension, intervalMS, dimension, labelImage) {
  const target = parseInt(labelImage.replace(/\D/g, ''));
  const visible = document.getElementsByClassName("visible")[0];
  const otherDimension = ((dimension === 'lr') ? 'ud': 'lr');
  const visibleId = visible.id;
  if (visibleId.indexOf("labels") !== -1) {
    return;
  }
  let integerValue = parseInt(visibleId.replace(/\D/g, ''));
  if (visibleId.indexOf(dimension) !== -1 && integerValue === target) {
    makeLabel();
    return;
  }
  if (visibleId.indexOf(otherDimension) !== -1) {
    goCenter(mapIdToLabelImage, framesPerDimension, intervalMS);
    let timer;
    if (integerValue <= framesPerDimension / 2 + 1) {
      timer = (integerValue - 1)*intervalMS + 15;
    } else {
      timer = (framesPerDimension + 1 - integerValue)*intervalMS + 15;
    }
    integerValue = 1;
    labelTimeoutStatic(function() { finishLabel(mapIdToLabelImage, framesPerDimension, intervalMS, dimension, integerValue, target); }, timer);
  } else {
    finishLabel(mapIdToLabelImage, framesPerDimension, intervalMS, dimension, integerValue, target);
  }
}

// Function to move the animation to the frame with the labels and then show the labels, using as few frames as possible while moving smoothly
function goLabel(mapIdToLabelImage, framesPerDimension, intervalMS) {
  clearTimeout(labelTimeoutStatic.timeout);
  clearInterval(gotoIntervalStatic.interval);
  const choices = document.getElementById("choices");
  const activeId = choices.value;
  const labelImage = activeId + mapIdToLabelImage[activeId];
  if (labelImage.indexOf("ud") !== -1) {
    goLabelByDimension(mapIdToLabelImage, framesPerDimension, intervalMS, 'ud', labelImage);
  } else {
    goLabelByDimension(mapIdToLabelImage, framesPerDimension, intervalMS, 'lr', labelImage);
  }
}

// When the left/right/up/down arrow is releases, stop the animation's movement
function stopHold() {
  clearInterval(holdIntervalStatic.interval);
  clearTimeout(holdTimeoutStatic.timeout);
}

// Don't show the context menu on long-press on touch devices
function noContext(event) {
  event.preventDefault();
  event.stopPropagation();
  stopHold();
  return false;
}

window.addEventListener('load', function() {
  const mapIdToLabelImage = {
    'brain': '56_lr',
    'basal_ganglia': '65_lr',
    'brainstem': '37_lr',
    'pons': '01_lr',
    'cerebellum': '46_lr',
    'corpus_callosum': '37_lr',
    'frontal_lobe': '63_lr',
    'brocas_area': '62_lr',
    'prefrontal': '07_lr',
    'premotor': '61_lr',
    'primary_motor': '61_lr',
    'limbic_system': '61_lr',
    'amygdala': '61_lr',
    'cingulate': '65_lr',
    'dentate_gyrus': '64_ud',
    'entorhinal': '61_lr',
    'hippocampus': '61_lr',
    'hypothalamus': '61_lr',
    'subiculum': '01_lr',
    'occipital': '31_lr',
    'parietal_lobe': '31_lr',
    'somatosensory': '57_lr',
    'temporal_lobe': '67_lr',
    'mid_inf_temporal': '61_lr',
    'perirhinal': '11_ud',
    'superior_temporal': '61_lr',
    'wernickes_area': '50_lr',
    'thalamus': '61_lr',
    'ventricles': '61_lr'
  };
  const intervalMS = 25;
  const timeoutMS = 250;
  const framesPerDimension = 72;
  const pageContents = {};
  const choices = document.getElementById("choices");
  const xhr = new XMLHttpRequest();
  const xs = new XMLSerializer();
  xhr.open('GET', 'brainData_02.xml');
  xhr.responseType = 'document';
  xhr.overrideMimeType('text/xml');
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      const modules = xhr.responseXML.getElementsByTagName("module");
      for (let i = 0; i < modules.length; i++) {
        const attributes = modules[i].attributes;
        const accessId = attributes.accessID.value;
        const moduleLevel = attributes.moduleLevel.value;
        let selectOptionText = "";
        for (let j = 0; j < moduleLevel; j++) {
          selectOptionText += "&emsp;";
        }
        selectOptionText += attributes.label.value;
        const option = document.createElement("option");
        option.value = accessId;
        option.innerHTML = selectOptionText;
        choices.appendChild(option);
        let moduleText = xs.serializeToString(modules[i]);
        moduleText = moduleText.substring(moduleText.indexOf(">") + 1);
        moduleText = moduleText.substring(0, moduleText.lastIndexOf("<"));
        pageContents[accessId] = moduleText;
      }
      getInfo('brain', pageContents, mapIdToLabelImage, framesPerDimension);
    }
  };
  xhr.send();
  const labels = document.getElementById("labels");
  const center = document.getElementById("center");
  const hasTouch = 'ontouchstart' in window;
  const moveEvent = hasTouch ? 'touchstart' : 'mousedown';
  const moveStopEvent = hasTouch ? 'touchend' : 'mouseup';
  const hasApps = /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent);
  if (hasApps) {
    document.getElementById("mobileMessage").className = "mobileMessage";
  }
  const up = document.getElementById("up");
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  const down = document.getElementById("down");
  choices.addEventListener("change", function() { changeHandler(pageContents, mapIdToLabelImage, framesPerDimension); });
  center.addEventListener('click', function() { goCenter(mapIdToLabelImage, framesPerDimension, intervalMS); });
  labels.addEventListener('click', function() { goLabel(mapIdToLabelImage, framesPerDimension, intervalMS); });
  left.addEventListener(moveEvent, function(event) { goMove(event, mapIdToLabelImage, framesPerDimension, intervalMS, timeoutMS, 'lr', false); });
  right.addEventListener(moveEvent, function(event) { goMove(event, mapIdToLabelImage, framesPerDimension, intervalMS, timeoutMS, 'lr', true); });
  down.addEventListener(moveEvent, function(event) { goMove(event, mapIdToLabelImage, framesPerDimension, intervalMS, timeoutMS, 'ud', false); });
  up.addEventListener(moveEvent, function(event) { goMove(event, mapIdToLabelImage, framesPerDimension, intervalMS, timeoutMS, 'ud', true); });
  window.addEventListener(moveStopEvent, stopHold);
  window.addEventListener('contextmenu', stopHold);
  window.addEventListener('blur', stopHold);
  if (hasTouch) {
    left.addEventListener('contextmenu', noContext);
    right.addEventListener('contextmenu', noContext);
    down.addEventListener('contextmenu', noContext);
    up.addEventListener('contextmenu', noContext);
  }
  window.addEventListener('focus', function() { drawImages(framesPerDimension); });
});
