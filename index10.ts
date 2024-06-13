import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

interface BlockData {
  blockName: string;
  rows: number;
  columns: number;
  scale: number;
}

interface SeatPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-seat-visualization',
  templateUrl: './seat-visualization.component.html',
  styleUrls: ['./seat-visualization.component.css']
})
export class SeatVisualizationComponent implements OnInit {
  curveAmount = 20;
  spacingFactor = 1;
  rotationAngle = 0;
  scaleValue = 1;
  selectedBlockIndex: number | null = null;

  blocksData: BlockData[] = [
    { blockName: 'Block A', rows: 5, columns: 6, scale: 0.7 },
    { blockName: 'Block B', rows: 4, columns: 8, scale: 0.7 },
    { blockName: 'Block C', rows: 6, columns: 5, scale: 0.7 }
  ];

  private readonly seatRadius = 10;
  private readonly rowSpacing = 25;
  private readonly blockSpacing = 200;
  private readonly initialX = 100;
  private readonly initialY = 100;
  private readonly seatSpacingBase = 40;

  private svgContainer: any;

  ngOnInit(): void {
    this.svgContainer = d3.select('#svgContainer');
    this.createBlocksAndSeats();
    this.updateVisualization();
  }

  private updateVisualization(): void {
    this.blocksData.forEach((block, index) => {
      this.updateSeatsCurve(this.curveAmount, this.spacingFactor, this.rotationAngle, index);
    });
  }

  private calculateCurvedPositions(rowIndex: number, curveAmount: number, spacingFactor: number, numSeatsPerRow: number): SeatPosition[] {
    const positions: SeatPosition[] = [];
    const seatSpacing = this.seatSpacingBase * spacingFactor;
    const baseY = rowIndex * this.rowSpacing; // Adjust the base y-coordinate for each row

    for (let i = 0; i < numSeatsPerRow; i++) {
      const x = i * seatSpacing;
      const y = baseY + Math.sin((i / (numSeatsPerRow - 1)) * Math.PI) * curveAmount;
      positions.push({ x, y });
    }
    return positions;
  }

  private createBlocksAndSeats(): void {
    this.blocksData.forEach((block, blockIndex) => {
      const blockGroup = this.createBlockGroup(block, blockIndex);
      this.createSeats(blockGroup, block, blockIndex);
    });
  }

  private createBlockGroup(block: BlockData, blockIndex: number): any {
    return this.svgContainer.append('g')
      .attr('class', 'block')
      .attr('id', `block-${blockIndex}`)
      .attr('data-index', blockIndex)
      .attr('transform', `translate(${this.initialX + blockIndex * this.blockSpacing},${this.initialY}) scale(${block.scale})`)
      .on('click', () => this.selectBlock(blockIndex))
      .call(this.drag());
  }

  private createSeats(blockGroup: any, block: BlockData, blockIndex: number): void {
    for (let rowIndex = 0; rowIndex < block.rows; rowIndex++) {
      const rowPositions = this.calculateCurvedPositions(rowIndex, this.curveAmount, this.spacingFactor, block.columns);
      blockGroup.selectAll(`circle.row-${rowIndex}`)
        .data(rowPositions)
        .enter()
        .append('circle')
        .attr('cx', (d: SeatPosition) => d.x)
        .attr('cy', (d: SeatPosition) => d.y)
        .attr('r', this.seatRadius)
        .attr('fill', 'steelblue')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('class', `row-${rowIndex}`);
    }
  }

  selectBlock(blockIndex: number): void {
    if (this.selectedBlockIndex !== null) {
      d3.select(`#block-${this.selectedBlockIndex}`).selectAll('circle').classed('selected', false);
    }
    this.selectedBlockIndex = blockIndex;
    d3.select(`#block-${this.selectedBlockIndex}`).selectAll('circle').classed('selected', true);
  }

  private updateSeatsCurve(curveAmount: number, spacingFactor: number, rotationAngle: number, blockIndex: number): void {
    const block = this.blocksData[blockIndex];
    const blockGroup = this.svgContainer.select(`#block-${blockIndex}`);

    for (let rowIndex = 0; rowIndex < block.rows; rowIndex++) {
      const rowPositions = this.calculateCurvedPositions(rowIndex, curveAmount, spacingFactor, block.columns);
      const circles = blockGroup.selectAll(`circle.row-${rowIndex}`).data(rowPositions);

      circles.attr('cx', (d: SeatPosition) => d.x)
             .attr('cy', (d: SeatPosition) => d.y);
    }

    const translate = this.getTranslation(blockGroup.attr('transform'));
    blockGroup.attr('transform', `translate(${translate}) rotate(${rotationAngle}) scale(${block.scale})`);
  }

  private getTranslation(transform: string): string {
    const translate = transform.match(/translate\(([^)]+)\)/);
    return translate ? translate[1] : '0,0';
  }

  private drag(): any {
    return d3.drag()
      .on('start', function () {
        d3.select(this).raise().classed('active', true);
      })
      .on('drag', function (event) {
        const [newX, newY] = d3.pointer(event);
        d3.select(this).attr('transform', `translate(${newX},${newY})`);
      })
      .on('end', function () {
        d3.select(this).classed('active', false);
      });
  }

  updateScale(): void {
    this.blocksData.forEach((block, index) => {
      if (block.scale !== this.scaleValue) {
        block.scale = this.scaleValue;
        this.updateSeatsCurve(this.curveAmount, this.spacingFactor, this.rotationAngle, index);
      }
    });
  }
}
