function applyFontSize(size) {
  document.body.classList.remove("font-normal", "font-large", "font-xlarge");
  document.body.classList.add(`font-${size}`);
  localStorage.setItem("slowKioskFontSize", size);

  document.querySelectorAll("[data-font-size]").forEach((button) => {
    button.classList.toggle("active", button.dataset.fontSize === size);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const savedSize = localStorage.getItem("slowKioskFontSize") || "normal";
  applyFontSize(savedSize);

  document.querySelectorAll("[data-font-size]").forEach((button) => {
    button.addEventListener("click", function () {
      applyFontSize(button.dataset.fontSize);
    });
  });
});