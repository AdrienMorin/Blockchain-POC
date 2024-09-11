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

  // Create a transaction with the given senders, receivers, inputs and outputs
  public async createTransaction(senders: User[], receivers: User[], inputs: Coin[], outputs: Coin[]){
    const transaction = await Transaction.create({})

    // Take all the inputs and attach them to the transaction
    transaction.related('inputs').attach(inputs.map((coin) => coin.id))
    const walletService = new WalletService();
    // Use the coins in the inputs (remove them from the user's wallet)
    await walletService.useCoins(inputs);

    transaction.related('senders').attach(senders.map((user) => user.publicKey));
    transaction.related('receivers').attach(receivers.map((user) => user.publicKey))
    transaction.related('outputs').attach(outputs.map((coin) => coin.id))

    // For each output, save the coin in the user's wallet
    for (const coin of outputs) {
      const owner = await User.findBy('publicKey', coin.ownerKey)
      owner!.related('coins').save(coin);
    }
    // Sign the transaction
    // If there is no sender, it means it is the genesis transaction, so we sign it with the genesis private key (if it exists, otherwise we create it)
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
      // Sign the transaction with the genesis private key
      await this.signTransaction(genesisPrivateKey, transaction);
    } else {
      // Sign the transaction with the sender's private key
      await this.signTransaction(senders[0].privateKey, transaction);
    }

    return await this.findTransactionById(transaction.id);
  }

  // Fetch the transaction information by its id with filters to get the necessary information
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

  // Find a transaction by its id with all the relations
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

  // Sign a transaction with the given private key
  public async signTransaction(privateKey: string, transaction: Transaction) {
    const transactionInformation = await this.fetchTransactionInformationById(transaction.id);
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(transactionInformation));
    sign.end();
    transaction.signature = sign.sign(privateKey, 'hex');
    await transaction.save();
  }

  // Verify the signature of a transaction
  public async verifySignature(transaction: Transaction): Promise<boolean> {
    const transactionInformation = await this.fetchTransactionInformationById(transaction.id);
    // We initialize the verify object with the SHA256 algorithm
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(transactionInformation));
    verify.end()
    // If there is no sender, it means it is the genesis transaction, so we verify it with the genesis public key
    if (!transaction.senders || transaction.senders.length === 0) {
      const genesisPublicKey = fs.readFileSync(path.resolve(__dirname, '../../public-key.pem'), 'utf8')
      return verify.verify(genesisPublicKey, transaction.signature, 'hex');
    }
    // Otherwise, we verify it with the sender's public key
    else {
      return verify.verify(transaction.senders[0].publicKey, transaction.signature, 'hex');
    }
  }

  // Get the transaction summarize JSON of a transaction
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
