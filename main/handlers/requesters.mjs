

export async function getWavForm(response) {

  const speechResult = await fetch('http://localhost/v1/speech/xenova', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: response.content
  });

  // console.log("Speech", speechResult);

};


export async function getPixtralApiImageResponse(apikey, completionOptions, userTasked, imageUrl) {
  const
    InitialResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userTasked.toString() },
              {
                type: "image_url",
                imageUrl: imageUrl.toString()
              },
            ],
          },
        ],
        max_tokens: 300
      })

    });
  return InitialResponse;
};


/**
 * Fetches a description of an image based on the provided user query and image URL.  
 * Local use via Huggingface VLM model.(SmolVLM)
 *
 * @param userQuery - The query text provided by the user.
 * @param image_url - The URL of the image to be described.
 * @returns A promise that resolves to the description of the image.
 * 
 */
export async function getSmolVLMImageDescription(userQuery, image_url) {
  const
    url = `http://localhost:8000/image/describe/${encodeURIComponent(userQuery)}?url=${encodeURIComponent(image_url)}`,
    smolVLMResponse = await fetch(url),
    data = await smolVLMResponse.json();

  // console.log(data);

  return data.output;
};
