import "core-js/stable";
import listsView from "./views/listsView";
import itemsView from "./views/itemsView";
import navbarView from "./views/navbarView";
import creditsView from "./views/creditsView";
import hiddenView from "./views/hiddenView";
import * as model from "./model.js";

/**
 * The controller for lists
 * @param {string} action - save / create / delete
 * @param {object} [options] - status: new / old, name, id, active
 */
const listsController = (action, options) => {
  if (action === "save" && options.status === "new") {
    model.saveList(options);
    listsView.update(model.lists);
    itemsView.update(model.getCurrentlyActiveList());
    model.upload();
  } else if (action === "save" && options.status === "old") {
    model.updateLists(options);
    itemsView.update(model.getCurrentlyActiveList());
    listsView.update(model.lists);
    model.upload();
  } else if (action === "create") {
    listsView.renderNewList();
  } else if (action === "delete") {
    model.deleteList(options.id);
    listsView.update(model.lists);
    itemsView.update(model.getCurrentlyActiveList());
    model.upload();
  }
};

/**
 * The controller for items
 * @param {string} action - save / create / delete
 * @param {object} [options] - status: new / old, name, id, completed
 */
const itemsController = (action, options) => {
  if (action === "save" && options.status === "new") {
    model.saveItem(options);
    itemsView.update(model.getCurrentlyActiveList());
    model.upload();
  } else if (action === "save" && options.status === "old") {
    model.updateItems(options);
    if (options.modify !== "completed") itemsView.update(model.getCurrentlyActiveList());
    // Don't render the whole container for the complete toggle
    model.upload();
  } else if (action === "create") {
    itemsView.renderNewItem();
  } else if (action === "delete") {
    model.deleteItem(options.id);
    itemsView.update(model.getCurrentlyActiveList());
    model.upload();
  }
};

const init = () => {
  listsView.update(model.lists);
  itemsView.update(model.getCurrentlyActiveList());
  listsView.addHandler(listsController);
  itemsView.addHandler(itemsController);
  navbarView.addNavbarMobileHandler(listsController);
};

console.log("Page started! 👍");
init();
