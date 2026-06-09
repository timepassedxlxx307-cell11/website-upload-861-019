(function () {
    function showMessage(element, text) {
        if (!element) {
            return;
        }
        element.textContent = text;
        element.classList.add("is-open");
        window.setTimeout(function () {
            element.classList.remove("is-open");
        }, 3600);
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var message = document.getElementById(options.messageId);
        var source = options.source;
        var started = false;
        var hls = null;

        if (!video || !button || !source) {
            return;
        }

        function begin() {
            if (started) {
                video.play().catch(function () {
                    showMessage(message, "点击视频区域继续播放");
                });
                return;
            }
            started = true;
            button.classList.add("is-hidden");
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {
                        showMessage(message, "点击视频区域继续播放");
                    });
                }, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        showMessage(message, "点击视频区域继续播放");
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showMessage(message, "播放暂时不可用，请稍后重试");
                    }
                });
                return;
            }

            showMessage(message, "播放暂时不可用，请稍后重试");
        }

        button.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
