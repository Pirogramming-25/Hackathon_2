(function () {
  const sizes = ["normal", "large", "xlarge"];
  const storageKey = "slowKioskFontSize";

  function getSafeSize(size) {
    return sizes.includes(size) ? size : "normal";
  }

  function applyFontSize(size) {
    const selectedSize = getSafeSize(size);
    const classNames = sizes.map((item) => `font-${item}`);

    document.documentElement.classList.remove(...classNames);
    document.documentElement.classList.add(`font-${selectedSize}`);

    if (document.body) {
      document.body.classList.remove(...classNames);
      document.body.classList.add(`font-${selectedSize}`);
    }

    localStorage.setItem(storageKey, selectedSize);

    document.querySelectorAll("[data-font-size]").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-font-size") === selectedSize);
    });
  }

  function initFontSizeControl() {
    applyFontSize(localStorage.getItem(storageKey));

    document.querySelectorAll("[data-font-size]").forEach((button) => {
      button.addEventListener("click", function () {
        applyFontSize(button.getAttribute("data-font-size"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFontSizeControl);
  } else {
    initFontSizeControl();
  }
})();
