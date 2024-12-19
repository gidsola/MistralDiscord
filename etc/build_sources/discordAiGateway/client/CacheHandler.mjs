// import DatabaseHelper from '../mysql2/helper/DatabaseHelper.mjs';
//import aray from '../../lib/utils/aray.js';

import { USER_FLAGS, PERMISSION_NAMES } from '../enums/base_enums.mjs';

class CacheHandler {
  /**
   * CacheHandler constructor.
   * @constructor
   */
  constructor() {
    // console.log("CacheHandler Constructor");
    // this.botStatus = botstatus;
    /**
     * Guild cache.
     * @type {Object.<string, CachedGuildObject_>}
     * @typedef {Object} CachedGuildObject_
     * @property {Array} roles - The roles in the guild.
     * @property {boolean} nsfw - Indicates if the guild is NSFW.
     * @property {number} default_message_notifications - The default message notifications setting of the guild.
     * @property {Object} application_command_counts - The application command counts in the guild.
     * @property {Array} channels - The channels in the guild.
     * @property {string} latest_onboarding_question_id - The ID of the latest onboarding question in the guild.
     * @property {number} explicit_content_filter - The explicit content filter level of the guild.
     * @property {Array} guild_scheduled_events - The scheduled events in the guild.
     * @property {string} public_updates_channel_id - The ID of the public updates channel in the guild.
     * @property {Array} presences - The presences in the guild.
     * @property {string} id - The ID of the guild.
     * @property {string} joined_at - The date and time when the bot joined the guild.
     * @property {boolean} premium_progress_bar_enabled - Indicates if the premium progress bar is enabled.
     * @property {number} max_video_channel_users - The maximum number of users in a video channel.
     * @property {number} max_members - The maximum number of members in the guild.
     * @property {Object} incidents_data - The incidents data in the guild.
     * @property {string} name - The name of the guild.
     * @property {string} icon - The icon of the guild.
     * @property {number} system_channel_flags - The system channel flags of the guild.
     * @property {string} banner - The banner of the guild.
     * @property {Object} inventory_settings - The inventory settings of the guild.
     * @property {Array} embedded_activities - The embedded activities in the guild.
     * @property {boolean} large - Indicates if the guild is large.
     * @property {string} vanity_url_code - The vanity URL code of the guild.
     * @property {boolean} unavailable - Indicates if the guild is unavailable.
     * @property {string} home_header - The home header of the guild.
     * @property {number} member_count - The count of members in the guild.
     * @property {string} owner_id - The ID of the guild owner.
     * @property {string} discovery_splash - The discovery splash image of the guild.
     * @property {Array} threads - The threads in the guild.
     * @property {number} premium_subscription_count - The count of premium subscriptions in the guild.
     * @property {number} max_stage_video_channel_users - The maximum number of users in a stage video channel.
     * @property {string} description - The description of the guild.
     * @property {number} verification_level - The verification level of the guild.
     * @property {string} splash - The splash image of the guild.
     * @property {number} premium_tier - The premium tier of the guild.
     * @property {boolean} lazy - Indicates if the guild is lazy.
     * @property {Array} soundboard_sounds - The soundboard sounds in the guild.
     * @property {Array} voice_states - The voice states in the guild.
     * @property {string} preferred_locale - The preferred locale of the guild.
     * @property {Array} stage_instances - The stage instances in the guild.
     * @property {string} hub_type - The hub type of the guild.
     * @property {string} system_channel_id - The ID of the system channel in the guild.
     * @property {string} rules_channel_id - The ID of the rules channel in the guild.
     * @property {Object} activity_instances - The activity instances in the guild.
     * @property {number} afk_timeout - The AFK timeout of the guild.
     * @property {number} nsfw_level - The NSFW level of the guild.
     * @property {Array} members - The members in the guild.
     * @property {string} afk_channel_id - The ID of the AFK channel in the guild.
     * @property {Array} features - The features of the guild.
     * @property {Array} stickers - The stickers in the guild.
     * @property {string} application_id - The ID of the application in the guild.
     * @property {number} version - The version of the guild.
     * @property {Array} emojis - The emojis in the guild.
     * @property {string} safety_alerts_channel_id - The ID of the safety alerts channel in the guild.
     * @property {string} region - The region of the guild.
     * @property {number} mfa_level - The MFA level of the guild.
     * 
     */
    this.GuildCache = [];

    /**
     * Presence cache.
     * @type {Object.<string, CachedPresenceObject_>}
     * @typedef {Object} CachedPresenceObject_
     * @property {string} OldStatus - The old status of the user.
     * @property {string} CurrentStatus - The current status of the user.
     * @property {string} OldActivity - The old activity of the user.
     * @property {string} CurrentActivity - The current activity of the user.
     * @property {string} OldClientStatus - The old client status of the user.
     * @property {string} CurrentClientStatus - The current client status of the user.
     */
    this.PresenceCache = [];

    this.createGuildPayloadEntry = this.createGuildPayloadEntry.bind(this);
    this.cacheInitialGuildObject = this.cacheInitialGuildObject.bind(this);
    this.processPresence = this.processPresence.bind(this);
    this.modifyPayload = this.modifyPayload.bind(this);
    this.roleUpdate = this.roleUpdate.bind(this);
    this.memberUpdate = this.memberUpdate.bind(this);

    // this.guild_user_obj = (payload) => ({
    //   id: payload?.user?.id,
    //   username: payload?.user?.username,
    //   discriminator: payload?.user?.discriminator,
    //   avatar: payload?.user?.avatar,
    //   avatar_url: payload?.user?.avatar ? generateCDN(payload?.user, 'avatar') : '',
    //   bot: payload?.user?.bot,
    //   system: payload?.user?.system,
    //   mfa_enabled: payload?.user?.mfa_enabled,
    //   locale: payload?.user?.locale,
    //   verified: payload?.user?.verified,
    //   email: payload?.user?.email,
    //   flags: payload?.user?.flags,
    //   premium_type: payload?.user?.premium_type,
    //   public_flags: payload?.user?.public_flags,
    //   created_at: payload?.user?.created_at,
    //   badges: payload?.user?.badges,
    //   displayAvatar: payload?.user?.displayAvatar,
    //   displayName: payload?.user?.displayName,
    //   permission_names: payload?.user?.permission_names,
    //   hexColor: payload?.user?.hexColor
    // });

    // exports.guildCache = this.GuildCache;
    // exports.presenceCache = this.PresenceCache;

    // exports.cacheInitialGuildObject = this.cacheInitialGuildObject;
    // exports.processPresence = this.processPresence;
    // exports.modifyPayload = this.modifyPayload;
    // exports.roleUpdate = this.roleUpdate;
    // exports.memberUpdate = this.memberUpdate;
  } // end constructor

