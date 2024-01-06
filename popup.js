import { getMinutesToCloseTab, saveMinutesToCloseTab } from "./storage.js";
window.addEventListener("DOMContentLoaded", async () => {
  const minutesToCloseTab = await getMinutesToCloseTab();
  document.getElementById("minutesToCloseTab").value = minutesToCloseTab;
});

document.getElementById("saveButton").addEventListener("click", async () => {
  const inputValue = document.getElementById("minutesToCloseTab").value;
  await saveMinutesToCloseTab(inputValue);
  const savedText = document.getElementById("savedText");
  savedText.style.display = "block";
  setTimeout(() => {
    savedText.style.display = "none";
  }, 1000);
});
