import {
  getMinutesToCloseTab,
  saveLatestActiveTimesForTabs,
  getLatestActiveTimesForTabs,
} from "./storage.js";

const initialize = async () => {
  const latestActiveTimesForTabs = {};
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    latestActiveTimesForTabs[tab.id] = new Date().getTime();
  });
  saveLatestActiveTimesForTabs(latestActiveTimesForTabs);
};

chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { tabId } = activeInfo;
  if (!tabId) return;

  const latestActiveTimesForTabs = await getLatestActiveTimesForTabs();

  latestActiveTimesForTabs[tabId] = new Date().getTime();

  await saveLatestActiveTimesForTabs(latestActiveTimesForTabs);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const latestActiveTimesForTabs = await getLatestActiveTimesForTabs();
  delete latestActiveTimesForTabs[tabId];
  await saveLatestActiveTimesForTabs(latestActiveTimesForTabs);
});

chrome.alarms.create({ periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async () => {
  const latestActiveTimesForTabs = await getLatestActiveTimesForTabs();
  const tabs = await chrome.tabs.query({});
  const minutesToCloseTab = await getMinutesToCloseTab();
  const now = new Date();
  for (const tab of tabs) {
    if (tab.active || tab.pinned) continue;

    // 指定時間経過していたらタブを閉じる
    if (
      now.getTime() - latestActiveTimesForTabs[tab.id] >
      minutesToCloseTab * 60 * 1000
    ) {
      try {
        await chrome.tabs.remove(tab.id);
      } catch (e) {
        // NOTE: タブがすでに閉じられている場合などでエラーになる
        // エラーになっても特に問題ないのでログに出すだけにしておく
        console.error(e);
      }
    }
  }

  await saveLatestActiveTimesForTabs(latestActiveTimesForTabs);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "pin-tab") {
    const tabs = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (tabs.length === 0) return;
    await chrome.tabs.update(tabs[0].id, { pinned: true });
  }
});
