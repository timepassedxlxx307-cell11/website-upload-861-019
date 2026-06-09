function initMoviePlayer(videoUrl) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playerButton");
    var hlsInstance = null;
    var loaded = false;

    function load() {
        if (!video || loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function play() {
        load();
        if (button) {
            button.classList.add("hide");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("hide");
            }
        });
        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) {
                button.classList.remove("hide");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}
