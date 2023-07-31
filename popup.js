window.addEventListener("DOMContentLoaded", async () => {
  const { timeToCloseTabs } = await chrome.storage.local.get("timeToCloseTabs");
  if (timeToCloseTabs) {
    document.getElementById("timeToCloseTabs").value = timeToCloseTabs;
  }
});

document.getElementById("saveButton").addEventListener("click", async () => {
  const inputValue = document.getElementById("timeToCloseTabs").value;
  await chrome.storage.local.set({ timeToCloseTabs: inputValue });
  console.log(inputValue);
  const savedText = document.getElementById("savedText");
  savedText.style.display = "block";
  setTimeout(() => {
    savedText.style.display = "none";
  }, 1000);
});
