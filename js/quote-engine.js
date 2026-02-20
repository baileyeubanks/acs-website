/* ============================================
   ASTRO CLEANING — QUOTE ENGINE v3
   Service types: Standard, Routine, Deep
   Turnover + Move-out moved to flat-fee extras
   Lead capture pre-filled from hero form
   ============================================ */

// ---- STATE ----
var quoteState = {
  currentStep: 1,
  totalSteps: 5,
  serviceType: 'standard',
  nextDay: false,
  sqft: 1800,
  beds: 3,
  baths: 2,
  frequency: 'once',
  frequencyMult: 1.0,
  addons: [],
  hasPets: false,
  petCount: 1,
  windowCount: 0,
  windowsHighReach: false,
  carpetSqft: 0,
  zipCode: '',
  zipMultiplier: 1.0,
  seasonalMultiplier: 1.0,
  zipLabel: '',
  seasonLabel: '',
  // White Glove
  whiteGloveOptions: [],
  whiteGloveCrew: 2,
  whiteGloveHours: 4,
  whiteGloveNotes: '',
  // Lead capture
  leadName: '',
  leadPhone: '',
  leadEmail: '',
};

// ---- PRICING CONFIG ----
var RATES = {
  standard: 0.11,
  routine:  0.14,
  deep:     0.18,
};

var MINIMUMS = {
  standard: 115,
  routine:  145,
  deep:     175,
};

var BEDROOM_SURCHARGE = {
  standard: 12,
  routine:  16,
  deep:     20,
};

var BATH_SURCHARGE = {
  standard: 8,
  routine:  12,
  deep:     15,
};

var NEXT_DAY_PREMIUM = 0.25;

// Flat-fee addons (turnover + moveout now here)
var ADDONS = {
  turnover:     65,
  moveout:      85,
  fridge:       35,
  oven:         45,
  patio:        55,
  'power-wash': 85,
  grout:        75,
  steam:        65,
  sanitation:   55,
  'ceiling-fans': 15,
};

var WINDOW_PRICE = 12;
var WINDOW_HIGH_REACH = 45;
var CARPET_RATE = 0.25;
var PET_BASE = 15;
var PET_ADDITIONAL = 10;

var FREQ_LABELS = {
  once:     'One-time',
  monthly:  'Monthly',
  biweekly: 'Bi-weekly',
  weekly:   'Weekly',
};

var FREQ_DISCOUNTS = {
  once:     0,
  monthly:  10,
  biweekly: 15,
  weekly:   25,
};

// ---- ZIP CODE DATA (Houston area) ----
var ZIP_DATA = {
  '77429': { mult: 1.05, label: 'Cypress (+5%)' },
  '77433': { mult: 1.05, label: 'Cypress (+5%)' },
  '77434': { mult: 1.05, label: 'Cypress (+5%)' },
  '77493': { mult: 1.05, label: 'Cypress (+5%)' },
  '77019': { mult: 1.15, label: 'River Oaks (+15%)' },
  '77027': { mult: 1.15, label: 'West University (+15%)' },
  '77005': { mult: 1.12, label: 'West University (+12%)' },
  '77006': { mult: 1.10, label: 'Montrose (+10%)' },
  '77380': { mult: 1.08, label: 'The Woodlands (+8%)' },
  '77381': { mult: 1.08, label: 'The Woodlands (+8%)' },
  '77382': { mult: 1.10, label: 'The Woodlands (+10%)' },
  '77478': { mult: 1.06, label: 'Sugar Land (+6%)' },
  '77479': { mult: 1.08, label: 'Sugar Land (+8%)' },
  '77450': { mult: 1.05, label: 'Katy (+5%)' },
  '77494': { mult: 1.07, label: 'Cinco Ranch (+7%)' },
  '77024': { mult: 1.12, label: 'Memorial (+12%)' },
  '77079': { mult: 1.08, label: 'Memorial (+8%)' },
  '77008': { mult: 1.08, label: 'Heights (+8%)' },
  '77009': { mult: 1.06, label: 'Heights (+6%)' },
  '77002': { mult: 1.05, label: 'Downtown (+5%)' },
  '77003': { mult: 1.04, label: 'EaDo (+4%)' },
  '77004': { mult: 1.04, label: 'Midtown (+4%)' },
  '77007': { mult: 1.08, label: 'Washington Ave (+8%)' },
  '77025': { mult: 1.06, label: 'Braeswood (+6%)' },
  '77030': { mult: 1.05, label: 'Med Center (+5%)' },
  '77056': { mult: 1.10, label: 'Galleria (+10%)' },
  '77057': { mult: 1.08, label: 'Galleria (+8%)' },
};

