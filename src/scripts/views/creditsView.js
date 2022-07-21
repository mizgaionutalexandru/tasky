import { qs, qsa } from "./../helpers.js";
import { ACTION_KEY, OPTIONS_KEY } from "./../config.js";

class CreditsView {
  _creditsContainer = qs(".credits");
  _creditsButton = qs(".credits__title");
  _areCreditsShown = false;

  constructor() {
    this._creditsButton.addEventListener("click", () => {
      if (this._areCreditsShown) this._hideCredits();
      else this._showCredits();
    });

    this._creditsContainer.addEventListener("keydown", (e) => {
      const activeEl = document.activeElement;

      // If the focused element is the 'credits' title
      if (
        activeEl.classList.contains("credits__title") &&
        (e.key === ACTION_KEY || e.key === OPTIONS_KEY)
      )
        if (this._areCreditsShown) return this._hideCredits();
        else return this._showCredits();

      // If there is another element active inside the container
      if (activeEl.closest(".credits") && e.key === OPTIONS_KEY) {
        this._hideCredits();
        this._creditsButton.focus();
        return;
      }
    });
  }

  _showCredits() {
    this._areCreditsShown = true;
    this._creditsContainer.classList.toggle("credits--hidden");
    qsa(".credits-link").forEach((a) => {
      a.tabIndex = "0";
    });
  }

  _hideCredits() {
    this._areCreditsShown = false;
    this._creditsContainer.classList.toggle("credits--hidden");
    qsa(".credits-link").forEach((a) => {
      a.tabIndex = "-1";
    });
  }
}

export default new CreditsView();
