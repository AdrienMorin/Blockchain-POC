import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import WalletService from "App/Services/WalletService";

export default class WalletsController {

  public async getWallet({ auth, response }: HttpContextContract){
    await auth.use("api").authenticate();
    const user = auth.use("api").user!;
    response.status(200).json({
      privateKey: user.privateKey,
      publicKey:user.publicKey
    })
  }

  public async getWalletBalance({ auth, response }: HttpContextContract) {
    await auth.use("api").authenticate();
    const user = auth.use("api").user!;

    let walletService = new WalletService();
    let amount = await walletService.getWalletAmount(user.publicKey);

    response.status(200).json({
      "walletAmount": amount
    })
  }

}
