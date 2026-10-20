(function () {
  "use strict";

  var CONSENT_KEY = "relay_consent";
  var CONSENT_VERSION = 1;

  var PLANS = {
    monthly: { price: "$9.99", per: "/ month", was: "$19.99", note: "a month, billed monthly" },
    yearly: { price: "$99.99", per: "/ year", was: "$199.99", note: "a year, billed yearly" },
  };

  function config() {
    return window.RELAY_CONFIG || {};
  }

  function readConsent() {
    try {
      var stored = JSON.parse(window.localStorage.getItem(CONSENT_KEY));
      if (stored && stored.v === CONSENT_VERSION) return stored;
    } catch (error) {}
    return null;
  }

  function writeConsent(choice) {
    var record = {
      v: CONSENT_VERSION,
      analytics: Boolean(choice.analytics),
      marketing: Boolean(choice.marketing),
      at: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch (error) {}
    return record;
  }

  function loadScript(src) {
    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  var loaded = { analytics: false, marketing: false };

  function loadGoogleAnalytics(id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id));
  }

  function loadMetaPixel(id) {
    if (window.fbq) return;
    var fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = window._fbq = fbq;
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  function applyConsent(consent) {
    if (!consent) return;
    var settings = config();
    if (consent.analytics && settings.gaMeasurementId && !loaded.analytics) {
      loaded.analytics = true;
      loadGoogleAnalytics(settings.gaMeasurementId);
    }
    if (consent.marketing && settings.metaPixelId && !loaded.marketing) {
      loaded.marketing = true;
      loadMetaPixel(settings.metaPixelId);
    }
  }

  function panels(kind) {
    return document.querySelectorAll('[data-consent="' + kind + '"]');
  }

  function show(kind, visible) {
    Array.prototype.forEach.call(panels(kind), function (panel) {
      panel.hidden = !visible;
    });
  }

  function toggles() {
    return document.querySelectorAll("[data-consent-toggle]");
  }

  function syncToggles(consent) {
    Array.prototype.forEach.call(toggles(), function (input) {
      input.checked = Boolean(consent && consent[input.getAttribute("data-consent-toggle")]);
    });
  }

  function choiceFromToggles() {
    var choice = { analytics: false, marketing: false };
    Array.prototype.forEach.call(toggles(), function (input) {
      choice[input.getAttribute("data-consent-toggle")] = input.checked;
    });
    return choice;
  }

  function decide(choice) {
    var previous = readConsent();
    var record = writeConsent(choice);
    show("banner", false);
    show("prefs", false);
    var withdrawn =
      previous &&
      ((previous.analytics && !record.analytics) || (previous.marketing && !record.marketing));
    if (withdrawn && (loaded.analytics || loaded.marketing)) {
      window.location.reload();
      return;
    }
    applyConsent(record);
  }

  function openSettings() {
    syncToggles(readConsent());
    show("banner", false);
    show("prefs", true);
    var first = document.querySelector('[data-consent="prefs"] input:not([disabled])');
    if (first) first.focus();
  }

  function closeSettings() {
    show("prefs", false);
    if (!readConsent()) show("banner", true);
  }

  function setBilling(period) {
    var plan = PLANS[period];
    Object.keys(plan).forEach(function (key) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-plan="' + key + '"]'), function (node) {
        node.textContent = plan[key];
      });
    });
    [
      ["setMonthly", "monthly"],
      ["setYearly", "yearly"],
    ].forEach(function (pair) {
      var button = document.querySelector('[data-action="' + pair[0] + '"]');
      if (!button) return;
      var active = pair[1] === period;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.style.background = active ? "#0D0F22" : "transparent";
      button.style.color = active ? "#FFFFFF" : "#0D0F22";
    });
  }

  var ACTIONS = {
    acceptAll: function () {
      decide({ analytics: true, marketing: true });
    },
    rejectAll: function () {
      decide({ analytics: false, marketing: false });
    },
    saveChoices: function () {
      decide(choiceFromToggles());
    },
    customize: openSettings,
    openCookieSettings: openSettings,
    setMonthly: function () {
      setBilling("monthly");
    },
    setYearly: function () {
      setBilling("yearly");
    },
  };

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = ACTIONS[target.getAttribute("data-action")];
    if (action) {
      event.preventDefault();
      action();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var open = document.querySelector('[data-consent="prefs"]:not([hidden])');
    if (open) closeSettings();
  });

  var consent = readConsent();
  if (consent) {
    applyConsent(consent);
  } else {
    show("banner", true);
  }
})();