  /**
   * Creates and returns a shortened guild payload object.
   * 
   * @param {Object} payload - The payload object.
   * @returns {GuildPayloadEntry_} - The guild payload object.
   */
  createGuildPayloadEntry(payload) {
    /**
     * Guild payload object.
     * @type {GuildPayloadEntry_}
     * @typedef {Object} GuildPayloadEntry_
     * @property {string} name - The name of the guild.
     * @property {string} id - The ID of the guild.
     * @property {string} icon - The icon of the guild.
     * @property {string} icon_url - The URL of the guild icon.
     * @property {string} banner - The banner of the guild.
     * @property {string} banner_url - The URL of the guild banner.
     * @property {string} splash - The splash image of the guild.
     * @property {string} splash_url - The URL of the guild splash image.
     * @property {string} discovery_splash - The discovery splash image of the guild.
     * @property {string} discovery_splash_url - The URL of the guild discovery splash image.
     * @property {string} description - The description of the guild.
     * @property {Array} emojis - The emojis in the guild.
     * @property {number} emojiCount - The count of emojis in the guild.
     * @property {Array} stickers - The stickers in the guild.
     * @property {number} stickerCount - The count of stickers in the guild.
     * @property {Array} roles - The roles in the guild.
     * @property {number} roleCount - The count of roles in the guild.
     * @property {Array} members - The members in the guild.
     * @property {number} member_count - The count of members in the guild.
     * @property {Array} channels - The channels in the guild.
     * @property {number} channelCount - The count of channels in the guild.
     * @property {Array} presences - The presences in the guild.
     * @property {number} max_video_channel_users - The maximum number of users in a video channel.
     * @property {string} owner_id - The ID of the guild owner.
     * @property {number} mfa_level - The MFA level of the guild.
     * @property {boolean} nsfw - Indicates if the guild is NSFW.
     * @property {number} nsfw_level - The NSFW level of the guild.
     * @property {string} explicit_content_filter - The explicit content filter level of the guild.
     * @property {number} afk_timeout - The AFK timeout of the guild.
     * @property {Object} inventory_settings - The inventory settings of the guild.
     * @property {number} verification_level - The verification level of the guild.
     * @property {number} default_message_notifications - The default message notifications setting of the guild.
     * @property {string} rules_channel_id - The ID of the rules channel in the guild.
     * @property {string} system_channel_id - The ID of the system channel in the guild.
     * @property {number} system_channel_flags - The system channel flags of the guild.
     * @property {string} public_updates_channel_id - The ID of the public updates channel in the guild.
     * @property {string} safety_alerts_channel_id - The ID of the safety alerts channel in the guild.
     * @property {string} preferred_locale - The preferred locale of the guild.
     * @property {number} premium_tier - The premium tier of the guild.
     * @property {number} premium_subscription_count - The count of premium subscriptions in the guild.
     * @property {string} vanity_url_code - The vanity URL code of the guild.
     * @property {string} latest_onboarding_question_id - The ID of the latest onboarding question in the guild.
     * @property {string} joined_at - The date and time when the bot joined the guild.
     * @property {string} preferred_locale - The preferred locale of the guild.
     */
    const _guildPayloadEntry = {
      name: this.GuildCache[payload?.guild_id].name,
      id: payload?.guild_id,
      icon: this.GuildCache[payload?.guild_id].icon,
      icon_url: this.GuildCache[payload?.guild_id].icon ? generateCDN(this.GuildCache[payload?.guild_id], 'icon') : '',
      banner: this.GuildCache[payload?.guild_id].banner,
      banner_url: this.GuildCache[payload?.guild_id].banner ? generateCDN(this.GuildCache[payload?.guild_id], 'banner') : '',
      splash: this.GuildCache[payload?.guild_id].splash,
      splash_url: this.GuildCache[payload?.guild_id].splash ? generateCDN(this.GuildCache[payload?.guild_id], 'splash') : '',
      discovery_splash: this.GuildCache[payload?.guild_id].discovery_splash,
      discovery_splash_url: this.GuildCache[payload?.guild_id].discovery_splash ? generateCDN(this.GuildCache[payload?.guild_id], 'discovery_splash') : '',
      description: this.GuildCache[payload?.guild_id].description,
      emojis: this.GuildCache[payload?.guild_id].emojis,
      emojiCount: this.GuildCache[payload?.guild_id].emojis.length,
      stickers: this.GuildCache[payload?.guild_id].stickers,
      stickerCount: this.GuildCache[payload?.guild_id]?.stickers?.length,
      roles: this.GuildCache[payload?.guild_id].roles,
      roleCount: this.GuildCache[payload?.guild_id]?.roles?.length,
      members: this.GuildCache[payload?.guild_id].members,
      member_count: this.GuildCache[payload?.guild_id].member_count,
      channels: this.GuildCache[payload?.guild_id].channels,
      channelCount: this.GuildCache[payload?.guild_id]?.channels?.length,
      presences: this.GuildCache[payload?.guild_id].presences,
      max_video_channel_users: this.GuildCache[payload?.guild_id].max_video_channel_users,
      owner_id: this.GuildCache[payload?.guild_id].owner_id,
      //region: this.guildCache[payload?.guild_id].region, // deprecated
      mfa_level: this.GuildCache[payload?.guild_id].mfa_level,
      nsfw: this.GuildCache[payload?.guild_id].nsfw,
      nsfw_level: this.GuildCache[payload?.guild_id].nsfw_level,
      explicit_content_filter: this.GuildCache[payload?.guild_id].explicit_content_filter,
      afk_timeout: this.GuildCache[payload?.guild_id].afk_timeout,
      inventory_settings: this.GuildCache[payload?.guild_id].inventory_settings,
      verification_level: this.GuildCache[payload?.guild_id].verification_level,
      default_message_notifications: this.GuildCache[payload?.guild_id].default_message_notifications,
      rules_channel_id: this.GuildCache[payload?.guild_id].rules_channel_id,
      system_channel_id: this.GuildCache[payload?.guild_id].system_channel_id,
      system_channel_flags: this.GuildCache[payload?.guild_id].system_channel_flags,
      public_updates_channel_id: this.GuildCache[payload?.guild_id].public_updates_channel_id,
      safety_alerts_channel_id: this.GuildCache[payload?.guild_id].safety_alerts_channel_id,
      preferred_locale: this.GuildCache[payload?.guild_id].preferred_locale,
      premium_tier: this.GuildCache[payload?.guild_id].premium_tier,
      premium_subscription_count: this.GuildCache[payload?.guild_id].premium_subscription_count,
      vanity_url_code: this.GuildCache[payload?.guild_id].vanity_url_code,
      latest_onboarding_question_id: this.GuildCache[payload?.guild_id].latest_onboarding_question_id,
      joined_at: this.GuildCache[payload?.guild_id].joined_at,
      preferred_locale: this.GuildCache[payload?.guild_id].preferred_locale
    };
    return _guildPayloadEntry;
  };

