/* ============================================
   ASTRO CLEANING — QUOTE ENGINE v3
   Service types: Standard, Routine, Deep
   Turnover + Move-out moved to flat-fee extras
   Lead capture pre-filled from hero form
   ============================================ */

// ---- STATE ----
var quoteState = {
  currentStep: 1,
  totalSteps: 6,
  serviceType: 'standard',
  nextDay: false,
  sqft: 1750,
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
  leadAddress: '',
  leadCity: 'Houston',
  leadState: 'TX',
  // Promo
  promoCode: '',
  promoDiscount: 0,
};

// ---- PRICING CONFIG ----
var RATES = {
  standard: 0.10,
  routine:  0.13,
  deep:     0.16,
};

var MINIMUMS = {
  standard: 110,
  routine:  135,
  deep:     165,
};

var BEDROOM_SURCHARGE = {
  standard: 14,
  routine:  18,
  deep:     22,
};

var BATH_SURCHARGE = {
  standard: 9,
  routine:  12,
  deep:     14,
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
// Median home values sourced from Zillow, Redfin, Census ACS 2023, HAR.com (2025-2026 data)
// Houston metro median ~$335K used as baseline (1.00 multiplier)
// Multiplier formula: higher home values = wealthier area = slight premium
// Range: 0.85 (most affordable) to 1.20 (most affluent)
var ZIP_DATA = {
  // --- Katy ---
  '77449': { mult: 0.92, label: 'Katy',           medianHome: 262500 },  // Affordable Katy
  '77450': { mult: 1.03, label: 'Katy',            medianHome: 362500 },  // Mid Katy
  '77494': { mult: 1.12, label: 'Cinco Ranch',     medianHome: 488000 },  // Cinco Ranch / Katy premium

  // --- Cypress ---
  '77429': { mult: 1.05, label: 'Cypress',         medianHome: 379500 },
  '77433': { mult: 1.08, label: 'Cypress',         medianHome: 432800 },

  // --- Sugar Land ---
  '77478': { mult: 1.08, label: 'Sugar Land',      medianHome: 420000 },
  '77479': { mult: 1.10, label: 'Sugar Land',      medianHome: 480000 },

  // --- The Woodlands ---
  '77380': { mult: 1.10, label: 'The Woodlands',   medianHome: 475000 },
  '77381': { mult: 1.12, label: 'The Woodlands',   medianHome: 520000 },
  '77382': { mult: 1.15, label: 'The Woodlands',   medianHome: 580000 },

  // --- Spring ---
  '77379': { mult: 1.04, label: 'Spring',          medianHome: 365600 },
  '77388': { mult: 0.97, label: 'Spring',          medianHome: 303800 },
  '77389': { mult: 1.10, label: 'Spring',          medianHome: 463200 },

  // --- Pearland ---
  '77581': { mult: 1.02, label: 'Pearland',        medianHome: 346800 },
  '77584': { mult: 1.08, label: 'Pearland',        medianHome: 420000 },

  // --- League City ---
  '77573': { mult: 1.05, label: 'League City',     medianHome: 380200 },

  // --- Missouri City ---
  '77459': { mult: 1.07, label: 'Missouri City',   medianHome: 403700 },

  // --- Richmond ---
  '77406': { mult: 1.00, label: 'Richmond',        medianHome: 340000 },
  '77407': { mult: 1.05, label: 'Richmond',        medianHome: 389800 },

  // --- Fulshear ---
  '77441': { mult: 1.15, label: 'Fulshear',        medianHome: 608300 },

  // --- Bellaire ---
  '77401': { mult: 1.18, label: 'Bellaire',        medianHome: 963000 },

  // --- West University Place ---
  '77005': { mult: 1.20, label: 'West University',  medianHome: 1418000 },

  // --- River Oaks / Memorial ---
  '77019': { mult: 1.20, label: 'River Oaks',      medianHome: 1200000 },
  '77024': { mult: 1.20, label: 'Memorial',        medianHome: 1104700 },
  '77056': { mult: 1.15, label: 'Tanglewood',      medianHome: 625600 },

  // --- Heights ---
  '77008': { mult: 1.12, label: 'The Heights',     medianHome: 635000 },
  '77009': { mult: 1.08, label: 'Heights East',    medianHome: 420000 },

  // --- Montrose ---
  '77006': { mult: 1.10, label: 'Montrose',        medianHome: 524800 },

  // --- Downtown / EaDo ---
  '77002': { mult: 0.97, label: 'Downtown',        medianHome: 308200 },
  '77003': { mult: 1.04, label: 'EaDo',            medianHome: 374100 },

  // --- Galleria ---
  '77057': { mult: 0.95, label: 'Galleria',        medianHome: 283500 },

  // --- Med Center / NRG ---
  '77030': { mult: 1.10, label: 'Med Center',      medianHome: 503000 },
  '77054': { mult: 0.90, label: 'NRG / Astrodome', medianHome: 210000 },

  // --- Clear Lake / NASA ---
  '77058': { mult: 0.92, label: 'Clear Lake',      medianHome: 257300 },
  '77059': { mult: 1.08, label: 'Clear Lake',      medianHome: 453300 },

  // --- Friendswood ---
  '77546': { mult: 1.10, label: 'Friendswood',     medianHome: 450000 },

  // --- Humble ---
  '77338': { mult: 0.90, label: 'Humble',          medianHome: 241300 },
  '77346': { mult: 0.98, label: 'Atascocita',      medianHome: 316900 },

  // --- Kingwood ---
  '77339': { mult: 0.95, label: 'Kingwood',        medianHome: 296500 },
  '77345': { mult: 1.07, label: 'Kingwood',        medianHome: 403100 },

  // --- Tomball ---
  '77375': { mult: 1.03, label: 'Tomball',         medianHome: 346800 },
  '77377': { mult: 1.07, label: 'Tomball',         medianHome: 405800 },

  // --- Conroe ---
  '77301': { mult: 0.90, label: 'Conroe',          medianHome: 240000 },
  '77302': { mult: 0.93, label: 'Conroe',          medianHome: 280000 },
  '77304': { mult: 0.98, label: 'Conroe',          medianHome: 324800 },

  // --- Pasadena ---
  '77502': { mult: 0.85, label: 'Pasadena',        medianHome: 195000 },
  '77503': { mult: 0.87, label: 'Pasadena',        medianHome: 210000 },
  '77504': { mult: 0.90, label: 'Pasadena',        medianHome: 235000 },

  // --- Baytown ---
  '77520': { mult: 0.88, label: 'Baytown',         medianHome: 220000 },
  '77521': { mult: 0.87, label: 'Baytown',         medianHome: 220100 },

  // --- Other premium areas (carried over) ---
  '77027': { mult: 1.15, label: 'Galleria / River Oaks', medianHome: 750000 },
  '77004': { mult: 1.04, label: 'Midtown',         medianHome: 370000 },
  '77007': { mult: 1.10, label: 'Washington Ave',  medianHome: 480000 },
  '77025': { mult: 1.06, label: 'Braeswood',       medianHome: 400000 },
  '77079': { mult: 1.08, label: 'Memorial West',   medianHome: 430000 },
  '77493': { mult: 1.00, label: 'Katy West',       medianHome: 330000 },
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

  if (BLAZE_WEBHOOK_URL) {
    try {
      fetch(BLAZE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    } catch (e) {}
  }

  // Open SMS to book
  var smsBody = 'Hi! I need a White Glove quote.\n'
    + 'Services: ' + selectedServices.join(', ') + '\n'
    + 'Crew: ' + s.whiteGloveCrew + ' | Hours: ' + s.whiteGloveHours + '\n'
    + (s.whiteGloveNotes ? 'Notes: ' + s.whiteGloveNotes : '');
  window.open('sms:3464015841?body=' + encodeURIComponent(smsBody), '_blank');
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
      var pctDiff = Math.round((data.mult - 1) * 100);
      var pctStr = pctDiff > 0 ? ' (+' + pctDiff + '%)' : pctDiff < 0 ? ' (' + pctDiff + '%)' : '';
      quoteState.zipLabel = data.label + pctStr;
      feedback.textContent = 'We serve ' + data.label + '!';
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

  if (quoteState.currentStep === 6) updateSummary();
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
  if (quoteState.currentStep === 6) updateSummary();

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

// ---- PDF GENERATION (Dark Royal Blue Theme) ----
function downloadQuotePDF() {
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var calc = calculateQuote();
  var s = quoteState;
  var W = 210;
  var serviceNames = { standard: 'Standard Clean', routine: 'Routine Clean', deep: 'Deep Clean' };
  var dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  var quoteNum = 'ACS-' + Date.now().toString(36).toUpperCase();

  // --- HEADER: Dark navy ---
  doc.setFillColor(6, 14, 26);
  doc.rect(0, 0, W, 58, 'F');
  doc.setFillColor(42, 90, 160);
  doc.rect(0, 58, W, 3, 'F');

  doc.setTextColor(240, 242, 245);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('ASTRO CLEANING SERVICES', 20, 22);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 195, 220);
  doc.text('322 Wilcrest Drive  |  Houston, Texas 77042', 20, 32);
  doc.text('(346) 401-5841  |  service@astrocleanings.com  |  astrocleanings.com', 20, 39);

  doc.setFontSize(9);
  doc.setTextColor(100, 160, 240);
  doc.text('Price Quote: #' + quoteNum, W - 20, 22, { align: 'right' });
  doc.setTextColor(180, 195, 220);
  doc.text('Issued: ' + dateStr, W - 20, 32, { align: 'right' });
  doc.text('Valid for 30 days', W - 20, 39, { align: 'right' });

  // --- CUSTOMER INFO ---
  var y = 72;
  doc.setFillColor(240, 245, 252);
  doc.rect(20, y - 6, W - 40, 38, 'F');
  doc.setDrawColor(42, 90, 160);
  doc.setLineWidth(0.3);
  doc.rect(20, y - 6, W - 40, 38);

  doc.setTextColor(6, 14, 26);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(s.leadName || 'Customer', 26, y + 2);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 90);
  var cy = y + 10;
  if (s.leadEmail) { doc.text(s.leadEmail, 26, cy); cy += 6; }
  if (s.leadAddress) {
    var addrLine = s.leadAddress;
    if (s.leadCity) addrLine += ', ' + s.leadCity;
    if (s.leadState) addrLine += ', ' + s.leadState;
    if (s.zipCode) addrLine += ' ' + s.zipCode;
    doc.text(addrLine, 26, cy); cy += 6;
  }
  if (s.leadPhone) { doc.text(s.leadPhone, 26, cy); }

  // --- SERVICE TABLE ---
  y = 118;
  doc.setFillColor(230, 238, 250);
  doc.rect(20, y, W - 40, 10, 'F');
  doc.setDrawColor(42, 90, 160);
  doc.setLineWidth(0.2);
  doc.line(20, y, W - 20, y);
  doc.line(20, y + 10, W - 20, y + 10);

  doc.setTextColor(6, 14, 26);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Product or Service', 26, y + 7);
  doc.text('Details', 105, y + 7);
  doc.text('Line Total', W - 26, y + 7, { align: 'right' });

  y += 14;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 40, 60);

  // Service line
  var svcName = serviceNames[s.serviceType] || s.serviceType;
  if (s.nextDay) svcName += ' (NEXT-DAY)';
  doc.setFont(undefined, 'bold');
  doc.text(svcName, 26, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 110);
  doc.text(s.sqft + ' sqft | ' + s.beds + ' bed / ' + s.baths + ' bath | ' + FREQ_LABELS[s.frequency], 26, y + 5);
  doc.setTextColor(30, 40, 60);
  doc.setFontSize(9);
  doc.text('$' + calc.basePrice.toFixed(2), W - 26, y, { align: 'right' });
  y += 14;

  if (s.frequencyMult < 1) {
    doc.setTextColor(34, 139, 34);
    doc.text(FREQ_LABELS[s.frequency] + ' discount', 26, y);
    doc.text('-$' + calc.freqSavings.toFixed(2), W - 26, y, { align: 'right' });
    doc.setTextColor(30, 40, 60);
    y += 8;
  }

  if (s.nextDay) {
    doc.text('Next-day rush premium (25%)', 26, y);
    doc.text('+$' + calc.nextDayCost.toFixed(2), W - 26, y, { align: 'right' });
    y += 8;
  }

  s.addons.forEach(function(a) {
    var names = { turnover: 'Airbnb/STR Turnover', moveout: 'Move In/Out Package', fridge: 'Inside Fridge', oven: 'Inside Oven', patio: 'Patio Cleaning', 'power-wash': 'Power Washing', grout: 'Grout Cleaning', 'ceiling-fans': 'Ceiling Fans' };
    doc.text(names[a] || a, 26, y);
    doc.text('+$' + (ADDONS[a] || 0).toFixed(2), W - 26, y, { align: 'right' });
    y += 8;
  });

  if (calc.windowCost > 0) {
    doc.text('Interior Windows (' + s.windowCount + ')' + (s.windowsHighReach ? ' + high-reach' : ''), 26, y);
    doc.text('+$' + calc.windowCost.toFixed(2), W - 26, y, { align: 'right' }); y += 8;
  }
  if (calc.petCost > 0) {
    doc.text('Pet surcharge (' + s.petCount + ')', 26, y);
    doc.text('+$' + calc.petCost.toFixed(2), W - 26, y, { align: 'right' }); y += 8;
  }
  if (calc.carpetCost > 0) {
    doc.text('Carpet Steam Clean (' + s.carpetSqft + ' sqft)', 26, y);
    doc.text('+$' + calc.carpetCost.toFixed(2), W - 26, y, { align: 'right' }); y += 8;
  }
  if (s.zipMultiplier !== 1.0 && s.zipLabel) {
    doc.text('Area adjustment (' + s.zipLabel.split(' (')[0] + ')', 26, y);
    doc.text((calc.zipAdjustment >= 0 ? '+' : '') + '$' + Math.abs(calc.zipAdjustment).toFixed(2), W - 26, y, { align: 'right' }); y += 8;
  }
  if (s.promoDiscount > 0) {
    doc.setTextColor(34, 139, 34);
    var promoAmt = Math.round(calc.total * s.promoDiscount / 100);
    doc.text('Promo: ' + s.promoCode + ' (-' + s.promoDiscount + '%)', 26, y);
    doc.text('-$' + promoAmt.toFixed(2), W - 26, y, { align: 'right' });
    doc.setTextColor(30, 40, 60);
    y += 8;
  }

  // Totals
  y += 4;
  doc.setDrawColor(42, 90, 160);
  doc.setLineWidth(0.5);
  doc.line(20, y, W - 20, y);
  y += 10;

  var finalTotal = s.promoDiscount > 0 ? Math.round(calc.total * (1 - s.promoDiscount / 100)) : calc.total;

  doc.setFillColor(6, 14, 26);
  doc.rect(90, y - 4, W - 110, 18, 'F');
  doc.setTextColor(240, 242, 245);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Total Price:', 96, y + 8);
  doc.setFontSize(14);
  doc.setTextColor(100, 160, 240);
  doc.text('$' + finalTotal.toFixed(2), W - 26, y + 8, { align: 'right' });

  y += 22;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 130);
  doc.text('Typical range: $' + calc.rangeLow + ' - $' + calc.rangeHigh + '  |  ~' + calc.hours + ' hours', 20, y);

  // --- CLEANING SCOPE ---
  y += 12;
  doc.setDrawColor(42, 90, 160);
  doc.setLineWidth(0.3);
  doc.line(20, y, W - 20, y);
  y += 8;
  doc.setTextColor(6, 14, 26);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Cleaning Scope', 20, y);
  y += 8;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 70, 90);

  var scope = (s.serviceType === 'deep') ? [
    'Everything in Standard, PLUS:',
    'Kitchen: Deep clean oven interior, inside fridge/freezer, cabinets inside/out, degrease backsplash',
    'Bathrooms: Deep scrub grout, descale fixtures, baseboards, detail behind toilets',
    'Interior windows (glass + tracks), door/wall faces, baseboards throughout',
    'Move furniture to clean behind, detail blinds, light switches, door frames'
  ] : [
    'Kitchen: Clean countertops, sink, appliance exteriors, stove, microwave, all floors',
    'Bathrooms: Sanitize toilets, clean showers/tubs, polish mirrors, wash sinks, mop floors',
    'Bedrooms: Dust surfaces, change bed linens, vacuum/mop floors, empty trash',
    'Living/Common: Dust surfaces, ceiling fans, window sills, blinds, vacuum/mop floors'
  ];

  scope.forEach(function(line) {
    var lines = doc.splitTextToSize('* ' + line, W - 46);
    lines.forEach(function(l) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(l, 24, y); y += 5;
    });
  });

  // Footer
  y = Math.max(y + 10, 274);
  if (y > 280) { doc.addPage(); y = 274; }
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 170);
  doc.text('Automated estimate. Final price confirmed after walkthrough. All work fully insured.', 20, y);
  doc.text('(346) 401-5841  |  service@astrocleanings.com  |  astrocleanings.com', 20, y + 4);
  doc.setFillColor(42, 90, 160);
  doc.rect(0, 294, W, 3, 'F');

  doc.save('Astro-Cleaning-Quote-' + quoteNum + '.pdf');
}

