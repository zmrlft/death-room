import { _decorator, Component, Node, Sprite, UITransform } from 'cc'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import ResourceManager from '../../Runtime/ResourceManager'
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  DIRECTION_ORDER_ENUM,
  ENTITY_STATE_ENUM,
  ENTITY_TYPE_ENUM,
  EVENT_ENUM,
  PARAMS_NAME_ENUM,
} from '../../Enums'
import EventManager from '../../Runtime/EventManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'
import { EntityManager } from '../../Base/EntityManager'
import DataManager from '../../Runtime/DataManager'
import { EnemyManager } from '../../Base/EnemyManager'
import { IENTITY } from '../../Levels'
const { ccclass, property } = _decorator

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EnemyManager {
  async init(params: IENTITY) {
    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()
    super.init(params)

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
  }

  onDestroy(): void {
    super.onDestroy()
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack)
  }

  onAttack() {
    if (this.state === ENTITY_STATE_ENUM.DEATH) {
      return
    }

    const player = DataManager.Instance.player
    if (!player) {
      return
    }

    const { targetX: playerX, targetY: playerY, state: playerState } = player
    if (
      ((playerX === this.x && Math.abs(playerY - this.y) <= 1) ||
        (playerY === this.y && Math.abs(playerX - this.x) <= 1)) &&
      playerState !== ENTITY_STATE_ENUM.DEATH &&
      playerState !== ENTITY_STATE_ENUM.AIRDEATH
    ) {
      if (playerX === this.x) {
        this.direction = playerY > this.y ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.TOP
      } else {
        this.direction = playerX > this.x ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.LEFT
      }
      this.state = ENTITY_STATE_ENUM.ATTACK
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH)
    } else {
      this.state = ENTITY_STATE_ENUM.IDLE
    }
  }
}