// ---- SEASONAL PRICING ----
function getSeasonalMultiplier() {
  var month = new Date().getMonth();
  if (month >= 5 && month <= 8) return { mult: 1.05, label: 'Summer demand (+5%)' };
  if (month === 11 || month === 0) return { mult: 1.03, label: 'Holiday season (+3%)' };
  if (month >= 1 && month <= 2) return { mult: 0.97, label: 'Winter savings (-3%)' };
  return { mult: 1.0, label: '' };
}

// ---- CORE CALCULATION ----
function calculateQuote() {
  var s = quoteState;
  var basePrice = s.sqft * RATES[s.serviceType];
  basePrice += s.beds * BEDROOM_SURCHARGE[s.serviceType];
  basePrice += s.baths * BATH_SURCHARGE[s.serviceType];

  var min = MINIMUMS[s.serviceType];
  if (basePrice < min) basePrice = min;

  var nextDayCost = 0;
  if (s.nextDay) {
    nextDayCost = basePrice * NEXT_DAY_PREMIUM;
    basePrice += nextDayCost;
  }

  var freqPrice = basePrice * s.frequencyMult;
  var freqSavings = basePrice - freqPrice;

  var addonTotal = 0;
  s.addons.forEach(function(addon) {
    if (ADDONS[addon]) addonTotal += ADDONS[addon];
  });

  var windowCost = 0;
  if (s.windowCount > 0) {
    windowCost = s.windowCount * WINDOW_PRICE;
    if (s.windowsHighReach) windowCost += WINDOW_HIGH_REACH;
  }
  addonTotal += windowCost;

  var petCost = 0;
  if (s.hasPets && s.petCount > 0) {
    petCost = PET_BASE + Math.max(0, s.petCount - 1) * PET_ADDITIONAL;
  }
  addonTotal += petCost;

  var carpetCost = 0;
  if (s.carpetSqft > 0) {
    carpetCost = s.carpetSqft * CARPET_RATE;
    if (carpetCost < 35) carpetCost = 35;
  }
  addonTotal += carpetCost;

  var subtotal = freqPrice + addonTotal;

  var zipAdjustment = freqPrice * (s.zipMultiplier - 1);
  subtotal += zipAdjustment;

  var seasonal = getSeasonalMultiplier();
  s.seasonalMultiplier = seasonal.mult;
  s.seasonLabel = seasonal.label;
  var seasonAdjustment = freqPrice * (seasonal.mult - 1);
  subtotal += seasonAdjustment;

  var rawTotal = basePrice + addonTotal;
  var maxTotal = rawTotal * 1.20;
  var minTotal = rawTotal * 0.80;
  if (subtotal > maxTotal) subtotal = maxTotal;
  if (subtotal < minTotal) subtotal = minTotal;

  var total = Math.round(subtotal);
  var rangeLow = Math.round(total * 0.85);
  var rangeHigh = Math.round(total * 1.15);
  var hours = (total / 42).toFixed(1);

  return {
    basePrice: Math.round(basePrice),
    nextDayCost: Math.round(nextDayCost),
    freqPrice: Math.round(freqPrice),
    freqSavings: Math.round(freqSavings),
    addonTotal: Math.round(addonTotal),
    windowCost: Math.round(windowCost),
    petCost: Math.round(petCost),
    carpetCost: Math.round(carpetCost),
    zipAdjustment: Math.round(zipAdjustment),
    seasonAdjustment: Math.round(seasonAdjustment),
    total: total,
    rangeLow: rangeLow,
    rangeHigh: rangeHigh,
    hours: hours,
  };
}

