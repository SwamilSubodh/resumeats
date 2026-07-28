const { pipeline } = require("@xenova/transformers");

let extractor = null;

async function getEmbeddingModel() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractor;
}

function cosineSim(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));

  if (!magA || !magB) return 0;

  return dot / (magA * magB);
}

// Mean-pool a 2D tensor (shape: [1, seqLen, hiddenSize]) into a 1D vector
function meanPool(tensor) {
  // tensor.data is a flat Float32Array of length seqLen * hiddenSize
  // tensor.dims = [1, seqLen, hiddenSize]
  const [, seqLen, hiddenSize] = tensor.dims;
  const data = tensor.data;
  const pooled = new Array(hiddenSize).fill(0);

  for (let t = 0; t < seqLen; t++) {
    for (let h = 0; h < hiddenSize; h++) {
      pooled[h] += data[t * hiddenSize + h];
    }
  }

  return pooled.map((v) => v / seqLen);
}

async function getSemanticSimilarity(resume, jd) {
  const model = await getEmbeddingModel();

  // pooling_mode: "mean" ensures we get sentence-level embeddings
  const emb1 = await model(resume, { pooling: "mean", normalize: true });
  const emb2 = await model(jd, { pooling: "mean", normalize: true });

  // emb1 is a Tensor with dims [1, hiddenSize] after mean pooling
  // Use Array.from on .data to get a plain JS array
  const vec1 = Array.from(emb1.data);
  const vec2 = Array.from(emb2.data);

  return cosineSim(vec1, vec2);
}

module.exports = {
  getSemanticSimilarity
};