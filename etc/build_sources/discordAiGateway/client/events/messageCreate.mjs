export async function MESSAGE_CREATE(dispatch, trigger, appID) {
  const
    eventMap = {
      1: 'RECIPIENT_ADD',
      2: 'RECIPIENT_REMOVE',
      3: 'CALL',
      4: 'CHANNEL_NAME_CHANGE',
      5: 'CHANNEL_ICON_CHANGE',
      6: 'CHANNEL_PINNED_MESSAGE',
      7: 'USER_JOIN',
      8: 'GUILD_BOOST',
      9: 'GUILD_BOOST',
      10: 'GUILD_BOOST',
      11: 'GUILD_BOOST',
      12: 'CHANNEL_FOLLOW_ADD',
      14: 'GUILD_DISCOVERY_DISQUALIFIED',
      15: 'GUILD_DISCOVERY_REQUALIFIED',
      16: 'GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING',
      17: 'GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING',
      18: 'THREAD_CREATED',
      20: 'CHAT_INPUT_COMMAND',
      21: 'THREAD_STARTER_MESSAGE',
      22: 'GUILD_INVITE_REMINDER',
      23: 'CONTEXT_MENU_COMMAND',
      24: 'AUTO_MODERATION_ACTION',
      25: 'ROLE_SUBSCRIPTION_PURCHASE',
      26: 'INTERACTION_PREMIUM_UPSELL',
      27: 'STAGE_START',
      28: 'STAGE_END',
      29: 'STAGE_SPEAKER',
      31: 'STAGE_TOPIC',
      32: 'GUILD_APPLICATION_PREMIUM_SUBSCRIPTION',
      36: 'GUILD_INCIDENT_ALERT_MODE_ENABLED',
      37: 'GUILD_INCIDENT_ALERT_MODE_DISABLED',
      38: 'GUILD_INCIDENT_REPORT_RAID',
      39: 'GUILD_INCIDENT_REPORT_FALSE_ALARM',
      44: 'PURCHASE_NOTIFICATION',
      46: 'POLL_RESULT',
    },
    eventName = eventMap[dispatch?.type] || trigger;

  if (dispatch?.type === 0 || dispatch?.type === 19 || dispatch?.type === 20) {

    if (dispatch?.mentions?.length && dispatch.mentions.some(m => m.id === appID))
      return { trigger: 'AI_WAS_MENTIONED', dispatch };

    if (dispatch?.author?.bot)
      return { trigger: 'AI_MADE_MESSAGE', dispatch };

    if (dispatch?.author && !dispatch.author.bot && dispatch.guild_id)
      return { trigger: 'AI_SEEN_MESSAGE', dispatch };

    if (dispatch?.author && !dispatch.author.bot && !dispatch.guild_id)
      return { trigger: 'AI_GOT_MESSAGE', dispatch };

  };
  return await emitClientEvent(eventName, dispatch);
};
