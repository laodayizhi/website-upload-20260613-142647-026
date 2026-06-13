(function () {
  var roots = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  roots.forEach(function (root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var message = root.querySelector('[data-player-message]');
    var source = root.getAttribute('data-video-src');
    var hlsInstance = null;
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function bindSource() {
      if (!video || !source || initialized) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setMessage('当前浏览器暂不支持此视频播放');
      }
    }

    function playVideo() {
      bindSource();
      if (!video) {
        return;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
          setMessage('');
        }).catch(function () {
          setMessage('点击视频区域可继续播放');
        });
      } else if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && !video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
