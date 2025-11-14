// In your ChatStore.ts, update the initialize method:
async initialize() {
  if (this.isInitialized) return
  
  try {
    const chatEngine = new ChatEngine()
    
    // ✅ ADD TRY-CATCH FOR DATABASE ERRORS
    try {
      this.conversations = await chatEngine.getConversations()
    } catch (error) {
      console.warn('⚠️ No conversations found, starting with empty list')
      this.conversations = []
    }
    
    this.isInitialized = true
    console.log('✅ Chat store initialized with', this.conversations.length, 'conversations')
  } catch (error) {
    console.error('❌ Failed to initialize chat store:', error)
    // Don't throw error, just start with empty state
    this.conversations = []
    this.isInitialized = true
  }
}