import Singleton from '../Base/Singleton'
import { ITile } from '../Levels'
import type { PlayerManager } from '../Scripts/Player/PlayerManager'
import { TileManager } from '../Scripts/Tile/TileManager'
import type { WoodenSkeletonManager } from '../Scripts/WoodenSkeleton/WoodenSkeletonManager'

export default class DataManager extends Singleton {
  enemies: WoodenSkeletonManager[] = []
  door: {}
  bursts: any
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
    this.enemies = []
  }
  static get Instance() {
    return super.GetInstance<DataManager>()
  }
}
