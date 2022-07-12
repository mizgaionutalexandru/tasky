import { qs, qsa } from "./helpers.js";
import { ACTION_KEY } from "./config.js";

class ListsView {
  _parentElement = qs(".nav-container");
  _listsContainer = qs(".lists");
  _isNewListInputOpen = false;
  _data;

  addHandlerClick(handler) {
    this._parentElement.addEventListener("click", (e) => {
      // 1) CLICK on 'create new list' button
      if (e.target.closest(".list-add")) return this._addNewListAction(handler);
    });

    this._parentElement.addEventListener("keydown", (e) => {
      // 1) ACTION KEY when the focused element is 'create new list' button
      if (document.activeElement.closest(".list-add") && e.key === ACTION_KEY)
        return this._addNewListAction(handler);
      // 1) Enter key when the focused element is 'new list' input
      if (document.activeElement.classList.contains("list__name__input")) {
        if (e.key === "Enter") {
          this._isNewListInputOpen = false;
          return this._saveListName(handler);
        } else if (e.key === "Escape") {
          this._isNewListInputOpen = false;
          return this._cancelNewList();
        }
      }
    });
  }

  _saveListName(handler) {
    handler("save", {
      status: "new",
      name: qs(".list__name__input").value,
    });
  }

  _cancelNewList() {
    qs(".list--new").remove();
  }

  /**
   * Function called when user engages 'add new list' button.
   * It creates a new list and saves the name of the previous one if it exists as an input
   * by calling the handler function
   */
  _addNewListAction(handler) {
    if (this._isNewListInputOpen)
      handler("save", {
        status: "new",
        name: qs(".list__name__input").value,
      });
    handler("create");
  }

  renderNewList() {
    this._isNewListInputOpen = true;
    const markup = `
    <li tabindex="0" class="list list--new">
        <span class="list__name">
            <input class="list__name__input" type="text">
        </span>
        <span class="list__options-cta">
            <svg  class="list__options-cta__svg" viewBox="0 0 6 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2.74725" cy="2.74725" r="2.74725" fill="black" fill-opacity="0.6"/>
                <circle cx="2.74725" cy="10" r="2.74725" fill="black" fill-opacity="0.6"/>
                <circle cx="2.74725" cy="17.2527" r="2.74725" fill="black" fill-opacity="0.6"/>
            </svg>
        </span>
        <ul class="list__options">
            <li class="list__option">
                <span class="list__option__name">Modify</span>
                <svg class="list__option__icon--modify"  viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.23 0.448832C12.1034 0.47344 11.882 0.5543 11.7378 0.624613C11.4847 0.74766 11.3652 0.860159 8.58079 3.64102C6.24993 5.96836 5.6804 6.55196 5.64173 6.66797C5.5679 6.87188 5.08274 9.16758 5.06517 9.375C5.05462 9.51563 5.06868 9.57539 5.13548 9.67383C5.27259 9.87422 5.43431 9.96211 5.63821 9.94805C5.84563 9.93047 8.14134 9.44532 8.34524 9.37149C8.46126 9.33282 9.04837 8.75977 11.3722 6.43242C14.132 3.66211 14.262 3.52852 14.3851 3.27539C14.5257 2.99414 14.6206 2.62149 14.6206 2.36133C14.6206 2.09766 14.5257 1.725 14.3886 1.4543C13.9949 0.677347 13.0984 0.258987 12.23 0.448832ZM13.0351 1.62305C13.3199 1.76719 13.4745 2.03086 13.4745 2.36133C13.4745 2.66719 13.4042 2.79375 12.9894 3.20508L12.6519 3.53907L12.0648 2.94844L11.4741 2.36133L11.8081 2.02383C12.1421 1.68633 12.2616 1.59844 12.4585 1.54922C12.6097 1.51055 12.8874 1.54571 13.0351 1.62305ZM9.84993 6.34102L7.85306 8.33789L7.11829 8.4961C6.71399 8.58399 6.37649 8.65078 6.36946 8.64375C6.36243 8.63672 6.42923 8.29922 6.51712 7.89492L6.67532 7.16016L8.66868 5.1668L10.6656 3.16992L11.2527 3.75703L11.8433 4.34766L9.84993 6.34102Z" fill="#0075FF"/>
                    <path d="M0.769114 2.70234C0.421067 2.82188 0.164427 3.08555 0.0519267 3.43711C-0.00080768 3.5918 -0.00432331 4.12266 0.00270794 8.90039L0.0132548 14.1914L0.132786 14.4129C0.26638 14.659 0.375364 14.7645 0.642552 14.9051L0.821849 15H6.18318H11.5445L11.766 14.8805C12.0121 14.7469 12.1176 14.6379 12.2582 14.3707L12.3531 14.1914L12.3636 11.2277C12.3742 7.92305 12.3883 8.11641 12.1316 7.92305C11.9523 7.78594 11.664 7.78594 11.4847 7.92305C11.2316 8.11641 11.2457 7.94414 11.2457 11.0766V13.8926H6.18318H1.12068V8.83008V3.76758H3.93669C7.06911 3.76758 6.89685 3.78164 7.09021 3.52852C7.22732 3.34922 7.22732 3.06094 7.09021 2.88164C6.89685 2.62852 7.08318 2.64258 3.83825 2.64258C1.28591 2.64609 0.906224 2.65313 0.769114 2.70234Z" fill="#0075FF"/>
                </svg>
            </li>
            <li class="list__option">
                <span class="list__option__name">Delete</span>
                <svg class="list__option__icon--delete"  viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6.83333V13.8333M10.9167 6.83333L10.3333 13.8333M5.08333 6.83333L5.66667 13.8333M5.66667 3.33333L6.25 1H9.75L10.3333 3.33333M15 3.33333H2.16667L3.33333 17.3333H12.6667L13.8333 3.33333H1H15Z" stroke="#FF0000" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>                            
            </li>
        </ul>
    </li>`;
    this._listsContainer.insertAdjacentHTML("beforeend", markup);

    // New List Input - make it stretch as it gets more content
    const listInput = qs(".list__name__input");
    listInput.focus();
    listInput.addEventListener("input", () => {
      listInput.style.width = "0px";
      listInput.style.width = listInput.scrollWidth + "px";
    });
  }

