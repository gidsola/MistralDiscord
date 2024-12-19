
import { WeaviateDataManager, WeaviateMethodHandler } from '../../weaviate/Weaviate.mjs';
import { typingIndicator } from '../../handlers/messages.mjs';

export async function POST(request) {
  try {
    const
      body = JSON.parse(request),
      {
        collection,
        modelProvider,
        modelApiKey,
        completionOptions,
        params,
        bot_token
      } = body;

    await typingIndicator(params.channel_id, bot_token);

    const
      weaviateDataManager
        = new WeaviateDataManager(collection, modelProvider, modelApiKey),
      weaviateMethodHandler
        = new WeaviateMethodHandler(weaviateDataManager, completionOptions),
      response
        = await weaviateMethodHandler.discordxchange(bot_token, params);

    return response;
  }
  catch (e) {
    console.error(e.message);
    return e.message ? e.message : e;
  };
};
