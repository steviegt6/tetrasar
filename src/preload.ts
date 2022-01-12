import { log } from "./utils/flavoredLogger";
import systeminformation, { Systeminformation } from "systeminformation";
import { ipcRenderer } from "electron";

/**
 * Define used window extension definitions.
 */
declare global {
  interface Window {
    IS_ELECTRON: boolean;
    IPC: Electron.IpcRenderer;
    BASEBOARD: string | undefined;
    REFRESH_RATE: number;
  }
}

//Populate window extension variables, called in `preload.ts`.
window.IS_ELECTRON = true;
window.IPC = ipcRenderer;
window.BASEBOARD = undefined;
window.REFRESH_RATE = 60;

systeminformation
  .baseboard()
  .then((x: Systeminformation.BaseboardData) => {
    window.BASEBOARD = x.serial;
  })
  .catch((e) => {
    log("System information baseboard error: " + e);
  });

// Calculate the maximum display refresh rate. Default is 60, use 60 as an undefined back-up as well.
systeminformation
  .graphics()
  .then((x: Systeminformation.GraphicsData) => {
    x.displays.forEach((display: Systeminformation.GraphicsDisplayData) => {
      window.REFRESH_RATE = Math.max(
        window.REFRESH_RATE,
        display.currentRefreshRate || 60
      );
    });
  })
  .catch((e) => {
    log("System information graphics error: " + e);
  });