  update(data) {
    this._data = data;
    this._listsContainer.innerHTML = "";
    let markup = "";
    this._data.forEach((list) => {
      markup += this._getListMarkup(list);
    });
    this._listsContainer.insertAdjacentHTML("beforeend", markup);
  }

  _getListMarkup(list) {
    return `
    <li tabindex="0" data-name="list_[${list.name}]" class="list ${
      list.active ? "list--active" : ""
    }">
        <span class="list__name">${list.name}</span>
        <span class="list__options-cta">
            <svg  class="list__options-cta__svg" viewBox="0 0 6 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2.74725" cy="2.74725" r="2.74725" fill="black" fill-opacity="0.6"/>
                <circle cx="2.74725" cy="10" r="2.74725" fill="black" fill-opacity="0.6"/>
                <circle cx="2.74725" cy="17.2527" r="2.74725" fill="black" fill-opacity="0.6"/>
            </svg>
        </span>
        <ul class="list__options">
            <li class="list__option">
                <span class="list__option__name">Modify</span>
                <svg class="list__option__icon--modify"  viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.23 0.448832C12.1034 0.47344 11.882 0.5543 11.7378 0.624613C11.4847 0.74766 11.3652 0.860159 8.58079 3.64102C6.24993 5.96836 5.6804 6.55196 5.64173 6.66797C5.5679 6.87188 5.08274 9.16758 5.06517 9.375C5.05462 9.51563 5.06868 9.57539 5.13548 9.67383C5.27259 9.87422 5.43431 9.96211 5.63821 9.94805C5.84563 9.93047 8.14134 9.44532 8.34524 9.37149C8.46126 9.33282 9.04837 8.75977 11.3722 6.43242C14.132 3.66211 14.262 3.52852 14.3851 3.27539C14.5257 2.99414 14.6206 2.62149 14.6206 2.36133C14.6206 2.09766 14.5257 1.725 14.3886 1.4543C13.9949 0.677347 13.0984 0.258987 12.23 0.448832ZM13.0351 1.62305C13.3199 1.76719 13.4745 2.03086 13.4745 2.36133C13.4745 2.66719 13.4042 2.79375 12.9894 3.20508L12.6519 3.53907L12.0648 2.94844L11.4741 2.36133L11.8081 2.02383C12.1421 1.68633 12.2616 1.59844 12.4585 1.54922C12.6097 1.51055 12.8874 1.54571 13.0351 1.62305ZM9.84993 6.34102L7.85306 8.33789L7.11829 8.4961C6.71399 8.58399 6.37649 8.65078 6.36946 8.64375C6.36243 8.63672 6.42923 8.29922 6.51712 7.89492L6.67532 7.16016L8.66868 5.1668L10.6656 3.16992L11.2527 3.75703L11.8433 4.34766L9.84993 6.34102Z" fill="#0075FF"/>
                    <path d="M0.769114 2.70234C0.421067 2.82188 0.164427 3.08555 0.0519267 3.43711C-0.00080768 3.5918 -0.00432331 4.12266 0.00270794 8.90039L0.0132548 14.1914L0.132786 14.4129C0.26638 14.659 0.375364 14.7645 0.642552 14.9051L0.821849 15H6.18318H11.5445L11.766 14.8805C12.0121 14.7469 12.1176 14.6379 12.2582 14.3707L12.3531 14.1914L12.3636 11.2277C12.3742 7.92305 12.3883 8.11641 12.1316 7.92305C11.9523 7.78594 11.664 7.78594 11.4847 7.92305C11.2316 8.11641 11.2457 7.94414 11.2457 11.0766V13.8926H6.18318H1.12068V8.83008V3.76758H3.93669C7.06911 3.76758 6.89685 3.78164 7.09021 3.52852C7.22732 3.34922 7.22732 3.06094 7.09021 2.88164C6.89685 2.62852 7.08318 2.64258 3.83825 2.64258C1.28591 2.64609 0.906224 2.65313 0.769114 2.70234Z" fill="#0075FF"/>
                </svg>
            </li>
            <li class="list__option">
                <span class="list__option__name">Delete</span>
                <svg class="list__option__icon--delete"  viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6.83333V13.8333M10.9167 6.83333L10.3333 13.8333M5.08333 6.83333L5.66667 13.8333M5.66667 3.33333L6.25 1H9.75L10.3333 3.33333M15 3.33333H2.16667L3.33333 17.3333H12.6667L13.8333 3.33333H1H15Z" stroke="#FF0000" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>                            
            </li>
        </ul>
    </li>`;
  }
}

export default new ListsView();
