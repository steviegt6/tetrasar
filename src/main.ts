import { app, powerSaveBlocker, ipcMain, BrowserWindow } from "electron";
import { log } from "./utils/flavoredLogger";
import { createDiscordClient } from "./utils/discordRp";
import { createWindow, setBlockMovement } from "./windowHandler";

import {
  storeEmergency,
  storeVsync,
  storeAnglecompat,
  ipcPresence,
  ipcDevtools,
  ipcFullscreen,
  ipcClose,
  ipcFlash,
  ipcNuke,
  ipcBlockmovement,
} from "./utils/constants.js";
import { getVal, setVal } from "./utils/wrappedStore";

import config from "./assets/config.json";
import { RP } from "discord-rich-presence";

//#region Verify Single Instance
// TODO: Permit multi-usage?
/**
 * A single instance lock to verify that we only have a single process open.
 */
const instanceLock: boolean = app.requestSingleInstanceLock();

if (!instanceLock) {
  log("Found an already-active TETR.IO instance! Aborting process.");
  app.quit();
}
//#endregion

//#region Initial Set-Up (Command Line & Discord IPC)
app.commandLine.appendSwitch("--disable-gpu-sandbox");
app.commandLine.appendSwitch("--enable-webgl2-compute-context");
app.commandLine.appendSwitch("--lang", "en-US");
app.commandLine.appendSwitch("--no-sandbox");
app.commandLine.appendSwitch("--force-discrete-gpu", "1");
app.commandLine.appendSwitch("--enable-high-resolution-time");
app.commandLine.appendSwitch("--enable-zero-copy");
app.commandLine.appendSwitch("--ignore-gpu-blacklist");
app.commandLine.appendSwitch("--autoplay-policy", "no-user-gesture-required");

powerSaveBlocker.start("prevent-display-sleep");

var discordIpcClient: RP | null = null;

if (!getVal(storeEmergency)) {
  // Disable vsync if it's disabled/unsupported.
  if (!getVal(storeVsync)) {
    app.commandLine.appendSwitch("--disable-frame-rate-limit");
    app.commandLine.appendSwitch("--disable-gpu-vsync");
  }

  // Initialize the IPC client.
  try {
    discordIpcClient = createDiscordClient();
  } catch (e) {
    log("Error encountered when initializing Discord IPC client: " + e);
  }
} else {
  // Included for parity with the original ASAR.
  setTimeout(() => {
    setVal(storeEmergency, false);
  }, 10000);
}

if (getVal(storeAnglecompat)) {
  app.commandLine.appendSwitch("--use-angle", "gl");
}
//#endregion

export var appWindow: BrowserWindow | null = null;

export function setAppWindow(window: BrowserWindow | null) {
  appWindow = window;
}

//#region App Listeners
app.whenReady().then(() => {
  try {
    appWindow = createWindow();
  } catch (e) {
    log("Failed to create window:" + e);
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

// Handle non-MacOS URls.
app.on("second-instance", (event, argv) => {
  try {
    argv.forEach((arg) => {
      if (arg.startsWith("tetrio://")) {
        if (appWindow) {
          appWindow.webContents.send(
            "goto",
            `${config.target}#${arg.replace("tetrio://", "").replace("/", "")}`
          );

          appWindow.show();
        }
      }
    });
  } catch (ex) {}
});

// Handle MacOS URLs.
app.on("open-url", (_, url) => {
  try {
    if (url.startsWith("/")) {
      url = url.substr(1);
    }

    if (appWindow) {
      appWindow.webContents.send(
        "goto",
        `${config.target}#${url.replace("tetrio://", "").replace("/", "")}`
      );

      appWindow.show();
    }
  } catch (ex) {}
});
//#endregion

//#region IPC Listeners
ipcMain.on(ipcPresence, (_, arg) => {
  if (discordIpcClient === null) {
    return;
  }
  try {
    discordIpcClient.updatePresence(arg);
  } catch (e) {
    log("Error updating Discord presence: " + e);
  }
});

ipcMain.on(storeEmergency, (_) => {
  setVal(storeEmergency, true);
  app.relaunch();
  app.exit(0);
});

ipcMain.on(storeVsync, (_, newvalue) => {
  setVal(storeVsync, !!newvalue);
});

ipcMain.on(ipcDevtools, (_) => {
  if (!appWindow) {
    return;
  }

  // TODO: Why?
  (appWindow as any).toggleDevTools();
});

ipcMain.on(ipcFullscreen, (_) => {
  if (!appWindow) {
    return;
  }
  appWindow.setFullScreen(!appWindow.isFullScreen());
});

ipcMain.on(ipcClose, (_) => {
  if (appWindow === null) {
    return;
  }

  setVal("window-width", appWindow.getBounds().width);
  setVal("window-height", appWindow.getBounds().height);
  setVal("window-maximized", appWindow.isMaximized());
  setVal("window-fullscreen", appWindow.isFullScreen());

  appWindow.close();
});

ipcMain.on(ipcFlash, (_) => {
  if (appWindow === null) {
    return;
  }
  appWindow.once("focus", () => {
    if (appWindow === null) {
      return;
    }

    appWindow.flashFrame(false);
  });

  appWindow.flashFrame(true);
});

ipcMain.on(storeAnglecompat, (_, arg) => {
  if (appWindow === null) {
    return;
  }

  setVal(storeAnglecompat, arg);
});

ipcMain.on(ipcNuke, (_) => {
  if (appWindow === null) {
    return;
  }

  try {
    // New Electron
    appWindow.webContents.session
      .clearCache()
      .then(() => {
        if (appWindow === null) {
          return;
        }

        return appWindow.webContents.session.clearStorageData({
          storages: [
            "appcache",
            "shadercache",
            "serviceworkers",
            "cachestorage",
          ],
        });
      })
      .then(() => {
        if (appWindow === null) {
          return;
        }

        appWindow.reload();
      });
  } catch (ex) {
    // Old Electron
    appWindow.webContents.session.clearCache().then(() => {
      if (appWindow === null) {
        return;
      }

      appWindow.webContents.session
        .clearStorageData({
          storages: [
            "appcache",
            "shadercache",
            "serviceworkers",
            "cachestorage",
          ],
        })
        .then(() => {
          if (appWindow === null) {
            return;
          }

          appWindow.reload();
        });
    });
  }
});

ipcMain.on(ipcBlockmovement, (_, newvalue) => {
  setBlockMovement(!!newvalue);
});
//#endregion
