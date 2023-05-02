const clicker = {
  hasClicked: 0,
  timeSinceLastClick: 0,
  hidden: false,
  intID: undefined,
  lastClicked: new Date().getTime(),
  toggleButton: document.createElement("button"),
  rowsContainer: document.createElement("div"),
  hideMenuButton: document.createElement("button"),
  init: function () {
    const trashCSS = `
    .trashCounterDiv {
        position: absolute;
        display: flex;
        margin: 12px;
        align-items: center;
        bottom: 0px;
        left: 0px;
        z-index: 100;
    }
    .trashRowsContainer {
        position: absolute;
        top: -50px;
        left: 37px;
        visibility: visible;
        opacity: 1;
        display: flex;
        font-weight: bold;
        color: white;
        overflow: hidden;
        white-space: nowrap;
        background-color: rgb(96 96 96 / 80%);
        border-radius: 10px;
        border: 1px solid #a970ff;
        justify-content: space-evenly;
        align-items: center;
        flex-direction: column;
        width: 250px;
        height: 50px;
        box-shadow: 5px 5px 6px 1px #0000004a;
        transition: visibility 0.5s ease-out, opacity 0.5s ease-out;
    }
    .trashRowsContainer.hidden {
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
    }
    .trashRow {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .trashButton {
        width: 100%;
        height: 100%;
        padding: 0;
        background-color: rgba(255, 255, 255, 0.38);
        border: 0;
        border-bottom-right-radius: 10px;
        border-bottom-left-radius: 10px;
        text-align: center;
    }
    .trashButton:hover {
        background-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
    }
    .trashCloseButton {
        position: absolute;
        width: 25px;
        height: 25px;
        top: -25px;
        right: -25px;
        background-color: rgba(255, 255, 255, 0.38);
        border: 1px solid #a970ff;
        border-radius: 50%;
        text-align: center;
        box-shadow: 5px 5px 6px 1px #0000004a;
        transition: top 0.5s ease-out, right 0.5s ease-out;
    }
    .trashCloseButton:hover {
        background-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
    }
    .active {
        border: 1px solid #70ffdb;
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

    const _this = this;
    const clickerBody = document.createElement("div");
    clickerBody.className = "trashCounterDiv";
    this.rowsContainer.className = "trashRowsContainer";

    const hideMenu = () => {
      this.rowsContainer.classList.toggle("hidden");
      this.hidden = !this.hidden;
      this.updateNumbers()
    };

    const row1 = document.createElement("div");
    row1.className = "trashRow";
    this.c1 = document.createElement("span");
    this.c2 = document.createElement("span");
    row1.appendChild(this.c1);
    row1.appendChild(this.c2);

    const row2 = document.createElement("div");
    row2.className = "trashRow";

    this.toggleButton.className = "trashButton";
    this.toggleButton.innerText = "Start";
    this.toggleButton.onclick = function (e, foo = _this) {
      foo.toggleClicking(60);
    };
    row2.appendChild(this.toggleButton);

    this.hideMenuButton.className = "trashCloseButton";
    this.hideMenuButton.onclick = hideMenu;

    clickerBody.appendChild(this.rowsContainer);
    clickerBody.appendChild(this.hideMenuButton);
    this.rowsContainer.appendChild(row1);
    this.rowsContainer.appendChild(row2);
    this.updateNumbers()
    document.body.appendChild(clickerBody);
  },
  tryToClick: function () {
    // TODO: Implement a better way to find the button.
    const button = document.querySelector(".claimable-bonus__icon");
    if (button === null) return;
    button.click();
    this.hasClicked += 1;
    this.lastClicked = new Date().getTime()
    this.timeSinceLastClick = 0;
    return;
  },
  updateNumbers: function () {
    this.c1.textContent = `Clicked: ${this.hasClicked}`;
    this.c2.textContent = `Clicked ${this.timeSinceLastClick} s. ago`;
    if (!this.hidden) {
        this.hideMenuButton.innerText = "X";
      } else {
        this.hideMenuButton.innerText = this.hasClicked;
      }
  },
  toggleClicking: function (interval = 5) {
    this.rowsContainer.classList.toggle("active");
    this.hideMenuButton.classList.toggle("active");

    if (this.intID) {
      console.log("Stopping");
      clearInterval(this.intID);
      this.intID = undefined;
      this.toggleButton.innerText = "Start";
      return;
    }
    this.intID = setInterval(() => {
      this.tryToClick();
      this.updateNumbers();
    }, 1000 * interval);
    console.log(
      `Clicking every ${interval} seconds. Interval ID: ${this.intID}`
    );
    this.toggleButton.innerText = "Stop";
  },
}.init()