(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, pos) {
                    slide.classList.toggle("active", pos === current);
                });
                dots.forEach(function (dot, pos) {
                    dot.classList.toggle("active", pos === current);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    window.clearInterval(timer);
                    show(index);
                    start();
                });
            });

            show(0);
            start();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-card-search]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll(".filter-button"));
            var clear = panel.querySelector("[data-clear-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-state");
            var activeQuery = "";

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var typed = input ? normalize(input.value) : "";
                var chip = normalize(activeQuery);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matched = (!typed || haystack.indexOf(typed) !== -1) && (!chip || haystack.indexOf(chip) !== -1);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    button.classList.add("active");
                    activeQuery = button.getAttribute("data-query") || "";
                    apply();
                });
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    activeQuery = "";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", !item.getAttribute("data-query"));
                    });
                    apply();
                });
            }

            apply();
        });
    });
})();