// ---- PROMO CODE SYSTEM ----
var PROMO_CODES = {
  'ASTRO15': 15,
  'FIRST15': 15,
  'CLEAN10': 10,
};

function applyPromo(code) {
  var upper = (code || '').toUpperCase().trim();
  if (PROMO_CODES[upper]) {
    quoteState.promoCode = upper;
    quoteState.promoDiscount = PROMO_CODES[upper];
    return true;
  }
  return false;
}

function showPromoPopup() {
  if (localStorage.getItem('astro_promo_shown')) return;
  setTimeout(function() {
    var overlay = document.getElementById('promoOverlay');
    if (overlay) {
      overlay.classList.add('active');
      // Auto-apply ASTRO15 when popup is shown
      applyPromo('ASTRO15');
    }
  }, 4000);
}

function closePromo() {
  var overlay = document.getElementById('promoOverlay');
  if (overlay) overlay.classList.remove('active');
  localStorage.setItem('astro_promo_shown', '1');
}

// ---- LEAD SUBMISSION ----
var BLAZE_WEBHOOK_URL = 'https://blaze.taildcd0ef.ts.net/webhook/quote';
var WIX_WEBHOOK_URL = '';  // Paste Wix automation webhook URL here once created
var ACS_PHONE = '3464015841';
var ACS_EMAIL = 'service@astrocleanings.com';