  /**
   * Caches the initial guild object.
   * 
   * @param {Object} payload - Payload emitted from the `GUILD_CREATE` event.
   */
  cacheInitialGuildObject(payload) {
    if (payload.roles && payload.roles.length)
      payload.roles.forEach(role => {
        this.roleUpdate(role);
      });

    if (payload.members && payload.members.length)
      payload.members.forEach(member => {
        this.memberUpdate(member, payload.roles, payload.id);
      });

    /**
     * Guild cache object.
     * 
     * @type {CachedGuildObject_}
     * @typedef {Object} CachedGuildObject_
     * @property {Array} roles - The roles in the guild.
     * @property {boolean} nsfw - Indicates if the guild is NSFW.
     * @property {number} default_message_notifications - The default message notifications setting of the guild.
     * @property {Object} application_command_counts - The application command counts in the guild.
     * @property {Array} channels - The channels in the guild.
     * @property {string} latest_onboarding_question_id - The ID of the latest onboarding question in the guild.
     * @property {number} explicit_content_filter - The explicit content filter level of the guild.
     * @property {Array} guild_scheduled_events - The scheduled events in the guild.
     * @property {string} public_updates_channel_id - The ID of the public updates channel in the guild.
     * @property {Array} presences - The presences in the guild.
     * @property {string} id - The ID of the guild.
     * @property {string} joined_at - The date and time when the bot joined the guild.
     * @property {boolean} premium_progress_bar_enabled - Indicates if the premium progress bar is enabled.
     * @property {number} max_video_channel_users - The maximum number of users in a video channel.
     * @property {number} max_members - The maximum number of members in the guild.
     * @property {Object} incidents_data - The incidents data in the guild.
     * @property {string} name - The name of the guild.
     * @property {string} icon - The icon of the guild.
     * @property {number} system_channel_flags - The system channel flags of the guild.
     * @property {string} banner - The banner of the guild.
     * @property {Object} inventory_settings - The inventory settings of the guild.
     * @property {Array} embedded_activities - The embedded activities in the guild.
     * @property {boolean} large - Indicates if the guild is large.
     * @property {string} vanity_url_code - The vanity URL code of the guild.
     * @property {boolean} unavailable - Indicates if the guild is unavailable.
     * @property {string} home_header - The home header of the guild.
     * @property {number} member_count - The count of members in the guild.
     * @property {string} owner_id - The ID of the guild owner.
     * @property {string} discovery_splash - The discovery splash image of the guild.
     * @property {Array} threads - The threads in the guild.
     * @property {number} premium_subscription_count - The count of premium subscriptions in the guild.
     * @property {number} max_stage_video_channel_users - The maximum number of users in a stage video channel.
     * @property {string} description - The description of the guild.
     * @property {number} verification_level - The verification level of the guild.
     * @property {string} splash - The splash image of the guild.
     * @property {number} premium_tier - The premium tier of the guild.
     * @property {boolean} lazy - Indicates if the guild is lazy.
     * @property {Array} soundboard_sounds - The soundboard sounds in the guild.
     * @property {Array} voice_states - The voice states in the guild.
     * @property {string} preferred_locale - The preferred locale of the guild.
     * @property {Array} stage_instances - The stage instances in the guild.
     * @property {string} hub_type - The hub type of the guild.
     * @property {string} system_channel_id - The ID of the system channel in the guild.
     * @property {string} rules_channel_id - The ID of the rules channel in the guild.
     * @property {Object} activity_instances - The activity instances in the guild.
     * @property {number} afk_timeout - The AFK timeout of the guild.
     * @property {number} nsfw_level - The NSFW level of the guild.
     * @property {Array} members - The members in the guild.
     * @property {string} afk_channel_id - The ID of the AFK channel in the guild.
     * @property {Array} features - The features of the guild.
     * @property {Array} stickers - The stickers in the guild.
     * @property {string} application_id - The ID of the application in the guild.
     * @property {number} version - The version of the guild.
     * @property {Array} emojis - The emojis in the guild.
     * @property {string} safety_alerts_channel_id - The ID of the safety alerts channel in the guild.
     * @property {string} region - The region of the guild.
     * @property {number} mfa_level - The MFA level of the guild.
     * 
     */
    const _cachedGuildObject = {
      roles: payload.roles,
      nsfw: payload.nsfw,
      default_message_notifications: payload.default_message_notifications,
      application_command_counts: payload.application_command_counts,
      channels: payload.channels,
      latest_onboarding_question_id: payload.latest_onboarding_question_id,
      explicit_content_filter: payload.explicit_content_filter,
      guild_scheduled_events: payload.guild_scheduled_events,
      public_updates_channel_id: payload.public_updates_channel_id,
      presences: payload.presences,
      id: payload.id,
      joined_at: payload.joined_at,
      premium_progress_bar_enabled: payload.premium_progress_bar_enabled,
      max_video_channel_users: payload.max_video_channel_users,
      max_members: payload.max_members,
      incidents_data: payload.incidents_data,
      name: payload.name,
      icon: payload.icon,
      system_channel_flags: payload.system_channel_flags,
      banner: payload.banner,
      inventory_settings: payload.inventory_settings,
      embedded_activities: payload.embedded_activities,
      large: payload.large,
      vanity_url_code: payload.vanity_url_code,
      unavailable: payload.unavailable,
      home_header: payload.home_header,
      member_count: payload.member_count,
      owner_id: payload.owner_id,
      discovery_splash: payload.discovery_splash,
      threads: payload.threads,
      premium_subscription_count: payload.premium_subscription_count,
      max_stage_video_channel_users: payload.max_stage_video_channel_users,
      description: payload.description,
      verification_level: payload.verification_level,
      splash: payload.splash,
      premium_tier: payload.premium_tier,
      lazy: payload.lazy,
      soundboard_sounds: payload.soundboard_sounds,
      voice_states: payload.voice_states,
      preferred_locale: payload.preferred_locale,
      stage_instances: payload.stage_instances,
      hub_type: payload.hub_type,
      system_channel_id: payload.system_channel_id,
      rules_channel_id: payload.rules_channel_id,
      activity_instances: payload.activity_instances,
      afk_timeout: payload.afk_timeout,
      nsfw_level: payload.nsfw_level,
      members: payload.members,
      afk_channel_id: payload.afk_channel_id,
      features: payload.features,
      stickers: payload.stickers,
      application_id: payload.application_id,
      version: payload.version,
      emojis: payload.emojis,
      safety_alerts_channel_id: payload.safety_alerts_channel_id,
      region: payload.region,
      mfa_level: payload.mfa_level
    };
    this.GuildCache[payload.id] = _cachedGuildObject;
  };

