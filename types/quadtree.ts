export class Box {
  constructor(public x: number, public y: number, public width: number, public height: number) {}

  contains(point: { x: number; y: number }): boolean {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  intersects(other: Box): boolean {
    return !(
      other.x > this.x + this.width ||
      other.x + other.width < this.x ||
      other.y > this.y + this.height ||
      other.y + other.height < this.y
    );
  }
}

export class Quadtree<T> {
  private objects: { box: Box; data: T }[] = [];
  private nodes: Quadtree<T>[] = [];

  constructor(
    public boundary: Box,
    private capacity: number = 4,
    private maxDepth: number = 5,   // <-- newly added
    private depth: number = 0       // <-- newly added
  ) {}

  insert(box: Box, data: T): boolean {
    // If it doesn't intersect, skip
    if (!this.boundary.intersects(box)) {
      return false;
    }

    // If we have space or we are at max depth
    if (this.objects.length < this.capacity || this.depth >= this.maxDepth) {
      this.objects.push({ box, data });
      return true;
    }

    // Otherwise, subdivide if necessary
    if (this.nodes.length === 0) {
      this.subdivide();
    }

    // Try inserting into each child node
    for (const node of this.nodes) {
      if (node.insert(box, data)) {
        return true;
      }
    }

    // If it didn't fit in a child node, store here
    this.objects.push({ box, data });
    return true;
  }

  queryRange(range: Box): T[] {
    const found: T[] = [];

    // If no intersection, skip
    if (!this.boundary.intersects(range)) {
      return found;
    }

    // Check objects at this level
    for (const obj of this.objects) {
      if (range.intersects(obj.box)) {
        found.push(obj.data);
      }
    }

    // If we have children, query them
    if (this.nodes.length > 0) {
      for (const node of this.nodes) {
        found.push(...node.queryRange(range));
      }
    }
    return found;
  }

  clear(): void {
    this.objects = [];
    this.nodes = [];
  }

  private subdivide(): void {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    this.nodes = [
      new Quadtree<T>(
        new Box(x, y, w, h),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
      new Quadtree<T>(
        new Box(x + w, y, w, h),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
      new Quadtree<T>(
        new Box(x, y + h, w, h),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
      new Quadtree<T>(
        new Box(x + w, y + h, w, h),
        this.capacity,
        this.maxDepth,
        this.depth + 1
      ),
    ];

    // Re-distribute objects into children
    const oldObjects = this.objects;
    this.objects = [];
    for (const obj of oldObjects) {
      this.insert(obj.box, obj.data);
    }
  }
}
