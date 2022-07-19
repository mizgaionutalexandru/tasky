import { makeId, qs } from "../helpers.js";
import { ACTION_KEY, OPTIONS_KEY } from "../config.js";

class ItemsView {
  _parentElement = qs(".content-container");
  _itemsContainer = qs(".items");
  _isNewItemInputOpen = false;
  _currentlyModifiedItemId = null;
  _itemOptionsOpen;
  _data;

  addHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      /////////////////////
      // I) Click on an item
      /////////////////////
      const itemClicked = e.target.closest(".item");

      if (itemClicked) {
        const itemId = itemClicked.dataset.id;

        // 1) Click on the item's checkbox/ name
        if (e.target.closest(".item__text"))
          if (itemClicked.querySelector(".item__text__input")) return;
          // if it is one being created/edited at the moment, ignore the click
          else return this._toggleItemComplete(handler, itemId);

        // 2) Click on option menu icon
        if (e.target.closest(".item__options-cta"))
          return this._displayItemOptions(itemClicked, itemId);

        // 3) Click on 'modify' item option
        if (e.target.closest("[data-action=modify]"))
          return this._modifyItem(itemClicked);

        // 5) Click on 'delete' item option
        if (e.target.closest("[data-action=delete")) {
          return handler("delete", { id: this._itemOptionsOpen });
        }
      }

      ///////////////////////////////////
      // II) Click on the add item button
      ///////////////////////////////////
      if (e.target.closest(".item-add")) return this._addNewItem(handler);