  /**
   * Processes the presence payload and updates the presence cache.  
   * If the user's presence already exists in the cache, it updates the status, activity, and client status.  
   * If the user's presence does not exist in the cache, it creates a new presence object and adds it to the cache.
   * 
   * @param {Object} payload - The presence payload.
   * @returns {Object} - The updated payload.
   */
  processPresence(payload) {
    if (this.PresenceCache[payload.user.id]) {
      if (this.PresenceCache[payload.user.id].CurrentStatus !== payload.status) {
        this.PresenceCache[payload.user.id].OldStatus = this.PresenceCache[payload.user.id].CurrentStatus;
        this.PresenceCache[payload.user.id].CurrentStatus = payload.status;
        this.PresenceCache[payload.user.id].OldActivity = this.PresenceCache[payload.user.id].CurrentActivity;
        this.PresenceCache[payload.user.id].CurrentActivity = payload.activities;
        this.PresenceCache[payload.user.id].OldClientStatus = this.PresenceCache[payload.user.id].CurrentClientStatus;
        this.PresenceCache[payload.user.id].CurrentClientStatus = payload.client_status;
      }
      payload.presence = this.PresenceCache[payload.user.id];
      return payload;
    };

    /**
     * Presence object.
     * @type {CachedPresenceObject_}
     * @typedef {Object} CachedPresenceObject_
     * @property {string} OldStatus - The old status of the user.
     * @property {string} CurrentStatus - The current status of the user.
     * @property {string} OldActivity - The old activity of the user.
     * @property {string} CurrentActivity - The current activity of the user.
     * @property {string} OldClientStatus - The old client status of the user.
     * @property {string} CurrentClientStatus - The current client status of the user.
     */
    const _presence = {
      OldStatus: null,
      CurrentStatus: payload.status,
      OldActivity: null,
      CurrentActivity: payload.activities,
      OldClientStatus: null,
      CurrentClientStatus: payload.client_status
    };

    this.PresenceCache[payload.user.id] = _presence;
    payload.presence = this.PresenceCache[payload.user.id];
    return payload;

  };