function buildLeadPayload() {
  var calc = calculateQuote();
  var s = quoteState;

  var addonList = [];
  s.addons.forEach(function(a) {
    addonList.push({ name: a, price: ADDONS[a] || 0 });
  });
  if (s.windowCount > 0) addonList.push({ name: 'Windows (' + s.windowCount + ')', price: calc.windowCost });
  if (s.hasPets) addonList.push({ name: 'Pets (' + s.petCount + ')', price: calc.petCost });
  if (s.carpetSqft > 0) addonList.push({ name: 'Carpet (' + s.carpetSqft + 'sqft)', price: calc.carpetCost });

  return {
    type: 'astro-quote-lead',
    name: s.leadName || '',
    phone: s.leadPhone || '',
    email: s.leadEmail || '',
    address: s.leadAddress || '',
    city: s.leadCity || 'Houston',
    state: s.leadState || 'TX',
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
}

function sendWebhook(url, payload) {
  if (!url) return;
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function() {});
  } catch (e) {}
}

function sendEmailNotification(lead) {
  var serviceNames = { standard: 'Standard Clean', routine: 'Routine Clean', deep: 'Deep Clean' };
  var subject = 'New Quote Request: ' + (lead.name || 'Website Visitor') + ' - $' + lead.estimate;
  var body = 'NEW LEAD from astrocleanings.com\n\n'
    + 'Name: ' + (lead.name || 'Not provided') + '\n'
    + 'Phone: ' + (lead.phone || 'Not provided') + '\n'
    + 'Email: ' + (lead.email || 'Not provided') + '\n'
    + 'Address: ' + (lead.address ? lead.address + ', ' + lead.city + ', ' + lead.state + ' ' + lead.zip : 'Not provided') + '\n\n'
    + 'Service: ' + (serviceNames[lead.serviceType] || lead.serviceType) + '\n'
    + 'Home: ' + lead.sqft + ' sqft, ' + lead.bedrooms + ' bed / ' + lead.bathrooms + ' bath\n'
    + 'Frequency: ' + (FREQ_LABELS[lead.frequency] || lead.frequency) + '\n'
    + 'Next-day: ' + (lead.nextDay ? 'Yes' : 'No') + '\n'
    + 'Estimate: $' + lead.estimate + ' ($' + lead.estimateRange.low + '-$' + lead.estimateRange.high + ')\n';

  if (lead.addons.length > 0) {
    body += 'Add-ons: ' + lead.addons.map(function(a) { return a.name + ' ($' + a.price + ')'; }).join(', ') + '\n';
  }

  // Open mailto as background notification
  var mailtoLink = 'mailto:' + ACS_EMAIL
    + '?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(body);

  // Use a hidden iframe to trigger mailto without navigating away
  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = mailtoLink;
  document.body.appendChild(iframe);
  setTimeout(function() { document.body.removeChild(iframe); }, 3000);
}

