import { getSmolVLMImageDescription, getPixtralApiImageResponse } from '../handlers/requesters.mjs';
import { sendMessage, typingIndicator } from '../handlers/messages.mjs';
import { DiscordCompletion } from '../handlers/ChatCompletions.mjs';
import dms from './schemas/DiscordmessageSchema2.mjs';
import { v4 as uuidv4 } from 'uuid';
import { inspect } from 'util';
import weaviate, {
  WeaviateClient, Collection,
  ApiKey,
  generative,
  vectorizer
} from 'weaviate-client';

const Config = (await import('../../config.json', { with: { type: "json" } })).default.Config;

/**
 * Manages data operations with Weaviate.
 */
class WeaviateDataManager {
  /**@private @type {WeaviateClient}*/ client;
  /**@private*/ dataCollectionName;
  /**@private*/ modelProvider;
  /**@type {Collection}*/ dataCollection;
  modelApiKey;

  /**
   * Creates a new instance of the `WeaviateDataManager` class.
   * 
   * @param {string} collection - The name of the collection to use.
   * @param {string} modelProvider - The name of the model provider.
   * @param {string} modelApiKey - The API key for the model.
   */
  constructor(collection, modelProvider, modelApiKey) {
    this.modelProvider = modelProvider;
    this.modelApiKey = modelApiKey;
    this.dataCollectionName = collection.replace(/\s+/g, ''); // thnx for the reminder Blahaj :)
  }

  /**
   * Initializes the Weaviate client and named data collection.
   * This method is meant to be used as a creation method.
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
   * Creates a Weaviate collection.
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

  /**
   * Stores a Discord message payload.
   *
   * @param {string} role - The role associated with the Discord message.(user or assistant)
   * @param {any} payload - The Discord message payload.
   * @param {string} payload.id - The Discord message id.
   * @returns The ID of the inserted object.
   */
  async storeDiscordMessagePayload(role, payload) {
    try {
      if (this.dataCollection === null)
        throw new Error('Error getting collection');

      const insertObj = { ...payload, messageID: payload.id, role };
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
      console.error("storeDiscordMessagePayload::", e.message || e);
      return e.message || e;
    };
  };
};

/**
 * Handles the interactions between mediums.
 */
class WeaviateMethodHandler {
  /**@private @type {WeaviateDataManager}*/ WeaviateDataManager;
  /**@private*/ completionOptions;

  /**
   * Creates a new instance of the `WeaviateMethodHandler` class.
   * 
   * @param {WeaviateDataManager} weaviateDataManager - The data manager instance.
   * @param {any} completionOptions - Options for completion.
   */
  constructor(weaviateDataManager, completionOptions) {
    this.WeaviateDataManager = weaviateDataManager;
    this.completionOptions = completionOptions;
  };


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
      // search for ctx from user query
      weaviateReturn = await collection.query.hybrid(userQuery, baseHybridOptions),
      dataObject = weaviateReturn.objects,

      // response handling
      aiResponse = await this.baseDiscordSemanticCtx(
        this.WeaviateDataManager.modelApiKey,
        this.completionOptions,
        userQuery,
        dataObject,
        input
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
   * @param {any} completionOptions - Options for the completion request.
   * @param {string} userQuery - The user's query.
   * @param {any} dataObject - Additional data object for context.
   * @param {any} input - The input object containing channel information.
   * @param {string} bot_token - The bot token for authentication.
   * @returns {Promise<string>} - The generated response or an error message.
   */
  async baseDiscordSemanticCtx(
    modelApiKey,
    completionOptions,
    userQuery,
    dataObject,
    input
  ) {
    try {
      const
        // get initial response. 
        // conversation context, user input, and message payload are supplied
        response = await DiscordCompletion(modelApiKey, completionOptions, userQuery, dataObject, input),
        parsed = await response.json();

      if (response.ok)
        return parsed.choices[0].message.content;

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