  /**
   * Modifies the payload based on the given type.
   * @param {Object} payload - The payload to be modified.
   * @param {string} type - The type of modification to be applied.
   * @returns {Promise<Object>} - The modified payload.
   */
  async modifyPayload(payload, type) {
    try {
      // presence update
      if (type === 'user') {

        if (payload?.user) {
          payload.user.badges = getBadges(payload.user.public_flags);
          payload.user.created_at = retrieveDate(payload.user.id, true);

          if (payload.user.avatar)
            payload.user.displayAvatar = avatarFromObject(payload.user.id, payload.user.avatar, payload.guild_id, payload.avatar);
          else
            payload.user.displayAvatar = avatarFromObject(payload.user.id, payload.avatar, payload.guild_id, payload.avatar);

          payload.user.displayName = payload.user.username;
          payload.user.permission_names = [];
          //payload.user.permission_names = getPermissionNames(payload.user.roles, this.GuildCache[payload.guild_id]?.roles);
          //payload.user.hexColor = userColor(payload.user.id);

          if (payload.member) {
            payload.member = this.retrieveMember(payload, payload.user.id, true);
          };
        }
        else {
          payload.user = {
            id: payload.user_id,
            username: payload.username,
            discriminator: payload.discriminator,
            avatar: payload.avatar,
            bot: payload.bot,
            system: payload.system,
            mfa_enabled: payload.mfa_enabled,
            locale: payload.locale,
            verified: payload.verified,
            email: payload.email,
            flags: payload.flags,
            premium_type: payload.premium_type,
            public_flags: payload.public_flags,
            created_at: retrieveDate(payload.user_id, true),
            badges: getBadges(payload.public_flags),
            displayAvatar: avatarFromObject(payload.user_id, payload.avatar, payload.guild_id, payload.avatar),
            displayName: payload.username,
            permission_names: []//payload.user.permission_names = getPermissionNames(payload.user.roles, this.GuildCache[payload.guild_id]?.roles),
            //hexColor: ''
          };
        };

        // extras
        // payload.aray = aray;
        // payload.botstatus = botstatus;
        return payload;
      };

      // dm_create, dm_update, dm_delete, dm_add_user, dm_remove_user
      if (type === 'guildless') {
        if (payload?.author) {
          payload.author.badges = getBadges(payload.author.public_flags);
          payload.author.created_at = retrieveDate(payload.author.id, true);
        }
        if (payload?.timestamp)
          payload.date = retrieveDate(payload.timestamp, false);

        if (payload?.channel_id
          &&
          this.GuildCache[payload?.guild_id]?.channels?.find((x) => x.id === payload.channel_id)
        ) {
          payload.channel = this.GuildCache[payload?.guild_id]?.channels?.find((x) => x.id === payload.channel_id);

          if (payload?.channel?.last_message_id)
            payload.channel.last_message_sent = retrieveDate(payload.channel.last_message_id, true);

          if (payload?.channel?.recipients?.length) {
            payload?.channel?.recipients.forEach((x) => {
              x.badges = getBadges(x.public_flags);
              x.created_at = retrieveDate(x.id, true);
            });
          };
        };
        // extras
        // payload.aray = aray;
        // payload.botstatus = botstatus;
        return payload;
      };

      // guild
      if (type === 'base') {
        if (payload?.channel_id)
          payload.channel = this.GuildCache[payload?.guild_id]?.channels?.find((x) => x.id === payload.channel_id)

        if (payload?.user?.id)
          payload.user = this.GuildCache[payload.guild_id].members.find((x) => x.user.id === payload.user.id).user;

        if (this.GuildCache[payload?.guild_id]?.threads)
          threadChannelProcess(this.GuildCache[payload.guild_id].threads, this.GuildCache[payload.guild_id].channels, payload);

        // extras
        payload = this.extendPayload(payload);
        // payload.aray = aray;
        // payload.botstatus = botstatus;
        return payload;
      };

    } catch (error) {
      console.log('error', error.message, error.stack);
    }
  };

