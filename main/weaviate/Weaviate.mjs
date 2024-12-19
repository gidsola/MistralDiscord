

import weaviate, {
  ApiKey,
  generative,
  vectorizer
} from 'weaviate-client';
import { DiscordCompletion } from '../handlers/ChatCompletions.mjs';
import { sendMessage, typingIndicator } from '../handlers/messages.mjs';
import { getSmolVLMImageDescription, getPixtralApiImageResponse } from '../handlers/requesters.mjs';
import dms from './schemas/DiscordmessageSchema2.mjs';
import { v4 as uuidv4 } from 'uuid';
import { inspect } from 'util';

const Config = (await import('../../config.json', { with: { type: "json" } })).default.Config;

/**
 * The `WeaviateDataManager` class is responsible for managing the data exchange between the Weaviate API and the bot.
 * It handles the creation and management of data collections, as well as the storage and retrieval of data.
 * The class also provides methods for initializing the Weaviate client and data collection.
 * 
 */
class WeaviateDataManager {
  /*private*/ client;
  /*private*/ dataCollectionName;
  /*private*/ modelProvider;
  dataCollection;
  modelApiKey;

  constructor(collection, modelProvider, modelApiKey) {
    this.modelProvider = modelProvider;
    this.modelApiKey = modelApiKey;
    this.dataCollectionName = collection.replace(/\s+/g, ''); // thnx for the reminder Blahaj :)
  }

  /**
   * Initializes the Weaviate client and named data collection.
   * This method is meant to be used as a creation method.
   * 
   * @returns A promise that resolves to `true` if successful, otherwise `false`.
   */
  async initialize() {
    try {
      const client = await this.getClient();
      if (!client) throw new Error('Error initializing client: could not connect to Weaviate Cloud');

      this.client = client;
      this.dataCollection = await this.createCollection();
      if (!this.dataCollection) throw new Error('Error initializing: could not create collection');

      return true;
    } catch (e) {
      console.error('Error initializing:', e.message || e);
      return false;
    };
  };

  /**
   * Retrieves a Weaviate client instance.
   *
   * @returns A promise that resolves to a WeaviateClient instance if successful,
   * or an Error if the client is not ready or an exception occurs.
   */
  async getClient() {
    try {
      const
        wcdUrl = Config.weaviateConfig.dialogsCluster.dialogsClusterRest,
        timeoutParams = { query: 120000, insert: 30000, init: 30000 },// TODO: move to config
        wcdHeaders = {
          mistral: 'X-Mistral-Api-Key'
        },
        connectToWeaviateCloudOptions = {
          timeout: { ...timeoutParams },
          authCredentials: new ApiKey(Config.weaviateConfig.dialogsCluster.adminApiKey),
          headers: {
            [wcdHeaders[this.modelProvider]]: this.modelApiKey
          }
        },
        client = await weaviate.connectToWeaviateCloud(wcdUrl, { ...connectToWeaviateCloudOptions }),
        isReady = await client.isReady();

      while (!isReady)
        await new Promise(r => setTimeout(r, 2000));

      return client;
    }
    catch (e) {
      console.error(e.message || e);
      return null;
    };
  };

  /**
   * Opens a client collection channel.
   * 
   * @returns A promise that resolves to boolean `true` if successful, otherwise `false`.
   * 
   */
  async openCollectionChannel() {
    try {
      const client = await this.getClient();
      if (client instanceof Error) throw new Error('Error initializing client: ' + client.message);
      this.client = client;

      const exists = await client.collections.exists(this.dataCollectionName);
      if (!exists) {
        this.dataCollection = await this.createCollection();
        if (!this.dataCollection) throw new Error('Error creating collection');
      };

      const collection = client.collections.get(this.dataCollectionName);
      this.dataCollection = collection;

      return true;
    } catch (e) {
      console.error(e.message || e);
      return false;
    };
  };

  /**
   * Creates a new collection with the specified configuration.
   * 
   * @returns A promise that resolves to the created collection or null if an error occurs.
   * 
   */
  async createCollection() {
    try {
      if (!this.client) throw new Error('Client not initialized');

      const
        text2VecMistralCreateConfig = {
          model: "mistral-embed",
          vectorizeCollectionName: true
        },
        generativeMistralCreateConfig = {
          maxTokens: 1024,
          model: 'mistral-small-latest',
          temperature: 0.5
        },
        text2vecConfigs = {
          mistral: vectorizer.text2VecMistral({ ...text2VecMistralCreateConfig })
        },
        generativeConfigs = {
          mistral: generative.mistral({ ...generativeMistralCreateConfig })
        },
        discordCollectionCreateConfig = {
          name: this.dataCollectionName,
          description: dms.description,
          properties: dms.properties,
          vectorizers: text2vecConfigs[this.modelProvider],
          generative: generativeConfigs[this.modelProvider]
        },
        createConfig = {
          discord: discordCollectionCreateConfig
        };

      return await this.client.collections.create({ ...createConfig.discord });
    }
    catch (e) {
      console.error(e.message || e);
      return null;
    };
  };

  async storeDiscordMessagePayload(role, params) {
    try {
      if (this.dataCollection === null)
        throw new Error('Error getting collection');

      const insertObj = { ...params, messageID: params.id, role };
      // remove id from insertObj (id is a reserved item with Weaviate)
      delete insertObj.id;
      // make any null values as undefined
      const replaceNulls = (obj) => {
        Object.keys(obj).forEach(key => {
          if (obj[key] === null) {
            obj[key] = undefined;
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            replaceNulls(obj[key]);
          }
        });
      };
      replaceNulls(insertObj);

      return await this.dataCollection.data.insert({ id: uuidv4(), properties: { ...insertObj } });
    }
    catch (e) {
      console.error("insert discord message", e.message || e);
      return e.message || e;
    };
  };




};

