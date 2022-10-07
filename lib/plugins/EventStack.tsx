// @ts-no check
// 类型值和方法是protected，插件能用到但是会报错，所以插件都不提示

import Base from "../core/base/base";
import { EventZIndex } from "../core/base/constant";
import { EventConstant } from "./event";

// preData 是为了服用judge得到的值
type preData = any;
export interface EventStackType {
  type: EventZIndex;
  /**
   * 一个用来判断是进入innerFunc的判断方法，
   * 返回 false代表是outer，
   * 返回true或者任何值，代表inner，并且把该值重新当成inner的入参
   */
  judgeFunc: (e: MouseEvent) => boolean | preData;
  innerFunc: (e: MouseEvent, preData?: preData) => void | Array<(e: MouseEvent) => void>;
  outerFunc?: (e: MouseEvent, preData?: preData) => void | Array<(e: MouseEvent) => void>;
}
export enum EventType {

}

export type setEventType = (type: EventConstant) => ((props: EventStackType) => void);
export type dispatchEventType = (type: EventConstant) => ((e: MouseEvent) => void);

export default class EventStack {
  private _this: Base;
  private eventStack: Partial<Record<EventConstant, Array<EventStackType[]>>>;
  // 结构
  // eventStack: {
  //   mouse_move: [
  //     [
  //       {
  //         type: EventZIndex;
  //         judgeFunc: (e: MouseEvent) => boolean;
  //         innerFunc: (e: MouseEvent) => void | Array<(e: MouseEvent) => void>;
  //         outerFunc?: (e: MouseEvent) => void | Array<(e: MouseEvent) => void>;
  //       }
  //     ]
  //   ]
  // }
  constructor(_this: Base) {
    this._this = _this;
    this.eventStack = {};
    this._this.setEvent = this.setEvent.bind(this);
    this._this.dispatchEvent = this.dispatchEvent.bind(this);
  }

  protected setEvent(type: EventConstant) {
    if (!this.eventStack[type]) {
      this.eventStack[type] = [];
    }

    return (props: EventStackType) => {
      const pointer = this.eventStack[type][props.type];
      if (pointer) {
        pointer.push(props);
      } else {
        this.eventStack[type][props.type] = [props];
      }
    }
  }

  protected dispatchEvent(type: EventConstant) {
    return (e: MouseEvent) => {
      const innerFuncArr: ((e: MouseEvent) => void)[] = [];
      const outerFuncArr: ((e: MouseEvent) => void)[] = [];
      let isFirst = true;
      this.eventStack[type]?.forEach(events => {
        if (!isFirst) {
          return;
        }
        events.forEach(eventStack => {
          if (eventStack.judgeFunc) {
            const preData = eventStack.judgeFunc(e);
            if (preData !== false) {
              isFirst = false;
              innerFuncArr.push((e: MouseEvent) => {
                eventStack.innerFunc(e, preData);
              });
            } else {
              eventStack.outerFunc && outerFuncArr.push(eventStack.outerFunc);
            }
          }
          return false;
        })
      })
      outerFuncArr.flat().forEach(fn => fn(e))
      innerFuncArr.flat().forEach(fn => fn(e))
    }
  }
}