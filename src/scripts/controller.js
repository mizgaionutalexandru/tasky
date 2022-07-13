import "core-js/stable";
import listsView from "./listsView";
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
    model.upload();
  } else if (action === "save" && options.status === "old") {
    model.updateLists(options);
    listsView.update(model.lists);
    model.upload();
  }
  if (action === "create") {
    listsView.renderNewList();
  }
};

const init = () => {
  listsView.update(model.lists);
  listsView.addHandlerClick(listsController);
};

init();
console.log("Page started! 👍");
