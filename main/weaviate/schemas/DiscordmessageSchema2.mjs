const discordmessageschema = {
  description: 'A collection to store Discord messages and their attributes.',
  properties: [
    {
      name: 'messageID' /*as const*/,
      description: 'The unique identifier for the message.',
      dataType: 'text' /*as const*/,
      indexFilterable: true,
      indexSearchable: true
    },
    {
      name: 'channelId',
      description: 'The ID of the channel where the message was sent.',
      dataType: 'text' /*as const*/,
      indexFilterable: true,
      indexSearchable: true
    },
    {
      name: 'author',
      description: 'Information about the user who sent the message.',
      dataType: 'object' /*as const*/,
      nestedProperties: [
        {
          name: 'username',
          description: 'The username of the author.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'discriminator',
          description: 'The discriminator of the author.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'id',
          description: 'The unique identifier for the author.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'avatar',
          description: 'The avatar of the author.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'public_flags',
          description: 'Public flags of the author.',
          dataType: 'int' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'global_name',
          description: 'The global name of the author.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'created_at',
          description: 'The creation date of the author.',
          dataType: 'text' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'badges',
          description: 'Badges of the author.',
          dataType: 'text[]' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'avatar_decoration_data',
          description: 'Avatar decoration data of the author.',
          dataType: 'object' /*as const*/,
          nestedProperties: [
            {
              name: 'sku_id',
              description: 'The SKU ID of the avatar decoration.',
              dataType: 'text' /*as const*/,
              indexFilterable: true,
              indexSearchable: true
            },
            {
              name: 'expires_at',
              description: 'The expiration date of the avatar decoration.',
              dataType: 'text' /*as const*/,
              indexFilterable: true
            },
            {
              name: 'asset',
              description: 'The asset of the avatar decoration.',
              dataType: 'text' /*as const*/,
              indexFilterable: true,
              indexSearchable: true
            }
          ]
        }
      ]
    },
    {
      name: 'content',
      description: 'The text content of the message.',
      dataType: 'text' /*as const*/,
      indexFilterable: true,
      indexSearchable: true
    },
    {
      name: 'timestamp',
      description: 'The time when the message was sent.',
      dataType: 'text' /*as const*/,
      indexFilterable: true
    },
    {
      name: 'editedTimestamp',
      description: 'The time when the message was last edited.',
      dataType: 'text' /*as const*/,
      indexFilterable: true
    },
    {
      name: 'tts',
      description: 'A boolean indicating whether the message is a text-to-speech message.',
      dataType: 'boolean' /*as const*/,
      indexFilterable: true
    },
    {
      name: 'mentionEveryone',
      description: 'A boolean indicating whether the message mentions everyone.',
      dataType: 'boolean' /*as const*/,
      indexFilterable: true
    },
    {
      name: 'mentions',
      description: 'An array of user objects that were mentioned in the message.',
      dataType: 'object[]' /*as const*/,
      nestedProperties: [
        {
          name: 'username',
          description: 'The username of the mentioned user.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'discriminator',
          description: 'The discriminator of the mentioned user.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'id',
          description: 'The unique identifier for the mentioned user.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'avatar',
          description: 'The avatar of the mentioned user.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        }
      ]
    },
    {
      name: 'mentionRoles',
      description: 'An array of role IDs that were mentioned in the message.',
      dataType: 'text[]' /*as const*/,
      indexFilterable: true,
      indexSearchable: true
    },
    {
      name: 'attachments',
      description: 'An array of attachment objects (files attached to the message).',
      dataType: 'object[]' /*as const*/,
      nestedProperties: [
        {
          name: 'id',
          description: 'The unique identifier for the attachment.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'filename',
          description: 'The name of the attached file.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'size',
          description: 'The size of the attached file.',
          dataType: 'int' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'url',
          description: 'The URL of the attached file.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        }
      ]
    },
    {
      name: 'embeds',
      description: 'An array of embed objects (rich content embedded in the message).',
      dataType: 'object[]' /*as const*/,
      nestedProperties: [
        {
          name: 'title',
          description: 'The title of the embed.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'description',
          description: 'The description of the embed.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'url',
          description: 'The URL of the embed.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'color',
          description: 'The color of the embed.',
          dataType: 'int' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'fields',
          description: 'An array of field objects in the embed.',
          dataType: 'object[]' /*as const*/,
          nestedProperties: [
            {
              name: 'name',
              description: 'The name of the field.',
              dataType: 'text' /*as const*/,
              indexFilterable: true,
              indexSearchable: true
            },
            {
              name: 'value',
              description: 'The value of the field.',
              dataType: 'text' /*as const*/,
              indexFilterable: true,
              indexSearchable: true
            },
            {
              name: 'inline',
              description: 'Whether the field is inline.',
              dataType: 'boolean' /*as const*/,
              indexFilterable: true
            }
          ]
        }
      ]
    },
    {
      name: 'reactions',
      description: 'An array of reaction objects (emoji reactions to the message).',
      dataType: 'object[]' /*as const*/,
      nestedProperties: [
        {
          name: 'count',
          description: 'The number of times the reaction has been used.',
          dataType: 'int' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'me',
          description: 'Whether the current user has reacted with this emoji.',
          dataType: 'boolean' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'emoji',
          description: 'The emoji object.',
          dataType: 'object' /*as const*/,
          nestedProperties: [
            {
              name: 'id',
              description: 'The unique identifier for the emoji.',
              dataType: 'text' /*as const*/,
              indexFilterable: true,
              indexSearchable: true
            },
            {
              name: 'name',
              description: 'The name of the emoji.',
              dataType: 'text' /*as const*/,
              indexFilterable: true,
              indexSearchable: true
            }
          ]
        }
      ]
    },
    {
      name: 'pinned',
      description: 'A boolean indicating whether the message is pinned.',
      dataType: 'boolean' /*as const*/,
      indexFilterable: true
    },
    {
      name: 'type',
      description: 'An integer representing the type of message.',
      dataType: 'int' /*as const*/,
      indexFilterable: true
    },
    {
      name: 'nonce',
      description: 'A nonce for the message.',
      dataType: 'text' /*as const*/,
      indexFilterable: true,
      indexSearchable: true
    },
    {
      name: 'member',
      description: 'Information about the member who sent the message.',
      dataType: 'object' /*as const*/,
      nestedProperties: [
        {
          name: 'roles',
          description: 'An array of role IDs the member has.',
          dataType: 'text[]' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'premium_since',
          description: 'The date when the member started boosting the server.',
          dataType: 'text' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'pending',
          description: 'Whether the member is pending.',
          dataType: 'boolean' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'nick',
          description: 'The nickname of the member.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'mute',
          description: 'Whether the member is muted.',
          dataType: 'boolean' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'joined_at',
          description: 'The date when the member joined the server.',
          dataType: 'text' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'flags',
          description: 'Flags of the member.',
          dataType: 'int' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'deaf',
          description: 'Whether the member is deafened.',
          dataType: 'boolean' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'communication_disabled_until',
          description: 'The date until the member\'s communication is disabled.',
          dataType: 'text' /*as const*/,
          indexFilterable: true
        },
        {
          name: 'banner',
          description: 'The banner of the member.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'avatar',
          description: 'The avatar of the member.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'displayAvatar',
          description: 'The display avatar of the member.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'displayName',
          description: 'The display name of the member.',
          dataType: 'text' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'permission_names',
          description: 'An array of permission names the member has.',
          dataType: 'text[]' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'role_names',
          description: 'An array of role names the member has.',
          dataType: 'text[]' /*as const*/,
          indexFilterable: true,
          indexSearchable: true
        },
        {
          name: 'hexColor',
          description: 'The hex color of the member.',
          dataType: 'int' /*as const*/,
          indexFilterable: true
        }
      ]
    },
    {
      name: 'flags',
      description: 'Flags of the message.',
      dataType: 'int' /*as const*/,
      indexFilterable: true
    },
    // {
    //   name: 'components',
    //   description: 'An array of component objects (interactive components in the message).',
    //   dataType: 'object[]' /*as const*/,
    //   nestedProperties: [
    //     // Add nested properties for components if needed
    //   ]
    // },
    {
      name: 'channel',
      description: 'The channel where the message is sent.',
      dataType: 'object' /*as const*/,
      nestedProperties: [
        {
          name: 'id',
          description: 'The unique identifier of the channel.',
          dataType: 'text' /*as const*/
        },
        {
          name: 'name',
          description: 'The name of the channel.',
          dataType: 'text' /*as const*/
        },
        {
          name: 'type',
          description: 'The type of the channel (e.g., text, voice).',
          dataType: 'number' /*as const*/
        }
      ]
    }
  ]
};
export default discordmessageschema;