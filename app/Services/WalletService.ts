import User from "App/Models/User";
import Coin from "App/Models/Coin";

export default class WalletService {

  constructor() {
  }

  public async getWalletAmount(publicKey: string): Promise<number> {
    const fetchedUser = await User.query()
      .preload('coins')
      .where({publicKey: publicKey})
      .first()

    let amount = 0;
    fetchedUser!.coins.map((coin) => {
      if (coin.usable) amount += coin.amount
    })

    return amount;
  }

  public async selectInputs(ownerKey: string, targetAmount: number): Promise<{amount: number, coins:Coin[]}> {
    // Get all the user's coins
    const coins = await Coin.query()
      .where('ownerKey', ownerKey)
      .where('usable', true)
      .orderBy('amount', 'asc')
      .exec()

    // Initialize the coins variables
    let currentAmount = 0
    const selectedCoins: Coin[] = []

    // Select all the smallest coins to make the needed amount (or more)
    for (const coin of coins) {
      selectedCoins.push(coin)
      currentAmount += coin.amount

      if (currentAmount >= targetAmount) {
        break
      }
    }

    // Vérifier si la somme des montants sélectionnés est suffisante
    if (currentAmount < targetAmount) {
      throw new Error('Insufficient coins to reach the target amount')
    }

    return {
      amount: currentAmount,
      coins: selectedCoins
    }
  }

  public async useCoins(coins: Coin[]) {
    for (const coin of coins) {
      coin.usable = false;
      await coin.save()
    }
  }
}