// ---- UI: SERVICE SELECTION ----
function selectService(el) {
  document.querySelectorAll('.service-select-card').forEach(function(c) {
    c.classList.remove('active');
  });
  el.classList.add('active');
  quoteState.serviceType = el.dataset.service;
  updateLivePrice();
}

// ---- WHITE GLOVE ----
function toggleWgOption(el) {
  el.classList.toggle('active');
  var opt = el.dataset.wg;
  var idx = quoteState.whiteGloveOptions.indexOf(opt);
  if (idx > -1) {
    quoteState.whiteGloveOptions.splice(idx, 1);
  } else {
    quoteState.whiteGloveOptions.push(opt);
  }
}

function stepWgValue(id, delta) {
  var input = document.getElementById(id);
  var val = parseInt(input.value) + delta;
  var minVal = parseInt(input.min) || 1;
  var maxVal = parseInt(input.max) || 10;
  if (val < minVal) val = minVal;
  if (val > maxVal) val = maxVal;
  input.value = val;
  if (id === 'wgCrew') quoteState.whiteGloveCrew = val;
  if (id === 'wgHours') quoteState.whiteGloveHours = val;
}

function backFromWhiteGlove() {
  var wgStep = document.getElementById('step1b');
  wgStep.classList.remove('active');
  var step1 = document.getElementById('step1');
  step1.classList.add('active');
  quoteState.currentStep = 1;
  updateProgress();
}

function submitWhiteGlove() {
  quoteState.whiteGloveNotes = (document.getElementById('wgNotes') || {}).value || '';
  var s = quoteState;

  var optionLabels = {
    airbnb: 'Airbnb/STR Reset',
    postevent: 'Post-Event Cleanup',
    deck: 'Large Deck/Patio',
    powerwash: 'Power Washing',
    moveout: 'Move In/Out',
    custom: 'Custom Request'
  };

  var selectedServices = s.whiteGloveOptions.map(function(o) { return optionLabels[o] || o; });

  var lead = {
    type: 'astro-whiteglove-lead',
    services: selectedServices,
    crewSize: s.whiteGloveCrew,
    hours: s.whiteGloveHours,
    notes: s.whiteGloveNotes,
    premium: '75%',
    timestamp: new Date().toISOString()
  };

  if (WEBHOOK_URL) {
    try {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    } catch (e) {}
  }

  window.open(WIX_BOOKING_URL, '_blank');
}

function toggleNextDay() {
  quoteState.nextDay = document.getElementById('nextDayToggle').checked;
  updateLivePrice();
}

// ---- UI: FREQUENCY ----
function selectFreq(el) {
  document.querySelectorAll('.freq-card').forEach(function(c) {
    c.classList.remove('active');
  });
  el.classList.add('active');
  quoteState.frequency = el.dataset.freq;
  quoteState.frequencyMult = parseFloat(el.dataset.mult);
  updateLivePrice();
}

// ---- UI: ADD-ONS ----
function toggleAddon(el) {
  el.classList.toggle('active');
  var addon = el.dataset.addon;
  var idx = quoteState.addons.indexOf(addon);
  if (idx > -1) {
    quoteState.addons.splice(idx, 1);
  } else {
    quoteState.addons.push(addon);
  }
  updateLivePrice();
}

function togglePets(el) {
  el.classList.toggle('active');
  quoteState.hasPets = el.classList.contains('active');
  var sub = document.getElementById('petSubOptions');
  if (sub) sub.style.display = quoteState.hasPets ? 'flex' : 'none';
  updateLivePrice();
}

function setPetCount(val) {
  quoteState.petCount = Math.max(1, Math.min(10, parseInt(val) || 1));
  document.getElementById('petCountInput').value = quoteState.petCount;
  updateLivePrice();
}

