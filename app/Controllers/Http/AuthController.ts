import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginUserValidator from "App/Validators/Auth/LoginUserValidator";

export default class AuthController {

  public async login({auth, request, response}: HttpContextContract){
    const {email, password} = await request.validate(LoginUserValidator)
    try {
      console.log("attempting to login")
      const token = await auth.use('api').attempt(email, password,{
        expiresIn: '12 hours'
      })
      return token
    } catch {
      return response.unauthorized('Wrong email or password')
    }
  }

  public async logout({auth, response}){
    await auth.use('api').revoke()
    return response.status(200).json({message: 'You are disconnected'})
  }

  public async getLoggedUser({ auth, response }: HttpContextContract) {
    await auth.use("api").authenticate();
    const user = auth.use("api").user!;
    user.firstname =
      user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1);
    user.lastname =
      user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1);
    return response.status(200).json(auth.use("api").user!);
  }

}
