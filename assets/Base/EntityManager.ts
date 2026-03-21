import { _decorator, Component, Node, Sprite, UITransform } from 'cc'
import { TILE_HEIGHT, TILE_WIDTH } from '../Scripts/Tile/TileManager'
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  DIRECTION_ORDER_ENUM,
  ENTITY_STATE_ENUM,
  EVENT_ENUM,
  PARAMS_NAME_ENUM,
} from '../Enums'
import { PlayerStateMachine } from '../Scripts/Player/PlayerStateMachine'
import { IENTITY } from '../Levels'
import { ENTITY_TYPE_ENUM } from '../Enums'
import { randomByLen } from '../Utils'
const { ccclass, property } = _decorator

@ccclass('EntityManager')
export class EntityManager extends Component {
  id: string = randomByLen(12)
  x: number = 0
  y: number = 0
  fsm: PlayerStateMachine
  type: ENTITY_TYPE_ENUM

  protected transform: UITransform
  private _direction: DIRECTION_ENUM
  private _state: ENTITY_STATE_ENUM

  get direction() {
    return this._direction
  }

  set direction(newDirection: DIRECTION_ENUM) {
    this._direction = newDirection
    this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION, DIRECTION_ORDER_ENUM[this._direction])
  }

  get state() {
    return this._state
  }

  set state(newState: ENTITY_STATE_ENUM) {
    this._state = newState
    this.fsm.setParams(this._state, true)
  }

  async init(params: IENTITY) {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

    this.x = params.x
    this.y = params.y
    this.direction = params.direction
    this.state = params.state
    this.type = params.type
  }

  protected update(): void {
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
  }

  onDestroy() {}
}
