/**
 * Created by daniel on 6/22/17.
 */
/**
 * A directed graph that holds Objects as its nodes, and supports the following operations:
 * - Checks if a path exists between to nodes.
 * - Checks if there is a circle in the graph.
 * - Creates a topological sort of the graph starting from a certain node.
 */
export default class Graph {

  // The graph
  graph;

  // true if the graph has a circle
  hasCircleInternal;

  /**
   * Constructs a new empty Graph.
   */
  constructor() {
    this.graph = {};
  }

  /**
   * Adds an edge between the source and target objects.
   * If the source or target objects don't exist yet in the graph, they will be added
   * automatically.
   * If the edge aleardy exists, nothing will happen.
   */
  addEdge(source, target) {
    this.checkExistence(source);
    this.checkExistence(target);
    this.graph[source].add(target);
  }

// Checks whether the given object exists in the graph. If not, creates it.
  checkExistence(object) {
    if (!this.graph[object]) {
      this.graph[object] = new Set();
    }
  }

/**
 * Returns true if the graph is empty.
 */
  isEmpty() {
    return Object.keys(this.graph).length === 0;
  }

/**
 * Returns true if there is a path from the given source node to the given
 * destination node.
 */
  pathExists(source, destination) {
    return this.doPathExists(source, destination, new Set());
  }

// Finds recursively using the DFS algorithm if there is a path from the
// source to destination.
  doPathExists(source, destination, marked) {
    let pathFound = false;
    marked.add(source);
    const edgeSet = this.graph[source];
    if (edgeSet) {
      const edgeIter = edgeSet.values();
      let currentNode = edgeIter.next();
      while (edgeIter.value && !pathFound) {
        pathFound = currentNode.equals(destination);
        if (!pathFound && !marked.contains(currentNode)) {
          pathFound = this.doPathExists(currentNode, destination, marked);
        }
        currentNode = edgeIter.next();
      }
    }
    return pathFound;
  }

/**
 * Returns the objects (nodes) of this graph sorted in a topological order,
 * starting from the given object.
 * Sets the 'containsCircle' property if a circle is detected in the graph.
 */
  topologicalSort(start) {
    this.hasCircleInternal = false;
    const nodes = [];
    this.doTopologicalSort(start, nodes, new Set(), new Set());
  // reverse the order received from the DFS algorithm
    return nodes.reverse();
  }

// Runs the topological sort on the given node. This will run recursively
// on all edges from the given node to non marked nodes. In the end, the
// given node will be added to the given nodes vector.
  doTopologicalSort(node,  nodes,  marked,  processed) {
    marked.add(node);
    processed.add(node);
    const edgeSet = this.graph[node];
    if (edgeSet) {
      const edgeIter = edgeSet.values();
      let currentNode = edgeIter.next();
      while (currentNode.value) {
      // check circle
        if (processed.contains(currentNode)) {
          this.hasCircleInternal = true;
        }
        if (!marked.contains(currentNode)) {
          this.doTopologicalSort(currentNode, nodes, marked, processed);
        }
        currentNode = edgeIter.next();
      }
    }
    processed.delete(node);
    nodes.push(node);
  }

/**
 * Returns true if the graph has a circle.
 */
  hasCircle() {
    return this.hasCircleInternal;
  }
}