function submitQuoteLead() {
  var s = quoteState;

  // Validate — need at least a phone or email
  if (!s.leadPhone && !s.leadEmail) {
    var phoneInput = document.getElementById('qPhone');
    if (phoneInput) {
      phoneInput.style.borderColor = '#ef4444';
      phoneInput.focus();
      phoneInput.setAttribute('placeholder', 'Phone or email required');
    }
    return;
  }

  var lead = buildLeadPayload();

  // Fire webhooks (non-blocking)
  sendWebhook(BLAZE_WEBHOOK_URL, lead);
  sendWebhook(WIX_WEBHOOK_URL, lead);

  // Email notification fallback
  sendEmailNotification(lead);

  // Build SMS with pre-filled quote details
  var serviceNames = { standard: 'Standard', routine: 'Routine', deep: 'Deep Clean' };
  var smsBody = 'Hi! I just got a quote on astrocleanings.com.\n'
    + (s.leadName ? 'Name: ' + s.leadName + '\n' : '')
    + 'Service: ' + (serviceNames[s.serviceType] || s.serviceType) + '\n'
    + 'Home: ' + s.sqft + 'sqft, ' + s.beds + 'bd/' + s.baths + 'ba\n'
    + 'Estimate: $' + lead.estimate + '\n'
    + "I'd like to book!";

  // Show confirmation state
  var actions = document.querySelector('.summary-actions');
  if (actions) {
    actions.innerHTML = '<div class="booking-confirmed">'
      + '<div class="confirmed-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
      + '<h3 class="confirmed-title">Quote Submitted!</h3>'
      + '<p class="confirmed-sub">We\'ll reach out shortly to confirm your booking.</p>'
      + '<a href="sms:' + ACS_PHONE + '?body=' + encodeURIComponent(smsBody) + '" class="btn btn-primary btn-lg" style="margin-top:16px">'
      + '<span>Text Us to Confirm</span></a>'
      + '<p class="confirmed-note">Or call <a href="tel:' + ACS_PHONE + '" style="color:var(--accent-bright)">(346) 401-5841</a></p>'
      + '</div>';
  }
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

  // Show 15% off promo popup for first-time visitors
  showPromoPopup();
});
