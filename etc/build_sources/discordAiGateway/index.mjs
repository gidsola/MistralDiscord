import Client from './client/Client.mjs';
import DiscordGateway from "./gateway/Gateway.mjs";
import Session from './client/DefaultSession.mjs';
import CacheHandler from './client/CacheHandler.mjs';

class GatewayController {
  /**
   * @param {string} token
   */
  constructor(token) {
    /**
     * @type {string}
     */
    this.token = token;
    /**
     * @type {Session}
     */
    this.Session = new Session();
    /**
     * @type {CacheHandler}
     */
    this.CacheHandler = new CacheHandler();
    /**
     * @type {Client}
     */
    this.Client = new Client(this.token, this.Session, this.CacheHandler);
    /**
     * @type {DiscordGateway}
     */
    this.Gateway = new DiscordGateway(this.token, this.Client);
  };

  /**
   * Begins the innitialization of the gateway
   */
  async start() { await this.Gateway.initialize(); };

};
export default GatewayController;
