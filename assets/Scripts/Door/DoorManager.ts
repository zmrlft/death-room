import { _decorator } from 'cc'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enums'
import EventManager from '../../Runtime/EventManager'
// import { IEntity } from '../../Levels'
import { DoorStateMachine } from './DoorStateMachine'
import DataManager from '../../Runtime/DataManager'
import { EntityManager } from '../../Base/EntityManager'
import { IENTITY } from '../../Levels'
const { ccclass } = _decorator

@ccclass('DoorManager')
export class DoorManager extends EntityManager {
  async init(params: IENTITY) {
    this.fsm = this.addComponent(DoorStateMachine)
    await this.fsm.init()
    super.init(params)
    EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this)
  }

  onDestroy() {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen)
  }

  onOpen() {
    if (
      DataManager.Instance.enemies.every((enemy: EntityManager) => enemy.state === ENTITY_STATE_ENUM.DEATH) &&
      this.state !== ENTITY_STATE_ENUM.DEATH
    ) {
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }
}
