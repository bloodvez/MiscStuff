const wiper = {
  selectedThread: null, // null by default
  selectedBoard: "", // Empty string by default
  captchaID: "",
  threadInfo: {},
  elements: {},
  timeLeft: 0,
  init: function () {
    // CSS
    const trashCSS = `
        .wiperBodyDiv {
          display: flex;
          flex-direction: column;
          position: fixed;
          width: 500px;
          background: #202020;
          border: solid 1px #ddd;
          top: 3rem;
          right: 1rem;
          padding: 10px;
          gap: 15px;
          z-index: 1000;
        }
        .wiperButtonsDiv {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .wiperJustify {
          display: flex;
          gap: 10px;
          justify-content: space-around;
        }
        .wiperHidden {
          display: none;
        }
        .wiperCaptchaImg {
          height: 120px;
          width: 270px;
          flex-shrink: 0;
        }
        .wiperCaptchaDiv {
          display: flex;
          gap: 10px;
        }
        .wiperCaptchaControlsDiv {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 10px;
        }
        .wiperButton {
          border: 1px solid transparent;
          color: black;
          background-color: #46a136;
          width: 5rem;
          height: 1.5rem;
          transition: border 0.25s ease-out
        }
        .wiperButton:hover {
          cursor: pointer;
          border: 1px solid white;
          transition: border 0.25s ease-in
        }
        .wiperButtonInactive {
          background-color: gray;
          border: 1px solid transparent;
        }
        .wiperButtonInactive:hover {
          cursor: not-allowed;
        }
        .wiperTextInput {
          width: -webkit-fill-available;
          border: 2px solid transparent;
          height: 1.5rem;
          padding: 0 3px;
        }
        .wiperTextInput:focus {
          outline: none;
        }
        .wiperTextInputIncomplete {
          border: 2px solid red;
        }
        .wiperBoardSelector {
          width: 100%;
        }
        .wiperThreadSelector {
          width: 100%;
        }
        .wiperInfoSpan {
          color: white;
          word-wrap: break-word;
          white-space: break-spaces;
        }
        .wiperBodyDiv input::-webkit-outer-spin-button,
        .wiperBodyDiv input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
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

    // Elements
    const wiperBody = document.createElement("div");
    wiperBody.className = "wiperBodyDiv";
    wiperBody.innerHTML = `
      <div class="wiperButtonsDiv">
        <div class="wiperJustify">
          <input class="wiperBoardSelector wiperTextInput" type="text" placeholder="board name">
          <input class="wiperThreadSelector wiperTextInput" type="number" placeholder="thread number">
        </div>
        <div class="wiperJustify">
          <button class="wiperButton wiperButtonSingle">single</button>
          <button class="wiperButton wiperButtonAll" name="autoSend">all</button>
        </div>
      </div>
      <div class="wiperCaptchaDiv">
        <img class="wiperCaptchaImg">
        <div class="wiperCaptchaControlsDiv">
            <input class="wiperCaptchaInput wiperTextInput" type="number" placeholder="captcha">
            <div class="wiperJustify">
              <button class="wiperButton wiperButtonSend wiperButtonInactive">send</button>
              <input class="wiperAutoCheckbox" type="checkbox">
              <label for="autoSend">auto send</label>
            </div>
            <span class="wiperInfoSpan">info</span>
            <span class="wiperCountdownSpan"></span>
        </div>
      </div>
    `;

    // Append stuff
    document.body.appendChild(wiperBody);

    // Add functionality to buttons
    {
      // Button Single
      wiper.elements.singleButton =
        document.querySelector(".wiperButtonSingle");
      wiper.elements.singleButton.addEventListener("click", (e) => {
        wiper.elements.selectedThread.classList.remove(
          "wiperTextInputIncomplete"
        );
        wiper.elements.selectedBoard.classList.remove(
          "wiperTextInputIncomplete"
        );

        if (wiper.selectedBoard === "" && wiper.selectedThread === null) {
          wiper.elements.selectedThread.classList.add(
            "wiperTextInputIncomplete"
          );
          wiper.elements.selectedBoard.classList.add(
            "wiperTextInputIncomplete"
          );
          wiper.elements.infoSpan.innerText = "no nothing";
          return;
        }
        if (wiper.selectedBoard === "") {
          wiper.elements.selectedBoard.classList.add(
            "wiperTextInputIncomplete"
          );
          wiper.elements.infoSpan.innerText = "no board";
          return;
        }
        if (wiper.selectedThread === null) {
          wiper.elements.selectedThread.classList.add(
            "wiperTextInputIncomplete"
          );
          wiper.elements.infoSpan.innerText = "no thread";
          return;
        }
        wiper.elements.infoSpan.innerText = "loading";
        wiper.randomWipe();
      });

      // Button All
      wiper.elements.allButton = document.querySelector(".wiperButtonAll");
      wiper.elements.allButton.addEventListener("click", (e) => {
        console.log("all");
      });

      // Button Send
      wiper.elements.sendButton = document.querySelector(".wiperButtonSend");
      wiper.elements.sendButton.disabled = true;
      wiper.elements.sendButton.addEventListener("click", (e) => {
        wiper.sendCaptcha(wiper.generateCommentRandom());
      });

      // Textbox Thread Selector
      wiper.elements.selectedThread = document.querySelector(
        ".wiperThreadSelector"
      );
      wiper.elements.selectedThread.oninput = (e) => {
        wiper.selectedThread = e.target.value;
        localStorage.setItem(
          "wiperStorage",
          JSON.stringify({
            selectedBoard: wiper.selectedBoard,
            selectedThread: wiper.selectedThread,
          })
        );
      };

      // Textbox Board Selector
      wiper.elements.selectedBoard = document.querySelector(
        ".wiperBoardSelector"
      );
      wiper.elements.selectedBoard.oninput = (e) => {
        wiper.selectedBoard = e.target.value;
        localStorage.setItem(
          "wiperStorage",
          JSON.stringify({
            selectedBoard: wiper.selectedBoard,
            selectedThread: wiper.selectedThread,
          })
        );
      };

      // Textbox Captcha
      wiper.elements.captchaInput =
        document.querySelector(".wiperCaptchaInput");
      wiper.elements.captchaInput.addEventListener("keypress", (e) => {
        if (e.target.value.length >= 6) {
          e.preventDefault();
        }
        if (e.keyCode === 13 && e.target.value.length >= 6) {
          wiper.elements.sendButton.click();
        }
      });
      wiper.elements.captchaImg = document.querySelector(".wiperCaptchaImg");
      wiper.elements.captchaImg.addEventListener("click", (e) => {
        e.target.src = e.target.src
      });
      wiper.elements.infoSpan = document.querySelector(".wiperInfoSpan");
      wiper.elements.countdownSpan = document.querySelector(
        ".wiperCountdownSpan"
      );

      // Load last thread number from storage
      const wiperStorage = localStorage.getItem("wiperStorage");
      if (wiperStorage === null) return;

      const storageJSON = JSON.parse(wiperStorage);
      wiper.elements.selectedThread.value = storageJSON.selectedThread;
      wiper.elements.selectedBoard.value = storageJSON.selectedBoard;
      wiper.selectedThread = storageJSON.selectedThread;
      wiper.selectedBoard = storageJSON.selectedBoard;

      // Countdown
      setInterval(() => {
        if (wiper.timeLeft <= 0) {
          wiper.elements.countdownSpan.innerText = "";
          return;
        }
        wiper.timeLeft -= 1;
        wiper.elements.countdownSpan.innerText = wiper.timeLeft;
      }, 1000);
    }
  },

  randomWipe: async function () {
    // Fetch thread info first
    const updated = await this.updateThreadInfo();

    if (updated) {
      // Get captcha
      await this.updateCaptcha(this.selectedBoard, this.selectedThread);
    }
  },

  generateCommentRandom: function () {
    const messages = this.threadInfo.threads[0].posts.reduce((acc, current) => {
      acc.push(current.num);
      return acc;
    }, []);

    let msg = "";

    // You can have maximum of 30 replies in one post
    // If thread has less than 30 post we can reply to all of them
    if (messages.length <= 30) {
      messages.forEach((elem, index, arr) => {
        msg += `>>${elem}`;
        if (index + 1 !== arr.length) {
          msg += "\n";
        }
      });
      return msg;
    } else {
      // More than 30 posts, reply to first, last and 28 random messages
      msg += `>>${messages[0]}\n`;
      messages.splice(0, 1);
      msg += `>>${messages[messages.length - 1]}\n`;
      messages.splice(messages.length - 1, 1);

      let resArr = [];
      for (let i = 0; i < 28; i++) {
        const randIndex = Math.floor(Math.random() * messages.length);
        resArr.push(messages[randIndex]);
        messages.splice(randIndex, 1);
      }

      resArr.forEach((elem, index) => {
        msg += `>>${elem}`;
        if (index < 27) {
          msg += "\n";
        }
      });
      return msg;
    }
  },

  updateThreadInfo: async function () {
    try {
      const res = await (
        await fetch(
          `https://2ch.hk/${this.selectedBoard}/res/${this.selectedThread}.json`
        )
      ).json();
      this.threadInfo = res;
      return true;
    } catch (error) {
      this.elements.infoSpan.innerText = "thread does not exist";
      this.elements.selectedThread.classList.add("wiperTextInputIncomplete");
      return false;
    }
  },

  updateCaptcha: async function (board, thread) {
    try {
      const res = await (
        await fetch(
          `https://2ch.hk/api/captcha/2chcaptcha/id?board=${board}&thread=${thread}`
        )
      ).json();
      if (res.result === 0) {
        return;
      }
      this.captchaID = res.id;
      this.elements.captchaImg.src = `https://2ch.hk/api/captcha/2chcaptcha/show?id=${res.id}`;
      this.elements.infoSpan.innerText = "input captcha";
      this.elements.sendButton.classList.remove("wiperButtonInactive");
      this.elements.captchaInput.value = "";
      this.elements.sendButton.disabled = false;
    } catch (error) {
      this.elements.infoSpan.innerText = "could not load captcha";
    }
  },

  sendCaptcha: async function (message) {
    if (this.timeLeft > 0) {
      this.elements.infoSpan.innerText = "20 seconds haven't passed yet";
      return;
    }

    this.elements.singleButton.classList.add("wiperButtonInactive");
    this.elements.allButton.classList.add("wiperButtonInactive");
    this.elements.sendButton.classList.add("wiperButtonInactive");
    this.elements.sendButton.disabled = true;
    this.elements.singleButton.disabled = true;
    this.elements.allButton.disabled = true;

    const captcha = this.elements.captchaInput;

    const formData = new FormData();
    formData.append("task", "post");
    formData.append("board", this.selectedBoard);
    formData.append("thread", this.selectedThread);
    formData.append("usercode", "");
    formData.append("code", "");
    formData.append("captcha_type", "2chcaptcha");
    formData.append("email", "sage");
    formData.append("comment", message);
    formData.append("oekaki_image", "");
    formData.append("oekaki_metadata", "post");
    formData.append("2chcaptcha_value", captcha.value);
    formData.append("2chcaptcha_id", this.captchaID);
    formData.append("makaka_id", "");
    formData.append("makaka_answer", "");

    this.elements.infoSpan.innerText = "sending";
    try {
      const res = await (
        await fetch("https://2ch.hk/user/posting?nc=1", {
          body: formData,
          method: "post",
        })
      ).json();
      if (res.result === 0 && res.error.code === -5) {
        this.elements.infoSpan.innerText = "wrong captcha";
        this.elements.sendButton.classList.remove("wiperButtonInactive");
        this.elements.sendButton.disabled = false;

        this.elements.singleButton.classList.remove("wiperButtonInactive");
        this.elements.allButton.classList.remove("wiperButtonInactive");
        this.elements.singleButton.disabled = false;
        this.elements.allButton.disabled = false;
        return;
      }
      if (res.result === 0 && res.error.code === -8) {
        this.elements.infoSpan.innerText = "too fast";
        return;
      }
      if (res.result === 1) {
        this.captchaID = "";
        this.elements.captchaImg.src = "";
        this.elements.infoSpan.innerText = "sent";
        this.elements.sendButton.classList.add("wiperButtonInactive");
        this.elements.sendButton.disabled = true;
        this.timeLeft = 20;
        captcha.value = "";
      }
      this.elements.singleButton.classList.remove("wiperButtonInactive");
      this.elements.allButton.classList.remove("wiperButtonInactive");
      this.elements.singleButton.disabled = false;
      this.elements.allButton.disabled = false;
    } catch (error) {
      this.elements.infoSpan.innerText = "error while sending";
      console.log(error);
    }
  },
};
wiper.init();
