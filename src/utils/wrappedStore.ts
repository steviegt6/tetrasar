import ElectronStore from "electron-store";

export var electronStoreInstance: any = new ElectronStore();

export function getVal(value: any, def: any = false) {
  return electronStoreInstance.get(value, def);
}

export function setVal(key: string, value: any) {
  return electronStoreInstance.set(key, value);
}
