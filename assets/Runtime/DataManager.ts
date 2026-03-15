import { EnemyManager } from '../Base/EnemyManager'
import Singleton from '../Base/Singleton'
import { ITile } from '../Levels'
import { BurstManager } from '../Scripts/Burst/BurstManager'
import { DoorManager } from '../Scripts/Door/DoorManager'
import type { PlayerManager } from '../Scripts/Player/PlayerManager'
import { TileManager } from '../Scripts/Tile/TileManager'
import type { WoodenSkeletonManager } from '../Scripts/WoodenSkeleton/WoodenSkeletonManager'

export default class DataManager extends Singleton {
  enemies: EnemyManager[] = []
  door: DoorManager
  bursts: BurstManager[]
  player: PlayerManager
  tileInfo: Array<Array<TileManager>>
  mapInfo: Array<Array<ITile>>
  mapRowCount: number = 0
  mapColumnCount: number = 0
  levelIndex: number = 1

  reset() {
    this.mapInfo = []
    this.mapColumnCount = 0
    this.mapRowCount = 0
    this.tileInfo = []
    this.player = null
    this.door = null
    this.enemies = []
    this.bursts = []
  }
  static get Instance() {
    return super.GetInstance<DataManager>()
  }
}
