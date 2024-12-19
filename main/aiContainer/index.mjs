import GatewayController from '../core/index.mjs';
await (new GatewayController(process.env.discord_bot_token)).start();
