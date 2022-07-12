class List {
  constructor(name) {
    this.name = name;
    this.active = true;
    this.items = [];
  }
}

export const lists = [new List("Personal"), new List("Groceries")];

export const updateLists = (options) => {
  if (options.status === "new") {
    lists.forEach((list) => (list.active = false));
    lists.push({
      name: options.name || "New list",
      active: true,
    });
  }
};