      /////////////////////////////////////////////////
      // III) Click anywhere else on the nav-container
      /////////////////////////////////////////////////
      this._saveInputAsNewItem(handler);
      // Save the list that is being modified if it exists
      this._saveModifiedItem(handler);
      this._closeOptionsMenu();
    });

    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    this._parentElement.addEventListener("keydown", (e) => {
      const activeEl = document.activeElement;
      ////////////////////////////////////////////////
      // I) The active element is the add item button
      ////////////////////////////////////////////////
      if (activeEl.closest(".item-add") && e.key === ACTION_KEY)
        return this._addNewItem(handler);

      ////////////////////////////////////////////////
      // II) The active element is the new item input
      ////////////////////////////////////////////////
      const itemEngaged = activeEl.closest(".item");
      const itemId = itemEngaged?.dataset.id;

      if (itemEngaged?.classList.contains("item--new")) {
        if (e.key === ACTION_KEY) return this._saveInputAsNewItem(handler);
        else if (e.key === OPTIONS_KEY) return this._closeAndCancelNewItem();
      }

      ///////////////////////////////////////////////////
      // III) The active element is the modify item input
      ///////////////////////////////////////////////////
      if (itemEngaged?.classList.contains("item--modify")) {
        if (e.key === ACTION_KEY) return this._saveModifiedItem(handler);
        else if (e.key === OPTIONS_KEY) return this._closeAndCancelModifyItem();
      }

      ///////////////////////////////////////////////////
      // IV) The active element is the modify item option
      ///////////////////////////////////////////////////
      if (activeEl.dataset.action === "modify") {
        if (e.key === ACTION_KEY) return this._modifyItem(itemEngaged);
        else if (e.key === OPTIONS_KEY) {
          this._closeOptionsMenu();
          qs(`[data-id='${itemId}']`).focus();
          return;
        }
      }

      ///////////////////////////////////////////////////
      // V) The active element is the delete item option
      ///////////////////////////////////////////////////
      if (activeEl.dataset.action === "delete") {
        if (e.key === ACTION_KEY) return handler("delete", { id: this._itemOptionsOpen });
        else if (e.key === OPTIONS_KEY) {
          this._closeOptionsMenu();
          qs(`[data-id='${itemId}']`).focus();
          return;
        }
      }

      ///////////////////////////////////////////////////
      // VI) The active element is a list
      ///////////////////////////////////////////////////
      if (itemEngaged) {
        if (e.key === ACTION_KEY) return this._toggleItemComplete(handler, itemId);
        else if (e.key === OPTIONS_KEY)
          return this._displayItemOptions(itemEngaged, itemId);
      }
    });
  }

  /**
   * Creates a new list on the DOM.
   * @param {function} handler
   */
  _addNewItem(handler) {
    this._closeOptionsMenu();
    this._saveModifiedItem(handler);
    this._saveInputAsNewItem(handler);
    // Create a new item (item--new) with an input
    return handler("create");
  }

  /**
   * Makes the given item editable.
   * @param {object} item
   */
  _modifyItem(item) {
    const oldText = item.querySelector(".item__text").innerText;
    const markup = `
    <div class="item__info">
        <input tabindex="-1" class="item__input" type="checkbox" />
        <label class="item__text" for="item_3">
            <input class="item__text__input" type="text" value='${oldText}' data-old-text='${oldText}'>
        </label>
    </div>`;
    item.innerHTML = markup;
    item.classList.remove("item--options-visible");
    item.classList.add("item--modify");
    const itemInput = item.querySelector(".item__text__input");
    itemInput.style.width = "0px";
    itemInput.style.width = itemInput.scrollWidth + "px";
    itemInput.setSelectionRange(itemInput.value.length, itemInput.value.length);
    itemInput.focus();

    // Make it stretch as it gets more content
    itemInput.addEventListener("input", () => {
      itemInput.style.width = "0px";
      itemInput.style.width = itemInput.scrollWidth + "px";
    });

    this._currentlyModifiedItemId = item.dataset.id;
  }

  _displayItemOptions(item, itemId) {
    const optionsMarkup = this._getOptionsMarkup();
    this._closeAndCancelNewItem();
    this._closeAndCancelModifyItem();
    if (item.classList.contains("item--options-visible")) {
      // If the clicked list has the options opened, close them
      item.classList.remove("item--options-visible");
      qs(".item__options").remove();
      // Reset the list's id for which the options are opened
      this._itemOptionsOpen = null;
    } else {
      // If there are some options open, close them
      this._closeOptionsMenu();
      // Open the options for the clicked list
      item.classList.add("item--options-visible");
      item.insertAdjacentHTML("beforeend", optionsMarkup);
      // Save the list's id for which the options are opened
      this._itemOptionsOpen = itemId;
    }
  }

  _toggleItemComplete(handler, itemId) {
    this._closeOptionsMenu();
    this._closeAndCancelNewItem();
    this._closeAndCancelModifyItem();
    handler("save", {
      status: "old",
      id: itemId,
      completed: qs(`[data-id='${itemId}']`).classList.contains("item--completed")
        ? false
        : true,
      modify: "completed",
    });
    // Focus the modified item
    const item = qs(`[data-id=${itemId}]`);
    item.classList.toggle("item--completed");
    return item.focus();
  }

  /**
   * Save the item that is being created if it exists.
   * Sets _isNewItemInputOpen to false.
   * @param {function} handler
   */
  _saveInputAsNewItem(handler) {
    if (!this._isNewItemInputOpen) return;
    this._isNewItemInputOpen = false;
    const id = makeId(9);
    handler("save", {
      status: "new",
      text: qs(".item__text__input").value,
      id,
    });
    qs(`[data-id='${id}'`).focus();
  }

  /**
   * Save the itme that is being modified if it exists.
   * Sets _currentlyModifiedItemId to null.
   * @param {function} handler
   */
  _saveModifiedItem(handler) {
    if (!this._currentlyModifiedItemId) return;
    console.log(qs(".item__text__input").dataset.oldText);
    handler("save", {
      status: "old",
      text: qs(".item__text__input").value,
      id: this._currentlyModifiedItemId,
      modify: "text",
    });
    qs(`[data-id='${this._currentlyModifiedItemId}']`).focus();
    this._currentlyModifiedItemId = null;
  }

  /**
   * Removes the options from the DOM and the item's 'item--options-visible' class
   */
  _closeOptionsMenu() {
    qs(".item--options-visible")?.classList.remove("item--options-visible");
    qs(".item__options")?.remove();
  }

  /**
   * Removes the new list input from the DOM and sets _isNewListInputOpen to false.
   * It CANCELS the creation of a new list!
   */
  _closeAndCancelNewItem() {
    this._isNewItemInputOpen = false;
    qs(".item--new")?.remove();
  }

  /**
   * Replaces the modify list input with a list on the DOM with the data previous to
   * the modify option. It CANCELS any modification made. Removes the 'list--modify' class.
   */
  _closeAndCancelModifyItem() {
    const item = qs(".item--modify");
    if (!item) return;
    const markup = `
    <div class="item__info">
        <input tabindex="-1" class="item__input" type="checkbox" />
        <label class="item__text">${qs(".item__text__input").dataset.oldText}</label>
    </div>
    <span class="item__options-cta">
        <svg  class="item__options-cta__svg" viewBox="0 0 6 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2.74725" cy="2.74725" r="2.74725" fill="black" fill-opacity="0.6"/>
            <circle cx="2.74725" cy="10" r="2.74725" fill="black" fill-opacity="0.6"/>
            <circle cx="2.74725" cy="17.2527" r="2.74725" fill="black" fill-opacity="0.6"/>
        </svg>
    </span>`;
    item.innerHTML = markup;
    item.classList.remove("item--modify");
    item.focus();
    this._currentlyModifiedItemId = null;
  }

  /**
   * Inserts into the page the markup of a new list
   */
  renderNewItem() {
    this._isNewItemInputOpen = true;
    const markup = `
    <li tabindex="0" class="item item--new">            
        <div class="item__info">
            <input tabindex="-1" class="item__input" type="checkbox" />
            <label class="item__text">
                <input class="item__text__input" type="text" maxlength=64>
            </label>
        </div>
    </li>`;
    this._itemsContainer.insertAdjacentHTML("beforeend", markup);

    // New Item Input - make it stretch as it gets more content
    const itemInput = qs(".item__text__input");
    itemInput.focus();
    itemInput.addEventListener("input", () => {
      itemInput.style.width = "0px";
      itemInput.style.width = itemInput.scrollWidth + "px";
    });
  }

  /**
   * Empties and renders (updates) the items container and the currently
   * active list's name
   * @param {array} data - the active list
   */
  update(data) {
    if (!data) return; // TODO: instructions for the user
    this._data = data; // the active list
    this._updateListName(this._data.name);
    this._updateListItems(this._data.items);
  }

  _updateListName(name) {
    qs(".active-list-title").innerText = `${name} list`;
  }

  _updateListItems(items) {
    this._itemsContainer.innerHTML = "";
    let markup = "";
    items.forEach((item) => {
      markup += this._getItemMarkup(item);
    });
    this._itemsContainer.insertAdjacentHTML("beforeend", markup);
  }

  /**
   * Creates and returns the markup of an item to be rendered in the items container
   * @param {object} item
   */
  _getItemMarkup(item) {
    return `
    <li tabindex="0" class="item ${item.completed ? "item--completed" : ""}" data-id='${
      item.id
    }'>
     <div class="item__info">
         <input tabindex="-1" class="item__input" type="checkbox" />
         <label class="item__text">${item.text}</label>
     </div>
     <span class="item__options-cta">
         <svg  class="item__options-cta__svg" viewBox="0 0 6 20" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="2.74725" cy="2.74725" r="2.74725" fill="black" fill-opacity="0.6"/>
             <circle cx="2.74725" cy="10" r="2.74725" fill="black" fill-opacity="0.6"/>
             <circle cx="2.74725" cy="17.2527" r="2.74725" fill="black" fill-opacity="0.6"/>
         </svg>
     </span>
   </li>`;
  }

  /**
   * Creates and returns the markup of the options menu to be rendered
   */
  _getOptionsMarkup() {
    return `
    <ul class="item__options">
        <li tabindex="0" class="item__option" data-action="modify">
            <span class="item__option__name">Modify</span>
            <svg class="item__option__icon--modify"  viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.23 0.448832C12.1034 0.47344 11.882 0.5543 11.7378 0.624613C11.4847 0.74766 11.3652 0.860159 8.58079 3.64102C6.24993 5.96836 5.6804 6.55196 5.64173 6.66797C5.5679 6.87188 5.08274 9.16758 5.06517 9.375C5.05462 9.51563 5.06868 9.57539 5.13548 9.67383C5.27259 9.87422 5.43431 9.96211 5.63821 9.94805C5.84563 9.93047 8.14134 9.44532 8.34524 9.37149C8.46126 9.33282 9.04837 8.75977 11.3722 6.43242C14.132 3.66211 14.262 3.52852 14.3851 3.27539C14.5257 2.99414 14.6206 2.62149 14.6206 2.36133C14.6206 2.09766 14.5257 1.725 14.3886 1.4543C13.9949 0.677347 13.0984 0.258987 12.23 0.448832ZM13.0351 1.62305C13.3199 1.76719 13.4745 2.03086 13.4745 2.36133C13.4745 2.66719 13.4042 2.79375 12.9894 3.20508L12.6519 3.53907L12.0648 2.94844L11.4741 2.36133L11.8081 2.02383C12.1421 1.68633 12.2616 1.59844 12.4585 1.54922C12.6097 1.51055 12.8874 1.54571 13.0351 1.62305ZM9.84993 6.34102L7.85306 8.33789L7.11829 8.4961C6.71399 8.58399 6.37649 8.65078 6.36946 8.64375C6.36243 8.63672 6.42923 8.29922 6.51712 7.89492L6.67532 7.16016L8.66868 5.1668L10.6656 3.16992L11.2527 3.75703L11.8433 4.34766L9.84993 6.34102Z" fill="#0075FF"/>
                <path d="M0.769114 2.70234C0.421067 2.82188 0.164427 3.08555 0.0519267 3.43711C-0.00080768 3.5918 -0.00432331 4.12266 0.00270794 8.90039L0.0132548 14.1914L0.132786 14.4129C0.26638 14.659 0.375364 14.7645 0.642552 14.9051L0.821849 15H6.18318H11.5445L11.766 14.8805C12.0121 14.7469 12.1176 14.6379 12.2582 14.3707L12.3531 14.1914L12.3636 11.2277C12.3742 7.92305 12.3883 8.11641 12.1316 7.92305C11.9523 7.78594 11.664 7.78594 11.4847 7.92305C11.2316 8.11641 11.2457 7.94414 11.2457 11.0766V13.8926H6.18318H1.12068V8.83008V3.76758H3.93669C7.06911 3.76758 6.89685 3.78164 7.09021 3.52852C7.22732 3.34922 7.22732 3.06094 7.09021 2.88164C6.89685 2.62852 7.08318 2.64258 3.83825 2.64258C1.28591 2.64609 0.906224 2.65313 0.769114 2.70234Z" fill="#0075FF"/>
            </svg>
        </li>
        <li tabindex="0" class="item__option" data-action="delete">
            <span class="item__option__name">Delete</span>
            <svg class="item__option__icon--delete"  viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6.83333V13.8333M10.9167 6.83333L10.3333 13.8333M5.08333 6.83333L5.66667 13.8333M5.66667 3.33333L6.25 1H9.75L10.3333 3.33333M15 3.33333H2.16667L3.33333 17.3333H12.6667L13.8333 3.33333H1H15Z" stroke="#FF0000" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>                            
        </li>
    </ul>`;
  }
}

export default new ItemsView();
