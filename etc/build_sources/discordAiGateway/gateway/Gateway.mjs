import Client from '../client/Client.mjs';
import GatewayConnector from './connection.mjs';
import { RESUMEABLE } from '../enums/base_enums.mjs';

class DiscordGateway {
  /**
   * Creates a new instance of the Gateway class.
   *
   * @param {string} token - The Discord token.
   * @param {Client} client - The Discord client.
   * 
   */
  constructor(token, client) {
    this.token = token;
    this.client = client;
    this.gatewayConnection = new GatewayConnector(this.client.Session);
  }

  /**
   * Initialize the gateway.
   */
  async initialize() {
    try {
      if (this.client.Session.hasInitializedApp && this.client.Session.gateway_url !== '') {
        await this.establishConnection(this.client.Session.gateway_url);
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.establishConnection(this.client.Session.gateway_url);
      };
    } catch (e) {
      if (e instanceof Error) console.error('Error while initializing gateway:', e.message);
      else console.error('Error while initializing gateway:', e);
    };
  };

  /**
   * Establishes a connection to the Discord gateway.
   *
   * @param {string} wss - The gateway URL.
   */
  async establishConnection(wss) {
    try {
      // console.log('Establishing connection to:', wss);
      const gatewaySocket = await this.gatewayConnection.retrieveSocket(wss);
      if (gatewaySocket instanceof Error) {
        console.error('Error while establishing connection:', gatewaySocket.message);
        return;
      };

      // console.log('Gateway connection established');

      const
        token = this.token,
        client = this.client;

      gatewaySocket
        .on('open', async () => {
          //console.log('Gateway connection established');
        })
        .on('message', async (msg) => {
          const
            data = JSON.parse(msg),
            sequence = data.s,
            opcode = data.op,
            trigger = data.t,
            dispatch = data.d;
          // console.log("Data:", data); // disable database logging before uncommenting

          if (sequence != undefined && sequence != null) client.Session.sequence = sequence;

          const opcodeHandlers = {
            0: async () => { client.gatewayEvents[trigger] ? await client.gatewayEvents[trigger](dispatch, trigger) : console.error('UNKNOWN_EVENT: ' + trigger); },
            1: async () => { await sendHeartbeat(); },
            7: async () => { gatewaySocket.close(1012); },
            9: async () => { dispatch ? gatewaySocket.close(4999) : await invalidSession(); },
            10: async () => { client.Session.heartbeat.interval = await heartbeat(dispatch.heartbeat_interval); },
            11: async () => { client.Session.heartbeat.acknowledged = true; }
          };
          opcodeHandlers[opcode] ? await opcodeHandlers[opcode]() : console.error('UNKNOWN_OPCODE' + opcode);

          /**
           * Performs a heartbeat operation.
           * @param {number} interval - The interval in milliseconds between heartbeats.
           * @returns {Promise<number>} - The interval value.
           */
          async function heartbeat(interval) {
            await new Promise(resolve => setTimeout(resolve, jitteredInterval(interval)));
            if (await sendHeartbeat()) {
              try {
                client.Session.resuming
                  ? await resumeSession()
                  : await identifyNewSession();

                client.Session.heartbeat.timer = setInterval(async () => {
                  try {
                    if (!client.Session.heartbeat.acknowledged) await heartCheck();
                    else await sendHeartbeat();
                  }
                  catch (e) { // TEST CODE IS HERE
                    console.error('Heartbeat Error: Shocking patient...', e instanceof Error ? e.message : e);
                    clearInterval(client.Session.heartbeat.timer);
                    client.Session.heartbeat.timer = setInterval(async () => {
                      try {
                        if (!client.Session.heartbeat.acknowledged) await heartCheck();
                        else await sendHeartbeat();
                      }
                      catch (e) { console.error('Heartbeat Error:', e instanceof Error ? e.message : e); };
                    }, interval);
                  };
                }, interval);

              } catch (e) {
                console.error('Error while setting heartbeat timer:', e instanceof Error ? e.message : e);
                return interval;
              };
            };
            return interval;
          };

          /**
           * Performs a heart check to monitor the health of the client's session.
           * If the client misses acknowledgments or exceeds the maximum missed acknowledgments,
           * it closes the gateway socket and takes appropriate actions.
           * @async
           * @function heartCheck
           * @returns {Promise<void>}
           */
          async function heartCheck() {
            if (client.Session.heartbeat.checkup.firstMissedAck == 0) {
              client.Session.heartbeat.checkup.missedAcks++;
              client.Session.heartbeat.checkup.firstMissedAck = Date.now();
              gatewaySocket.close(1002); // Zombie Connection
            }
            else {
              if (Date.now() - client.Session.heartbeat.checkup.firstMissedAck > 240000) {
                client.Session.heartbeat.checkup.firstMissedAck = 0;
                gatewaySocket.close(1002); // Zombie Connection
              }
              if (client.Session.heartbeat.checkup.missedAcks == client.Session.heartbeat.checkup.maxMissedAcks) {
                if (Date.now() - client.Session.heartbeat.checkup.firstMissedAck < 240000) {
                  console.error('Client suffered a Heart Attack. Obtaining new session.');
                  gatewaySocket.close(1011); // Heart Attack - Obtain new session
                }
              };
            };
          };

          /**
           * Generates a jittered interval based on the given interval.
           * 
           * @param {number} interval - The interval to generate the jittered interval from.
           * @returns {number} The jittered interval.
           */
          function jitteredInterval(interval) {
            return interval * Math.random();
          };

          /**
           * Sends a heartbeat to the gateway.
           * @returns {Promise<boolean>} Returns true if the heartbeat was sent successfully, otherwise false.
           */
          async function sendHeartbeat() {
            try {
              client.Session.heartbeat.acknowledged = false;
              gatewaySocket.send(JSON.stringify({ op: 1, d: client.Session.sequence }));
              return true;
            } catch (e) {
              if (e instanceof Error) console.error('Error while sending heartbeat:', e.message);
              else console.error('Error while sending heartbeat:', e);
            };
          };

          /**
           * Identifies a new session.
           * 
           * @async
           * @function identifyNewSession
           * @returns {Promise<void>} A promise that resolves when the new session is identified.
           */
          async function identifyNewSession() {
            await new Promise(resolve => setTimeout(resolve, jitteredInterval(1.2)));
            try {
              gatewaySocket.send(
                JSON.stringify({
                  op: 2,
                  d: {
                    token: token,
                    properties: client.Session.properties,
                    shard: [0, 1], //NYI - Change to dynamic shard count
                    presence: client.Session.presence,
                    intents: client.Session.intents
                  }
                })
              );
            } catch (e) {
              if (e instanceof Error) console.error('Error while Identifying New Session:', e.message);
              else console.error('Error while Identifying New Session:', e);
            };
          };

          /**
           * Resumes a session.
           * @async
           * @function resumeSession
           * @returns {Promise<void>} A promise that resolves when the session is resumed.
           */
          async function resumeSession() {
            try { gatewaySocket.send(JSON.stringify({ op: 6, d: { token: token, session_id: client.Session.resume_session_id, seq: client.Session.resume_seq } })); }
            catch (e) {
              console.error(e instanceof Error ? e.message : e);
            }
          };

          /**
           * Invalidates the session by setting the project as inactive and closing the gateway socket.
           * @async
           * @function invalidSession
           * @returns {Promise<void>} A promise that resolves when the session is invalidated.
           */
          async function invalidSession() {
            try {
              console.error('Invalid Session.');
              gatewaySocket.close(1011);
            } catch (e) {
              console.error(e instanceof Error ? e.message : e);
            }
          };

          /**
           * Checks if there are voice channels available.
           */
          function hasVoiceChannels() {
            const do_voice = false;
            if (do_voice) {
              const voiceChannels = [];
              if (voiceChannels) {
                for (const [guild, channel] of voiceChannels) {
                  connectVC(guild, channel);
                };
              };
            };
          };

          /**
           * Connects to a voice channel.
           * 
           * @param {string} guild - The ID of the guild.
           * @param {string} channel - The ID of the channel.
           * @returns {boolean} - Returns true if the connection was successful, false otherwise.
           */
          function connectVC(guild, channel) {
            try {
              gatewaySocket.send(JSON.stringify({
                op: 4,
                d: {
                  guild_id: guild,
                  channel_id: channel,
                  self_mute: false,
                  self_deaf: false
                }
              }));
              return true;
            } catch (e) {
              if (e instanceof Error) console.error('Error while connecting to voice channel:', e.message);
              else console.error('Error while connecting to voice channel:', e);
              return false;
            }
          }
        })
        .on('close', async code => {
          try {
            clearInterval(client.Session.heartbeat.timer);
            return RESUMEABLE[code]
              ? await this.establishConnection(client.Session.state.resume())
              : await this.establishConnection(client.Session.gateway_url);

          } catch (e) {
            if (e instanceof Error) console.error('Error while closing gateway:', e.message);
            else console.error('Error while closing gateway:', e);
          }
        })
        .on('error', async (e) => {
          const errorMessages = {
            ENOTFOUND: 'Address not found.',
            ECONNREFUSED: 'Connection refused.',
            ETIMEDOUT: 'Connection timed out.',
            ECONNRESET: 'Connection reset.',
            EHOSTUNREACH: 'Host unreachable.',
            ECONNABORTED: 'Connection aborted.',
            EHOSTDOWN: 'Host down.'
          };

          const errorMessage = Object.keys(errorMessages).find(key => e.message.includes(key));
          if (errorMessage) {
            client.Session.GATEWAY_CONNECTION_HAS_ERR = true;
            console.error(`Gateway Error: ${errorMessages[errorMessage]}`);
          }
          else console.error('Gateway Error: ' + e.message);

        });
    } catch (e) {
      if (e instanceof Error) console.error('Error while establishing connection:', e.message);
      else console.error('Error while establishing connection:', e);
    };
  }
};
export default DiscordGateway;
