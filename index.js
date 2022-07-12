"use strict";

// New List Input - make it stretch as it gets more content
const listInput = document.querySelector(".list__name__input");
listInput.addEventListener("input", () => {
  listInput.style.width = "0px";
  listInput.style.width = listInput.scrollWidth + "px";
});

// New Item Input - make it stretch as it gets more content
const itemInput = document.querySelector(".item__label__input");
itemInput.addEventListener("input", () => {
  itemInput.style.width = "0px";
  itemInput.style.width = itemInput.scrollWidth + "px";
});

// Data Model
/*
    const data = {
        listName: [
            {
                completed: true/false,
                content: text
            }
        ]
    }
*/
