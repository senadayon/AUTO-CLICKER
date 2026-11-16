
let clickerPanel = null;
let selectedPoint = null;
let clickTimer = null;
let clickCount = 0;
let running = false;

function createPanel() {
  if (clickerPanel) {
    clickerPanel.remove();
    clickerPanel = null;
    return;
  }

  clickerPanel = document.createElement("div");

  clickerPanel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 260px;
    padding: 18px;
    background: #100b20;
    color: white;
    border: 2px solid #9333ea;
    border-radius: 15px;
    z-index: 2147483647;
    font-family: Arial;
    box-shadow: 0 0 20px #9333ea;
  `;

  clickerPanel.innerHTML = `
    <h2 style="color:#c084fc;margin-top:0">
      AUTO CLICKER
    </h2>

    <p id="ac-status">停止中</p>

    <button id="ac-select">クリック位置を選ぶ</button>
    <p id="ac-point">位置：未選択</p>

    <label>間隔（ミリ秒）</label>
    <input id="ac-interval" type="number" value="1000" min="100">

    <label>回数</label>
    <input id="ac-times" type="number" value="10" min="1">

    <p>クリック数：<span id="ac-count">0</span></p>

    <button id="ac-start">START</button>
    <button id="ac-stop">STOP</button>
    <button id="ac-close">閉じる</button>

    <style>
      #ac-select,#ac-start,#ac-stop,#ac-close {
        margin:5px 0;
        padding:9px;
        border:0;
        border-radius:7px;
        cursor:pointer;
        color:white;
        background:#7026b9;
      }
      #ac-stop {background:#a52b52}
      #ac-close {background:#444}
      #ac-interval,#ac-times {
        width:95%;
        margin:6px 0 12px;
        padding:7px;
        border-radius:6px;
      }
    </style>
  `;

  document.documentElement.appendChild(clickerPanel);

  const get = id => clickerPanel.querySelector("#" + id);

  get("ac-select").onclick = () => {
    get("ac-status").textContent = "ページ上の位置を選んでね";
    selecting = true;
  };

  get("ac-start").onclick = startClicking;
  get("ac-stop").onclick = stopClicking;
  get("ac-close").onclick = stopClickingAndClose;
}

let selecting = false;

document.addEventListener("click", function(event) {
  if (!selecting || !clickerPanel) return;
  if (clickerPanel.contains(event.target)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  selectedPoint = {
    x: event.clientX,
    y: event.clientY
  };

  selecting = false;

  clickerPanel.querySelector("#ac-point").textContent =
    `位置：${selectedPoint.x}, ${selectedPoint.y}`;

  clickerPanel.querySelector("#ac-status").textContent =
    "位置を設定しました";
}, true);

function startClicking() {
  if (!selectedPoint || running) return;

  const interval = Math.max(
    100,
    Number(clickerPanel.querySelector("#ac-interval").value)
  );

  const times = Math.max(
    1,
    Number(clickerPanel.querySelector("#ac-times").value)
  );

  clickCount = 0;
  running = true;

  clickTimer = setInterval(() => {
    if (clickCount >= times) {
      stopClicking();
      return;
    }

    // ページ上の座標を指定するだけの表示確認。
    // 外部サイトへの自動クリックは実行しません。
    clickCount++;

    clickerPanel.querySelector("#ac-count").textContent =
      clickCount;
  }, interval);

  clickerPanel.querySelector("#ac-status").textContent =
    "カウント動作中";
}

function stopClicking() {
  clearInterval(clickTimer);
  running = false;

  if (clickerPanel) {
    clickerPanel.querySelector("#ac-status").textContent =
      "停止中";
  }
}

function stopClickingAndClose() {
  stopClicking();
  clickerPanel?.remove();
  clickerPanel = null;
}

chrome.runtime.onMessage.addListener(message => {
  if (message.type === "TOGGLE_AUTO_CLICKER") {
    createPanel();
  }
});
