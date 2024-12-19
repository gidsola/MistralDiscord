
import initializeAiContainer, { stopAllContainers } from './loadAiContainer.mjs';
// import { sqlSet } from '../lib/mysql2/connector/Mysql2Connector.mjs';
import { endpoints } from './endpoints/endpoints.mjs';
import logger from './logger.mjs';

import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { createServer as createSecureServer, Agent } from 'https';
import { readFileSync } from 'fs';
import readline from 'readline';
import { URL } from 'url';
import chalk from 'chalk';

let server;
const
  Config = (await import('../config.json', { with: { type: "json" } })).default.Config,
  DOMAIN = Config.main.DOMAIN,
  serverConnectionOptions = {
    rejectUnauthorized: false,
    dev: DOMAIN === 'localhost',
    hostname: DOMAIN,
    port: 443,
  },
  httpsServerOptions = {
    key: serverConnectionOptions.dev
      ? readFileSync(process.cwd() + Config.ssl.local.key)
      : readFileSync(process.cwd() + Config.ssl.key),
    cert: serverConnectionOptions.dev
      ? readFileSync(process.cwd() + Config.ssl.local.cert)
      : readFileSync(process.cwd() + Config.ssl.cert),
    ca: serverConnectionOptions.dev
      ? undefined
      : [readFileSync(process.cwd() + Config.ssl.ca)],
    keepAlive: false,
    requestCert: false,
    rejectUnauthorized: false,
    insecureHTTPParser: false,
    ciphers: "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
    maxVersion: "TLSv1.3",
    minVersion: "TLSv1.2",
    enableTrace: false,
    requestTimeout: 30000,
    sessionTimeout: 120000,
  };

httpsServerOptions.agent = new Agent(httpsServerOptions);
serverConnectionOptions.agent = new Agent(serverConnectionOptions);

// const
//   ipBlockList = (await sqlSet('SELECT * FROM ip_blocklist', [])).map((x/*: any*/) => x.part),
//   urlBlockList = (await sqlSet('SELECT * FROM url_blocklist', [])).map((x/*: any*/) => x.url),
//   RateLimitBucket = new Map(),
//   rateLimitIpBlockList/*: string[]*/ = [];

// async function isBlocked(address/*: string | undefined*/, method/*: string*/, url/*: string | undefined*/) {
//   if (ipBlockList.some((x/*: string*/) => address?.match(x))) return true;
//   if (urlBlockList.some((x/*: string*/) => url?.match(x))) return true;
//   return false;
// };

// function isRateLimited(url/*: string*/, address/*: string*/, method/*: string*/)/*: boolean */ {
//   const
//     allowedRateLimit = 100,
//     releaseTime = 5000,
//     inactivityTime = 10000,
//     key = `${url}:${address}`,
//     now = Date.now();

//   if (rateLimitIpBlockList.includes(address)) {
//     const blockTime = RateLimitBucket.get(address);
//     if (blockTime && now - blockTime < releaseTime) return true;
//     else {
//       rateLimitIpBlockList.splice(rateLimitIpBlockList.indexOf(address), 1);
//       RateLimitBucket.delete(address);
//     }
//   };

//   if (RateLimitBucket.has(key)) {
//     const requestCount = RateLimitBucket.get(key);
//     if (requestCount >= allowedRateLimit) {
//       rateLimitIpBlockList.push(address);
//       RateLimitBucket.set(address, now);
//       logger.info(chalk.redBright.bgBlack('Rate Limited:'), chalk.cyanBright(url, address, method));
//       return true;
//     } else RateLimitBucket.set(key, requestCount + 1);
//   } else RateLimitBucket.set(key, 1);

//   setTimeout(() => {
//     if (RateLimitBucket.has(key)) RateLimitBucket.delete(key);
//   }, inactivityTime);

//   return false;
// };

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
async function processRequest(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    if (endpoints[url.pathname])
      await endpoints[url.pathname](req, res);
    else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('Hello nosey o,O');
    };
  } catch (e) {
    logger.error('UnCaught processRequest Error:', e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end("something bad happened");
  }
};

