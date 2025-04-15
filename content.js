let blurSettings = {
    enabled: false,
    blurText: true,
    blurImages: true,
    blurVideos: true,
    autoUnblurPlaying: true,
    spotlightBlur: false,
    blurLevel: 5,
  };
  
  chrome.storage.local.get('blurSettings', function (data) {
    if (data.blurSettings) {
      blurSettings = data.blurSettings;
      applyBlurEffects();
      setupVideoMonitoring();
      toggleSpotlight(blurSettings.spotlightBlur);
    }
  });
  
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'updateBlurSettings') {
      blurSettings = message.settings;
      applyBlurEffects();
      setupVideoMonitoring();
      toggleSpotlight(blurSettings.spotlightBlur);
    }
    sendResponse({ status: 'success' });
    return true;
  });
  
  function setupVideoMonitoring() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach((video) => {
      video.addEventListener('play', () => {
        toggleSpotlight(false);
      });
  
      video.addEventListener('pause', () => {
        toggleSpotlight(true);
      });
  
      video.addEventListener('ended', () => {
        toggleSpotlight(true);
      });
    });
  }
  
  function applyBlurEffects() {
    const overlay = document.querySelector('.blur-extension-spotlight-overlay');
  
    if (overlay) {
      overlay.remove();
    }
  
    document
      .querySelectorAll('.blur-extension-text, .blur-extension-image, .blur-extension-video')
      .forEach((el) => {
        if (!el.classList.contains('blur-extension-playing')) el.style.filter = '';
        el.classList.remove('blur-extension-text', 'blur-extension-image', 'blur-extension-video');
      });
  
    if (!blurSettings.enabled || blurSettings.spotlightBlur) return;
  
    const blurValue = `blur(${blurSettings.blurLevel}px)`;

    if (blurSettings.blurText) {
      document
        .querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, div:not(:has(*))')
        .forEach((el) => {
          if (el.textContent.trim() !== '') {
            el.classList.add('blur-extension-text');
            el.style.filter = blurValue;
          }
        });
    }
  
    if (!blurSettings.spotlightBlur) {
      if (blurSettings.blurImages) {
        document.querySelectorAll('img, svg, canvas').forEach((el) => {
          el.classList.add('blur-extension-image');
          el.style.filter = blurValue;
        });
      }
  
      if (blurSettings.blurVideos) {
        document
          .querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]')
          .forEach((el) => {
            el.classList.add('blur-extension-video');
            if (el.tagName === 'VIDEO' && !el.paused && el.readyState > 2 && blurSettings.autoUnblurPlaying) {
              el.classList.add('blur-extension-playing');
            } else {
              el.style.filter = blurValue;
            }
          });
      }
    }
  }
  
  function toggleSpotlight(enable) {
    let overlay = document.querySelector('.blur-extension-spotlight-overlay');
    if (enable) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'blur-extension-spotlight-overlay';
        document.body.appendChild(overlay);
  
        document.addEventListener('mousemove', updateMousePosition);
      }
    } else {
      if (overlay) {
        overlay.remove();
      }
      document.removeEventListener('mousemove', updateMousePosition);
    }
  }
  
  function updateMousePosition(e) {
    const overlay = document.querySelector('.blur-extension-spotlight-overlay');
    if (!overlay) return;
  
    const blurValue = `${blurSettings.blurLevel || 5}px`;
    const radius = 150;
  
    const x = e.clientX;
    const y = e.clientY;
  
    overlay.style.webkitMaskImage =
      `radial-gradient(circle ${radius}px at ${x}px ${y}px, transparent 0%, black 100%)`;
    overlay.style.backdropFilter = `blur(${blurValue})`;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    applyBlurEffects();
    setupVideoMonitoring();
    toggleSpotlight(blurSettings.spotlightBlur);
  });
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyBlurEffects();
    setupVideoMonitoring();
    toggleSpotlight(blurSettings.spotlightBlur);
  }
  
  const observer = new MutationObserver(() => {
    if (blurSettings.enabled) {
      applyBlurEffects();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  