/**
 * The `WeaviateMethodHandler` class is responsible for handling interactions with the Weaviate API.
 * It manages the exchange of messages using various methods and search types, and generates responses
 * based on user messages and chat history.
 */
class WeaviateMethodHandler {
  /*private*/WeaviateDataManager;
  /*private*/ completionOptions;
  constructor(weaviateDataManager, completionOptions) {
    this.WeaviateDataManager = weaviateDataManager;
    this.completionOptions = completionOptions;
  };

  /**
   * Handles the interaction between a Discord bot and Weaviate, a vector search engine.
   * 
   * @param {string} bot_token - The token for the Discord bot.
   * @param {Object} input - The input object containing details of the Discord message.
   * @param {string} input.channel_id - The ID of the Discord channel where the message was sent.
   * @param {string} input.content - The content of the user's message.
   * @returns {Promise<string>} - The AI-generated response.
   */
  async discordxchange(bot_token, input) {
    if (!this.WeaviateDataManager)
      return 'Error getting weaviate data manager';

    if (!this.WeaviateDataManager.dataCollection)
      await this.WeaviateDataManager.openCollectionChannel();

    const collection = this.WeaviateDataManager.dataCollection;
    if (!collection) return 'Error getting collection collection';

    // engage
    await typingIndicator(input.channel_id, bot_token);




    const
      userQuery = input.content,
      baseHybridOptions = {
        limit: 10,
        alpha: 0.5,
        // queryProperties: [], // empty to enable searching all fields
        fusionType: "Ranked", // "RelativeScore" | "Ranked"
      },
      weaviateReturn = await collection.query.hybrid(userQuery, baseHybridOptions),
      dataObject = weaviateReturn.objects,

      // response handling
      aiResponse = await this.baseDiscordSemanticCtx(
        this.WeaviateDataManager.modelApiKey,
        this.completionOptions,
        userQuery,
        dataObject,
        input,
        bot_token
      );

    // engage user(extra helpful here if handling takes a long time)
    await typingIndicator(input.channel_id, bot_token);

    // store user message payload
    await this.WeaviateDataManager.storeDiscordMessagePayload("user", input);

    // get and store ai message payload returned from sendmessage
    const responsePayload = await sendMessage(input.channel_id, { content: aiResponse.toString() }, bot_token)
    await this.WeaviateDataManager.storeDiscordMessagePayload("assistant", responsePayload);

    // console.log("Final Response", aiResponse);
    return aiResponse;
  };


  /**
   * Generates a response based on the provided user query and data object using a specified model API key and completion options.
   * Handles different types of tasks, including image description tasks.
   *
   * @param {string} modelApiKey - The API key for the model.
   * @param {object} completionOptions - Options for the completion request.
   * @param {string} userQuery - The user's query.
   * @param {object} dataObject - Additional data object for context.
   * @param {object} input - The input object containing channel information.
   * @param {string} bot_token - The bot token for authentication.
   * @returns {Promise<string>} - The generated response or an error message.
   */
  async baseDiscordSemanticCtx(
    modelApiKey,
    completionOptions,
    userQuery,
    dataObject,
    input,
    bot_token
  ) {
    try {
      const
        // get initial response. 
        // conversation context, user input, and message payload are supplied
        response = await DiscordCompletion(modelApiKey, completionOptions, userQuery, dataObject, input),
        parsed = await response.json();

      if (response.ok) {
        // capture response text(currently from MistralAI)
        const text = parsed.choices[0].message.content;

        // TODO: add generated tasklist import.

        // ignore this if you're seeing it.

        // TODO: base on split char exists
        if (text.includes('USER_TASK')) {
          await typingIndicator(input.channel_id, bot_token);

          //TODO: fix and use
          // get arguements
          const parts = text.split(':USER_IMAGE');// need new split char
          console.log("Parts", parts);

          const task = parts[0].split('USER_TASK')[1].trim();
          const image_url = parts[1].trim(); // needs to be if image task

          // engage user
          await sendMessage(input.channel_id, { content: "One moment please.." }, bot_token);
          await typingIndicator(input.channel_id, bot_token);

          const image_describe = true; // set to true to use image describe task
          if (image_describe) {
            const api = false; // set to true to use api
            if (!api) {
              // image describe task: local
              const imageDescription = await getSmolVLMImageDescription(task, image_url);
              return imageDescription;
            }
            // image describe task: api
            else if (api) {
              const
                imageTaskResponse = await getPixtralApiImageResponse(
                  modelApiKey,
                  completionOptions,
                  userQuery,
                  image_url
                ),
                imageTaskParsed = await imageTaskResponse.json();

              return imageTaskResponse.ok
                ? imageTaskParsed.choices[0].message.content
                : imageTaskParsed.detail.map((msg) => inspect(msg, { depth: null }));
            };
          };

          return "User task not found" + task;

        }
        // regular response
        else
          return text;
      }
      // error response
      else
        return parsed.detail && parsed.detail.map((msg) => inspect(msg, { depth: null }));// : 'something weird happened..';// TODO: actually handle this

    } catch (e) {
      console.error(e.message || e);
      return 'An error occurred while generating response: ' + e.message || e;
    };
  };
};
export { WeaviateDataManager, WeaviateMethodHandler };

