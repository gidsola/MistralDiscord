import Session from '../client/DefaultSession.mjs';
import socket from 'ws';

/**
 * Represents a GatewayConnector.
 * @class
 *
 * Requires an active client session
 */
export class GatewayConnector {
  /**
   * @type {socket | undefined}
   */
  gatewaySocket;
  /**
   * @param {Session} session
   */
  constructor(session) {
    this.session = session;
  }
  /**
   * Initializes the gateway connection.
   * @returns {Promise<socket>}
   */
  async retrieveSocket(gatewayUrl = this.session.gateway_url) {
    try {
      if (this.session.resuming) {
        this.gatewaySocket = new socket(gatewayUrl);
        return this.gatewaySocket;
      }

      if (this.gatewaySocket) {
        return this.gatewaySocket;
      }

      if (this.session.hasInitializedApp && gatewayUrl !== '') {
        if (this.session.GATEWAY_CONNECTION_HAS_ERR) {
          this.session.GATEWAY_CONNECTION_HAS_ERR = false;
          await new Promise(resolve => setTimeout(resolve, 3000));
          return await this.retrieveSocket(gatewayUrl);
        }

        this.gatewaySocket = new socket(gatewayUrl);
        return this.gatewaySocket;
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return await this.retrieveSocket(gatewayUrl);
      }
    } catch (e) {
      console.error('Error retrieving socket:', e);
      throw e;
    }
  }
};

export default GatewayConnector;
