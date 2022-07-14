import { qs } from "../helpers.js";
import { ACTION_KEY } from "../config.js";

class NavbarView {
  _parentElement = qs(".mobile-aside");
  _navContainer = qs(".nav-container");

  addNavbarMobileListener(handler) {
    this._parentElement.addEventListener("click", (e) => {
      ////////////////////////////////
      // I) Click on the burger menu
      ////////////////////////////////
      if (e.target.closest(".nav-toggle")) {
        // Open the list menu
        this._openList();
      }

      ///////////////////////////////////
      // II) Click on the add list button
      ///////////////////////////////////
      if (e.target.closest(".list-add--mobile")) {
        this._openList();
        handler("create");
      }
    });

    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    this._parentElement.addEventListener("keydown", (e) => {
      const activeEl = document.activeElement;
      /////////////////////////////////////////////
      // I) The active element is the burger menu
      /////////////////////////////////////////////
      if (activeEl.closest(".nav-toggle") && e.key === ACTION_KEY) {
        // Open the list menu
        this._openList();
      }

      ////////////////////////////////////////////////
      // I) The active element is the add list button
      ////////////////////////////////////////////////
      if (activeEl.closest(".list-add--mobile") && e.key === ACTION_KEY) {
        this._openList();
        handler("create");
      }
    });
  }

  _openList() {
    qs(".list-add--mobile").classList.toggle("hidden");
    qs(".content-container").classList.toggle("content-container--navbar-shown");
    this._navContainer.classList.toggle("nav-container--hidden");
    this._navContainer.classList.toggle("nav-container--shown-mobile");
    this._parentElement.classList.toggle("mobile-aside--lists-visible");
  }
}

export default new NavbarView();
