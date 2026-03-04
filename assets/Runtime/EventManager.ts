import Singleton from '../Base/Singleton'

export default class EventManager extends Singleton {
  static get Instance() {
    return super.GetInstance<EventManager>()
  }

  private eventDic: Map<string, Array<Function>> = new Map()

  on(eventName: string, func: Function, ctx: any) {
    func = func.bind(ctx)
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).push(func)
    } else {
      this.eventDic.set(eventName, [func])
    }
  }

  Off(eventName: string, func: Function) {
    if (this.eventDic.has(eventName)) {
      const index = this.eventDic.get(eventName).indexOf(func)
      index > -1 && this.eventDic.get(eventName).splice(index, 1)
    }
  }

  emit(eventName: string, ...params: unknown[]) {
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).forEach(func => {
        func(...params)
      })
    }
  }

  clear() {
    this.eventDic.clear()
  }
}
