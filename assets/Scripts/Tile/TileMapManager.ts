import { _decorator, Component, Node, resources, SpriteFrame, Sprite, UITransform, Layers } from 'cc'
import { TileManager } from './TileManager'
import { createUINode, randomByRange } from '../../Utils'
import DataManager from '../../Runtime/DataManager'
import ResourceManager from '../../Runtime/ResourceManager'
const { ccclass, property } = _decorator

@ccclass('TileMapManager')
export class TileMapManager extends Component {
  async init() {
    const spriteFrames = await ResourceManager.Instance.loadRes('texture/tile/tile')
    const { mapInfo } = DataManager.Instance
    for (let i = 0; i < mapInfo.length; i++) {
      for (let j = 0; j < mapInfo[i].length; j++) {
        const item = mapInfo[i][j]
        if (item.src === null || item.type === null) {
          continue
        }

        let number = item.src
        if ((number == 1 || number == 5 || number == 9) && i % 2 === 0 && j % 2 === 0) {
          number += randomByRange(0, 4)
        }

        const imgSrc = `tile (${number})`

        const node = createUINode()
        const spriteFrame = spriteFrames.find(v => v.name === imgSrc) || spriteFrames[0]

        const tileManager = node.addComponent(TileManager)
        tileManager.init(spriteFrame, i, j)
        node.setParent(this.node)
      }
    }
  }

  start() {}

  update(deltaTime: number) {}
}
