import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from 'cc'
import { FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_ENUM } from '../Enums'
import State from '../Base/State'
import { SubStateMachine } from './SubStateMachine'
import { SpikesStateMachine } from '../Scripts/Spikes/SpikesStateMachine'

const { ccclass, property } = _decorator

type ParamsValueType = boolean | number

interface IParamsValue {
  type: FSM_PARAMS_TYPE_ENUM
  value: ParamsValueType
}

export const getInitParamsTrigger = () => {
  return {
    type: FSM_PARAMS_TYPE_ENUM.TRIGGER,
    value: false,
  }
}

export const getInitParamsNumber = () => {
  return {
    type: FSM_PARAMS_TYPE_ENUM.NUMBER,
    value: 1,
  }
}

@ccclass('StateMachine')
export default abstract class StateMachine extends Component {
  private _currentState: State | SubStateMachine = null
  params: Map<string, IParamsValue> = new Map()
  stateMachines: Map<string | number, State | SubStateMachine> = new Map()
  animationComponent: Animation
  waitList: Array<Promise<SpriteFrame[]>> = []

  getParams(paramsName: string) {
    if (this.params.has(paramsName)) {
      return this.params.get(paramsName).value
    }
  }

  setParams(paramsName: string, value: ParamsValueType) {
    if (this.params.has(paramsName)) {
      this.params.get(paramsName).value = value
      this.run()
      this.resetTrigger()
    }
  }
  resetTrigger() {
    for (const [_, value] of this.params) {
      if (value.type === FSM_PARAMS_TYPE_ENUM.TRIGGER) {
        value.value = false
      }
    }
  }

  get currentState() {
    return this._currentState
  }

  set currentState(newState: State | SubStateMachine) {
    this._currentState = newState
    this._currentState.run()
  }

  abstract init(): void

  abstract run(): void
}