  /**
   * Extends the payload object with additional properties and values.
   * 
   * @param {Object} payload - The payload object to be extended.
   * @returns {Object} - The extended payload object.
   */
  extendPayload(payload) {
    if (!payload) return payload;

    if (!payload.timestamp) {
      payload.timestamp = Date.now();
      payload.date = retrieveDate(payload.timestamp, false);
    }

    const guild_id = payload.guild_id;
    const guild = this.GuildCache[guild_id];
    const guildRoles = guild?.roles;

    if (payload.channel) {
      payload.channel.created_at = retrieveDate(payload.channel.id, true);
      if (payload.channel.last_message_id)
        payload.channel.last_message_sent = retrieveDate(payload.channel.last_message_id, true);
    };

    if (payload.inviter) {
      payload.inviter.badges = getBadges(payload.inviter.public_flags);
      payload.inviter.created_at = retrieveDate(payload.inviter.id, true);
      payload.member = this.retrieveMember(payload, payload.inviter.id, true);
    };

    if (payload.target_user) {
      payload.target_user.created_at = retrieveDate(payload.target_user.id, true);
      payload.target_user.badges = getBadges(payload.target_user.public_flags);
      payload.member = this.retrieveMember(payload, payload.target_user.id, true);
    };

    if (payload.code && payload.created_at) {
      payload.inviteUrl = `https://discord.gg/${payload.code}`;
    };

    if (payload.mentions && payload.mentions.length) {
      for (const mention of payload.mentions) {
        mention.badges = getBadges(mention?.public_flags);
        mention.created_at = retrieveDate(mention?.id, true);
        mention.member = this.retrieveMember(payload, mention?.id, true);
      };
    };

    if (payload.id && payload.username) {
      payload.badges = getBadges(payload.public_flags);
      payload.created_at = retrieveDate(payload.id, true);
    }

    if ((payload.roles && guildRoles && !payload.max_members) || payload.avatar || payload.nick) {
      payload.displayAvatar = avatarFromObject(payload.user?.id ?? payload.user_id ?? payload.member?.user?.id, payload.user?.avatar, guild_id, payload.avatar);
      payload.displayName = payload.nick ?? payload.user?.display_name ?? payload.user?.global_name ?? payload.user?.username; // add nickname to user object
      payload.permission_names = [];
      payload.permission_names = getPermissionNames(payload.roles, guildRoles);
      payload.hexColor = userColor(payload.roles, guildRoles);
    }

    if (payload.user && !payload.presence) {
      payload.user.badges = getBadges(payload.user.public_flags);
      payload.user.created_at = retrieveDate(payload.user.id, true);
      if (!payload.member && !payload.joined_at && payload.displayName && payload.guild) {
        payload.member = this.retrieveMember(payload, payload.user.id, true);
      }
    }

    if (payload.member) {
      const user_id = payload.member.user?.id ?? payload.author?.id ?? payload.user_id ?? payload.inviter?.id ?? payload.target_user?.id;
      if (user_id) {
        payload.member.displayAvatar = avatarFromObject(payload.member.user?.id ?? payload.author?.id ?? payload.user_id ?? payload.inviter?.id, payload.member.user?.avatar ?? payload.author?.avatar, guild_id, payload.member.avatar);
        payload.member.displayName = payload.member.nick ?? payload.nick ?? payload.member.user?.display_name ?? payload.member.user?.global_name ?? payload.member?.user?.username ?? payload.author?.display_name ?? payload.author?.global_name ?? payload.author?.username ?? payload.inviter?.display_name ?? payload.inviter?.global_name ?? payload.inviter?.username;
      };

      if (payload.member.roles && guildRoles) {
        payload.member.permission_names = getPermissionNames(payload.member.roles, guildRoles);
        payload.member.role_names = [];
        guildRoles.forEach((role) => {
          if (payload.member.roles.includes(role.id)) payload.member.role_names.push(role.name);
        });
        payload.member.hexColor = userColor(payload.member.roles, guildRoles);
      };

      if (payload.member.user) {
        payload.member.user.created_at = retrieveDate(payload.member.user.id, true);
        payload.member.user.badges = getBadges(payload.member.user.public_flags);
      };
    };

    if (payload.author) {
      payload.author.created_at = retrieveDate(payload.author.id, true);
      payload.author.badges = getBadges(payload.author.public_flags);
    };

    if (payload.message) {
      // payload.message.trueType = messageType[payload.message.type];
      if (payload.message.author) {
        payload.message.author.badges = getBadges(payload.message.author.public_flags);
        payload.message.author.created_at = retrieveDate(payload.message.author.id, true);
      };

      if (payload.message.interaction?.user) {
        payload.message.interaction.user.badges = getBadges(payload.message.interaction.user.public_flags);
        payload.message.interaction.user.created_at = retrieveDate(payload.message.interaction.user.id, true);
      };

      if (payload.message.interaction?.member?.user) {
        payload.message.interaction.member.user.badges = getBadges(payload.message.interaction.member.user.public_flags);
        payload.message.interaction.member.displayAvatar = avatarFromObject(payload.message.interaction.member.user.id, payload.message.interaction.member.user.avatar, guild_id, payload.message.interaction.avatar ?? payload.message.interaction.member?.avatar);
        payload.message.interaction.member.displayName = payload.message.interaction.member.nick ?? payload.message.interaction.member.user.display_name ?? payload.message.interaction.member.user.global_name ?? payload.message.interaction.member.user.username;
        payload.message.interaction.member.user.created_at = retrieveDate(payload.message.interaction.member.user.id, true);
      };

      if (payload.message.interaction?.member && payload.message.interaction?.member?.roles && guildRoles) {
        payload.message.interaction.member.permission_names = getPermissionNames(payload.message.interaction.member.roles, guildRoles);
        payload.message.interaction.member.role_names = [];
        guildRoles.forEach((role) => {
          if (payload.message.interaction.member.roles.includes(role.id)) payload.message.interaction.member.role_names.push(role.name);
        });
        payload.message.interaction.member.hexColor = userColor(payload.message.interaction.member.roles, guildRoles);
      };
    };

    if (payload.interaction) {
      if (payload.interaction.member) {
        payload.interaction.member.displayAvatar = avatarFromObject(payload.interaction.user?.id, payload.interaction.user?.avatar, guild_id, payload.interaction.member.avatar);
        payload.interaction.member.displayName = payload.interaction.member.nick ?? payload.interaction.user?.display_name ?? payload.interaction.user?.global_name ?? payload.interaction.user?.username;

        if (payload.interaction.member.user) {
          payload.interaction.member.user.badges = getBadges(payload.interaction.member.user.public_flags);
          payload.interaction.member.user.created_at = retrieveDate(payload.interaction.member.user.id, true);
        };

        if (payload.interaction.member.roles && guildRoles) {
          payload.interaction.member.permission_names = getPermissionNames(payload.interaction.member.roles, guildRoles);
          payload.interaction.member.role_names = [];
          guildRoles.forEach((role) => {
            if (payload.interaction.member.roles.includes(role.id)) payload.interaction.member.role_names.push(role.name);
          });
          payload.interaction.member.hexColor = userColor(payload.interaction.member.roles, guildRoles);
        };
      };

      if (payload.interaction.user) {
        payload.interaction.user.created_at = retrieveDate(payload.interaction.user.id, true);
        payload.interaction.user.badges = getBadges(payload.interaction.user.public_flags);
      };
    };

    if (payload.data) {
      if (payload.data?.resolved) {
        for (const [object, values] of Object.entries(payload.data.resolved)) {
          for (const [id, value] of Object.entries(values)) {
            let userObject;

            if (object === 'users') {
              value.badges = getBadges(value.public_flags);
              value.created_at = retrieveDate(id, true);
              userObject = value;
            }
            if (object === 'members') {
              value.displayAvatar = avatarFromObject(id, null, guild_id, value.avatar);
              value.permission_names = getPermissionNames(value.roles, guildRoles);
              value.hexColor = userColor(value.roles, guildRoles);
              if (userObject)
                value.displayName = value.nick ?? userObject.display_name ?? userObject.global_name ?? userObject.username;
            }
            if (object === 'messages') {
              value.member = this.retrieveMember(payload, value.author?.id ?? value.user?.id, true);
              value.author.badges = getBadges(value.author.public_flags);
              value.author.created_at = retrieveDate(value.author.id, true);

              if (value.mentions && value.mentions.length) {
                for (const mention of value.mentions) {
                  mention.badges = getBadges(mention.public_flags);
                  mention.created_at = retrieveDate(mention.id, true);
                  mention.member = this.retrieveMember(payload, mention.id, true);
                }
              };

              if (value.interaction) {
                if (value.interaction.user) {
                  value.interaction.user.created_at = retrieveDate(value.interaction.user.id, true);
                  value.interaction.user.badges = getBadges(value.interaction.user.public_flags);
                };
                if (value.interaction.member) {
                  value.interaction.member.displayName = value.interaction.member.nick ?? value.interaction.user?.display_name ?? value.interaction.user?.global_name ?? value.interaction.user?.username;
                  value.interaction.member.displayAvatar = avatarFromObject(value.interaction.user?.id, value.interaction.user?.avatar, guild_id, value.interaction.member.avatar);
                };
              };
            };
          }
        }
      };
    };
    return payload;
  };

