(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-video-status]");
            var source = player.getAttribute("data-src");
            var hlsInstance = null;

            function showStatus(message) {
                if (!status) {
                    return;
                }
                status.textContent = message || "";
                status.classList.toggle("is-visible", Boolean(message));
            }

            function bindSource() {
                if (!video || !source) {
                    showStatus("当前视频源暂不可用");
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        showStatus("");
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            showStatus("网络波动，正在重新加载视频");
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            showStatus("媒体解析异常，正在恢复播放");
                            hlsInstance.recoverMediaError();
                        } else {
                            showStatus("视频加载失败，请刷新后重试");
                            hlsInstance.destroy();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    showStatus("");
                } else {
                    showStatus("当前浏览器暂不支持该播放格式");
                }
            }

            function playVideo() {
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        showStatus("请再次点击播放按钮或视频区域开始播放");
                    });
                }
            }

            function toggleVideo() {
                if (!video) {
                    return;
                }
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            }

            bindSource();

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    playVideo();
                });
            }

            if (video) {
                video.addEventListener("click", toggleVideo);
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                    showStatus("");
                });
                video.addEventListener("pause", function () {
                    player.classList.remove("is-playing");
                });
                video.addEventListener("ended", function () {
                    player.classList.remove("is-playing");
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
