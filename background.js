
chrome.runtime.onInstalled.addListener(() => {
  console.log("AUTO CLICKER installed!");
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "TOGGLE_AUTO_CLICKER"
    });
  } catch (error) {
    console.log("このページでは操作できません");
  }
});