  /**
 * Updates the properties of a role object.
 * 
 * @param {Object} role - The role object to be updated.
 * @returns {Object} - The updated role object.
 */
  roleUpdate(role) {
    role.permission_names = parsePermissions(role.permissions);
    role.hexColor = role.color.toString(16);
    role.created_at = retrieveDate(role.id, true);
    if (role.icon)
      role.icon_url = generateCDN(role, 'icon');
    return role;
  };

  /**
   * Updates the member object with additional propeerties.
   * 
   * @param {Object} member - The member object to be updated.
   * @param {Object} payload - The payload containing the updated member data.
   * @returns {Object} - The updated member object.
   */
  memberUpdate(member, roles, guild_id) {
    member.user.badges = getBadges(member.user.public_flags);
    member.user.created_at = retrieveDate(member.user.id, true);
    member.displayName = member.nick ?? member.user.display_name ?? member.user.global_name ?? member.user.username;
    member.displayAvatar = avatarFromObject(member.user.id, member.user.avatar, guild_id, member.avatar);
    if (member.roles) {
      member.hexColor = userColor(member.roles, roles);
      member.permission_names = [];
      member.permission_names = getPermissionNames(member.roles, roles);
      member.role_names = [];
      roles.forEach((role) => {
        if (member.roles.includes(role.id)) member.role_names.push(role.name);
      });
    }
    else {
      member.hexColor = 0x0;
      member.permission_names = [];
      member.role_names = [];
    }
    return member;
  };


  /**
 * Retrieves a member from the guild cache based on the provided payload and user ID.
 * 
 * @param {Object} payload - The payload object containing guild and user information.
 * @param {string} userID - The ID of the user to retrieve the member for.
 * @param {boolean} memberOnly - Indicates whether to return only the member object, excluding the user object.
 * @returns {Object} - The retrieved member object from the guild cache.
 */
  retrieveMember(payload, userID, memberOnly) {
    try {
      //console.log('retrieveMember payload', payload);
      const
        user_id = userID ? userID : payload.user?.id ?? payload.user_id,
        member = this.GuildCache[payload.guild_id]?.members?.find((x) => x.user?.id === user_id);
      //{ roles, user } = member;

      return member;
      // return memberOnly
      //   ? { roles, user }
      //   : member;



    } catch (e) {
      console.log('error', e.stack, 'Retrieve Member Error: ' + payload);
      return {};
    }
  };

}; // end of class

