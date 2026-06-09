
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters(form) {
        var section = form.closest(".content-section") || document;
        var query = normalize(form.elements.q && form.elements.q.value);
        var region = normalize(form.elements.region && form.elements.region.value);
        var type = normalize(form.elements.type && form.elements.type.value);
        var year = normalize(form.elements.year && form.elements.year.value);
        var cards = section.querySelectorAll(".movie-card");

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var cardType = normalize(card.getAttribute("data-type"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.hidden = !matched;
        });
    }

    function readSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            if (document.querySelector("[data-search-page]")) {
                var q = readSearchQuery();
                if (q && form.elements.q) {
                    form.elements.q.value = q;
                }
            }
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilters(form);
            });
            form.addEventListener("input", function () {
                applyFilters(form);
            });
            form.addEventListener("change", function () {
                applyFilters(form);
            });
            applyFilters(form);
        });
    }

    window.setupPlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var hlsInstance = null;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function attachWithHls(Hls) {
            if (!Hls || !Hls.isSupported()) {
                video.src = streamUrl;
                playVideo();
                return;
            }
            if (hlsInstance) {
                hlsInstance.destroy();
            }
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
        }

        function loadStream() {
            if (attached) {
                playVideo();
                return;
            }
            attached = true;
            video.setAttribute("controls", "controls");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                attachWithHls(window.Hls);
                return;
            }

            window.addEventListener("hls-ready", function () {
                attachWithHls(window.Hls);
            }, { once: true });
        }

        function begin() {
            overlay.classList.add("is-hidden");
            loadStream();
        }

        overlay.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            } else {
                video.pause();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
