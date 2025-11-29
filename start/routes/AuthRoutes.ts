import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Register a new user
   *     description: Create a new user account with username, email, and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: johndoe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *                 example: password123
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *       400:
   *         description: Validation failed
   *       500:
   *         description: Registration failed
   */
  Route.post('/register', 'AuthController.register')

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Login user
   *     description: Login with email and password to get authentication token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *       400:
   *         description: Validation failed
   *       401:
   *         description: Invalid email or password
   */
  Route.post('/login', 'AuthController.login')

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Logout user
   *     description: Logout the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *       500:
   *         description: Logout failed
   */
  Route.post('/logout', 'AuthController.logout').middleware('auth:api')

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags:
   *       - Auth
   *     summary: Get current user profile
   *     description: Retrieve the current authenticated user's profile information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *       401:
   *         description: User not authenticated
   */
  Route.get('/me', 'AuthController.me').middleware('auth:api')
}).prefix('/api/auth')
