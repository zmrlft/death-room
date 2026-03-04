import { AnimationClip } from 'cc'
import { SubStateMachine } from '../../Base/SubStateMachine'
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_ENUM } from '../../Enums'
import State from '../../Base/State'
import { StateMachine } from '../../Base/StateMachine'

const BAST_URL = 'texture/player/turnleft'

export default class TurnLeftSubStateMachine extends SubStateMachine {
  constructor(fsm: StateMachine) {
    super(fsm)
    this.stateMachines.set(DIRECTION_ENUM.TOP, new State(fsm, `${BAST_URL}/top`))
    this.stateMachines.set(DIRECTION_ENUM.BUTTOM, new State(fsm, `${BAST_URL}/bottom`))
    this.stateMachines.set(DIRECTION_ENUM.LEFT, new State(fsm, `${BAST_URL}/left`))
    this.stateMachines.set(DIRECTION_ENUM.RIGHT, new State(fsm, `${BAST_URL}/right`))
  }

  run() {
    const value = this.fsm.getParams(PARAMS_NAME_ENUM.DIRECTION)
    this.currentState = this.stateMachines.get(DIRECTION_ORDER_ENUM[value as number])
  }
}
