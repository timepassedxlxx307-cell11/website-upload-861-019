(function () {
    var body = document.body;
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === active);
            slide.setAttribute("aria-hidden", i === active ? "false" : "true");
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === active);
            dot.setAttribute("aria-current", i === active ? "true" : "false");
        });
    }

    function startHero() {
        if (!slides.length) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            setHero(active + 1);
        }, 5600);
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            setHero(i);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            setHero(active - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            setHero(active + 1);
            startHero();
        });
    }

    setHero(0);
    startHero();

    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    filterForms.forEach(function (form) {
        var scopeSelector = form.getAttribute("data-filter-scope") || "body";
        var scope = document.querySelector(scopeSelector) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var empty = scope.querySelector("[data-empty]");
        var controls = Array.prototype.slice.call(form.querySelectorAll("input, select"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matchCard(card) {
            var keywordControl = form.querySelector("[name='q']");
            var yearControl = form.querySelector("[name='year']");
            var typeControl = form.querySelector("[name='type']");
            var regionControl = form.querySelector("[name='region']");
            var keyword = normalize(keywordControl ? keywordControl.value : "");
            var year = normalize(yearControl ? yearControl.value : "");
            var type = normalize(typeControl ? typeControl.value : "");
            var region = normalize(regionControl ? regionControl.value : "");
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year")
            ].join(" "));

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }

            if (year && normalize(card.getAttribute("data-year")) !== year) {
                return false;
            }

            if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
                return false;
            }

            if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
                return false;
            }

            return true;
        }

        function applyFilter() {
            var shown = 0;

            cards.forEach(function (card) {
                var ok = matchCard(card);
                card.classList.toggle("is-hidden", !ok);

                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        controls.forEach(function (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });

        applyFilter();
    });

    var quickForm = document.querySelector("[data-quick-search]");

    if (quickForm) {
        quickForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = quickForm.querySelector("input");
            var value = input ? input.value.trim() : "";
            var target = "search.html";

            if (value) {
                target += "?q=" + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    }

    var searchInput = document.querySelector("[data-auto-query]");

    if (searchInput && window.location.search) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q) {
            searchInput.value = q;
            searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    var player = document.querySelector(".video-player");
    var overlay = document.querySelector(".player-overlay");
    var message = document.querySelector(".player-message");
    var hlsInstance = null;
    var started = false;

    function setPlayerMessage(text) {
        if (message) {
            message.textContent = text || "";
        }
    }

    function startPlayer() {
        if (!player || started) {
            return;
        }

        var url = player.getAttribute("data-play");

        if (!url) {
            setPlayerMessage("播放暂不可用，请稍后再试");
            return;
        }

        started = true;

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        setPlayerMessage("");

        if (player.canPlayType("application/vnd.apple.mpegurl")) {
            player.src = url;
            player.play().catch(function () {
                setPlayerMessage("点击视频区域继续播放");
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(player);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                player.play().catch(function () {
                    setPlayerMessage("点击视频区域继续播放");
                });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setPlayerMessage("播放暂不可用，请稍后再试");
                }
            });
            return;
        }

        setPlayerMessage("播放暂不可用，请稍后再试");
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayer);
    }

    if (player) {
        player.addEventListener("click", function () {
            if (!started) {
                startPlayer();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    body.classList.add("ready");
})();
