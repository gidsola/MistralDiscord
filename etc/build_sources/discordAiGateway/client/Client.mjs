import { EventEmitter } from 'node:events';
import { createRequire } from 'module';
import { readdir, stat/*, readFile*/ } from 'node:fs/promises';
import path from 'node:path';
import Session from './DefaultSession.mjs';
import CacheHandler from './CacheHandler.mjs';
import { BASE_INTENTS, TEXTFIELDS, APP_FLAGS, PRIVILEGED } from '../enums/base_enums.mjs';
import { MESSAGE_CREATE } from './events/messageCreate.mjs';
import { get } from '../utils/https.mjs';

/**
 * Represents a Discord gateway client.
 */
class Client extends EventEmitter {
  /**
   * @param {string} token - The token for authentication.
   * @param {Session} session - The session.
   * @param {CacheHandler} cache - The cache handler.
   */
  constructor(token, session, cache) {
    super();
    this.setMaxListeners(0);
    this.CacheHandler = cache;
    this.Session = session;
    this.projectRoot = path.join('.');
    this.addOnListener = this.RegisterEventAlways.bind(this);
    this.addOnceListener = this.RegisterEventOnce.bind(this);
    this.depCount = [];
    this.commandCache = [];
    this.supportCache = [];
    this.unknownCache = [];
    this.datadir = '.';
    this.token = token;
    this.exists = async (_path) => {
      try {
        await stat(_path);
        return true;
      } catch (e) {
        return false;
      }
    };

    // GATEWAY EVENTS
    this.gatewayEvents = {
      'READY': async (dispatch, trigger) => {
        this.Session.state.ready(dispatch);
        console.log('Session Ready');
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'RESUMED': async () => { /*this.emit('system', `Process Resumed`);*/ },
      'CHANNEL_CREATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].channels.push(dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'CHANNEL_DELETE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].channels =
          this.CacheHandler.GuildCache[dispatch.guild_id].channels.filter(x => x.id !== dispatch.id);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'CHANNEL_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].channels =
          this.CacheHandler.GuildCache[dispatch.guild_id]?.channels?.map(x => {
            return x.id === dispatch.id
              ? Object.assign(x, dispatch)
              : x
          });
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'CHANNEL_PINS_UPDATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'THREAD_CREATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].threads.push(dispatch);
        //this.emit(trigger.toLowerCase(), dispatch);
        await this.handleGatewayEvent(trigger, dispatch);
      },
      'THREAD_DELETE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].threads =
          this.CacheHandler.GuildCache[dispatch.guild_id].threads.filter(x => x.id !== dispatch.id);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'THREAD_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].threads =
          this.CacheHandler.GuildCache[dispatch.guild_id].threads.map(x => {
            return x.id === dispatch.id
              ? Object.assign(x, dispatch)
              : x
          });
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'THREAD_LIST_SYNC': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].threads = dispatch.threads;
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'THREAD_MEMBER_UPDATE': async (dispatch, trigger) => {
        //console.info('THREAD_MEMBER_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'THREAD_MEMBERS_UPDATE': async (dispatch, trigger) => {
        //console.info('THREAD_MEMBERS_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      // GUILD EVENTS
      'APPLICATION_COMMAND_CREATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'APPLICATION_COMMAND_DELETE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'APPLICATION_COMMAND_UPDATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'APPLICATION_COMMAND_PERMISSIONS_UPDATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'AUTO_MODERATION_RULE_CREATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'AUTO_MODERATION_RULE_UPDATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'AUTO_MODERATION_RULE_DELETE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'ENTITLEMENT_CREATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'ENTITLEMENT_DELETE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'ENTITLEMENT_UPDATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'GUILD_AUDIT_LOG_ENTRY_CREATE': async (dispatch, trigger) => {
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_BAN_ADD': async (dispatch, trigger) => {
        await this.handleGatewayEvent(trigger, dispatch, 'user');
        this.CacheHandler.GuildCache[dispatch.guild_id].members =
          this.CacheHandler.GuildCache[dispatch.guild_id].members.filter(x => x.user.id !== dispatch.user.id);
      },
      'GUILD_BAN_REMOVE': async (dispatch, trigger) => {
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_CREATE': async (dispatch, trigger) => {
        this.CacheHandler.cacheInitialGuildObject(dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_DELETE': ( // assumed checked
        dispatch,
        /** @type {string} */trigger
      ) => {
        this.CacheHandler.GuildCache =
          this.CacheHandler.GuildCache.filter(x => x.id !== dispatch.id);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_UPDATE': async (dispatch, trigger) => {
        Object.assign(this.CacheHandler.GuildCache[dispatch.id], dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_EMOJIS_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].emojis = dispatch.emojis;
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_STICKERS_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].stickers = dispatch.stickers;
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_INTEGRATIONS_UPDATE': async (dispatch, trigger) => {
        // console.info('GUILD_INTEGRATIONS_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_MEMBER_ADD': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].members.push(dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_MEMBER_REMOVE': async (dispatch, trigger) => {
        if (dispatch.user.id === this.Session.sessionReady.application.id) {
          // remove the guild involved from cache as bot is no longer in that guild
          this.CacheHandler.GuildCache = this.CacheHandler.GuildCache.filter(x => x.id !== dispatch.guild_id);
          // emit custom event
          this.emit('BOT_GUILD_MEMBER_REMOVE', dispatch);
        }
        this.CacheHandler.GuildCache[dispatch.guild_id].members =
          this.CacheHandler.GuildCache[dispatch.guild_id].members.filter(x => x.user.id !== dispatch.user.id);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_MEMBER_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].members =
          this.CacheHandler.GuildCache[dispatch?.guild_id]?.members.map(member => {
            return member.user.id === dispatch.user.id
              ? Object.assign(member, this.CacheHandler.memberUpdate(member, member.roles, dispatch.guild_id))
              : member;
          });
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_MEMBERS_CHUNK': async (dispatch, trigger) => {
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_ROLE_CREATE': async (dispatch, trigger) => {
        // console.info('GUILD_ROLE_CREATE', dispatch);
        this.CacheHandler.GuildCache[dispatch.guild_id].roles.push(dispatch.role);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_ROLE_DELETE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].roles =
          this.CacheHandler.GuildCache[dispatch.guild_id].roles.filter(x => x.id !== dispatch.role_id);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_ROLE_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.GuildCache[dispatch.guild_id].roles =
          this.CacheHandler.GuildCache[dispatch.guild_id].roles.map(role => {
            return role.id === dispatch.role.id
              ? Object.assign(role, this.CacheHandler.roleUpdate(dispatch.role))
              : role;
          });
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'GUILD_SCHEDULED_EVENT_CREATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'GUILD_SCHEDULED_EVENT_DELETE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'GUILD_SCHEDULED_EVENT_UPDATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'GUILD_SCHEDULED_EVENT_USER_ADD': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'GUILD_SCHEDULED_EVENT_USER_REMOVE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'INTEGRATION_CREATE': async (dispatch, trigger) => {
        // console.info('INTEGRATION_CREATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'INTEGRATION_DELETE': async (dispatch, trigger) => {
        // console.info('INTEGRATION_DELETE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'INTEGRATION_UPDATE': async (dispatch, trigger) => {
        // console.info('INTEGRATION_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'INTERACTION_CREATE': async (dispatch, trigger) => {
        try {
          await this.handleGatewayEvent(trigger, dispatch);
          /**
           * @type {InteractionData}
           * @typedef {object} InteractionData
           * @property {string} data.custom_id the custom_id of the component or modal
           * @property {string} data.name the name of the invoked command
           */
          const data = dispatch?.data;
          data?.custom_id
            ? await this.execSupport(data, dispatch)
            : (data?.name)
              ? await this.execCommand(data, dispatch)
              : console.error('error', 'Script not found by Name' + data.toString() + 'INTERACTION_CREATE');

        } catch (e) { console.error('error', JSON.stringify(e)); }
      },
      'INVITE_CREATE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'INVITE_DELETE': async (dispatch, trigger) => { this.emit(trigger.toLowerCase(), dispatch); },
      'MESSAGE_CREATE': async (dispatch, trigger) => {
        const msgObj = await MESSAGE_CREATE(dispatch, trigger, this.Session.sessionReady.application.id);
        await this.handleGatewayEvent(msgObj.trigger, msgObj.dispatch);
      },
      'MESSAGE_DELETE': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'MESSAGE_DELETE_BULK': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'MESSAGE_UPDATE': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'MESSAGE_REACTION_ADD': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'MESSAGE_REACTION_REMOVE': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'MESSAGE_REACTION_REMOVE_ALL': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'MESSAGE_REACTION_REMOVE_EMOJI': async (dispatch, trigger) => { await this.handleGatewayEvent(trigger, dispatch); },
      'PRESENCE_UPDATE': async (dispatch, trigger) => {
        this.CacheHandler.processPresence(dispatch);
        // this.CacheHandler.modifyPayload(dispatch, 'user');
        // this.emit(trigger.toLowerCase(), dispatch);
        await this.handleGatewayEvent(trigger, dispatch, 'user');
      },
      'STAGE_INSTANCE_CREATE': async (dispatch, trigger) => {
        // console.info('this.CacheHandler.guildCache[dispatch.guild_id].channels', this.CacheHandler.guildCache[dispatch.guild_id].channels);
        // this.CacheHandler.guildCache[dispatch.guild_id].stage_instances.push(dispatch);
        // console.info('STAGE_INSTANCE_CREATE', dispatch);
        // console.info('AFTERWARDS [dispatch.guild_id].channels', this.CacheHandler.guildCache[dispatch.guild_id].channels);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'STAGE_INSTANCE_DELETE': async (dispatch, trigger) => {
        // console.info('STAGE_INSTANCE_DELETE', dispatch);
        // this.CacheHandler.guildCache[dispatch.guild_id].stage_instances =
        //   this.CacheHandler.guildCache[dispatch.guild_id].stage_instances.filter(x => x.id !== dispatch.id);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'STAGE_INSTANCE_UPDATE': async (dispatch, trigger) => {
        // console.info('STAGE_INSTANCE_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'TYPING_START': async (dispatch, trigger) => {
        //console.info('TYPING_START', dispatch);
        !dispatch.member
          ? await this.handleGatewayEvent('dm_typing_start', dispatch, 'guildless')
          : await this.handleGatewayEvent(trigger, dispatch, 'guildless');
      },
      'USER_UPDATE': async (dispatch, trigger) => {
        // console.info('USER_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },

      // VOICE EVENTS
      'VOICE_SERVER_UPDATE': async (dispatch, trigger) => {
        this.Session.state?.serverUpdate(dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },
      'VOICE_STATE_UPDATE': async (dispatch, trigger) => {
        // console.info('this.CacheHandler.guildCache[dispatch.guild_id].channels', this.CacheHandler.guildCache[dispatch.guild_id].channels);
        // console.info('VOICE_STATE_UPDATE', dispatch);
        // this.CacheHandler.guildCache[dispatch.guild_id]?.voice_states?.push(dispatch);
        // if (dispatch?.user_id === this.Session.sessionReady?.application?.id && dispatch?.session_id)
        //   if (this.Session.sessionState?.stateUpdate(dispatch))
        //     connectVGateway(this.Session.voiceGatewayInfo, dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      },

      // WEBHOOK EVENTS
      'WEBHOOKS_UPDATE': async (dispatch, trigger) => {
        // console.info('WEBHOOKS_UPDATE', dispatch);
        this.emit(trigger.toLowerCase(), dispatch);
      }
    };

    this.InitializeApplication(this.token);
  }; // eo constructor

  /**
   * Initializes the client session.
   * 
   * @param {string} token - The token for authentication.
   * @returns {Promise<boolean>} - A promise that resolves to true if the session was initialized successfully, or false otherwise.
   */
  async InitializeApplication(token) {
    try {
      const appObj = await this._get(`/api/v10/oauth2/applications/@me`, token);
      if (appObj.message)
        throw new Error(JSON.stringify(appObj.message));

      const gateObj = await this._get(`/api/v10/gateway/bot`, token);
      if (!gateObj.url)
        throw new Error(JSON.stringify(gateObj));

      const APP_INTENTS = await this.GetAppIntents(appObj.flags);

      this.Session.intents = Object.values(BASE_INTENTS).reduce(
        (a, b) => a + b,
        APP_INTENTS ? APP_INTENTS : 0
      );

      this.Session.gateway_url = gateObj.url + `/?v=${TEXTFIELDS.API}&encoding=${TEXTFIELDS.ENCODING}`;

      await this.processFile("/app/gateway_triggers.mjs", "gateway_triggers.mjs");
      console.log('Data Loaded Successfully ✔', '\n',
        '----------------------------------', '\n',
        'Triggers Registered:', this.eventNames(), '\n',
      );
      console.log('Waiting for Gateway Session...');

      return this.Session.hasInitializedApp = true;
    } catch (e) {
      process.exit(1);
    };
  };

  /**
   * Retrieves the intents based on the provided application flags.
   * @param {number} appFlags - The application flags.
   * @returns {Promise<number>} - The intents.
   */
  async GetAppIntents(appFlags) {
    try {
      const
        /** Represents the intents. @type {number[]} */intents = [],
        /** Does the bot have local permission for presence intent? @type {boolean} */hasPresence = false;  //NYI - Change to dynamic check

      if (appFlags) {
        for (const [key, val] of Object.entries(APP_FLAGS)) {
          if (appFlags & val) {
            if (key.match('GATEWAY_PRESENCE_LIMITED' || 'GATEWAY_PRESENCE') && hasPresence)
              intents.push(PRIVILEGED.GUILD_PRESENCES)
            if (key.match('GATEWAY_GUILD_MEMBERS_LIMITED' || 'GATEWAY_GUILD_MEMBERS'))
              intents.push(PRIVILEGED.GUILD_MEMBERS);
            if (key.match('GATEWAY_MESSAGE_CONTENT_LIMITED' || 'GATEWAY_MESSAGE_CONTENT'))
              intents.push(PRIVILEGED.MESSAGE_CONTENT);
          };
        };
        return (intents.length) ? intents.reduce((a, b) => a + b) : 0;
      }
      else {
        console.log('No application flags found. Using default intents.');
        return 0;
      }
    } catch (e) {
      console.error('Error in GetAppIntents() function. Using default intents.\n' + e);
      return 0;
    }
  };

  /**
   * Retrieves data from a specified URL using the GET method.
   * 
   * @param {string} p - The path of the URL to retrieve data from.
   * @param {string} t - The authorization token for the request.
   * @returns {Promise<Object>} - A promise that resolves to the parsed JSON response.
   */
  async _get(p, t) {
    try {
      return JSON.parse(
        (await get({
          url: encodeURI(`discord.com`),
          path: encodeURI(p),
          headers: { Authorization: `Bot ` + t },
        })).body);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Processes a file by loading its module and registering its events or handlers.
   *
   * @param {string} filepath - The path to the file to be processed.
   * @param {string} baseFileName - The base file name of the module.
   * @returns {Promise<boolean>} - A promise that resolves to true if the file was processed successfully, or false otherwise.
   */
  async processFile(filepath, baseFileName) {
    try {
      console.log('Processing Triggers...');

      const module = await this.loadModule(filepath);

      await Promise.all(module.events.map(async m => {
        if (m.trigger) {
          if (m.once)
            await this.RegisterEventOnce(m, baseFileName);
          else
            await this.RegisterEventAlways(m, baseFileName);
        } else
          new Error('Error: ' + 'Event trigger not found in: ' + baseFileName + '\n');
      }))


    } catch (e) {
      return e.message || e;
    }
  };

  /**
       * Asynchronously loads a module from the given file path.
       *
       * @param {string} filepath - The path to the module file.
       * @param {string} baseFileName - The base file name of the module.
       * @returns {Promise<Module>} A promise that resolves to the loaded module.
       *
       * @typedef {Object} Module
       * @property {Object} default - The default export of the module.
       * @property {string} name - The name of the module.
       * @property {Function} execute - The function to execute.
       * @property {string} trigger - The trigger of the event.
       * @property {boolean} once - Whether the event should be triggered only once.
       * @property {Object[]} events - The events.
       * @property {string} events.trigger - The trigger of the event.
       * @property {boolean} events.once - Whether the event should be triggered only once.
       * @property {Function} events.execute - The function to execute.
       * @property {string} events.name - The name of the event.
       * @property {string} events.description - The description of the event.
       */
  async loadModule(filepath) {
    const require = createRequire(import.meta.url);
    /**
     * @type {Module} module - The module.
     * @typedef {Object} Module 
     * @property {Object} [default] - The default export of the module.
     */
    let module;
    try {
      module = await import('file://' + filepath);
    } catch (e) {
      if (e.code === 'ERR_REQUIRE_ESM')
        module = require(filepath); else throw e;
    };
    return module = module.default ?? module;
  };

  /**
   * Creates a list of files in a given folder and its subfolders.
   * 
   * @param {string} folder - The path of the folder to search for files.
   * @param {string[]} [found] - (Optional) An array to store the found file paths.
   * 
   * @returns {Promise<string[]>} - A list of files in the folder and its subfolders.
   */
  async CreateFileList(folder, found) {
    try {
      found = found ?? [];
      const
        skipList = [`index.mjs`, 'package.json', 'package-lock.json', '.env', '.profile', '.mock', '.mapih', 'node_modules', 'www', 'bin', 'bash', 'lib', 'lib64', 'usr', 'etc', '.npm'],
        files = await readdir(folder);

      for await (const file of files) {
        const
          filePath = path.join(folder, file),
          fileStat = await stat(filePath);

        if (skipList.some(x => filePath.includes(x))) continue;
        fileStat.isDirectory() ? found = await this.CreateFileList(filePath, found) : found.push(filePath);
      };
      return found;
    }
    catch (e) { return e; };
  };

  /**
   * Caches the support content by storing the filename and the execute function in the commandCache array.
   * Emits a 'suppstore' event with the loaded support file name.
   * 
   * @param {string} filename - The filename of the support content.
   * @param {function} fileData - The execute function of the support content.
   * @returns {Promise<void|Error>} - A promise that resolves when the support content is cached.
   */
  async RegisterSupportContent(fileData, filename) {
    try {
      // /**
      //  * @type {object} _content - The content object.
      //  * @property {string} filename - The filename.
      //  * @property {any} execute - The execute function.
      //  */
      // const _content = {
      //   filename: filename,
      //   execute: fileData
      // };
      this.supportCache.push(filename);
      return;
    } catch (e) { return e; };
  };

  /**
   * `Adds a one-time event listener for the specified event trigger.`
   * 
   * @typedef {Object} _module - Mixed module object.
   * @property {string} trigger - The trigger of the module.
   * @property {function} trigger_actions - The trigger actions of the module.
   * 
   * @param {_module} module - The module object.
   * @param {string} _filename - The filename.
   * @returns {Promise<void|Error>} - A promise that resolves when the event is registered.
   */
  async RegisterEventOnce(module, _filename) {
    try {
      this.prependOnceListener(module.trigger, async (...args) => {
        try { await module.trigger_actions(...args); }
        catch (e) { return e; };
      });
      return;
    } catch (e) { return e; };
  };

  /**
   * `Adds an event listener for the specified event trigger.`
   * 
   * @typedef {Object} _module - Mixed module object.
   * @property {string} trigger - The trigger of the module.
   * @property {function} trigger_actions - The trigger actions of the module.
   * 
   * @param {_module} module - The module object.
   * @param {string} _filename - The filename.
   * @returns {Promise<void|Error>} - A promise that resolves when the event is registered.
   */
  async RegisterEventAlways(module, _filename) {
    try {
      this.on(module.trigger, async (...args) => {
        try { await module.trigger_actions(...args); }
        catch (e) { return e; };
      });
      console.log('Event Registered:', module.trigger);
      return;
    } catch (e) { return e; };
  };

  /**
   * Executes a support command based on the provided command data.
   *
   * @param {Object} commandData - The data for the command to be executed.
   * @param {string} commandData.custom_id - The custom identifier for the command, expected to be in the format 'filename.arg1.arg2...'.
   * @param {Function} dispatch - The dispatch function to be passed to the support file's execute method.
   *
   * @returns {Promise<void|Error>} - A promise that resolves to an error if there is an issue with executing the support command, or void otherwise.
   */
  async execSupport(commandData, dispatch) {
    try {
      let args = [];
      const parts = commandData?.custom_id?.split('.');
      for (let i = 1; i <= (parts?.length - 1); i++) { args.push(parts[i]) };
      for await (const file of this.supportCache) {
        if (file?.filename && file?.filename === parts[0] + '.mjs')
          try { await file?.execute(dispatch, ...args); }
          catch (e) { return e; }
      };
      return;
    } catch (e) { return e; };
  };

  /**
   * Executes a command from the command cache that matches the provided command data.
   *
   * @param {Object} commandData - The data of the command to be executed.
   * @param {string} commandData.name - The name of the command to be executed.
   * @param {Function} dispatch - The dispatch function to be used when executing the command.
   * 
   * @returns {Promise<void|Error>} - Returns a promise that resolves to void or an error if one occurs.
   */
  async execCommand(commandData, dispatch) {
    try {
      for (const file of this.commandCache) {
        if (file?.name && file?.name === commandData?.name)
          try { await file?.execute(dispatch); }
          catch (e) { return e; }
      };
      return;
    } catch (e) { return e; };
  };

  /**
   * Emits a client event.
   * 
   * @param {string} trigger - The event trigger.
   * @param {Object} dispatch - The event payload.
   * @param {string} [type='base'] - The type of payload modification to perform.
   * @returns {Promise<boolean>} - A promise that resolves to true if the event was emitted successfully, or false otherwise.
   */
  async handleGatewayEvent(trigger, dispatch, type = 'base') {
    try {
      // modify the payload
      await this.CacheHandler.modifyPayload(dispatch, type);
      // emit the event to the client
      this.emit(trigger.toLowerCase(), dispatch);
      return true;
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
      else console.error(e);
      return false;
    };
  };
}; // eoclass
export default Client;
