(function () {
  function startPlayer(video, layer) {
    var url = video.getAttribute('data-hls');
    if (!url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
      video.play().catch(function () {});
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsReady) {
        var hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsReady = true;
      }
      video.play().catch(function () {});
    } else {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
      video.play().catch(function () {});
    }
    if (layer) {
      layer.classList.add('is-hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-video-player]');
    var layer = document.querySelector('[data-play-layer]');
    var button = document.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(video, layer);
      });
    }
    if (layer) {
      layer.addEventListener('click', function () {
        startPlayer(video, layer);
      });
    }
    video.addEventListener('click', function () {
      if (!video.getAttribute('src') && !video.hlsReady) {
        startPlayer(video, layer);
      }
    });
  });
})();
