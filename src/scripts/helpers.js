export const qs = (query) => document.querySelector(query);
export const qsa = (query) => document.querySelectorAll(query);

export const makeId = (num) => {
  let result = "id";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < num; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