function toggleWindows(el) {
  el.classList.toggle('active');
  var isActive = el.classList.contains('active');
  quoteState.windowCount = isActive ? (parseInt(document.getElementById('windowCountInput').value) || 6) : 0;
  var sub = document.getElementById('windowSubOptions');
  if (sub) sub.style.display = isActive ? 'flex' : 'none';
  if (isActive && quoteState.windowCount === 0) {
    quoteState.windowCount = 6;
    document.getElementById('windowCountInput').value = 6;
  }
  updateLivePrice();
}

function setWindowCount(val) {
  quoteState.windowCount = Math.max(1, Math.min(50, parseInt(val) || 1));
  document.getElementById('windowCountInput').value = quoteState.windowCount;
  updateLivePrice();
}

function toggleHighReach() {
  quoteState.windowsHighReach = document.getElementById('highReachToggle').checked;
  updateLivePrice();
}

function toggleCarpet(el) {
  el.classList.toggle('active');
  var isActive = el.classList.contains('active');
  quoteState.carpetSqft = isActive ? (parseInt(document.getElementById('carpetSqftInput').value) || 400) : 0;
  var sub = document.getElementById('carpetSubOptions');
  if (sub) sub.style.display = isActive ? 'flex' : 'none';
  if (isActive && quoteState.carpetSqft === 0) {
    quoteState.carpetSqft = 400;
    document.getElementById('carpetSqftInput').value = 400;
  }
  updateLivePrice();
}

function setCarpetSqft(val) {
  quoteState.carpetSqft = Math.max(50, Math.min(5000, parseInt(val) || 50));
  document.getElementById('carpetSqftInput').value = quoteState.carpetSqft;
  updateLivePrice();
}

// ---- UI: STEPPER ----
function stepValue(id, delta) {
  var input = document.getElementById(id);
  var step = (id === 'qBaths') ? 0.5 : 1;
  var val = parseFloat(input.value) + (delta * step);
  var minVal = parseFloat(input.min) || 1;
  var maxVal = parseFloat(input.max) || 10;
  if (val < minVal) val = minVal;
  if (val > maxVal) val = maxVal;
  input.value = (id === 'qBaths') ? val : Math.round(val);
  if (id === 'qBeds') quoteState.beds = Math.round(val);
  if (id === 'qBaths') quoteState.baths = val;
  updateLivePrice();
}

function syncRange(inputId, value) {
  document.getElementById(inputId).value = value;
  quoteState.sqft = parseInt(value);
  updateLivePrice();
}

function onZipInput(el) {
  var zip = el.value.replace(/\D/g, '').substring(0, 5);
  el.value = zip;
  quoteState.zipCode = zip;
  var feedback = document.getElementById('zipFeedback');

  if (zip.length === 5) {
    var data = ZIP_DATA[zip];
    if (data) {
      quoteState.zipMultiplier = data.mult;
      quoteState.zipLabel = data.label;
      feedback.textContent = 'We serve ' + data.label.split(' (')[0] + '!';
      feedback.style.color = 'var(--green)';
    } else {
      quoteState.zipMultiplier = 1.0;
      quoteState.zipLabel = '';
      feedback.textContent = 'Houston area \u2014 standard pricing';
      feedback.style.color = 'var(--slate)';
    }
    updateSummary();
  } else {
    quoteState.zipMultiplier = 1.0;
    quoteState.zipLabel = '';
    feedback.textContent = '';
    updateSummary();
  }
}

// ---- LIVE PRICE UPDATES ----
function updateLivePrice() {
  var sqftInput = document.getElementById('qSqft');
  if (sqftInput) {
    quoteState.sqft = parseInt(sqftInput.value) || 1800;
    var range = document.getElementById('qSqftRange');
    if (range) range.value = Math.min(quoteState.sqft, 8000);
  }

  var calc = calculateQuote();

  ['livePrice', 'livePrice2', 'livePrice3'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      var oldVal = el.textContent;
      var newVal = '$' + calc.total;
      if (oldVal !== newVal) {
        el.textContent = newVal;
        el.classList.add('price-bump');
        setTimeout(function() { el.classList.remove('price-bump'); }, 300);
      }
    }
  });

  if (quoteState.currentStep === 5) updateSummary();
}

