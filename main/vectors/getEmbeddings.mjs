// import fetch from 'node-fetch';
const endpoint = 'https://api.mistral.ai/v1/embeddings';

async function getEmbeddings(text, apiKey) {
  console.log('Generating vectors for:', text);
  console.log('Using API Key:', apiKey);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'mistral-embed',
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const vectors = data.data;
    // console.log('Received Vectors=>', vectors);
    return vectors;
  } catch (error) {
    console.error('Error generating vectors!', error);
    throw error;
  }
};


export { getEmbeddings };
