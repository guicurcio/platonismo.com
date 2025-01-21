/**
 * Production-ready utility functions for creating and managing edges in React Flow.
 */

import { Edge } from 'reactflow';

/*//////////////////////////////////////////////////////////////
                          CONSTRUCTORS
//////////////////////////////////////////////////////////////*/

/**
 * Creates a new edge configuration for React Flow.
 *
 * @param {object} params
 * @param {string} params.source - The node ID that the edge originates from.
 * @param {string} params.target - The node ID that the edge terminates at.
 * @param {boolean} params.animated - Whether the edge should be animated.
 * @returns {Edge} A valid React Flow Edge object.
 * @throws {Error} Throws if either `source` or `target` is missing or empty.
 */
export function newFluxEdge({
  source,
  target,
  animated,
}: {
  source: string;
  target: string;
  animated: boolean;
}): Edge {
  if (!source) {
    throw new Error('newFluxEdge: "source" cannot be empty.');
  }

  if (!target) {
    throw new Error('newFluxEdge: "target" cannot be empty.');
  }

  return {
    id: `${source}-${target}`,
    source,
    target,
    animated,
  };
}

/*//////////////////////////////////////////////////////////////
                          TRANSFORMERS
//////////////////////////////////////////////////////////////*/

/**
 * Adds a new edge to an existing array of edges.  
 * By default, it prevents adding a duplicate if `skipDuplicate` is `true`.
 *
 * @param {Edge[]} existingEdges - Array of existing edges.
 * @param {object} params
 * @param {string} params.source - The node ID that the edge originates from.
 * @param {string} params.target - The node ID that the edge terminates at.
 * @param {boolean} [params.animated=false] - Whether the new edge should be animated.
 * @param {boolean} [params.skipDuplicate=true] - Whether to skip adding an edge with a duplicate ID.
 * @returns {Edge[]} A new array of edges containing the newly added edge (if not skipped).
 */
export function addFluxEdge(
  existingEdges: Edge[],
  {
    source,
    target,
    animated = false,
    skipDuplicate = true,
  }: {
    source: string;
    target: string;
    animated?: boolean;
    skipDuplicate?: boolean;
  }
): Edge[] {
  const newEdge = newFluxEdge({ source, target, animated });

  if (skipDuplicate) {
    const edgeExists = existingEdges.some((edge) => edge.id === newEdge.id);
    if (edgeExists) {
      // Optionally, you could log or throw an error here if duplicates are undesired.
      return existingEdges;
    }
  }

  return [...existingEdges, newEdge];
}

/**
 * Modifies an existing edge if it matches the `source-target` ID.  
 * Any edges that do not match remain unmodified.
 *
 * @param {Edge[]} existingEdges - The array of existing edges.
 * @param {object} params
 * @param {string} params.source - The node ID that the edge originates from.
 * @param {string} params.target - The node ID that the edge terminates at.
 * @param {boolean} params.animated - The updated animation status for the matching edge.
 * @returns {Edge[]} A new array of edges with the modified edge (if found).
 */
export function modifyFluxEdge(
  existingEdges: Edge[],
  { source, target, animated }: { source: string; target: string; animated: boolean }
): Edge[] {
  const edgeId = `${source}-${target}`;

  return existingEdges.map((edge) => {
    if (edge.id !== edgeId) return edge;

    // Merging the old edge to keep other properties (e.g., style, data) intact
    return {
      ...edge,
      animated,
    };
  });
}
