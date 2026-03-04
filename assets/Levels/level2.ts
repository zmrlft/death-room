import { TILE_TYPE_ENUM } from '../Enums'
import { ILevel } from './index'

const mapInfo = [
  [
    {
      src: 16,
      type: TILE_TYPE_ENUM.WALL_LEFT_TOP,
    },
    {
      src: 5,
      type: TILE_TYPE_ENUM.WALL_COLUMN,
    },
    {
      src: 5,
      type: TILE_TYPE_ENUM.WALL_COLUMN,
    },
    {
      src: 5,
      type: TILE_TYPE_ENUM.WALL_COLUMN,
    },
    {
      src: 5,
      type: TILE_TYPE_ENUM.WALL_COLUMN,
    },
    {
      src: 13,
      type: TILE_TYPE_ENUM.WALL_LEFT_BOTTOM,
    },
    {
      src: 18,
      type: TILE_TYPE_ENUM.CLIFF_LEFT,
    },
  ],
  [
    {
      src: 21,
      type: TILE_TYPE_ENUM.WALL_ROW,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 9,
      type: TILE_TYPE_ENUM.WALL_ROW,
    },
    {
      src: 17,
      type: TILE_TYPE_ENUM.CLIFF_CENTER,
    },
  ],
  [
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 9,
      type: TILE_TYPE_ENUM.WALL_ROW,
    },
    {
      src: 17,
      type: TILE_TYPE_ENUM.CLIFF_CENTER,
    },
  ],
  [
    {
      src: 20,
      type: TILE_TYPE_ENUM.WALL_LEFT_BOTTOM,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 9,
      type: TILE_TYPE_ENUM.WALL_ROW,
    },
    {
      src: 17,
      type: TILE_TYPE_ENUM.CLIFF_CENTER,
    },
  ],
  [
    {
      src: 9,
      type: TILE_TYPE_ENUM.WALL_ROW,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 20,
      type: TILE_TYPE_ENUM.WALL_LEFT_BOTTOM,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 9,
      type: TILE_TYPE_ENUM.WALL_ROW,
    },
    {
      src: 17,
      type: TILE_TYPE_ENUM.CLIFF_CENTER,
    },
  ],
  [
    {
      src: 15,
      type: TILE_TYPE_ENUM.WALL_RIGHT_TOP,
    },
    {
      src: 5,
      type: TILE_TYPE_ENUM.WALL_COLUMN,
    },
    {
      src: 14,
      type: TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM,
    },
    {
      src: 1,
      type: TILE_TYPE_ENUM.FLOOR,
    },
    {
      src: 22,
      type: TILE_TYPE_ENUM.WALL_COLUMN,
    },
    {
      src: 14,
      type: TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM,
    },
    {
      src: 19,
      type: TILE_TYPE_ENUM.CLIFF_RIGHT,
    },
  ],
]

// const player: IEntity = {
//   x: 0,
//   y: 7,
//   direction: DIRECTION_ENUM.TOP,
//   state: ENTITY_STATE_ENUM.IDLE,
//   type: ENTITY_TYPE_ENUM.PLAYER,
// }

// const enemies: Array<IEntity> = [
//   {
//     x: 2,
//     y: 6,
//     direction: DIRECTION_ENUM.LEFT,
//     state: ENTITY_STATE_ENUM.IDLE,
//     type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
//   },
// ]

// const spikes: Array<ISpikes> = []

// const bursts: Array<IEntity> = [
//   {
//     x: 2,
//     y: 3,
//     state: ENTITY_STATE_ENUM.IDLE,
//     type: ENTITY_TYPE_ENUM.BURST,
//     direction: DIRECTION_ENUM.TOP,
//   },
//   {
//     x: 2,
//     y: 5,
//     state: ENTITY_STATE_ENUM.IDLE,
//     type: ENTITY_TYPE_ENUM.BURST,
//     direction: DIRECTION_ENUM.TOP,
//   },
//   {
//     x: 3,
//     y: 3,
//     state: ENTITY_STATE_ENUM.IDLE,
//     type: ENTITY_TYPE_ENUM.BURST,
//     direction: DIRECTION_ENUM.TOP,
//   },
//   {
//     x: 3,
//     y: 4,
//     state: ENTITY_STATE_ENUM.IDLE,
//     type: ENTITY_TYPE_ENUM.BURST,
//     direction: DIRECTION_ENUM.TOP,
//   },
// ]

// const door: IEntity = {
//   x: 7,
//   y: 6,
//   direction: DIRECTION_ENUM.LEFT,
//   state: ENTITY_STATE_ENUM.IDLE,
//   type: ENTITY_TYPE_ENUM.DOOR,
// }

const level: ILevel = {
  mapInfo,
  // player,
  // enemies,
  // spikes,
  // bursts,
  // door,
}

export default level
