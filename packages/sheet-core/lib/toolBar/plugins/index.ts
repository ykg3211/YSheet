import Base from '../base';
import DarkMode from './DarkMode.ts';

export enum PluginTypeEnum {
  DarkMode = 'DarkMode',
}

export interface PluginType {
  [PluginTypeEnum.DarkMode]?: DarkMode;
}

export interface BasePluginType {
  _this: Base;
  remove?: () => void;
}

export default class Plugins {
  private _this: Base;

  constructor(_this: Base) {
    this._this = _this;

    this.register(DarkMode);
  }

  public deregister(name?: PluginTypeEnum) {
    if (name) {
      //@ts-ignore
      this._this.pluginsMap[name]?.remove?.();
    } else {
      Object.values(this._this.pluginsMap).forEach((plugin) => plugin.remove?.());
    }
  }

  public register(Plugin: any) {
    const newPlugin = new Plugin(this._this);
    const name = newPlugin.name as PluginTypeEnum;

    if (this._this.pluginsMap[name]) {
      //@ts-ignore
      this._this.pluginsMap[name]?.remove?.();
    }

    this._this.pluginsMap[name] = newPlugin;
  }
}
