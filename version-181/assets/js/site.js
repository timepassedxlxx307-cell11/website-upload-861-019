(function () {
  var root = document.body ? document.body.dataset.siteRoot || "" : "";
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (toggle && mobilePanel) {
    toggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  });

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = searchPage.querySelector("input[name='q']");
    var output = searchPage.querySelector("[data-search-results]");

    if (input) {
      input.value = query;
    }

    function renderResults(items) {
      if (!output) {
        return;
      }
      if (!query) {
        output.innerHTML = '<div class="empty-state">输入片名、地区、年份、类型或标签后即可搜索。</div>';
        return;
      }
      var lowered = query.toLowerCase();
      var results = items.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return haystack.indexOf(lowered) !== -1;
      }).slice(0, 80);

      if (!results.length) {
        output.innerHTML = '<div class="empty-state">没有找到匹配结果，可以换一个关键词继续搜索。</div>';
        return;
      }

      output.innerHTML = '<div class="movie-grid">' + results.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
          '    <h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("") + '</div>';
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    fetch(root + "assets/data/search-index.json")
      .then(function (response) {
        return response.json();
      })
      .then(renderResults)
      .catch(function () {
        if (output) {
          output.innerHTML = '<div class="empty-state">搜索数据暂时无法加载。</div>';
        }
      });
  }
})();
