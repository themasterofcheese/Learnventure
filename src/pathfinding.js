window.Pathfinder = (() => {
    class MinHeap {
        constructor() {
            this.heap = [];
        }

        push(node) {
            this.heap.push(node);
            this._bubbleUp(this.heap.length - 1);
        }

        pop() {
            if (this.heap.length === 0) return null;
            if (this.heap.length === 1) return this.heap.pop();
            const min = this.heap[0];
            this.heap[0] = this.heap.pop();
            this._bubbleDown(0);
            return min;
        }

        size() {
            return this.heap.length;
        }

        _bubbleUp(i) {
            while (i > 0) {
                let p = Math.floor((i - 1) / 2);
                if (this.heap[i].f < this.heap[p].f) {
                    let temp = this.heap[i];
                    this.heap[i] = this.heap[p];
                    this.heap[p] = temp;
                    i = p;
                } else {
                    break;
                }
            }
        }

        _bubbleDown(i) {
            while (true) {
                let left = 2 * i + 1;
                let right = 2 * i + 2;
                let min = i;
                if (left < this.heap.length && this.heap[left].f < this.heap[min].f) {
                    min = left;
                }
                if (right < this.heap.length && this.heap[right].f < this.heap[min].f) {
                    min = right;
                }
                if (min !== i) {
                    let temp = this.heap[i];
                    this.heap[i] = this.heap[min];
                    this.heap[min] = temp;
                    i = min;
                } else {
                    break;
                }
            }
        }
    }

    function findPath(tileGrid, startTx, startTy, endTx, endTy, maxSteps = 500) {
        if (!tileGrid.inBounds(startTx, startTy) || !tileGrid.inBounds(endTx, endTy)) return [];
        if (startTx === endTx && startTy === endTy) return [];
        if (!tileGrid.isWalkable(endTx, endTy)) return [];

        let openSet = new MinHeap();
        let visited = new Set();
        
        const manhattan = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

        let startNode = {
            tx: startTx,
            ty: startTy,
            g: 0,
            f: manhattan(startTx, startTy, endTx, endTy),
            parent: null
        };

        openSet.push(startNode);
        
        const dirs = [
            {dx: 0, dy: -1}, // N
            {dx: 0, dy: 1},  // S
            {dx: 1, dy: 0},  // E
            {dx: -1, dy: 0}  // W
        ];

        let steps = 0;
        let finalNode = null;
        let gridW = window.TileMap ? window.TileMap.GRID_W : 90;

        while (openSet.size() > 0 && steps < maxSteps) {
            let current = openSet.pop();
            steps++;

            if (current.tx === endTx && current.ty === endTy) {
                finalNode = current;
                break;
            }

            let key = current.tx + current.ty * gridW;

            if (visited.has(key)) continue;
            visited.add(key);

            for (let d of dirs) {
                let nTx = current.tx + d.dx;
                let nTy = current.ty + d.dy;

                if (tileGrid.inBounds(nTx, nTy) && tileGrid.isWalkable(nTx, nTy)) {
                    let nKey = nTx + nTy * gridW;
                    if (!visited.has(nKey)) {
                        let g = current.g + 1;
                        let f = g + manhattan(nTx, nTy, endTx, endTy);
                        openSet.push({
                            tx: nTx,
                            ty: nTy,
                            g: g,
                            f: f,
                            parent: current
                        });
                    }
                }
            }
        }

        if (!finalNode) return [];

        let path = [];
        let curr = finalNode;
        while (curr.parent) {
            path.push({ tx: curr.tx, ty: curr.ty });
            curr = curr.parent;
        }
        
        return path.reverse();
    }

    function findPathWorld(tileGrid, startWx, startWy, endWx, endWy, maxSteps = 500) {
        let start = tileGrid.worldToTile(startWx, startWy);
        let end = tileGrid.worldToTile(endWx, endWy);

        let path = findPath(tileGrid, start.tx, start.ty, end.tx, end.ty, maxSteps);
        
        return path.map(p => tileGrid.tileCenterWorld(p.tx, p.ty));
    }

    return {
        findPath,
        findPathWorld
    };
})();