function updateSummary() {
  var calc = calculateQuote();
  var s = quoteState;

  var priceEl = document.getElementById('summaryPrice');
  if (priceEl) {
    priceEl.textContent = '$' + calc.total;
    priceEl.style.transform = 'scale(1.05)';
    setTimeout(function() { priceEl.style.transform = 'scale(1)'; }, 300);
  }

  var rangeEl = document.getElementById('summaryRange');
  if (rangeEl) rangeEl.textContent = 'Typical range: $' + calc.rangeLow + ' \u2013 $' + calc.rangeHigh;

  var serviceNames = {
    standard: 'Standard Clean',
    routine: 'Routine Clean',
    deep: 'Deep Clean',
  };
  setText('bkServiceName', serviceNames[s.serviceType]);
  setText('bkBase', '$' + calc.basePrice.toFixed(2));

  if (s.nextDay) { showRow('bkNextDayRow'); setText('bkNextDay', '+$' + calc.nextDayCost.toFixed(2)); }
  else { hideRow('bkNextDayRow'); }

  if (s.frequencyMult < 1) {
    showRow('bkFreqRow');
    setText('bkFreqLabel', FREQ_LABELS[s.frequency] + ' discount');
    setText('bkFreq', '-$' + calc.freqSavings.toFixed(2));
  } else { hideRow('bkFreqRow'); }

  if (calc.windowCost > 0) {
    showRow('bkWindowsRow');
    setText('bkWindowsLabel', s.windowCount + ' windows' + (s.windowsHighReach ? ' + high-reach' : ''));
    setText('bkWindows', '+$' + calc.windowCost.toFixed(2));
  } else { hideRow('bkWindowsRow'); }

  if (calc.petCost > 0) {
    showRow('bkPetsRow');
    setText('bkPetsLabel', s.petCount + (s.petCount === 1 ? ' pet' : ' pets'));
    setText('bkPets', '+$' + calc.petCost.toFixed(2));
  } else { hideRow('bkPetsRow'); }

  if (calc.carpetCost > 0) {
    showRow('bkCarpetRow');
    setText('bkCarpetLabel', 'Carpet (' + s.carpetSqft + ' sqft)');
    setText('bkCarpet', '+$' + calc.carpetCost.toFixed(2));
  } else { hideRow('bkCarpetRow'); }

  var flatAddonTotal = 0;
  s.addons.forEach(function(a) { flatAddonTotal += (ADDONS[a] || 0); });
  if (flatAddonTotal > 0) {
    showRow('bkAddonsRow');
    setText('bkAddons', '+$' + flatAddonTotal.toFixed(2));
  } else { hideRow('bkAddonsRow'); }

  if (s.zipMultiplier !== 1.0 && s.zipLabel) {
    showRow('bkZipRow');
    setText('bkZipLabel', s.zipLabel.split(' (')[0]);
    setText('bkZip', (calc.zipAdjustment >= 0 ? '+' : '') + '$' + calc.zipAdjustment.toFixed(2));
  } else { hideRow('bkZipRow'); }

  if (s.seasonalMultiplier !== 1.0 && s.seasonLabel) {
    showRow('bkSeasonRow');
    setText('bkSeasonLabel', s.seasonLabel.split(' (')[0]);
    setText('bkSeason', (calc.seasonAdjustment >= 0 ? '+' : '') + '$' + calc.seasonAdjustment.toFixed(2));
  } else { hideRow('bkSeasonRow'); }

  setText('bkTotal', '$' + calc.total.toFixed(2));
  setText('bkHours', '~' + calc.hours + ' hrs estimated');
}

function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
function showRow(id) { var el = document.getElementById(id); if (el) el.style.display = 'flex'; }
function hideRow(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }

