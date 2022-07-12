"use strict";

// New Item Input - make it stretch as it gets more content
const input = document.querySelector(".item__label__input");
input.addEventListener("input", () => {
  input.style.width = "0px";
  input.style.width = input.scrollWidth + "px";
});
