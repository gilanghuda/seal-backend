import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  /**
   * @swagger
   * /api/chat/questions:
   *   post:
   *     tags:
   *       - Chat
   *     summary: Send a question to the chatbot
   *     description: Send a question to the chatbot. Creates new conversation if conversation_id not provided. Automatically calls external Majadigi API and saves response.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - question
   *             properties:
   *               conversation_id:
   *                 type: string
   *                 format: uuid
   *                 description: Optional. If not provided, new conversation will be created. Use this to continue existing conversation.
   *                 example: 550e8400-e29b-41d4-a716-446655440000
   *               question:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 5000
   *                 description: The question to ask the chatbot
   *                 example: Apa itu pajak daerah?
   *     responses:
   *       200:
   *         description: Question sent successfully and bot replied
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Question sent successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     conversation:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         session_id:
   *                           type: string
   *                           format: uuid
   *                         last_message:
   *                           type: string
   *                           nullable: true
   *                         created_at:
   *                           type: string
   *                           format: date-time
   *                         updated_at:
   *                           type: string
   *                           format: date-time
   *                     user_message:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         sender_type:
   *                           type: string
   *                           enum: [user, bot]
   *                         message:
   *                           type: string
   *                         created_at:
   *                           type: string
   *                           format: date-time
   *                     bot_message:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         sender_type:
   *                           type: string
   *                           enum: [user, bot]
   *                         message:
   *                           type: string
   *                         created_at:
   *                           type: string
   *                           format: date-time
   *       400:
   *         description: Validation failed
   *       401:
   *         description: User not authenticated
   *       500:
   *         description: Failed to process question
   */
  Route.post('/questions', 'ChatsController.sendQuestion')

  /**
   * @swagger
   * /api/chat/conversations:
   *   get:
   *     tags:
   *       - Chat
   *     summary: Get list of user conversations (cursor-based pagination)
   *     description: |
   *       Retrieve user's conversations using cursor-based pagination for efficient data fetching.
   *       
   *       **Pagination Logic:**
   *       - First request: omit the `cursor` parameter to get the first page
   *       - Subsequent requests: use `next_cursor` from previous response as `cursor` parameter
   *       - Continue until `has_more` is false
   *       
   *       **Cursor Encoding:** Cursor is base64-encoded ID of the last conversation in previous page
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: cursor
   *         schema:
   *           type: string
   *         description: Base64-encoded cursor for pagination. Omit for first page. Use `next_cursor` from previous response.
   *         example: "NjMwZWMwNzItY2U4YS00MDEyLWFmMzUtOTAxZTcxMWE1MzUx"
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Number of conversations per page (default 10, max 100)
   *         example: 10
   *     responses:
   *       200:
   *         description: User conversations retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Conversations retrieved"
   *                 data:
   *                   type: object
   *                   properties:
   *                     conversations:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "630ec072-ce8a-4012-af35-901e711a5351"
   *                           session_id:
   *                             type: string
   *                             example: "sess_abc123def456"
   *                           last_message:
   *                             type: string
   *                             nullable: true
   *                             example: "Pajak daerah adalah kontribusi wajib kepada negara..."
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00Z"
   *                           updated_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:35:00Z"
   *                     pagination:
   *                       type: object
   *                       description: Pagination metadata for cursor-based pagination
   *                       properties:
   *                         next_cursor:
   *                           type: string
   *                           nullable: true
   *                           description: Base64-encoded cursor for next page. Null if no more pages available.
   *                           example: "NjMwZWMwNzItY2U4YS00MDEyLWFmMzUtOTAxZTcxMWE1MzUy"
   *                         has_more:
   *                           type: boolean
   *                           description: Indicates if there are more pages to fetch
   *                           example: true
   *                         limit:
   *                           type: integer
   *                           description: Number of items per page
   *                           example: 10
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *                     requestId:
   *                       type: string
   *       401:
   *         description: Unauthorized - User not authenticated
   *       500:
   *         description: Internal server error
   */
  Route.get('/conversations', 'ChatsController.getConversations')

  /**
   * @swagger
   * /api/chat/conversations/{conversationId}:
   *   get:
   *     tags:
   *       - Chat
   *     summary: Get conversation details with messages (cursor-based pagination)
   *     description: |
   *       Retrieve conversation and its messages using cursor-based pagination.
   *       Separate cursor controls are available for messages pagination.
   *       
   *       **Pagination Logic:**
   *       - First request: omit `messages_cursor` to get first page of messages
   *       - Subsequent requests: use `next_cursor` from pagination metadata
   *       - Messages are returned in chronological order (oldest first)
   *       - Continue until `has_more` is false
   *       
   *       **Cursor Encoding:** Message cursor is base64-encoded message ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: conversationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the conversation
   *         example: "630ec072-ce8a-4012-af35-901e711a5351"
   *       - in: query
   *         name: messages_cursor
   *         schema:
   *           type: string
   *         description: Base64-encoded cursor for message pagination. Omit for first page. Use `next_cursor` from previous response.
   *         example: "NjMwZWMwNzItY2U4YS00MDEyLWFmMzUtOTAxZTcxMWE1MzUx"
   *       - in: query
   *         name: messages_limit
   *         schema:
   *           type: integer
   *           default: 20
   *           minimum: 1
   *           maximum: 100
   *         description: Number of messages per page (default 20, max 100)
   *         example: 20
   *     responses:
   *       200:
   *         description: Conversation and messages retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Conversation retrieved"
   *                 data:
   *                   type: object
   *                   properties:
   *                     conversation:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                           example: "630ec072-ce8a-4012-af35-901e711a5351"
   *                         session_id:
   *                           type: string
   *                           example: "sess_abc123def456"
   *                         last_message:
   *                           type: string
   *                           nullable: true
   *                           example: "Pajak daerah adalah kontribusi wajib..."
   *                         created_at:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T10:30:00Z"
   *                         updated_at:
   *                           type: string
   *                           format: date-time
   *                           example: "2024-01-15T10:35:00Z"
   *                     messages:
   *                       type: array
   *                       description: Paginated messages in chronological order (oldest first)
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                             example: "630ec072-ce8a-4012-af35-901e711a5351"
   *                           sender_type:
   *                             type: string
   *                             enum: [user, bot]
   *                             example: "user"
   *                           message:
   *                             type: string
   *                             example: "Apa itu pajak daerah?"
   *                           suggest_links:
   *                             type: array
   *                             nullable: true
   *                             items:
   *                               type: object
   *                               properties:
   *                                 title:
   *                                   type: string
   *                                   example: "Peraturan Pajak Daerah"
   *                                 link:
   *                                   type: string
   *                                   format: uri
   *                                   example: "https://example.com/pajak-daerah"
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-15T10:30:00Z"
   *                     pagination:
   *                       type: object
   *                       description: Pagination metadata for message cursor-based pagination
   *                       properties:
   *                         next_cursor:
   *                           type: string
   *                           nullable: true
   *                           description: Base64-encoded cursor for next page of messages. Null if no more pages.
   *                           example: "NjMwZWMwNzItY2U4YS00MDEyLWFmMzUtOTAxZTcxMWE1MzUy"
   *                         has_more:
   *                           type: boolean
   *                           description: Indicates if there are more messages to fetch
   *                           example: true
   *                         limit:
   *                           type: integer
   *                           description: Number of messages per page
   *                           example: 20
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *                     requestId:
   *                       type: string
   *       404:
   *         description: Conversation not found or user unauthorized to access it
   *       401:
   *         description: Unauthorized - User not authenticated
   *       500:
   *         description: Internal server error
   */
  Route.get('/conversations/:conversationId', 'ChatsController.getConversation')

  /**
   * @swagger
   * /api/chat/conversations/{conversationId}:
   *   delete:
   *     tags:
   *       - Chat
   *     summary: Delete a conversation
   *     description: |
   *       Delete a conversation and all its associated messages.
   *       Only the conversation owner (user who created it) can delete it.
   *       This action is irreversible.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: conversationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The ID of the conversation to delete
   *         example: "630ec072-ce8a-4012-af35-901e711a5351"
   *     responses:
   *       200:
   *         description: Conversation deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Conversation deleted successfully"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *                     requestId:
   *                       type: string
   *       404:
   *         description: Conversation not found or user unauthorized
   *       401:
   *         description: Unauthorized - User not authenticated
   *       500:
   *         description: Internal server error
   */
  Route.delete('/conversations/:conversationId', 'ChatsController.deleteConversation')
})
  .prefix('/api/chat')
  .middleware('auth:api')
