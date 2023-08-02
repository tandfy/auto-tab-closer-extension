const setTabsTimes = async (tabsTimes) => {
  await chrome.storage.local.set({ tabsTimes });
};
const getTabsTimes = async () => {
  const { tabsTimes } = await chrome.storage.local.get("tabsTimes");
  return tabsTimes;
};

const initialize = async () => {
  const tabsTimes = {};
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    tabsTimes[tab.id] = new Date().getTime();
  });
  await chrome.storage.local.set({ tabsTimes });
};

chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { tabId } = activeInfo;
  if (!tabId) return;

  const tabsTimes = await getTabsTimes();

  tabsTimes[tabId] = new Date().getTime();

  await setTabsTimes(tabsTimes);
});

chrome.alarms.create({ periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async () => {
  const date = new Date();
  const tabsTimes = await getTabsTimes();
  const pinnedTabs = await chrome.tabs.query({ pinned: true });
  for (const pinnedTab of pinnedTabs) {
    delete tabsTimes[pinnedTab.id];
  }

  const activeTabs = await chrome.tabs.query({ active: true });
  for (const activeTab of activeTabs) {
    delete tabsTimes[activeTab.id];
  }

  let { timeToCloseTabs } = await chrome.storage.local.get("timeToCloseTabs");
  if (timeToCloseTabs === undefined) timeToCloseTabs = 60;

  for (const tabId of Object.keys(tabsTimes)) {
    // 1時間経過してたらタブを閉じる
    if (date.getTime() - tabsTimes[tabId] > timeToCloseTabs * 60 * 1000) {
      try {
        await chrome.tabs.remove(parseInt(tabId));
      } catch (e) {
        // NOTE: タブがすでに閉じられている場合などでエラーになる
        // エラーになっても特に問題ないのでログに出すだけにしておく
        console.error(e);
      }
      delete tabsTimes[tabId];
    }
  }

  await setTabsTimes(tabsTimes);
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
