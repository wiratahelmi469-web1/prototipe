// SECTION: localStorage Helpers

export const getLocalStorageItem = (key, defaultValue = null) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading Web Storage key "${key}":`, error);
    return defaultValue;
  }
};

export const setLocalStorageItem = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting Web Storage key "${key}":`, error);
  }
};

export const removeLocalStorageItem = (key) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing Web Storage key "${key}":`, error);
  }
};
