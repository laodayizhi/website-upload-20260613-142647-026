(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-player-trigger]');
    var message = shell.querySelector('[data-player-message]');
    var src = shell.getAttribute('data-src');
    var hls = null;
    var loaded = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function hideOverlay() {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    }

    function playVideo() {
      if (!video || !src) {
        showMessage('视频源未配置，请检查 m3u8 地址。');
        return;
      }

      hideOverlay();

      if (loaded) {
        video.play().catch(function () {
          showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
        });
        return;
      }

      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage('视频加载失败，请刷新页面或稍后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
          });
        }, { once: true });
      } else {
        showMessage('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  });
})();
