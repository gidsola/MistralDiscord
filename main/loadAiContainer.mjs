import Docker from 'dockerode';
const docker = new Docker();
import path from 'path';
import logger from './logger.mjs';
import { writeFile, readdir, mkdir } from 'fs/promises';
import GeneratedContainerConfig from './aiContainer/aiContainerConfig.mjs';
import readline from 'readline';

/************************************************************************/

/**
 * @typedef {Docker.ImageBuildContext} ImageBuildContext
 * @property {string} context
 * @property {string[]} src
 */

/**
 * @typedef {Docker.ImageBuildOptions} ImageBuildOptions
 * @property {string} t
 */

/**
 * @typedef {Docker.ContainerCreateOptions} ContainerCreateOptions
 * @property {string} Image
 * @property {string} name
 * @property {string[]} Env
 * @property {string} WorkingDir
 * @property {string[]} Cmd
 * @property {boolean} AttachStdout
 * @property {boolean} AttachStderr
 * @property {boolean} AttachStdin
 * @property {boolean} OpenStdin
 * @property {boolean} Tty
 * @property {HostConfig} HostConfig
 */

/**
 * @typedef {Docker.HostConfig} HostConfig
 * @property {string[]} Binds
 * @property {boolean} ReadonlyRootfs
 * @property {boolean} Privileged
 * @property {string} NetworkMode
 * @property {boolean} AutoRemove
 */

/**
 * @typedef {Object} EnvObject
 * @property {string} discord_bot_token
 * @property {string} auid
 * @property {string} uuid
 */

/************************************************************************/

const
  Config = (await import('../config.json', { with: { type: "json" } })).default.Config

export default async function initializeAiContaineri() {
  try {
    const imageExists = (await docker.listImages()).some(image => image.RepoTags && image.RepoTags.includes(Config.container.imageName + ':latest'));
    if (!imageExists)
      return await buildContainerSupportImage();

    const container = docker.getContainer(GeneratedContainerConfig.id);
    if (container)
      return await startContainer(container);

  } catch (/**@type {any}*/e) {
    logger.error(e.message || e);
  }
};

/**
 * @param {Docker.Container} container
 */
async function startContainer(container) {
  try {
    await container.start();

    (await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
      since: 0,
      until: 0,
      details: true,
      tail: 0,
      timestamps: false,
      abortSignal: undefined,
    })).on('data', (/** @type {Buffer} */data/*: Buffer*/) => {
      logger.info(data.toString());
    });
    return container;
  } catch (/**@type {any}*/e) {
    e.message.includes('No such container')
      ? await initializeDiscordBotContainer()
      : logger.error(e.message || e);
  }
};

export async function stopAllContainers() {
  try {
    const containers = await docker.listContainers();
    for (const container of containers) {
      const containerObj = docker.getContainer(container.Id);
      await containerObj.stop();
      logger.info(`Stopped Container: ${container.Names[0]}`);
    }
    return;
  } catch (/**@type {any}*/e) { return e.message || e; }
};

/**
 * @param {string} sourceDirectory
 * @param {string} imageName
 * @returns {Promise<NodeJS.ReadableStream | string>}
 */
async function BuildCoreImage(sourceDirectory, imageName) {
  try {
    const
      source = await readdir(sourceDirectory),
      /** @type {ImageBuildContext} */
      imageBuildContext = {
        context: sourceDirectory,
        src: ['Dockerfile', ...source.map(file => file)],
      },
      /** @type {ImageBuildOptions} */
      imageBuildOptions = {
        t: imageName
      };
    return await docker.buildImage(
      { ...imageBuildContext },
      { ...imageBuildOptions }
    );
  } catch (/**@type {any}*/e) { return e.message || e; }
};

/**
 * Creates a container environment.
 * 
 * @returns {Promise<Docker.Container>}
 */
async function initializeDiscordBotContainer() {
  /** @type {ContainerCreateOptions} */
  const containerCreateOptions = {
    Image: Config.container.imageName + ':latest',
    name: 'Mistral_Discord',
    Env: [
      "model=" + Config.mistralaiConfig.completionOptions.model,
      "top_p=" + Config.mistralaiConfig.completionOptions.top_p,
      "max_tokens=" + Config.mistralaiConfig.completionOptions.max_tokens,
      "stream=" + Config.mistralaiConfig.completionOptions.stream,
      "safe_prompt=" + Config.mistralaiConfig.completionOptions.safe_prompt,
      "modelApiKey=" + Config.mistralaiConfig.mistralaiApiKey,
      "discord_bot_token=" + Config.discord.token,
      "localhost=" + Config.main.localhost
    ],
    WorkingDir: '/app',
    Cmd: ['/bin/sh', '-c', 'npm install && node /app/index.mjs'],
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    OpenStdin: true,
    Tty: true,
    HostConfig: {
      Binds: [Config.container.bindsDir + ':/app'],
      ReadonlyRootfs: false,
      Privileged: true,
      NetworkMode: 'host',
      AutoRemove: false
    }
  };
  // create the container
  const container = await docker.createContainer({ ...containerCreateOptions });
  await writeFile(Config.container.bindsDir + '/aiContainerConfig.mjs',
    'const aiConfig = ' + JSON.stringify(container, null, 2) + '\nexport default aiConfig;'
  );

  return await startContainer(container);
};

async function buildContainerSupportImage() {
  const
    imageName = Config.container.imageName + ':latest',
    buildStream = await BuildCoreImage(
      Config.container.buildSource,
      imageName
    );
  if (typeof buildStream === 'string')
    return false;

  buildStream.on('data', (/**@type {Buffer}*/data/*: Buffer*/) => {
    const parsed = JSON.parse(data.toString());

    // check for properties
    if (parsed.stream) logger.info(parsed.stream);
    if (parsed.aux) logger.info("ID:", parsed.aux.ID);
    if (parsed.status && parsed.status === "Pulling from library/node") logger.info("Pulling from library/node (8 Layers)");
    // if(parsed.status && parsed.status === "Pulling fs layer") logger.info(parsed.status);

    if (parsed.status === "Extracting") {
      clearLine();
      process.stdout.write(parsed.progress);
    } else if (parsed.status === "Pull complete") {
      clearLine();
      logger.info("FS Layer Pulled");
    }
  })
    .on('end', async () => {
      logger.info("Image built successfully.");
      await initializeAiContaineri();
    })
    .on('error', (/**@type {any}*/e) => { logger.error(e.message || e); });

  return true;
};

function clearLine() {
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
};
