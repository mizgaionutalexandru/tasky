import { qs, qsa } from "../helpers.js";
import { ACTION_KEY, MOBILE_THRESHOLD } from "../config.js";

class NavbarView {
  _parentElement = qs(".mobile-aside");
  _navContainer = qs(".nav-container");
  _areListsShown = window.innerWidth <= MOBILE_THRESHOLD ? false : true;

  addNavbarMobileHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      ////////////////////////////////
      // I) Click on the burger menu
      ////////////////////////////////
      if (e.target.closest(".nav-toggle")) {
        if (this._areListsShown) {
          // Hide the lists
          this._makeListsNotTabbable();
          this._areListsShown = false;
        } else {
          // Show thet lists
          this._makeListsTabbable();
          this._areListsShown = true;
        }
        this._toggleList();
      }

      ///////////////////////////////////
      // II) Click on the add list button
      ///////////////////////////////////
      if (e.target.closest(".list-add--mobile")) {
        this._toggleList();
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
        if (this._areListsShown) {
          // Hide the lists
          this._makeListsNotTabbable();
          this._areListsShown = false;
        } else {
          // Show thet lists
          this._makeListsTabbable();
          this._areListsShown = true;
        }
        this._toggleList();
      }

      ////////////////////////////////////////////////
      // I) The active element is the add list button
      ////////////////////////////////////////////////
      if (activeEl.closest(".list-add--mobile") && e.key === ACTION_KEY) {
        if (this._areListsShown) {
          // Hide the lists
          this._makeListsNotTabbable();
          this._areListsShown = false;
        } else {
          // Show thet lists
          this._makeListsTabbable();
          this._areListsShown = false;
        }
        this._toggleList();
        handler("create");
      }
    });

    window.addEventListener("load", (e) => {
      if (window.innerWidth <= MOBILE_THRESHOLD && qs(".nav-container--hidden-mobile"))
        this._makeListsNotTabbable();
    });

    window.addEventListener("resize", (e) => {
      if (window.innerWidth <= MOBILE_THRESHOLD && qs(".nav-container--hidden-mobile"))
        this._makeListsNotTabbable();
      else this._makeListsTabbable();
    });
  }

  _toggleList() {
    qs(".list-add--mobile").classList.toggle("hidden");
    qs(".content-container").classList.toggle("content-container--navbar-shown");
    this._navContainer.classList.toggle("nav-container--hidden-mobile");
    this._navContainer.classList.toggle("nav-container--shown-mobile");
    this._parentElement.classList.toggle("mobile-aside--lists-visible");
  }

  _makeListsNotTabbable() {
    qsa(".list").forEach((list) => (list.tabIndex = "-1"));
    qs(".list-add").tabIndex = "-1";
  }

  _makeListsTabbable() {
    qsa(".list").forEach((list) => (list.tabIndex = "0"));
    qs(".list-add").tabIndex = "0";
  }
}

export default new NavbarView();
