class List {
  constructor(name, id) {
    this.name = name;
    this.active = true;
    this.items = [];
    this.id = id;
  }
}

export let lists = JSON.parse(localStorage.getItem("tasky-lists")) || [];
console.log(lists);

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
 * Change the currently active list
 * @param {object} options
 */
export const updateLists = (options) => {
  if (options.active) {
    // change the currently active list
    lists.forEach((list) => {
      list.active = list.id === options.id ? true : false;
    });
  }
};

export const deleteList = (id) => {
  lists = lists.filter((list) => list.id != id);
  // If the users deletes the currently active list, make the first one the active one
  if (!lists.some((list) => list.active === true)) lists[0].active = true;
};

export const upload = () => {
  localStorage.setItem("tasky-lists", JSON.stringify(lists));
};
