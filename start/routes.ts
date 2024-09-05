import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

// Protected route group by authentication
Route.group(() => {
  // Auth routes
  Route.post('/auth/logout', 'AuthController.logout')
  Route.get('/user/getUser', 'AuthController.getLoggedUser')

  // Wallet routes
  Route.get('/wallet/getWallet', 'WalletsController.getWallet')
  Route.get('/wallet/getWalletBalance', 'WalletsController.getWalletBalance')

  // Transactions routes
  Route.get('/blockchain', 'TransactionsController.getBlockchain')
  Route.post('/transactions', 'TransactionsController.createTransaction')
  Route.post('/transactions/verify', 'TransactionsController.verifyTransactionSignature')

  // Mining route
  Route.get('/blocks/mine', 'TransactionsController.mineBlock')

  // Blockchain verification route
  Route.get('/verify', 'TransactionsController.verifyBlockChain')

}).prefix("/api").middleware('auth')

// Unprotected routes
Route.group(() => {
  // Index route
  Route.get('/', async ({ auth }: HttpContextContract) => {
    try {
      await auth.use('api').authenticate()
      if (auth.use('api').isLoggedIn) {
        return "You are connected."
      } else {
        return "Please, login to access the application."
      }
    } catch (error) {
      return "Please, login to access the application."
    }
  })

  // Login route
  Route.post("/auth/login", 'AuthController.login')

}).prefix("/api")
