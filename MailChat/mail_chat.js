const formatTime = () => {
  const currDate = new Date();
  return currDate.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);
  // return `${currHour}:${currMinutes}`
};
const decodeMessage = (message) => {
  try {
    return JSON.parse(message);
  } catch (error) {
    return null;
  }
};
const hiddenChatter = {
  currentWS: null,
  containerBody: null,
  inputText: "",
  messageEventListener: function (e) {
    const data = decodeMessage(e.data);
    if (data === null) {
      // most likely ping/pong
      return;
    }
    if (data.type === "notification" && data.notification === "chat-message") {
      hiddenChatter.addMessage(data);
    }
  },
  selectActiveWS: function (array) {
    // find WebSocket with open state
  },
  init: async function () {
    const wsPromise = new Promise((resolve) => {
      const originalSend = WebSocket.prototype.send;
      window.sockets = [];
      WebSocket.prototype.send = function (...args) {
        if (window.sockets.indexOf(this) === -1) {
          // window.sockets.push(this);
          // console.log("Added socket");
          resolve(this);
        }
        return originalSend.call(this, ...args);
      };
    });

    console.log("Starting");
    this.currentWS = await wsPromise
    console.log("Found socket");
    this.currentWS.addEventListener(
      "message",
      this.messageEventListener,
      false
    );

    // Add elements
    const trashCSS = `
    .trashChatDiv {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      margin: 12px;
      bottom: 0px;
      left: 0px;
      z-index: 100;
      background-color: #1f1f1fb8;
      border: 1px solid black;
      border-radius: 10px;
      overflow: hidden;
      height: 500px;
      width: 320px;
    }
    .trashChatContainer {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: auto;
      scroll-behavior: smooth;
    }
    .trashChatContainer::-webkit-scrollbar {
        width: 10px;
    }
    .trashChatContainer::-webkit-scrollbar-track {
        background: transparent;
    }
    .trashChatContainer::-webkit-scrollbar-thumb {
        background: #2e2e2e;
        border-radius: 5px;
    }
    .trashChatContainer::-webkit-scrollbar-thumb:hover {
        background: #b9b9b9;
    }
    .trashHeader {
      margin: 5px 0;
      padding-bottom: 5px;
      font-size: 1.5em;
    }
    .trashMessageBody {
      width: fit-content;
      min-width: 150px;
      display: flex;
      flex-direction: column;
      margin: 2px 10px;
      padding: 5px 10px;
      background-color: #00397c;
      border-radius: 10px;
      color: white;
    }
    .trashMessageFrom {
      height: 20px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-weight: bold;
      font-size: 16px;
    }
    .trashMessageText {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      word-break: break-word;
      font-size: 18px;
    }
    .trashMessageDate {
      height: 12px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 12px;
    }
    .trashChatInputContainter {
      display: flex;
      justify-content: space-around;
      width: 100%;
      height: 40px;
      margin: 2px 10px;
      padding: 5px 10px;
    }
    .trashChatInput {
      width: 100%;
      height: 40px;
      margin: 0 10px;
      padding-left: 10px;
      background-color: #2e2e2e;
      border-radius: 10px;
      border: 0px solid transparent;
      color: white;
      font-size: 18px;
      transition: border 0.25s;
    }
    .trashChatInput:focus {
        border: 1px solid white;
        transition: border 0.25s;
      }
    .trashChatButton {
        width: 80px;
        height: 40px;
        margin-right:10px;
        background-color: #2e2e2e;
        border-radius: 10px;
        border: 0 solid transparent;
        transition: background-color 0.25s;
        color: white;
    }
    .trashChatButton:hover {
        background-color: #b9b9b9;
        cursor: pointer;
        transition: background-color 0.25s;
    }
    `;
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    head.appendChild(style);
    if (style.styleSheet) {
      // This is required for IE8 and below.
      style.styleSheet.cssText = trashCSS;
    } else {
      style.appendChild(document.createTextNode(trashCSS));
    }

    const chatBody = document.createElement("div");
    chatBody.className = "trashChatDiv";
    chatBody.innerHTML = `
    <h1 class="trashHeader">Messages</h1>
    <div class="trashChatContainer"></div>
    <div class="trashChatInputContainter">
    <input class="trashChatInput" type="text" placeholder="Message...">
    <input class="trashChatButton" type="button" value="Send">
    </div>
    `;

    window.document.body.appendChild(chatBody);
    this.containerBody = document.querySelector(".trashChatContainer");
  },
  addControls: function () {
    // Add events to controls
    const chatInput = document.querySelector(".trashChatInput");
    const chatButton = document.querySelector(".trashChatButton");

    chatInput.oninput = (e) => {
      hiddenChatter.inputText = e.target.value;
    };
    chatInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        hiddenChatter.addMessage({
          message: hiddenChatter.inputText,
          participantId: "You",
        });
        hiddenChatter.submitMessage(this.inputText);
        hiddenChatter.inputText = "";
        e.target.value = "";
      }
    };
    chatButton.onclick = () => {
      hiddenChatter.addMessage({
        message: hiddenChatter.inputText,
        participantId: "You",
      });
      hiddenChatter.submitMessage(this.inputText);
      hiddenChatter.inputText = "";
      chatInput.value = "";
    };
  },
  addMessage: function (msg) {
    // TODO: Add timestamps data
    // "stamp": 1671098365621000000,
    const { participantId, message } = msg;
    if (message === "") return;
    if (this.containerBody.childElementCount > 20) {
      this.containerBody.removeChild(this.containerBody.children[0]);
    }
    const messageBody = document.createElement("div");
    messageBody.className = "trashMessageBody";
    messageBody.innerHTML = `
      <div class="trashMessageFrom">${participantId}</div>
      <div class="trashMessageText">${message}</div>
      <div class="trashMessageDate">${formatTime()}</div>
      `;
    this.containerBody.appendChild(messageBody);
    this.containerBody.scrollTop = this.containerBody.scrollHeight;
  },
  submitMessage: function (msg) {
    if (this.inputText === "") return;
    this.currentWS.send(
      JSON.stringify({
        command: "chat-message",
        message: msg,
        sequence: 1,
      })
    );
  },
  debugHistory: function () {
    this.currentWS.send(
      JSON.stringify({
        command: "chat-history",
        sequence: 1,
      })
    );
  },
};
console.clear();
await hiddenChatter.init();
hiddenChatter.addControls();