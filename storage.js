export const getMinutesToCloseTab = async () => {
  let { minutesToCloseTab } = await chrome.storage.local.get(
    "minutesToCloseTab"
  );
  if (!minutesToCloseTab) minutesToCloseTab = 60;
  return minutesToCloseTab;
};

export const saveMinutesToCloseTab = async (minutesToCloseTab) => {
  await chrome.storage.local.set({ minutesToCloseTab });
};

export const saveLatestActiveTimesForTabs = async (
  latestActiveTimesForTabs
) => {
  await chrome.storage.local.set({ latestActiveTimesForTabs });
};

export const getLatestActiveTimesForTabs = async () => {
  const { latestActiveTimesForTabs } = await chrome.storage.local.get(
    "latestActiveTimesForTabs"
  );
  return latestActiveTimesForTabs;
};
