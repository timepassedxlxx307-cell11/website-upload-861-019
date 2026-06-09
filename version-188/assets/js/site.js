(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("#heroCarousel");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
            var current = 0;
            var showSlide = function (index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var typeSelect = panel.querySelector("[data-type-filter]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var items = Array.prototype.slice.call(panel.querySelectorAll(".searchable-item"));
            var empty = panel.querySelector(".no-results");
            var filterItems = function () {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = [
                        item.getAttribute("data-title") || "",
                        item.getAttribute("data-tags") || "",
                        item.getAttribute("data-region") || "",
                        item.getAttribute("data-year") || "",
                        item.getAttribute("data-type") || ""
                    ].join(" ").toLowerCase();
                    var typeOk = !typeValue || (item.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
                    var yearOk = !yearValue || (item.getAttribute("data-year") || "") === yearValue;
                    var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                    var match = typeOk && yearOk && keywordOk;
                    item.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            if (input) {
                input.addEventListener("input", filterItems);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", filterItems);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", filterItems);
            }
        });
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !sourceUrl) {
        return;
    }
    var hlsInstance = null;
    var sourceReady = false;
    var prepare = function () {
        if (sourceReady) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
        sourceReady = true;
    };
    var begin = function () {
        prepare();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    };
    prepare();
    if (overlay) {
        overlay.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            begin();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
