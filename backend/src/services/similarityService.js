// function buildTermFrequency(tokens = []) {
//   const frequency = new Map();

//   for (const token of tokens) {
//     frequency.set(token, (frequency.get(token) || 0) + 1);
//   }

//   const tokenCount = tokens.length || 1;

//   const tf = new Map();
//   frequency.forEach((count, token) => {
//     tf.set(token, count / tokenCount);
//   });

//   return tf;
// }

// function buildDocumentFrequency(vocabulary, docs) {
//   const df = new Map();

//   for (const term of vocabulary) {
//     let count = 0;
//     for (const doc of docs) {
//       if (doc.has(term)) {
//         count += 1;
//       }
//     }
//     df.set(term, count);
//   }

//   return df;
// }

// function cosineSimilarity(vectorA, vectorB) {
//   let dotProduct = 0;
//   let magnitudeA = 0;
//   let magnitudeB = 0;

//   for (let i = 0; i < vectorA.length; i += 1) {
//     dotProduct += vectorA[i] * vectorB[i];
//     magnitudeA += vectorA[i] * vectorA[i];
//     magnitudeB += vectorB[i] * vectorB[i];
//   }

//   if (!magnitudeA || !magnitudeB) {
//     return 0;
//   }

//   return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
// }

// function calculateTfidfCosineSimilarity(resumeTokens = [], jdTokens = []) {
//   if (!resumeTokens.length || !jdTokens.length) {
//     return {
//       cosineSimilarity: 0,
//       similarityScore: 0
//     };
//   }

//   const resumeTf = buildTermFrequency(resumeTokens);
//   const jdTf = buildTermFrequency(jdTokens);

//   const vocabulary = Array.from(new Set([...resumeTokens, ...jdTokens]));
//   const df = buildDocumentFrequency(vocabulary, [resumeTf, jdTf]);
//   const totalDocs = 2;

//   const resumeVector = [];
//   const jdVector = [];

//   for (const term of vocabulary) {
//     const idf = Math.log((totalDocs + 1) / ((df.get(term) || 0) + 1)) + 1;
//     resumeVector.push((resumeTf.get(term) || 0) * idf);
//     jdVector.push((jdTf.get(term) || 0) * idf);
//   }

//   const cosine = cosineSimilarity(resumeVector, jdVector);

//   return {
//     cosineSimilarity: Number(cosine.toFixed(4)),
//     similarityScore: Math.round(cosine * 100)
//   };
// }

// module.exports = {
//   calculateTfidfCosineSimilarity
// };


function buildTermFrequency(tokens = []) {
  const frequency = new Map();

  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  const tokenCount = tokens.length || 1;

  const tf = new Map();
  frequency.forEach((count, token) => {
    tf.set(token, count / tokenCount);
  });

  return tf;
}

function buildDocumentFrequency(vocabulary, docs) {
  const df = new Map();

  for (const term of vocabulary) {
    let count = 0;
    for (const doc of docs) {
      if (doc.has(term)) {
        count += 1;
      }
    }
    df.set(term, count);
  }

  return df;
}

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (!magnitudeA || !magnitudeB) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function calculateTfidfCosineSimilarity(resumeTokens = [], jdTokens = []) {
  if (!resumeTokens.length || !jdTokens.length) {
    return {
      cosineSimilarity: 0,
      similarityScore: 0
    };
  }

  const resumeTf = buildTermFrequency(resumeTokens);
  const jdTf = buildTermFrequency(jdTokens);

  const vocabulary = Array.from(new Set([...resumeTokens, ...jdTokens]));
  const df = buildDocumentFrequency(vocabulary, [resumeTf, jdTf]);

  // FIX: Use standard IDF formula — more meaningful with a small corpus
  // log(N / df) where N = total docs; +1 denominator avoids division by zero
  const totalDocs = 2;

  const resumeVector = [];
  const jdVector = [];

  for (const term of vocabulary) {
    const idf = Math.log(totalDocs / ((df.get(term) || 0) + 1)) + 1;
    resumeVector.push((resumeTf.get(term) || 0) * idf);
    jdVector.push((jdTf.get(term) || 0) * idf);
  }

  const cosine = cosineSimilarity(resumeVector, jdVector);

  return {
    cosineSimilarity: Number(cosine.toFixed(4)),
    similarityScore: Math.round(cosine * 100)
  };
}

module.exports = {
  calculateTfidfCosineSimilarity
};
