import { _decorator, Component, director, Node } from 'cc'
import { TileMapManager } from '../Tile/TileMapManager'
import { createUINode } from '../../Utils'
import levels, { ILevel } from '../../Levels'
import DataManager, { IRecord } from '../../Runtime/DataManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import EventManager from '../../Runtime/EventManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, SCENE_ENUM } from '../../Enums'
import { PlayerManager } from '../Player/PlayerManager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'
import { DoorManager } from '../Door/DoorManager'
import { IronSkeletonManager } from '../IronSkeleton/IronSkeletonManager'
import { BurstManager } from '../Burst/BurstManager'
import SpikesManager from '../Spikes/SpikesManager'
import { SmokeManager } from '../Smoke/SmokeManager'
import FaderManager from '../../Runtime/FaderManager'
const { ccclass, property } = _decorator

@ccclass('BattleManager')
export class BattleManager extends Component {
  level: ILevel
  stage: Node
  smokeLayer: Node
  private inited: boolean = false

  onLoad() {
    DataManager.Instance.levelIndex = 1
    EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this)
    EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.genereteSmoke, this)
    EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this)
    EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this)
    EventManager.Instance.on(EVENT_ENUM.RESTART_LEVEL, this.initLevel, this)
    EventManager.Instance.on(EVENT_ENUM.QUIT_BATTLE, this.quitBattle, this)
  }

  onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived)
    EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.genereteSmoke)
    EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record)
    EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke)
    EventManager.Instance.off(EVENT_ENUM.RESTART_LEVEL, this.initLevel)
    EventManager.Instance.off(EVENT_ENUM.QUIT_BATTLE, this.quitBattle)
  }

  start() {
    this.generateStage()
    this.initLevel()
  }

  async initLevel() {
    const level = levels[`level${DataManager.Instance.levelIndex}`]
    if (level) {
      if (this.inited) {
        await FaderManager.Instance.fadeIn()
      } else {
        await FaderManager.Instance.mask()
      }
      this.clearLevel()
      this.level = level

      DataManager.Instance.mapInfo = this.level.mapInfo
      DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0
      DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0

      Promise.all([
        this.generateTileMap(),
        this.genereteBursts(),
        this.genereteDoor(),
        this.generateSmokeLayer(),
        this.genereteEnemies(),
        this.genereteSpikes(),
        this.generatePlayer(),
      ])

      await FaderManager.Instance.fadeOut()
      this.inited = true
    } else {
      this.quitBattle()
    }
  }

  nextLevel() {
    DataManager.Instance.levelIndex++
    this.initLevel()
  }

  clearLevel() {
    this.stage.destroyAllChildren()
    DataManager.Instance.reset()
  }

  async quitBattle() {
    await FaderManager.Instance.fadeIn()
    director.loadScene(SCENE_ENUM.Start)
  }

  generateStage() {
    this.stage = createUINode()
    this.stage.setParent(this.node)
  }

  async generateTileMap() {
    const tileMap = createUINode()
    tileMap.setParent(this.stage)
    const tileMapManager = tileMap.addComponent(TileMapManager)
    await tileMapManager.init()

    this.adaptPos()
  }

  async generatePlayer() {
    const player = createUINode()
    player.setParent(this.stage)
    const playerManager = player.addComponent(PlayerManager)
    await playerManager.init(this.level.player)
    DataManager.Instance.player = playerManager
  }

  async genereteEnemies() {
    const promise = []
    for (let i = 0; i < this.level.enemies.length; i++) {
      const enemy = this.level.enemies[i]
      const Manager = enemy.type === ENTITY_TYPE_ENUM.SKELETON_IRON ? IronSkeletonManager : WoodenSkeletonManager
      const node = createUINode()
      node.setParent(this.stage)
      const manager = node.addComponent(Manager)
      promise.push(manager.init(enemy))
      DataManager.Instance.enemies.push(manager)
    }
    await Promise.all(promise)
  }

  async genereteDoor() {
    const door = createUINode()
    door.setParent(this.stage)
    const doorManager = door.addComponent(DoorManager)
    await doorManager.init(this.level.door)
    DataManager.Instance.door = doorManager
  }

  async genereteBursts() {
    const promises = []
    for (let i = 0; i < this.level.bursts.length; i++) {
      const burst = this.level.bursts[i]
      const node = createUINode()
      node.setParent(this.stage)
      const burstManager = node.addComponent(BurstManager)
      promises.push(burstManager.init(burst))
      DataManager.Instance.bursts.push(burstManager)
    }
    await Promise.all(promises)
  }

  async genereteSpikes() {
    const promises = []
    for (let i = 0; i < this.level.spikes.length; i++) {
      const spikes = this.level.spikes[i]
      const node = createUINode()
      node.setParent(this.stage)
      const spikesManager = node.addComponent(SpikesManager)
      promises.push(spikesManager.init(spikes))
      DataManager.Instance.spikes.push(spikesManager)
    }
    await Promise.all(promises)
  }

  async genereteSmoke(x: number, y: number, direction: DIRECTION_ENUM) {
    const item = DataManager.Instance.smokes.find(smoke => smoke.state === ENTITY_STATE_ENUM.DEATH)
    if (item) {
      item.x = x
      item.y = y
      item.direction = direction
      item.state = ENTITY_STATE_ENUM.IDLE
      item.node.setPosition(x * TILE_WIDTH - TILE_WIDTH * 1.5, -y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
    } else {
      const smoke = createUINode()
      smoke.setParent(this.smokeLayer)
      const smokeManager = smoke.addComponent(SmokeManager)
      await smokeManager.init({
        x,
        y,
        direction,
        state: ENTITY_STATE_ENUM.IDLE,
        type: ENTITY_TYPE_ENUM.SMOKE,
      })
      DataManager.Instance.smokes.push(smokeManager)
    }
  }

  generateSmokeLayer() {
    this.smokeLayer = createUINode()
    this.smokeLayer.setParent(this.stage)
  }

  checkArrived() {
    if (!DataManager.Instance.player || !DataManager.Instance.door) {
      return
    }

    const { x: playerX, y: playerY } = DataManager.Instance.player
    const { x: doorX, y: doorY, state: doorState } = DataManager.Instance.door
    if (playerX === doorX && playerY === doorY && doorState === ENTITY_STATE_ENUM.DEATH) {
      EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL)
    }
  }

  adaptPos() {
    const { mapRowCount, mapColumnCount } = DataManager.Instance
    const disX = (TILE_WIDTH * mapRowCount) / 2
    const dixY = (TILE_HEIGHT * mapColumnCount) / 2
    this.stage.setPosition(-disX, dixY + 80)
  }

  update(deltaTime: number) {}

  record() {
    const item: IRecord = {
      player: {
        x: DataManager.Instance.player.targetX,
        y: DataManager.Instance.player.targetY,
        state:
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
          DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH
            ? DataManager.Instance.player.state
            : ENTITY_STATE_ENUM.IDLE,
        direction: DataManager.Instance.player.direction,
        type: DataManager.Instance.player.type,
      },
      door: {
        x: DataManager.Instance.door.x,
        y: DataManager.Instance.door.y,
        state: DataManager.Instance.door.state,
        direction: DataManager.Instance.door.direction,
        type: DataManager.Instance.door.type,
      },
      enemies: DataManager.Instance.enemies.map(({ x, y, state, direction, type }) => {
        return {
          x,
          y,
          state,
          direction,
          type,
        }
      }),
      spikes: DataManager.Instance.spikes.map(({ x, y, count, type }) => {
        return {
          x,
          y,
          count,
          type,
        }
      }),
      bursts: DataManager.Instance.bursts.map(({ x, y, state, direction, type }) => {
        return {
          x,
          y,
          state,
          direction,
          type,
        }
      }),
    }

    DataManager.Instance.records.push(item)
  }

  revoke() {
    const data = DataManager.Instance.records.pop()
    if (data) {
      DataManager.Instance.player.x = DataManager.Instance.player.targetX = data.player.x
      DataManager.Instance.player.y = DataManager.Instance.player.targetY = data.player.y
      DataManager.Instance.player.state = data.player.state
      DataManager.Instance.player.direction = data.player.direction

      for (let i = 0; i < data.enemies.length; i++) {
        const item = data.enemies[i]
        DataManager.Instance.enemies[i].x = item.x
        DataManager.Instance.enemies[i].y = item.y
        DataManager.Instance.enemies[i].state = item.state
        DataManager.Instance.enemies[i].direction = item.direction
      }

      for (let i = 0; i < data.spikes.length; i++) {
        const item = data.spikes[i]
        DataManager.Instance.spikes[i].x = item.x
        DataManager.Instance.spikes[i].y = item.y
        DataManager.Instance.spikes[i].count = item.count
      }

      for (let i = 0; i < data.bursts.length; i++) {
        const item = data.bursts[i]
        DataManager.Instance.bursts[i].x = item.x
        DataManager.Instance.bursts[i].y = item.y
        DataManager.Instance.bursts[i].state = item.state
      }

      DataManager.Instance.door.x = data.door.x
      DataManager.Instance.door.y = data.door.y
      DataManager.Instance.door.state = data.door.state
      DataManager.Instance.door.direction = data.door.direction
    } else {
      //TODO 播放游戏音频嘟嘟嘟
    }
  }
}
