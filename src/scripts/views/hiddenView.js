import { qs } from "./../helpers.js";
import { ACTION_KEY, MOBILE_NAVBAR_THRESHOLD } from "./../config.js";

class HiddenView {
  _container = qs(".hidden-container");

  constructor() {
    this._container.addEventListener("keydown", (e) => {
      if (e.key === ACTION_KEY) {
        e.preventDefault();
        const firstItem = qs(".item");
        if (firstItem) return firstItem.focus();
        const addItemButton = qs(".item-add");
        if (addItemButton) return addItemButton.focus();
        if (window.innerWidth <= MOBILE_NAVBAR_THRESHOLD)
          return qs(".list-add--mobile").focus();
        else return qs(".list-add").focus();
      }
    });
  }
}

export default new HiddenView();
