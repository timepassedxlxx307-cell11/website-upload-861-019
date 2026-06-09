(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
        });
    }

    var sliders = document.querySelectorAll("[data-hero-slider]");

    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

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

        function start() {
            if (timer || slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                stop();
                show(current);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function renderSearch(input) {
        var shell = input.closest(".search-shell");
        if (!shell) {
            return;
        }
        var results = shell.querySelector(".search-results");
        if (!results) {
            return;
        }
        var keyword = normalize(input.value);
        var data = Array.isArray(window.movieSearchData) ? window.movieSearchData : [];
        if (!keyword) {
            results.classList.remove("is-open");
            results.innerHTML = "";
            return;
        }
        var matches = data.filter(function (movie) {
            return normalize(movie.title + " " + movie.genre + " " + movie.tags + " " + movie.region + " " + movie.year).indexOf(keyword) !== -1;
        }).slice(0, 14);

        if (!matches.length) {
            results.innerHTML = '<div class="search-result-item"><div></div><div><div class="search-result-title">暂无匹配影片</div><div class="search-result-meta">换个片名、类型、年份或地区试试</div></div></div>';
            results.classList.add("is-open");
            return;
        }

        results.innerHTML = matches.map(function (movie) {
            return '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span>' +
                    '<span class="search-result-title">' + escapeHtml(movie.title) + '</span>' +
                    '<span class="search-result-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span>' +
                '</span>' +
            '</a>';
        }).join("");
        results.classList.add("is-open");
    }

    document.querySelectorAll(".global-search-input").forEach(function (input) {
        input.addEventListener("input", function () {
            renderSearch(input);
        });
        input.addEventListener("focus", function () {
            if (input.value.trim()) {
                renderSearch(input);
            }
        });
    });

    document.addEventListener("click", function (event) {
        document.querySelectorAll(".search-results.is-open").forEach(function (panel) {
            if (!panel.closest(".search-shell").contains(event.target)) {
                panel.classList.remove("is-open");
            }
        });
    });

    function filterCategory(scope) {
        var input = scope.querySelector(".category-filter-input");
        var activeGenre = scope.getAttribute("data-active-genre") || "all";
        var keyword = normalize(input ? input.value : "");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year"));
            var genre = normalize(card.getAttribute("data-genre"));
            var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesGenre = activeGenre === "all" || genre.indexOf(normalize(activeGenre)) !== -1;
            var show = matchesText && matchesGenre;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });
        var empty = scope.querySelector(".empty-filter");
        if (empty) {
            empty.classList.toggle("is-open", visible === 0);
        }
    }

    document.querySelectorAll("[data-category-scope]").forEach(function (scope) {
        var input = scope.querySelector(".category-filter-input");
        if (input) {
            input.addEventListener("input", function () {
                filterCategory(scope);
            });
        }
        scope.querySelectorAll("[data-genre-filter]").forEach(function (button) {
            button.addEventListener("click", function () {
                scope.setAttribute("data-active-genre", button.getAttribute("data-genre-filter") || "all");
                scope.querySelectorAll("[data-genre-filter]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                filterCategory(scope);
            });
        });
    });
})();
