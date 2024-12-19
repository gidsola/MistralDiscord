
import { TEXTFIELDS } from '../enums/base_enums.mjs';

/**
 * Session class for the gateway.
 */
class Session {
  constructor() {

    /** Indicates if a resume has been requested. 
     * @type {boolean}
    */
    this.resuming = false;

    /** Gateway Url 
     * @type {string}
    */
    this.gateway_url = '';

    /** session type  
     * default: 'normal'
     * @type {string}
    */
    this.session_type = '';

    this.hasInitializedApp = false;

    /**
     * Controls the heartbeat process.
     * 
     * @type {Heartbeat} 
     * @typedef {object} Heartbeat
     * @property {number} interval - Heartbeat interval
     * @property {NodeJS.Timer} timer - Heartbeat timer
     * @property {Object} checkup - Heartbeat checkup 
     * @property {number} checkup.missedAcks - Missed heartbeat acknowledgements
     * @property {number} checkup.maxMissedAcks - Maximum missed heartbeat acks
     * @property {number} checkup.firstMissedAck - Timestamp of first missed heartbeat ack.
     * @property {boolean} acknowledged - Heartbeat acknowledgement status
     */
    this.heartbeat = {
      interval: 0,
      timer: null,
      acknowledged: true,
      checkup: {
        missedAcks: 0,
        maxMissedAcks: 3,
        firstMissedAck: 0
      },

    };

    /** Sequence number 
     * @type {number}
    */
    this.sequence = 0;

    /** Indicates if the gateway connection has errored.
     * @type {boolean}
     */
    this.GATEWAY_CONNECTION_HAS_ERR = false;

    /** Session Intents 
     * @type {number} 
     * */
    this.intents = 0;

    /** Temporary session object
     * 
      * @type {array}
      */
    this.vsessions = [];

    /**
     * @type {IdentProps}
     * @typedef {object} IdentProps
     * @property {string} os - Operating System
     * @property {string} browser - Browser
     * @property {string} device - Device
     * @property {string} browser_user_agent - Browser User Agent
     * @property {string} browser_version - Browser Version
     * @property {string} os_version - Operating System Version
     * @property {string} referrer - Referrer
     * @property {string} referring_domain - Referring Domain
     * @property {string} referrer_current - Referrer Current
     * @property {string} referring_domain_current - Referring Domain Current
     * @property {string} release_channel - Release Channel
     * @property {number} client_build_number - Client Build Number
     * @property {string} client_event_source - Client Event Source
     */
    this.properties = {
      os: "ubuntu",
      browser: "NodeJS",
      device: "desktop",
      browser_user_agent: "Mozilla/5.0 (Linux; Chrome/90.0.4430.212) AppleWebKit/537.36 (KHTML, like Gecko) OnSocket/0.0.1 Chrome/90.0.4430.212 Electron/12.0.7 Safari/537.36",
      browser_version: "1.0.0",
      os_version: "noble",
      referrer: "",
      referring_domain: "",
      referrer_current: "",
      referring_domain_current: "",
      release_channel: "stable",
      client_build_number: 10,
      client_event_source: null
    };

    this.richPresenceActivity = {
      name: "onsocket",
      type: 0,
      application_id: "939211509752561765",
      state: "Powered by OnSocket",
      details: "onsocket.com",
      party: {
        id: "ae488379-351d-4a4f-ad32-2b9b01c91657",
        size: [1, 2]
      },
      assets: {
        large_image: "halloween",
        large_text: "Chilling",
        small_image: "halloween",
        small_text: "epic"
      },
      timestamps: {
        start: Date.now(),
      },
      secrets: {
        join: "MTI4NzM0OjFpMmhuZToxMjMxMjM="
      },
      instance: true,
      flags: 0
    };

    /** 
     * @type {{ name: string, type: number, state: string, url: string }}
     */
    this.activity = {
      name: "custom",
      type: 4,
      state: "Powered by OnSocket",
      url: null
    };

    /**
     * @type {string}
     */
    this.status = "online";

    /**
     * @type {{ activities: [object], status: string, since: number, afk: boolean }}
     */
    this.presence = {
      activities: [this.activity],
      status: this.status,
      since: null,
      afk: false
    };

    /**
     * Pepares the initial session state
     */
    this.state = {
      /**
       * @param {object} payloadData Session object from gateway
       */
      ready: (payloadData) => {

        this.sessionReady = {
          trace: payloadData?._trace,
          /**
           * @type {object}
           */
          application: {
            /** Id of the connected application. 
             * @type {string}
             */
            id: payloadData?.application?.id,
            /** flags of the connected application. 
             * 
             */
            flags: payloadData?.application?.flags
          },
          geo_ordered_rtc_regions: payloadData?.geo_ordered_rtc_regions,//(5) ['montreal', 'newark', 'us-east', 'us-central', 'atlanta']
          guild_join_requests: payloadData?.guild_join_requests,//(0) []
          guilds: payloadData?.guilds,//(2) [{…}, {…}]
          presences: payloadData?.presences,//(0) []
          private_channels: payloadData?.private_channels,//(0) []
          relationships: payloadData?.relationships,//(0) []
          /**
           * @type {string}
           */
          resume_gateway_url: payloadData?.resume_gateway_url,//'wss://gateway-us-east1-b.discord.gg'
          /**
           * @type {string}
           */
          session_id: payloadData?.session_id,//'d84bc6ae65f37044294f1914b96462bf'
          /**
           * @type {string}
           */
          session_type: payloadData?.session_type,//'normal'
          /**
           * @type {[number, number]}
           */
          shard: payloadData?.shard, //(2)[0, 1]
          /**
           * @type {object}
           */
          user: {
            verified: payloadData?.user?.verified,
            username: payloadData?.user?.username,
            mfa_enabled: payloadData?.user?.mfa_enabled,
            id: payloadData?.user?.id,
            flags: payloadData?.user?.flags,
            email: payloadData?.user?.email,
            discriminator: payloadData?.user?.discriminator,
            bot: payloadData?.user?.bot,
            avatar: payloadData?.user?.avatar
          },
          user_settings: payloadData?.user_settings,//{}
          api_version: payloadData?.v//10
        }
        //exports.sessionReturn = this.sessionReturn;
        /** Session Id, used in resume process. */
        this.resume_session_id = this.sessionReady.session_id;
        this.session_type = this.sessionReady.session_type;
        /** Resume Gateway Url */
        this.resume_gateway_url = this.sessionReady.resume_gateway_url + `/?v=${TEXTFIELDS.API}&encoding=${TEXTFIELDS.ENCODING}`;
      },

      /**
       * Prepares a session to be resumed.
       * 
       * @returns {string} Resume Gateway Url
       */
      resume: () => {
        this.resuming = true;
        this.heartbeat.acknowledged = true;
        this.resume_seq = this.sequence;
        return this.resume_gateway_url;
      },//

      stateUpdate: (payloadData) => {
        if (this.voiceGatewayInfo?.endpoint && (this.voiceGatewayInfo?.guild_id == payloadData?.guild_id))
          return true;
        else setTimeout(() => {
          this.state.stateUpdate(payloadData);
        }, 100);
      },

      serverUpdate: (payloadData) => {

        // if (this.voiceGatewayInfo?.guild_id)
        //   setTimeout(() => { this.sessionState?.serverUpdate(payloadData); }, 500)
        // else
        this.voiceGatewayInfo = {
          token: payloadData?.token,
          guild_id: payloadData?.guild_id,
          endpoint: payloadData?.endpoint
        }
      },

    };

  }
};

export default Session;
