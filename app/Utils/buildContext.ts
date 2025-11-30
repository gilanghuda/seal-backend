const MAX_CONTEXT_LENGTH = 2000
const MAX_RECENT_MESSAGES = 3

export function buildAdditionalContext(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return ''
  }

  const recentMessages = messages.slice(-MAX_RECENT_MESSAGES)

  const contextMessages = recentMessages
    .map((msg) => {
      const role = msg.senderType === 'user' ? 'User' : 'Bot'
      const cleanMessage = msg.message.replace(/\s+/g, ' ').trim()
      return `${role}: ${cleanMessage}`
    })
    .join('\n\n')

  if (contextMessages.length > MAX_CONTEXT_LENGTH) {
    return contextMessages.substring(0, MAX_CONTEXT_LENGTH) + '...'
  }

  return contextMessages
}
