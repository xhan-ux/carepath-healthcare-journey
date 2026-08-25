const brand = document.querySelector(".brand");
const heroButton = document.querySelector(".hero-button");

brand?.addEventListener("click", (event) => {
  event.preventDefault();
  location.hash = "#home";
});

heroButton?.addEventListener("click", (event) => {
  event.preventDefault();
  location.hash = "#login";
});

if (location.hash === "#start") location.hash = "#home";
