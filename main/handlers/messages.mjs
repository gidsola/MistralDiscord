import FormData from 'form-data';

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

/**
 * Splits a message into chunks of 2000 characters.
 *
 * @param {string} content - The message content to split.
 * @returns {Array<string>} - An array of message chunks.
 */
function splitMessage(content) {
  const maxLength = 2000;
  const chunks = [];
  let start = 0;

  while (start < content.length) {
    const end = start + maxLength;
    chunks.push(content.slice(start, end));
    start = end;
  }

  return chunks;
};

/**
 * 
 * @param {string} channelId 
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
export async function typingIndicator(channelId, token) {
  try {
    const
      url = `${DISCORD_API_BASE_URL}/channels/${channelId}/typing`,
      headers = {
        "Authorization": `Bot ${token}`,
        "Content-Type": "application/json",
      },
      response = await fetch(url, {
        method: 'POST',
        headers: headers,
      });

    if (!response.ok) throw new Error(`Failed to send typing indicator: ${response.statusText}`);
    return true;
  } catch (e) { return false; }
};

/**
 * Sends a message to a Discord channel.
 *
 * @param {string} channelId - The ID of the channel.
 * @param {object} messageData - The message data to send.
 * @param {string} token - The Discord bot token.
 * @returns {Promise<object>} - A promise that resolves with the response from the Discord API.
 */
export async function sendMessage(channelId, messageData, token) {
  const url = `${DISCORD_API_BASE_URL}/channels/${channelId}/messages`;

  const headers = {
    "Authorization": `Bot ${token}`,
    "Content-Type": "application/json",
  };
  let msgData = null;
  const contentChunks = splitMessage(messageData.content);

  for (const chunk of contentChunks) {
    const chunkedMessageData = { ...messageData, content: chunk };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(chunkedMessageData),
    });

    if (!response.ok) {
      throw new Error("Failed to send message: " + response.statusText);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    msgData = await response.json();
  }

  return msgData && msgData || { status: "Message not sent" };
};

/**
 * Sends a message with files to a Discord channel.
 *
 * @param {string} channelId - The ID of the channel.
 * @param {object} messageData - The message data to send.
 * @param {Array<File>} files - The files to attach.
 * @param {string} token - The Discord bot token.
 * @returns {Promise<object>} - A promise that resolves with the response from the Discord API.
 */
export async function sendMessageWithFiles(channelId, messageData, files, token) {
  const url = `${DISCORD_API_BASE_URL}/channels/${channelId}/messages`;

  const contentChunks = splitMessage(messageData.content);

  for (const chunk of contentChunks) {
    const chunkedMessageData = { ...messageData, content: chunk };

    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(chunkedMessageData));

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file.buffer, file.name);
    });

    const headers = {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Failed to send message with files: ${response.statusText}`);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { status: 'Message with files sent successfully' };
};

/**
 * Edits a message in a Discord channel.
 *
 * @param {string} channelId - The ID of the channel.
 * @param {string} messageId - The ID of the message to edit.
 * @param {object} data - The new message data.
 * @param {string} token - The Discord bot token.
 * @returns {Promise<object>} - A promise that resolves with the response from the Discord API.
 */
export async function editMessage(channelId, messageId, data, token) {
  const url = `${DISCORD_API_BASE_URL}/channels/${channelId}/messages/${messageId}`;

  const headers = {
    'Authorization': `Bot ${token}`,
    'Content-Type': 'application/json',
  };

  const contentChunks = splitMessage(data.content);

  // Edit the initial message with the first chunk
  const firstChunk = contentChunks.shift();
  const body = JSON.stringify({
    content: firstChunk,
  });

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const editedMessage = await response.json();
    // console.log('Message edited successfully:', editedMessage);

    // Send additional chunks as new messages
    for (const chunk of contentChunks) {
      await sendMessage(channelId, { content: chunk }, token);
      // Wait for 1 second to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return editedMessage;
  } catch (e) {
    console.error('Error editing message:', e.message || e);
    throw e.message || e;
  };
};
