document.addEventListener("DOMContentLoaded", function () {
  const enableBlur = document.getElementById("enable-blur");
  const blurText = document.getElementById("blur-text");
  const blurImages = document.getElementById("blur-images");
  const blurVideos = document.getElementById("blur-videos");
  const autoUnblurPlaying = document.getElementById("auto-unblur-playing");
  const spotlightBlur = document.getElementById("spotlight-blur");
  const blurLevel = document.getElementById("blur-level");
  const blurValue = document.getElementById("blur-value");
  const blurOptions = document.getElementById("blur-options");
  const spotlightOptions = document.getElementById("spotlight-options");

  function applySettings(settings) {
    enableBlur.checked = settings.enabled;
    blurText.checked = settings.blurText;
    blurImages.checked = settings.blurImages;
    blurVideos.checked = settings.blurVideos;
    autoUnblurPlaying.checked = settings.autoUnblurPlaying !== false;
    spotlightBlur.checked = settings.spotlightBlur === true;
    blurLevel.value = settings.blurLevel;
    blurValue.textContent = settings.blurLevel + "px";
    toggleOptionsDisplay();
  }

  chrome.storage.local.get("blurSettings", function (data) {
    if (data.blurSettings) {
      applySettings(data.blurSettings);
    }
  });

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "local" && changes.blurSettings) {
      applySettings(changes.blurSettings.newValue);
    }
  });

  function saveSettings() {
    const settings = {
      enabled: enableBlur.checked,
      blurText: blurText.checked,
      blurImages: blurImages.checked,
      blurVideos: blurVideos.checked,
      autoUnblurPlaying: autoUnblurPlaying.checked,
      spotlightBlur: spotlightBlur.checked,
      blurLevel: parseInt(blurLevel.value),
    };

    chrome.storage.local.set({ blurSettings: settings });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateBlurSettings",
          settings: settings,
        });
      }
    });

    toggleOptionsDisplay();
  }

  function refreshTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  }

  function toggleOptionsDisplay() {
    if (enableBlur.checked) {
      blurOptions.classList.remove("disabled");
      spotlightBlur.disabled = true;
      enableBlur.disabled = false;
    } else if (spotlightBlur.checked) {
      blurOptions.classList.add("disabled");
      enableBlur.disabled = true;
      spotlightBlur.disabled = false;
    } else {
      blurOptions.classList.add("disabled");
      enableBlur.disabled = false;
      spotlightBlur.disabled = false;
    }
  }

  enableBlur.addEventListener("change", function () {
    if (enableBlur.checked) {
      spotlightBlur.checked = false;
    }
    saveSettings();
    toggleOptionsDisplay();
    refreshTab();
  });

  spotlightBlur.addEventListener("change", function () {
    if (spotlightBlur.checked) {
      enableBlur.checked = false;
    }
    saveSettings();
    toggleOptionsDisplay();
    refreshTab();
  });

  blurText.addEventListener("change", saveSettings);
  blurImages.addEventListener("change", saveSettings);
  blurVideos.addEventListener("change", saveSettings);
  autoUnblurPlaying.addEventListener("change", saveSettings);

  blurLevel.addEventListener("input", function () {
    blurValue.textContent = blurLevel.value + "px";
    saveSettings();
  });
});
