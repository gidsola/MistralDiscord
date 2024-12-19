// config.mjs

const config = {
  weights: {
    cosine_similarity: 0.5,       // Weight for cosine similarity
    euclidean_distance: 0.5        // Weight for Euclidean distance
  },
  initialFilterThreshold: 0.3,     // Initial threshold for filtering scores
  top_results: 10                  // Number of top results to return
};

export default config;
