import Singleton from '../Base/Singleton'

export default class EventManager extends Singleton {
  static get Instance() {
    return super.GetInstance<EventManager>()
  }

  private eventDic: Map<string, Array<{ cb: Function; ctx: any }>> = new Map()

  on(eventName: string, func: Function, ctx: any) {
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).push({ cb: func, ctx })
    } else {
      this.eventDic.set(eventName, [{ cb: func, ctx }])
    }
  }

  off(eventName: string, func: Function) {
    if (this.eventDic.has(eventName)) {
      const index = this.eventDic.get(eventName).findIndex(item => item.cb === func)

      index > -1 && this.eventDic.get(eventName).splice(index, 1)
    }
  }

  emit(eventName: string, ...params: unknown[]) {
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).forEach(item => {
        item.cb.call(item.ctx, ...params)
      })
    }
  }

  clear() {
    this.eventDic.clear()
  }
}