/**
   * Parses a users public_flags to produce readable badge names
   * 
   * @param {number} public_flags 
   * @returns {string[]}
   */
function getBadges(public_flags) {
  const badges = [], flags = Object.entries(USER_FLAGS);
  if (public_flags) {
    for (let a = 0; a < flags.length; a++) {
      if (public_flags & flags[a][1]) {
        badges.push(flags[a][0]);
      }
    }
  }
  return badges;
};

/**
 * Retrieves the permission names of a user's roles in a guild.
 * 
 * @param {string[]} userRoles - The IDs of the user's roles.
 * @param {Object[]} guildRoles - The array of guild roles.
 * @returns {string[]} - The permission names of the user's roles.
 * @throws {Error} - If an error occurs during the process.
 */
function getPermissionNames(userRoles, guildRoles) {
  const names = [];
  try {
    for (const userRole of userRoles) {
      const guildRole = guildRoles.find((role) => role.id === userRole);
      if (guildRole && guildRole.permission_names) {
        guildRole.permission_names.forEach((permission) => {
          if (!names.includes(permission)) {
            names.push(permission);
          }
        });
      }
    }
    return names;
  } catch (e) {
    console.log('error', e.stack, 'Permission Names Error: ' + userRoles);
  }
};


/**
 * Processes the thread channel data and updates the payload.
 * 
 * @param {Array} threads - The array of thread channels.
 * @param {Array} channels - The array of all channels.
 * @param {Object} payload - The payload object to be updated.
 * @returns {Object} - The updated payload object.
 */
function threadChannelProcess(threads, channels, payload) {
  try {
    threads.forEach((thread) => {
      if (thread.id == payload.channel_id) {
        payload.channel = thread;
        channels.forEach((chan) => {
          if (chan.id == thread.parent_id)
            payload.channel.parent_name = chan.name;
        });
        payload.channel.isForumChannel = true;
      }
    });
    return payload;
  } catch (e) {
    console.log('error', e.stack, 'Thread Channel Process Error: ' + payload);
  }
};





function avatarFromObject(userID, avatarID, guildID, memberAvatarID) {
  const base = 'https://cdn.discordapp.com';

  if (!avatarID && !memberAvatarID) {
    return `${base}/embed/avatars/${Number((BigInt(userID) >> 22n) % 6n)}.png`;
  }

  const avatar = memberAvatarID ?? avatarID;
  const ext = avatar?.startsWith('a_') ? 'gif' : 'png';

  return memberAvatarID
    ? `${base}/guilds/${guildID}/users/${userID}/avatars/${avatar}.${ext}`
    : `${base}/avatars/${userID}/${avatar}.${ext}`;

};


function retrieveDate(value, snowflake, style) {
  if (!value) return `Invalid or missing argument: ${value ?? 'undefined'}`;
  const DISCORD_EPOCH = 1420070400000;

  const date = /^\d+$/.test(String(value)) && snowflake
    // @ts-ignore
    ? new Date(parseInt(value) / 4194304 + DISCORD_EPOCH)
    : new Date(value);

  // console.log('DATE IN RETRIEVEdATE:', date);
  const year = date.getFullYear();
  let month = (date.getMonth()).toString();
  month = month.length === 1 ? `0${month}` : month;
  let day = (date.getDay()).toString();
  day = day.length === 1 ? `0${day}` : day;
  const time = (date.toTimeString()).split(' ')[0];

  if (!style) return `${year}.${month}.${day} ${time}`;
  const timestamp = Math.floor(new Date(date).getTime() / 1000);
  return /^r(elative)?\s*$/gmi.test(style)
    ? `<t:${timestamp}:R>`
    : /^d(ate)?\s*$/gmi.test(style)
      ? `<t:${timestamp}:f>`
      : /^f(ull)?\s*$/gmi.test(style)
        ? `<t:${timestamp}:f> (<t:${timestamp}:R>)`
        : `Invalid argument: ${style}`;

};


function userColor(userRoles, guildRoles) {
  return guildRoles
    .sort((a, b) => b.position - a.position)
    .filter((x) => {
      return userRoles.includes(x.id);
    })?.[0]?.color;
};


function generateCDN(object, media, size = '1024', x = '') {
  media === 'icon' ? x = 'icons' : '';
  media === 'splash' ? x = 'splashes' : '';
  media === 'banner' ? x = 'banners' : '';
  media === 'discovery_splash' ? x = 'discovery-splashes' : '';
  let url;
  if (object[media] && object['id']) {
    if (object['hoist'] && x === 'icons') x = 'role-icons';
    let ext;
    object[media].startsWith('a_') ? ext = 'gif' : ext = 'png';
    url = `https://cdn.discordapp.com/${x}/${object['id']}/${object[media]}.${ext}?size=${size}`;

  }
  return url ?? undefined;
};


function parsePermissions(permissions) {
  const flags = Object.entries(PERMISSION_NAMES);
  if (!permissions) return [];
  const permission_names = [];
  if (permissions > 0) {
    for (let p = 0; p < flags.length; p++) {
      if (permissions & flags[p][1])
        if (!permission_names.includes(flags[p][0]))
          permission_names.push(flags[p][0]);
    }
  }
  return permission_names;
};
export default CacheHandler;
