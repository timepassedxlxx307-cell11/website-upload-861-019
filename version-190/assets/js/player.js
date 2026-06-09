(function () {
    function formatTime(value) {
        if (!Number.isFinite(value)) {
            return '00:00';
        }

        var minutes = Math.floor(value / 60);
        var seconds = Math.floor(value % 60);

        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    window.initializePlayer = function (streamUrl) {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
        var muteButton = document.querySelector('[data-player-mute]');
        var progress = document.querySelector('[data-player-progress]');
        var time = document.querySelector('[data-player-time]');
        var fullscreen = document.querySelector('[data-player-fullscreen]');
        var attached = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attachStream();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener('click', play);
        });

        video.addEventListener('click', togglePlay);

        video.addEventListener('play', function () {
            playButtons.forEach(function (button) {
                button.textContent = '播放中';
            });
        });

        video.addEventListener('pause', function () {
            playButtons.forEach(function (button) {
                button.textContent = '播放';
            });
        });

        video.addEventListener('timeupdate', function () {
            if (progress && video.duration) {
                progress.value = (video.currentTime / video.duration) * 100;
            }

            if (time) {
                time.textContent = formatTime(video.currentTime);
            }
        });

        if (progress) {
            progress.addEventListener('input', function () {
                if (video.duration) {
                    video.currentTime = (Number(progress.value) / 100) * video.duration;
                }
            });
        }

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullscreen && shell) {
            fullscreen.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
