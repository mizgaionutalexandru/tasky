class List {
  constructor(name, id) {
    this.name = name;
    this.active = true;
    this.items = [];
    this.id = id;
  }
}

class Item {
  constructor(text, id) {
    this.text = text;
    this.completed = false;
    this.id = id;
  }
}

export let lists = JSON.parse(localStorage.getItem("tasky-lists")) || [];

export const getCurrentlyActiveList = () =>
  lists.filter((list) => list.active === true)[0];

/**
 * Creates a new list into the data model with the given name and id
 * @param {object} data
 */
export const saveList = (data) => {
  lists.forEach((list) => (list.active = false));
  const newList = new List(data.name || "New list", data.id);
  lists.push(newList);
};

/**
 * Creates a new item into for the active list with the given text and id
 * @param {object} data
 */
export const saveItem = (data) => {
  const newItem = new Item(data.text || "New item", data.id);
  lists.forEach((list) => {
    if (list.active === true) list.items.push(newItem);
  });
};

/**
 * Change the currently active list / the name of a list
 * @param {object} options - id, modify = [active, name]
 */
export const updateLists = (options) => {
  if (options.modify === "active") {
    // change the currently active list
    lists.forEach((list) => {
      list.active = list.id === options.id ? true : false;
    });
  } else if (options.modify === "name") {
    // change the name of a specific list
    lists.forEach((list) => {
      list.name = list.id === options.id ? options.name : list.name;
    });
  }
};

/**
 * Change the name of an item/ toggle its completed property
 * @param {object} options - id, modify = [completed, text]
 */
export const updateItems = (options) => {
  if (options.modify === "completed") {
    // toggle its completed property
    getCurrentlyActiveList().items.forEach((item) => {
      item.completed = item.id === options.id ? options.completed : item.completed;
    });
  } else if (options.modify === "text") {
    // change the text of an item
    getCurrentlyActiveList().items.forEach((item) => {
      if (item.id === options.id) item.text = options.text;
    });
  }
};

export const deleteList = (id) => {
  lists = lists.filter((list) => list.id != id);
  // If the users deletes the currently active list, make the first one the active one
  if (!lists.some((list) => list.active === true) && lists[0]) lists[0].active = true;
};

export const deleteItem = (id) => {
  getCurrentlyActiveList().items = getCurrentlyActiveList().items.filter(
    (item) => item.id != id
  );
};

export const upload = () => {
  localStorage.setItem("tasky-lists", JSON.stringify(lists));
};
