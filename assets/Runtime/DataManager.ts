import Singleton from '../Base/Singleton'
import { ITile } from '../Levels'
import { TileManager } from '../Scripts/Tile/TileManager'

export default class DataManager extends Singleton {
  enemies: any
  door: {}
  bursts: any
  reset() {
    this.mapInfo = []
    this.mapColumnCount = 0
    this.mapRowCount = 0
    this.tileInfo = []
  }
  static get Instance() {
    return super.GetInstance<DataManager>()
  }

  tileInfo: Array<Array<TileManager>>
  mapInfo: Array<Array<ITile>>
  mapRowCount: number = 0
  mapColumnCount: number = 0
  levelIndex: number = 1
}
