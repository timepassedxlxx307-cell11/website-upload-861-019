import { H as Hls } from "./hls.js";

function bindPlayer(player) {
  var video = player.querySelector("video");
  var button = player.querySelector("[data-play-button]");
  var source = player.dataset.src;
  var hls = null;
  var initialized = false;

  if (!video || !source) {
    return;
  }

  function markPlaying() {
    if (button) {
      button.classList.add("is-hidden");
    }
  }

  function initialize() {
    if (initialized) {
      video.play().catch(function () {});
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    video.play().then(markPlaying).catch(function () {
      markPlaying();
    });
  }

  if (button) {
    button.addEventListener("click", initialize);
  }

  video.addEventListener("click", function () {
    if (!initialized) {
      initialize();
    }
  });

  video.addEventListener("play", markPlaying);

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll("[data-video-player]").forEach(bindPlayer);
