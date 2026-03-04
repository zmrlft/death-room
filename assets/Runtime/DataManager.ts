import Singleton from '../Base/Singleton'
import { ITile } from '../Levels'

export default class DataManager extends Singleton {
  reset() {
    this.mapInfo = []
    this.mapColumnCount = 0
    this.mapRowCount = 0
  }
  static get Instance() {
    return super.GetInstance<DataManager>()
  }

  mapInfo: Array<Array<ITile>>
  mapRowCount: number = 0
  mapColumnCount: number = 0
  levelIndex: number = 1
}
