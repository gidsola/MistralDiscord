import config from './config.mjs';

/**
 * Calculates the cosine similarity between two vectors.
 *
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
function cosineSimilarity(vec1, vec2) {
  // validation
  if (!Array.isArray(vec1) || !Array.isArray(vec2))
    throw new Error('Both inputs must be arrays.');

  if (vec1.length !== vec2.length)
    throw new Error('Both vectors must have the same length.');

  if (!vec1.every(Number.isFinite) || !vec2.every(Number.isFinite))
    throw new Error('Both vectors must contain only numeric values.');

  // get the scalar
  const
    // [1, 2, 3] * [4, 5, 6] => 1*4 + 2*5 + 3*6 = 4+10+18 = 32
    singleScalar = vec1.reduce((sum, val, index) => sum + val * vec2[index], 0),
    // console.log("singleScalar", singleScalar);

    // get the magnitudes(square of sum of squares)
    // [1, 2, 3] => sqrt(1^2 + 2^2 + 3^2)== 1+4+9 = 14 => sqrt(14)
    magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0)),
    magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  // console.log("magnitude1", magnitude1);
  // console.log("magnitude2", magnitude2);

  // Handle the case where either magnitude is zero to avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0)
    return 0; // similarity is undefined, but we can return 0

  const cosine = singleScalar / (magnitude1 * magnitude2);
  // console.log("cosine", cosine);
  return cosine;
};


/**
* Calculates the Euclidean distances between two arrays of vectors.
*
* @param {Array<Array<number>>} X - The first array of vectors.
* @param {Array<Array<number>>} [Y=null] - The second array of vectors. If not provided, it defaults to the first array.
* @param {Array<number>} [Y_norm_squared=null] - The squared norm of each vector in the second array. If not provided, it is calculated internally.
* @param {boolean} [squared=false] - Indicates whether to return the squared distances or not. Defaults to false.
* @returns {Array<Array<number>>} - The matrix of Euclidean distances between the vectors in X and Y.
*/
function euclideanDistances(X, Y = null, Y_norm_squared = null, squared = false) {
  // If Y is not provided, use X as the second array
  if (Y === null) Y = X;

  const
    // Get the number of samples in each array
    xSamples = X.length,
    ySamples = Y.length,

    // Initialize the distance matrix with zeros
    distances = Array.from({ length: xSamples }, () => new Array(ySamples).fill(0)),

    // Calculate the squared norms of X if not provided
    X_norm_squared = X.map(x => x.reduce((acc, val) => acc + val * val, 0));

  // Calculate Y_norm_squared if not provided
  if (Y_norm_squared === null)
    Y_norm_squared = Y.map(y => y.reduce((acc, val) => acc + val * val, 0));

  // Calculate the distances
  for (let i = 0; i < xSamples; i++) {
    const
      x = X[i],
      x_norm_squared = X_norm_squared[i];

    for (let j = 0; j < ySamples; j++) {
      const
        y = Y[j],
        y_norm_squared = Y_norm_squared[j],
        // Calculate the squared distance using vectorized operations
        dist = x_norm_squared + y_norm_squared - 2 * x.reduce((acc, val, k) => acc + val * y[k], 0);
      // If squared is false, take the square root of the distance
      distances[i][j] = squared ? dist : Math.sqrt(dist);
    };
  };

  // Return the matrix of Euclidean distances
  return distances;
};


/**
 * Filters and ranks vectors based on the config settings.
 *
 * @param {Array<Array<number>>} vectors - The array of vectors to be filtered and ranked.
 * @returns {Array<Array<number>>} - The top vectors based on the config settings.
 */
function filterAndRankVectors(vectors) {
  // Calculate cosine similarities and Euclidean distances
  const
    similarities = [],
    distances = [];

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const
        sim = cosineSimilarity(vectors[i], vectors[j]),
        dist = euclideanDistances([vectors[i]], [vectors[j]])[0][0];

      similarities.push({ index: i, value: sim });
      distances.push({ index: i, value: dist });
    }
  };

  // Normalize similarities and distances
  const
    maxSimilarity = Math.max(...similarities.map(s => s.value)),
    maxDistance = Math.max(...distances.map(d => d.value));

  similarities.forEach(s => s.value /= maxSimilarity);
  distances.forEach(d => d.value /= maxDistance);

  // Combine similarities and distances based on weights
  const scores = similarities.map((s, idx) => {
    return {
      index: s.index,
      score: config.weights.cosine_similarity * s.value + config.weights.euclidean_distance * distances[idx].value
    };
  });

  // Filter based on initial threshold
  const filteredScores = scores.filter(s => s.score >= config.initialFilterThreshold);

  // Sort by score and get top results
  filteredScores.sort((a, b) => b.score - a.score);
  const topResults = filteredScores.slice(0, config.top_results).map(s => vectors[s.index]);

  return topResults;
};

export { cosineSimilarity, euclideanDistances, filterAndRankVectors };