function startServices() {
  serverConnectionOptions.dev
    // Insecure Server (HTTP)(Development Only)
    ? server = createHttpServer(async (req, res) => {
      try {
        if (!req.method || !req.url) return res.end();
        // if (await isBlocked(req.socket.remoteAddress, req.method, req.url))
        //   return res
        //     .writeHead(403, {
        //       'Content-Length': Buffer.byteLength(`Access Denied`),
        //       'Content-Type': 'text/plain',
        //     })
        //     .end(`Access Denied`);

        // if (isRateLimited(req.url, req.headers['x-forwarded-for'] || req.socket.remoteAddress, req.method))
        //   return res
        //     .writeHead(429, {
        //       'Content-Length': Buffer.byteLength(`Too many requests`),
        //       'Content-Type': 'text/plain',
        //     })
        //     .end(`Too many requests`);

        return await processRequest(req, res);
      } catch (e) {
        if (e instanceof Error) logger.error('UnCaught startServices Error:', e.message);
        else logger.error('UnCaught startServices Error:', e);
        res
          .writeHead(500, {
            'Content-Length': Buffer.byteLength(JSON.stringify(e || e.message)),
            'Content-Type': 'text/plain',
          })
          .end(JSON.stringify(e || e.message));
      }
    })
      .listen(80, async function isListening() {
        logger.info(chalk.yellowBright('Net Services Online on HTTP.'));
      })
      .addListener('error', async function serviceError(err) {
        logger.error('createServer Error:', err);
      })
      .addListener('clientError', async function clientError(err, socket) {
        socket.destroy(err);
      })
      .addListener('stream', async function rcvdStream(stream, headers) {
        logger.info('stream');
      })

    // Secure Server (HTTPS)
    : server = createSecureServer(httpsServerOptions, async (req, res) => {
      try {
        if (!req.method || !req.url) return res.end();
        // if (await isBlocked(req.socket.remoteAddress, req.method, req.url))
        //   return res
        //     .writeHead(403, {
        //       'Content-Length': Buffer.byteLength(`Access Denied`),
        //       'Content-Type': 'text/plain',
        //     })
        //     .end(`Access Denied`);

        // if (isRateLimited(req.url, req.headers['x-forwarded-for'] /*as string*/ || req.socket.remoteAddress, req.method))
        //   return res
        //     .writeHead(429, {
        //       'Content-Length': Buffer.byteLength(`Too many requests`),
        //       'Content-Type': 'text/plain',
        //     })
        //     .end(`Too many requests`);

        return await processRequest(req, res);
      } catch (e) {
        logger.error('UnCaught startServices Error:', e);
        res
          .writeHead(500, {
            'Content-Length': Buffer.byteLength(JSON.stringify(e || e.message)),
            'Content-Type': 'text/plain',
          })
          .end(JSON.stringify(e || e.message));
      }
    })
      .listen(serverConnectionOptions.port, async function isListening() {
        logger.info(chalk.yellowBright('Net Services Online.'));
      })
      .addListener('error', async function serviceError(err) {
        logger.error('createServer Error:', err);
      })
      .addListener('clientError', async function clientError(err, socket) {
        socket.destroy(err);
      })
      .addListener('tlsClientError', async function tlsClientError(err, socket) {
        socket.destroy(err);
      })
      .addListener('stream', async function rcvdStream(stream, headers) {
        logger.info('stream');
      });
};

async function gracefulShutdown() {
  try {
    logger.info(chalk.yellowBright('Stopping Containers...'));
    await stopAllContainers();
    server.close(() => {
      logger.info(chalk.yellowBright('Server Exiting Normally ->>'));
      process.exit(0);
    });
  } catch (e) {
    logger.error('Error closing Next Server:', err);
    server.close(() => {
      logger.info(chalk.yellowBright('Exiting with code: 1 ->>'));
      process.exit(1);
    });
  };
  // other process' retaining the server force closed
  setTimeout(() => {
    logger.info(chalk.yellowBright('Forcing shutdown...'));
    process.exit(1);
  }, 10000); // Force shutdown after 10 seconds
};

process
  .on('SIGINT', async () => { await gracefulShutdown() })
  .on('SIGTERM', async () => { await gracefulShutdown() });

const rli = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// TODO: add more commands
rli.on('line', async (input) => {
  if (input.trim().toLowerCase() === 'shutdown') {
    await gracefulShutdown();
  }
  if (input.trim().toLowerCase() === 'exit') {
    process.exit(0);
  }
});

async function displayBanner() {
  logger.info((chalk.green('    Starting ++>')));
  logger.info(chalk.magenta(`\n\n\n
    ███████                █████████                    █████                █████   
  ███░░░░░███             ███░░░░░███                  ░░███                ░░███    
 ███     ░░███ ████████  ░███    ░░░   ██████   ██████  ░███ █████  ██████  ███████  
░███      ░███░░███░░███ ░░█████████  ███░░███ ███░░███ ░███░░███  ███░░███░░░███░   
░███      ░███ ░███ ░███  ░░░░░░░░███░███ ░███░███ ░░░  ░██████░  ░███████   ░███    
░░███     ███  ░███ ░███  ███    ░███░███ ░███░███  ███ ░███░░███ ░███░░░    ░███ ███
 ░░░███████░   ████ █████░░█████████ ░░██████ ░░██████  ████ █████░░██████   ░░█████ 
   ░░░░░░░    ░░░░ ░░░░░  ░░░░░░░░░   ░░░░░░   ░░░░░░  ░░░░ ░░░░░  ░░░░░░     ░░░░░  \n\n`,
    chalk.blueBright('    Version: ' + '       ' + chalk.yellowBright((await import('node:fs')).readFileSync('.version', 'utf8'))),
    chalk.blueBright('       Process ID: ' + '    ' + chalk.yellowBright(process.pid) + '\n'),
    chalk.blueBright('    Hardware Arch: ', chalk.yellowBright(process.arch)),
    chalk.blueBright('                          Platform: ' + '      ' + chalk.yellowBright(process.platform) + '\n\n\n')));
};

class ServiceMgr {
  constructor() {
    try {
      (async () => {
        await displayBanner();
        logger.info('Starting Services...');
        startServices();
        logger.info('Loading Ai Container...');
        await initializeAiContainer();
      })();
    } catch (e) { e instanceof Error ? logger.error('UnCaught ServiceMgr Error:', e.message) : logger.error('UnCaught ServiceMgr Error:', e); }
  };
};
export default new ServiceMgr();




/*
-- `local`.ip_blocklist definition

CREATE TABLE `ip_blocklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `part` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_blocklist_id_IDX` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- `local`.url_blocklist definition

CREATE TABLE `url_blocklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_blocklist_id_IDX` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

*/