// ---- WIZARD NAVIGATION ----
function nextStep() {
  if (quoteState.currentStep >= quoteState.totalSteps) return;

  // White Glove redirect: step 1 → step 1b (custom screen)
  if (quoteState.currentStep === 1 && quoteState.serviceType === 'whiteglove') {
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step1b').classList.add('active');
    quoteState.currentStep = '1b';
    document.getElementById('quoteWizard').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  var current = document.querySelector('.quote-step[data-step="' + quoteState.currentStep + '"]');
  current.classList.remove('active');

  var dot = document.querySelector('.step-dot[data-step="' + quoteState.currentStep + '"]');
  if (dot) { dot.classList.remove('active'); dot.classList.add('completed'); }

  quoteState.currentStep++;

  var next = document.querySelector('.quote-step[data-step="' + quoteState.currentStep + '"]');
  next.classList.add('active');

  var newDot = document.querySelector('.step-dot[data-step="' + quoteState.currentStep + '"]');
  if (newDot) newDot.classList.add('active');

  updateProgress();
  updateLivePrice();
  if (quoteState.currentStep === 5) updateSummary();

  document.getElementById('quoteWizard').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function prevStep() {
  if (quoteState.currentStep <= 1) return;

  var current = document.querySelector('.quote-step[data-step="' + quoteState.currentStep + '"]');
  current.classList.remove('active');

  var dot = document.querySelector('.step-dot[data-step="' + quoteState.currentStep + '"]');
  if (dot) dot.classList.remove('active');

  quoteState.currentStep--;

  var prev = document.querySelector('.quote-step[data-step="' + quoteState.currentStep + '"]');
  prev.classList.add('active');

  var prevDot = document.querySelector('.step-dot[data-step="' + quoteState.currentStep + '"]');
  if (prevDot) { prevDot.classList.remove('completed'); prevDot.classList.add('active'); }

  updateProgress();
  document.getElementById('quoteWizard').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateProgress() {
  var pct = (quoteState.currentStep / quoteState.totalSteps) * 100;
  var bar = document.getElementById('progressBar');
  if (bar) bar.style.width = pct + '%';
}

// ---- PDF GENERATION ----
function downloadQuotePDF() {
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var calc = calculateQuote();
  var s = quoteState;

  doc.setFillColor(6, 14, 26);
  doc.rect(0, 0, 210, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('ASTRO CLEANING SERVICES', 20, 25);
  doc.setFontSize(11);
  doc.text('Houston, TX  |  (346) 401-5841  |  astrocleanings.com', 20, 35);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(18);
  doc.text('Cleaning Estimate', 20, 70);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Date: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 20, 80);
  doc.text('Valid for 30 days', 20, 86);

  var y = 100;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);

  var serviceNames = { standard: 'Standard Clean', routine: 'Routine Clean', deep: 'Deep Clean' };
  doc.text('Service: ' + serviceNames[s.serviceType] + (s.nextDay ? ' (NEXT-DAY)' : ''), 20, y); y += 8;
  doc.text('Home: ' + s.sqft + ' sqft  |  ' + s.beds + ' bed / ' + s.baths + ' bath', 20, y); y += 8;
  doc.text('Frequency: ' + FREQ_LABELS[s.frequency], 20, y); y += 8;
  if (s.zipCode) { doc.text('ZIP Code: ' + s.zipCode, 20, y); y += 8; }

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 10;

  doc.setFontSize(11);
  doc.text('Base cleaning', 20, y);
  doc.text('$' + calc.basePrice.toFixed(2), 170, y, { align: 'right' }); y += 8;

  if (s.nextDay) {
    doc.text('Next-day premium (25%)', 20, y);
    doc.text('+$' + calc.nextDayCost.toFixed(2), 170, y, { align: 'right' }); y += 8;
  }

  if (s.frequencyMult < 1) {
    doc.setTextColor(34, 139, 34);
    doc.text(FREQ_LABELS[s.frequency] + ' discount', 20, y);
    doc.text('-$' + calc.freqSavings.toFixed(2), 170, y, { align: 'right' }); y += 8;
    doc.setTextColor(20, 20, 20);
  }

  if (calc.windowCost > 0) {
    doc.text(s.windowCount + ' windows', 20, y);
    doc.text('+$' + calc.windowCost.toFixed(2), 170, y, { align: 'right' }); y += 8;
  }

  if (calc.petCost > 0) {
    doc.text(s.petCount + ' pet(s)', 20, y);
    doc.text('+$' + calc.petCost.toFixed(2), 170, y, { align: 'right' }); y += 8;
  }

  if (calc.carpetCost > 0) {
    doc.text('Carpet (' + s.carpetSqft + ' sqft)', 20, y);
    doc.text('+$' + calc.carpetCost.toFixed(2), 170, y, { align: 'right' }); y += 8;
  }

  var flatAddonTotal = 0;
  s.addons.forEach(function(a) { flatAddonTotal += (ADDONS[a] || 0); });
  if (flatAddonTotal > 0) {
    doc.text('Add-on services', 20, y);
    doc.text('+$' + flatAddonTotal.toFixed(2), 170, y, { align: 'right' }); y += 8;
  }

  y += 4;
  doc.line(20, y, 190, y);
  y += 10;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('ESTIMATED TOTAL', 20, y);
  doc.text('$' + calc.total, 170, y, { align: 'right' }); y += 8;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Typical range: $' + calc.rangeLow + ' - $' + calc.rangeHigh, 20, y); y += 6;
  doc.text('Estimated time: ~' + calc.hours + ' hours', 20, y);

  y = 250;
  doc.setFontSize(9);
  doc.text('This is an automated estimate. Final price confirmed after walkthrough.', 20, y);
  doc.text('All work fully insured. Questions? Call or text (346) 401-5841', 20, y + 5);

  doc.save('Astro-Cleaning-Quote-' + new Date().toISOString().slice(0, 10) + '.pdf');
}

// ---- LEAD SUBMISSION ----
var WEBHOOK_URL = 'https://blaze.taildcd0ef.ts.net/webhook/quote';
var WIX_BOOKING_URL = 'https://www.astrocleanings.com/book';

function submitQuoteLead() {
  var calc = calculateQuote();
  var s = quoteState;

  // Use hero-captured lead info, or fall back to any fields on this page
  var name = s.leadName || '';
  var phone = s.leadPhone || '';
  var email = s.leadEmail || '';

  var addonList = [];
  s.addons.forEach(function(a) {
    addonList.push({ name: a, price: ADDONS[a] || 0 });
  });
  if (s.windowCount > 0) addonList.push({ name: 'Windows (' + s.windowCount + ')', price: calc.windowCost });
  if (s.hasPets) addonList.push({ name: 'Pets (' + s.petCount + ')', price: calc.petCost });
  if (s.carpetSqft > 0) addonList.push({ name: 'Carpet (' + s.carpetSqft + 'sqft)', price: calc.carpetCost });

  var lead = {
    type: 'astro-quote-lead',
    name: name,
    phone: phone,
    email: email,
    zip: s.zipCode || '',
    serviceType: s.serviceType,
    sqft: s.sqft,
    bedrooms: s.beds,
    bathrooms: s.baths,
    frequency: s.frequency,
    nextDay: s.nextDay,
    addons: addonList,
    estimate: calc.total,
    estimateRange: { low: calc.rangeLow, high: calc.rangeHigh },
    timestamp: new Date().toISOString()
  };

  if (WEBHOOK_URL) {
    try {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    } catch (e) {}
  }

  window.open(WIX_BOOKING_URL, '_blank');
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  var sqftInput = document.getElementById('qSqft');
  if (sqftInput) {
    sqftInput.addEventListener('input', function() {
      quoteState.sqft = parseInt(this.value) || 1800;
      var range = document.getElementById('qSqftRange');
      if (range) range.value = Math.min(quoteState.sqft, 8000);
      updateLivePrice();
    });
  }

  var defaultFreq = document.querySelector('.freq-card[data-freq="once"]');
  if (defaultFreq) defaultFreq.classList.add('active');

  updateProgress();
  updateLivePrice();
});
