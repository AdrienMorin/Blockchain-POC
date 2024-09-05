import User from "App/Models/User";
import Coin from "App/Models/Coin";
import crypto from 'crypto'
import Transaction from "App/Models/Transaction";
import fs from 'fs'
import path from 'path'
import WalletService from "App/Services/WalletService";

export default class TransactionService {

  constructor() {
  }

  public async createTransaction(senders: User[], receivers: User[], inputs: Coin[], outputs: Coin[]){
    const transaction = await Transaction.create({})

    // Find inputs and use them
    transaction.related('inputs').attach(inputs.map((coin) => coin.id))
    const walletService = new WalletService();
    await walletService.useCoins(inputs);

    transaction.related('senders').attach(senders.map((user) => user.publicKey));
    transaction.related('receivers').attach(receivers.map((user) => user.publicKey))
    transaction.related('outputs').attach(outputs.map((coin) => coin.id))

    for (const coin of outputs) {
      const owner = await User.findBy('publicKey', coin.ownerKey)
      owner!.related('coins').save(coin);
    }
    if (senders.length === 0) {
      let genesisPrivateKey: string;
      try {
        genesisPrivateKey = fs.readFileSync(path.resolve(__dirname, '../../private-key.pem'), 'utf8');
      } catch (e) {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
          }
        })
        fs.writeFileSync(path.resolve(__dirname, '../../private-key.pem'), privateKey)
        fs.writeFileSync(path.resolve(__dirname, '../../public-key.pem'), publicKey)
        genesisPrivateKey = privateKey;
      }
      await this.signTransaction(genesisPrivateKey, transaction);
    } else {
      await this.signTransaction(senders[0].privateKey, transaction);
    }

    return await this.findTransactionById(transaction.id);
  }

  private async fetchTransactionInformationById(id: number){
    const transaction = await this.findTransactionById(id);
    return {
      id: transaction.id,
      senders: transaction.senders.map((user) => user.publicKey),
      receivers: transaction.receivers.map((user) => user.publicKey),
      inputs: transaction.inputs.map((coin) => JSON.stringify({
        id: coin.id,
        amount: coin.amount,
        owner: coin.ownerKey,
        createdAt: coin.createdAt
      })),
      outputs: transaction.outputs.map((coin) => JSON.stringify({
        id: coin.id,
        amount: coin.amount,
        owner: coin.ownerKey,
        createdAt: coin.createdAt
      }))
    }
  }

  public async findTransactionById(id: number) {
    const transaction = await Transaction.query()
      .where('id', id)
      .preload('receivers')
      .preload('outputs')
      .preload('senders')
      .preload('inputs')
      .first()
    return transaction!
  }

  public async signTransaction(privateKey: string, transaction: Transaction) {
    const transactionInformation = await this.fetchTransactionInformationById(transaction.id);
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(transactionInformation));
    sign.end();
    transaction.signature = sign.sign(privateKey, 'hex');
    await transaction.save();
  }

  public async verifySignature(transaction: Transaction): Promise<boolean> {
    const transactionInformation = await this.fetchTransactionInformationById(transaction.id);
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(transactionInformation));
    verify.end()
    if (!transaction.senders || transaction.senders.length === 0) {
      const genesisPublicKey = fs.readFileSync(path.resolve(__dirname, '../../public-key.pem'), 'utf8')
      return verify.verify(genesisPublicKey, transaction.signature, 'hex');
    } else {
      return verify.verify(transaction.senders[0].publicKey, transaction.signature, 'hex');
    }
  }

  public getTransactionSummarize(transaction: Transaction): string {
    return JSON.stringify({
      id: transaction.id,
      senders: transaction.senders ? transaction.senders.map((user) => user.publicKey) : [],
      receivers: transaction.receivers ? transaction.receivers.map((user) => user.publicKey) : [],
      inputs: transaction.inputs ? transaction.inputs.map((coin) => JSON.stringify({
        id: coin.id,
        amount: coin.amount,
        owner: coin.ownerKey,
        createdAt: coin.createdAt
      })) : [],
      outputs: transaction.outputs ? transaction.outputs.map((coin) => JSON.stringify({
        id: coin.id,
        amount: coin.amount,
        owner: coin.ownerKey,
        createdAt: coin.createdAt
      })) : []
    });
  }


}
