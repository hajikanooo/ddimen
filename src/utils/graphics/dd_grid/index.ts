import { Container, Graphics } from 'pixi.js';
import { Vector } from 'matter-js';
import { DDEntity } from '@/utils/engine/entity';

export interface GridTile {
  row: number;
  col: number;
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

interface GridHooks {
  handleClickTile?: (params: { tile: GridTile }) => void;
}

export class DDGrid extends DDEntity {
  parent: Container;

  container: Container = new Container();

  gridWidth: number;

  gridHeight: number;

  lineWidth: number;

  zIndex: number;

  rows: number;

  cols: number;

  actualCellWidth: number;

  actualCellHeight: number;

  tiles: GridTile[] = [];

  activeTile: GridTile | null = null;

  graphics: Graphics = new Graphics();

  hooks: GridHooks = {};

  constructor({
    parent,
    gridWidth,
    gridHeight,
    cellWidth,
    lineWidth,
    zIndex = 10,
    hooks = {},
  }: {
    parent: Container;
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    lineWidth: number;
    zIndex?: number;
    hooks?: GridHooks;
  }) {
    super();
    const cols = Math.floor(
      (gridWidth + lineWidth) / (cellWidth + lineWidth),
    );
    const rows = Math.floor(
      (gridHeight + lineWidth) / (cellWidth + lineWidth),
    );
    const actualCellWidth =
      (gridWidth - (cols + 1) * lineWidth) / cols;
    const actualCellHeight =
      (gridHeight - (rows + 1) * lineWidth) / rows;

    this.container.zIndex = zIndex;

    this.parent = parent;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.lineWidth = lineWidth;
    this.zIndex = zIndex;
    this.rows = rows;
    this.cols = cols;
    this.actualCellWidth = actualCellWidth;
    this.actualCellHeight = actualCellHeight;
    this.hooks = hooks;

    this.initEventListeners();
  }

  initEventListeners() {
    const { parent } = this;
    parent.eventMode = 'static';
    parent.cursor = 'pointer';
    parent.on('pointerdown', e => {
      const { controller } = this;
      if (!controller) {
        return;
      }
      const { global } = e;
      const { x, y } = controller.getWorldPosition({
        screenPosition: Vector.create(global.x, global.y),
      });
      const tile = this.getTileByCoordinate({ x, y });
      if (!tile) {
        return;
      }
      console.log(
        '🚀 ~ DDGrid ~ initEventListeners ~ tile:',
        tile,
      );
      // this.activateTile({ tile });
      this.hooks.handleClickTile?.({ tile });
    });
    parent.on('pointermove', e => {
      const { controller } = this;
      if (!controller) {
        return;
      }
      const { global } = e;
      const { x, y } = controller.getWorldPosition({
        screenPosition: Vector.create(global.x, global.y),
      });
      const tile = this.getTileByCoordinate({ x, y });
      if (!tile) {
        return;
      }
      this.activateTile({ tile });
    });
  }

  generate(): DDGrid {
    const {
      gridHeight,
      gridWidth,
      lineWidth,
      cols,
      rows,
      actualCellWidth,
      actualCellHeight,
    } = this;

    const graphics = new Graphics();
    graphics.rect(0, 0, gridWidth, gridHeight).fill({
      color: '#333',
      alpha: 0,
    });

    // 绘制垂直线
    for (let j = 0; j <= cols; j++) {
      const x =
        j * (actualCellWidth + lineWidth) + lineWidth / 2;
      graphics.moveTo(x, lineWidth / 2);
      graphics.lineTo(x, gridHeight - lineWidth / 2);
    }
    // 绘制水平线
    for (let i = 0; i <= rows; i++) {
      const y =
        i * (actualCellHeight + lineWidth) + lineWidth / 2;
      graphics.moveTo(lineWidth / 2, y);
      graphics.lineTo(gridWidth - lineWidth / 2, y);
    }

    const tiles: GridTile[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xStart =
          col * (actualCellWidth + lineWidth) +
          lineWidth / 2;
        const xEnd = xStart + actualCellWidth;
        const yStart =
          row * (actualCellHeight + lineWidth) +
          lineWidth / 2;
        const yEnd = yStart + actualCellHeight;
        tiles.push({
          row,
          col,
          xStart,
          xEnd,
          yStart,
          yEnd,
        });
      }
    }

    graphics.stroke({
      alpha: 0.5,
    });

    this.graphics = graphics;
    this.tiles = tiles;

    return this;
  }

  getTileByCoordinate({ x, y }: { x: number; y: number }) {
    const { tiles } = this;
    return tiles.find(
      tile =>
        x >= tile.xStart &&
        x <= tile.xEnd &&
        y >= tile.yStart &&
        y <= tile.yEnd,
    );
  }

  getTiles({
    rowIndex,
    colIndex,
  }: {
    rowIndex?: number;
    colIndex?: number;
  }): GridTile[] {
    const { tiles } = this;
    if (rowIndex !== undefined && colIndex !== undefined) {
      return tiles.filter(
        tile =>
          tile.row === rowIndex && tile.col === colIndex,
      );
    } else if (rowIndex !== undefined) {
      return tiles.filter(tile => tile.row === rowIndex);
    } else if (colIndex !== undefined) {
      return tiles.filter(tile => tile.col === colIndex);
    } else {
      return [];
    }
  }

  draw() {
    const { parent, container, graphics } = this;
    container.addChild(graphics);
    parent.addChild(container);
  }

  activateTile({ tile }: { tile: GridTile }) {
    this.activeTile = tile;
    const { xStart, yStart } = tile;
    const { actualCellWidth, actualCellHeight, graphics } =
      this;
    const highlight = new Graphics();
    highlight.rect(
      xStart,
      yStart,
      actualCellWidth + 1,
      actualCellHeight + 1,
    );
    highlight.fill({
      color: '#fff',
      alpha: 0.5,
    });
    graphics.removeChildren();
    graphics.addChild(highlight);
  }
}
