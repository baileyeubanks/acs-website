/* ============================================
   ASTRO CLEANING — V3 ANIMATIONS
   Lenis smooth scroll + Rivian-style reveals
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ---- LENIS SMOOTH SCROLL ----
  var lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ---- SCROLL REVEAL (Cinematic sequencing) ----
  var revealElements = document.querySelectorAll('.reveal');

  // Hero elements get special treatment — trigger immediately on load
  var heroReveals = document.querySelectorAll('.hero .reveal');
  heroReveals.forEach(function(el) {
    var delay = parseFloat(el.dataset.delay) || 0;
    setTimeout(function() {
      el.classList.add('visible');
    }, 200 + delay * 1000);
  });

  // Everything else — scroll triggered with professional rootMargin
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = parseFloat(entry.target.dataset.delay) || 0;
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, delay * 1000);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(function(el) {
    // Skip hero elements — they are handled above
    if (!el.closest('.hero')) {
      revealObserver.observe(el);
    }
  });

  // ---- NAV SCROLL BEHAVIOR ----
  var nav = document.getElementById('nav');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // ---- MOBILE NAV TOGGLE ----
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMobile.classList.toggle('open');
    });
  }

  // ---- COUNTER ANIMATION ----
  var counters = document.querySelectorAll('.trust-num[data-count]');

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(el) {
    counterObserver.observe(el);
  });

  function animateCounter(el) {
    var target = parseInt(el.dataset.count);
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // ---- SMOOTH SCROLL for anchor links (via Lenis) ----
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      }
    });
  });

  // ---- FLOATING PARTICLES ----
  var particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (var i = 0; i < 25; i++) {
      var p = document.createElement('div');
      p.classList.add('particle');
      p.style.left = Math.random() * 100 + '%';
      p.style.top = (Math.random() * 100 + 100) + '%';
      var size = (Math.random() * 2 + 1) + 'px';
      p.style.width = size;
      p.style.height = size;
      p.style.animationDuration = (Math.random() * 15 + 10) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      p.style.opacity = Math.random() * 0.4 + 0.15;
      particlesContainer.appendChild(p);
    }
  }

  // ---- VIDEO FALLBACK ----
  document.querySelectorAll('video').forEach(function(video) {
    video.addEventListener('error', function() {
      this.style.display = 'none';
    });
    var sources = video.querySelectorAll('source');
    sources.forEach(function(source) {
      source.addEventListener('error', function() {
        video.style.display = 'none';
      });
    });
  });

});

// ---- FAQ TOGGLE ----
function toggleFaq(btn) {
  var item = btn.parentElement;
  var answer = item.querySelector('.faq-answer');
  var isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
    openItem.classList.remove('open');
    openItem.querySelector('.faq-answer').style.maxHeight = '0';
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// ---- MOBILE NAV CLOSE ----
function closeMobile() {
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  if (navToggle) navToggle.classList.remove('active');
  if (navMobile) navMobile.classList.remove('open');
}

// ---- AMBIENT AUDIO TOGGLE ----
function toggleAudio() {
  var audio = document.getElementById('ambientAudio');
  var btn = document.getElementById('audioToggle');
  if (!audio || !btn) return;

  if (audio.paused) {
    audio.volume = 0.15;
    audio.play().then(function() {
      btn.classList.add('playing');
    }).catch(function() {
      // Autoplay blocked — ignore
    });
  } else {
    audio.pause();
    btn.classList.remove('playing');
  }
}

// ---- HERO LEAD CAPTURE → Scroll to Quote ----
function captureAndScroll(e) {
  e.preventDefault();

  var name = document.getElementById('heroName').value;
  var phone = document.getElementById('heroPhone').value;
  var email = document.getElementById('heroEmail').value;

  // Pre-fill the quote engine contact fields if they exist
  var qName = document.getElementById('qName');
  var qPhone = document.getElementById('qPhone');
  var qEmail = document.getElementById('qEmail');
  if (qName) qName.value = name;
  if (qPhone) qPhone.value = phone;
  if (qEmail) qEmail.value = email;

  // Store in quote state for submission
  if (typeof quoteState !== 'undefined') {
    quoteState.leadName = name;
    quoteState.leadPhone = phone;
    quoteState.leadEmail = email;
  }

  // Scroll to quote section
  var quoteSection = document.getElementById('quote');
  if (quoteSection && typeof lenis !== 'undefined') {
    // Lenis may not be accessible here, use fallback
    quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
