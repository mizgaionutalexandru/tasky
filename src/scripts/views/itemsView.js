import { makeId, qs } from "../helpers.js";
import { ACTION_KEY, MOBILE_NAVBAR_THRESHOLD, OPTIONS_KEY } from "../config.js";

class ItemsView {
  _parentElement = qs(".content-container");
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
    const itemsContainer = qs(".items");
    const markup = `
    ${itemsContainer ? "" : '<ul class="items" id="items">'}
    <li tabindex="0" class="item item--new">            
        <div class="item__info">
            <input tabindex="-1" class="item__input" type="checkbox" />
            <label class="item__text">
                <input class="item__text__input" type="text" maxlength=64>
            </label>
        </div>
    </li>
    ${itemsContainer ? "" : "</ul>"}`;
    if (itemsContainer) itemsContainer.insertAdjacentHTML("beforeend", markup);
    else {
      qs(".message").remove();
      this._parentElement.insertAdjacentHTML("beforeend", markup);
    }

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
    if (!data) return this._renderNoListsMessage();
    this._data = data; // the active list
    if (data.items.length === 0) {
      this._renderNoItemsMessage();
      this._updateListName(this._data.name);
      return;
    }
    qs(".message")?.remove();
    this._updateListName(this._data.name);
    this._updateListItems(this._data.items);
  }

  _updateListName(name) {
    qs(".content-header")?.remove();
    const markup = `
    <header class="content-header">
      <span class="active-list-title">${name} list</span>
      <button tabindex="0" class="item-add">New item +</button>
    </header>`;
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _updateListItems(items) {
    qs(".items")?.remove();
    let markup = `<ul class="items" id="items">`;
    items.forEach((item) => {
      markup += this._getItemMarkup(item);
    });
    markup += `</ul>`;
    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _renderNoListsMessage() {
    const markup = `
    <div class="message">
    <div class="message_icon">
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6638 0.049221C14.0834 0.302345 12.1006 0.857815 9.99118 1.90547C5.30134 4.23281 1.89118 8.44453 0.569306 13.5563C-0.0846004 16.0734 -0.161944 18.9773 0.351337 21.5227C1.46227 27.007 5.04118 31.6688 10.0193 34.1086C11.3974 34.7836 12.2271 35.0859 13.5982 35.4375C15.2013 35.8453 16.2138 35.9648 18.0349 35.9648C20.2076 35.9578 21.6701 35.7328 23.6248 35.093C28.2443 33.5672 31.9779 30.3047 34.1435 25.9102C35.0365 24.1031 35.5709 22.3383 35.8732 20.2148C36.0138 19.2375 35.9927 16.6781 35.831 15.5742C35.6834 14.4844 35.2685 12.8109 34.9099 11.8406C34.5443 10.8422 33.6302 9.0211 33.0677 8.15625C31.3591 5.56172 28.9474 3.3961 26.2123 1.99688C24.1381 0.942188 22.1341 0.344532 19.8349 0.105469C18.9771 0.0140648 17.3107 -0.014061 16.6638 0.049221ZM19.406 2.46797C25.1787 2.98828 30.2131 6.71484 32.4349 12.0938C33.3349 14.2594 33.7498 16.9945 33.5459 19.3008C33.0466 24.8203 29.7701 29.6016 24.8552 31.9922C23.3295 32.7375 21.9091 33.1805 20.2498 33.4406C19.1459 33.6164 16.8607 33.6164 15.7849 33.4477C12.4099 32.9133 9.55524 31.507 7.16462 29.2008C2.29196 24.4898 1.01931 17.2406 4.00056 11.1445C4.83024 9.44297 5.82165 8.09297 7.20681 6.76406C10.4623 3.62109 14.9201 2.05313 19.406 2.46797Z" fill="#EA5959"/>
          <path d="M12.5855 12.6703C12.2902 12.8742 12.0933 13.1414 12.03 13.4227C12.0089 13.5422 12.0019 14.4562 12.023 15.4547C12.0581 17.2195 12.0652 17.2687 12.2269 17.5008C12.4167 17.768 12.8667 17.993 13.2042 18C13.4925 18 13.9355 17.782 14.1253 17.5359C14.3855 17.2055 14.4206 16.875 14.3996 15.0609C14.3785 13.3805 14.3714 13.3172 14.2097 13.057C13.8863 12.5367 13.0706 12.3398 12.5855 12.6703Z" fill="#EA5959"/>
          <path d="M22.3594 12.5648C22.0992 12.6633 21.8391 12.9094 21.7195 13.1766C21.6 13.4297 21.5859 13.6617 21.5859 15.2227C21.5859 17.1773 21.6211 17.3602 22.0711 17.7398C22.6125 18.1969 23.5125 18.007 23.8359 17.3602C23.9625 17.1141 23.9766 16.9453 23.9766 15.2016C23.9766 13.3523 23.9766 13.3031 23.8148 13.0711C23.5617 12.6914 23.2383 12.5156 22.8234 12.5227C22.6266 12.5227 22.4156 12.5438 22.3594 12.5648Z" fill="#EA5959"/>
          <path d="M11.2359 22.7813C10.7156 22.9359 10.4062 23.3719 10.4062 23.9414C10.4062 24.3633 10.5258 24.5883 10.9758 24.9891C11.918 25.8328 13.5703 26.7398 14.8852 27.1266C16.0734 27.4852 16.9383 27.5836 18.3867 27.5414C20.0883 27.4852 21.15 27.2391 22.6195 26.543C23.7937 25.9875 25.1297 25.0313 25.3336 24.5883C25.6711 23.8922 25.2492 23.0484 24.4898 22.8867C24.082 22.8023 23.8008 22.9219 23.0836 23.4563C21.9656 24.3 20.7422 24.8414 19.3992 25.0734C18.4219 25.2422 16.868 25.1789 15.9328 24.9328C14.6742 24.5953 13.507 23.9977 12.607 23.2313C12.0516 22.7531 11.7 22.6406 11.2359 22.7813Z" fill="#EA5959"/>
        </svg>              
    </div>
    <div class="message_text">No lists yet.<br> Create one bottom left!</div>
  </div>`;
    this._parentElement.innerHTML = markup;
    if (window.innerWidth <= MOBILE_NAVBAR_THRESHOLD) qs(".list-add--mobile").focus();
    else qs(".list-add").focus();
  }

  _renderNoItemsMessage() {
    const markup = `
    <header class="content-header">
      <span class="active-list-title"></span>
      <button tabindex="0" class="item-add">New item +</button>
    </header>
    <div class="message">
    <div class="message_icon">
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6638 0.049221C14.0834 0.302345 12.1006 0.857815 9.99118 1.90547C5.30134 4.23281 1.89118 8.44453 0.569306 13.5563C-0.0846004 16.0734 -0.161944 18.9773 0.351337 21.5227C1.46227 27.007 5.04118 31.6688 10.0193 34.1086C11.3974 34.7836 12.2271 35.0859 13.5982 35.4375C15.2013 35.8453 16.2138 35.9648 18.0349 35.9648C20.2076 35.9578 21.6701 35.7328 23.6248 35.093C28.2443 33.5672 31.9779 30.3047 34.1435 25.9102C35.0365 24.1031 35.5709 22.3383 35.8732 20.2148C36.0138 19.2375 35.9927 16.6781 35.831 15.5742C35.6834 14.4844 35.2685 12.8109 34.9099 11.8406C34.5443 10.8422 33.6302 9.0211 33.0677 8.15625C31.3591 5.56172 28.9474 3.3961 26.2123 1.99688C24.1381 0.942188 22.1341 0.344532 19.8349 0.105469C18.9771 0.0140648 17.3107 -0.014061 16.6638 0.049221ZM19.406 2.46797C25.1787 2.98828 30.2131 6.71484 32.4349 12.0938C33.3349 14.2594 33.7498 16.9945 33.5459 19.3008C33.0466 24.8203 29.7701 29.6016 24.8552 31.9922C23.3295 32.7375 21.9091 33.1805 20.2498 33.4406C19.1459 33.6164 16.8607 33.6164 15.7849 33.4477C12.4099 32.9133 9.55524 31.507 7.16462 29.2008C2.29196 24.4898 1.01931 17.2406 4.00056 11.1445C4.83024 9.44297 5.82165 8.09297 7.20681 6.76406C10.4623 3.62109 14.9201 2.05313 19.406 2.46797Z" fill="#EA5959"/>
          <path d="M12.5855 12.6703C12.2902 12.8742 12.0933 13.1414 12.03 13.4227C12.0089 13.5422 12.0019 14.4562 12.023 15.4547C12.0581 17.2195 12.0652 17.2687 12.2269 17.5008C12.4167 17.768 12.8667 17.993 13.2042 18C13.4925 18 13.9355 17.782 14.1253 17.5359C14.3855 17.2055 14.4206 16.875 14.3996 15.0609C14.3785 13.3805 14.3714 13.3172 14.2097 13.057C13.8863 12.5367 13.0706 12.3398 12.5855 12.6703Z" fill="#EA5959"/>
          <path d="M22.3594 12.5648C22.0992 12.6633 21.8391 12.9094 21.7195 13.1766C21.6 13.4297 21.5859 13.6617 21.5859 15.2227C21.5859 17.1773 21.6211 17.3602 22.0711 17.7398C22.6125 18.1969 23.5125 18.007 23.8359 17.3602C23.9625 17.1141 23.9766 16.9453 23.9766 15.2016C23.9766 13.3523 23.9766 13.3031 23.8148 13.0711C23.5617 12.6914 23.2383 12.5156 22.8234 12.5227C22.6266 12.5227 22.4156 12.5438 22.3594 12.5648Z" fill="#EA5959"/>
          <path d="M11.2359 22.7813C10.7156 22.9359 10.4062 23.3719 10.4062 23.9414C10.4062 24.3633 10.5258 24.5883 10.9758 24.9891C11.918 25.8328 13.5703 26.7398 14.8852 27.1266C16.0734 27.4852 16.9383 27.5836 18.3867 27.5414C20.0883 27.4852 21.15 27.2391 22.6195 26.543C23.7937 25.9875 25.1297 25.0313 25.3336 24.5883C25.6711 23.8922 25.2492 23.0484 24.4898 22.8867C24.082 22.8023 23.8008 22.9219 23.0836 23.4563C21.9656 24.3 20.7422 24.8414 19.3992 25.0734C18.4219 25.2422 16.868 25.1789 15.9328 24.9328C14.6742 24.5953 13.507 23.9977 12.607 23.2313C12.0516 22.7531 11.7 22.6406 11.2359 22.7813Z" fill="#EA5959"/>
        </svg>              
    </div>
    <div class="message_text">No items yet.<br> Create one top right!</div>
  </div>`;
    this._parentElement.innerHTML = markup;
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
