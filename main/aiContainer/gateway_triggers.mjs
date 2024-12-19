export const events = [
  {
    trigger: 'ai_seen_message',

    async trigger_actions(params) {
      if (params.content.startsWith('--')) return;
      try {
        const
          response = await fetch(process.env.localhost + '/v1/ai_entry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              collection: "MistralDiscord",
              modelProvider: "mistral",
              modelApiKey: process.env.modelApiKey,
              completionOptions: { 
                model: process.env.model,
                top_p: parseFloat(process.env.top_p),
                max_tokens: parseInt(process.env.max_tokens),
                stream: process.env.stream === 'true' ? true : false,
                safe_prompt: process.env.safe_prompt === 'true' ? true : false
               },
              params,
              bot_token: process.env.discord_bot_token
            })
          });

        if (!response.ok)
          throw new Error("HTTP Status: " + response.status + ", Message: " + response.statusText);

        return;
      }
      catch (e) { console.error(e); };
    },
  }
];
