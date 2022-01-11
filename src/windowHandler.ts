import { BrowserWindow, dialog, shell } from "electron";
import { storeEmergency, storeVsync, storeWindowMaximized } from "./constants";
import { appWindow, setAppWindow } from "./main";
import config from "./assets/config.json";
import path from "path";
import { getVal, setVal } from "./store";

export var targetAddress: string =
  process.argv[1] && process.argv[1].includes("tetrio://")
    ? `${config.target}#${process.argv[1]
        .replace("tetrio://", "")
        .replace("/", "")}`
    : config.target;

export var blockMovement: boolean = true;

export function setBlockMovement(block: boolean) {
  blockMovement = block;
}

var crashStrings = {
  "abnormal-exit":
    "Renderer crashed (process exited with a non-zero exit code)!",
  killed: "Renderer crashed (process terminated unexpectedly)!",
  crashed: "Renderer crashed (Chromium engine crashed)!",
  oom: "Renderer crashed (out of memory)!",
  "launch-failure": "TETR.IO failed to open.",
  "integrity-failure": "Renderer crashed (code integrity checks failed)!",
};

export function createWindow() {
  // TODO: Make most of this configurable uwu
  var window = new BrowserWindow({
    title: "TETR.IO",
    show: true,
    width: getVal("window-width", 1600),
    height: getVal("window-height", 800),
    fullscreen: getVal("window-fullscreen", false),
    minWidth: 800,
    minHeight: 400,
    useContentSize: true,
    backgroundColor: "#000000",
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      // enableRemoteModule: false,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
      nativeWindowOpen: true,
      disableBlinkFeatures:
        "PreloadMediaEngagementData,AutoplayIgnoreWebAudio,MediaEngagementBypassAutoplayPolicies",
    },
  });

  if (getVal(storeWindowMaximized, false)) {
    window.maximize();
  }

  window.setMenu(null);

  initializeWebContentEvents(window);
  initializeWindowEvents(window);

  window.loadFile("index.html");

  return window;
}

function initializeWebContentEvents(window: BrowserWindow) {
  // Open outlinks in normal browser
  // TODO: Allow Tetraleague to open internally!!
  window.webContents.on(
    "new-window",
    (e: any, url: any, _: any, __: any, options: any) => {
      if (!blockMovement) {
        if (options.webPreferences) {
          options.webPreferences.nodeIntegration = false;
          options.webPreferences.nativeWindowOpen = true;
        } else {
          options.webPreferences = {
            nodeIntegration: false,
            nativeWindowOpen: true,
          };
        }
        return;
      }

      e.preventDefault();
      shell.openExternal(url);
    }
  );

  window.webContents.on("will-navigate", (e: any, url: any) => {
    if (!blockMovement) {
      return;
    }

    if (url !== window.webContents.getURL() && !url.startsWith(targetAddress)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  window.webContents.on("did-create-window", (newWindow: any) => {
    newWindow.setMenu(null);
  });

  window.webContents.on(
    "render-process-gone",
    (_: any, details: { reason: string }) => {
      if (details.reason === "clean-exit") {
        return;
      }

      // TODO: Remove "any" cast
      dialog.showMessageBoxSync({
        message: (crashStrings as any)[details.reason] || "Renderer crashed!",
        type: "error",
      });
    }
  );

  window.webContents.on("dom-ready", () => {
    window.webContents.executeJavaScript(
      `window.EMERGENCY_MODE = ${
        getVal(storeEmergency, false) ? "true" : "false"
      }; window.VSYNC_ON = ${
        getVal(storeVsync, false) ? "true" : "false"
      }; window.TARGET_ADDRESS = '${targetAddress.replace(
        `'`,
        `\\'`
      )}'; window.UPDATER_ADDRESS = '${config.updater_target.replace(
        `'`,
        `\\'`
      )}'; window.UPDATER_SITE = '${config.updater_site.replace(
        `'`,
        `\\'`
      )}'; window.CLIENT_VERSION = ${8}; window.PLATFORM_TYPE = '${
        process.platform
      }'; if (window.StartLoader) { StartLoader(); }`
    );
  });
}

function initializeWindowEvents(window: BrowserWindow) {
  window.on("close", () => {
    setVal("window-width", window.getBounds().width);
    setVal("window-height", window.getBounds().height);
    setVal("window-maximized", window.isMaximized());
    setVal("window-fullscreen", window.isFullScreen());
  });

  window.on("closed", () => {
    setAppWindow(null);
  });
}

module.exports = { createWindow, blockMovement, crashStrings };
