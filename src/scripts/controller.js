import "core-js/stable";
import listsView from "./listsView";
import * as model from "./model.js";

/**
 * The controller for lists
 * @param {string} action - save / create / delete
 * @param {object} [options] - status: new / old, name, id
 */
const listsController = (action, options) => {
  if (action === "save") {
    model.updateLists(options);
    listsView.update(model.lists);
  }
  if (action === "create") {
    listsView.renderNewList();
  }
};

const init = () => {
  listsView.addHandlerClick(listsController);
};

init();
console.log("Page started! 👍");
