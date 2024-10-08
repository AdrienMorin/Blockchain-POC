
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import Block from "App/Models/Block";
import WalletService from "App/Services/WalletService";
import User from "App/Models/User";
import Coin from "App/Models/Coin";
import Transaction from "App/Models/Transaction";
import MerkleTreeService from "App/Services/MerkleTreeService";
import ProofOfWorkService from "App/Services/ProofOfWorkService";
import BlockService from "App/Services/BlockService";
import BlockChainService from "App/Services/BlockChainService";
import TransactionService from "App/Services/TransactionService";

export default class TransactionsController {

  // Get all the blocks of the blockchain
  public async getBlockchain({ auth, response }: HttpContextContract){
    await auth.use("api").authenticate();
    const blockService = new BlockService();

    const blocks = await blockService.findAllWithFilter();

    if(blocks){
      response.status(200).json(
        blocks
      )
    } else {
      response.status(400).json("No genesis block found")
    }
  }

  // Create a transaction between two users
  public async createTransaction({ auth, request, response }: HttpContextContract){
    await auth.use("api").authenticate();
    const user = auth.use("api").user!;
    let walletService = new WalletService();
    let receiverKey: string;
    let amount: number;
    try {
      receiverKey = request.body().receiverKey;
      amount = request.body().amount;

      // Check if the receiver exists (in real case of Bitcoin, there is no need to do that, but for the sake of the example, we do it)
      const receiver = await User.findBy('public_key', receiverKey)
      if (receiver == null) {
        return response.status(404).json("The receiver key seems to be wrong…")
      }

      try {
        // Find the inputs so that sum(inputs) >= needed amount
        const inputs = await walletService.selectInputs(user.publicKey, amount)

        // Compute the outputs
        const outputs: Coin[] = [];
        const outputCoin: Coin = await Coin.create({
          amount: amount,
          ownerKey: receiverKey
        });
        outputs.push(outputCoin)
        // If there are some change needed, we create a new coin for the user
        if (inputs.amount >= amount){
          const changeCoin: Coin = await Coin.create({
            amount: inputs.amount - amount,
            ownerKey: user.publicKey
          });
          outputs.push(changeCoin);
        }
        // Create the transaction
        try {
          const transactionService = new TransactionService();
          await transactionService.createTransaction(
            [user!],
            [receiver!],
            inputs.coins,
            outputs
          )
        } catch (e) {
          console.log("Error while creating the transaction…", e);
          return response.status(400).json("Error while creating the transaction…");
        }

      } catch (e) {
        return response.status(400).json("Insufficient wallet amount")
      }

    } catch (e){
      return response.status(400).json("The request body is wrong")
    }

  }

  // Verify a transaction signature
  public async verifyTransactionSignature({ auth, request, response }: HttpContextContract){
    await auth.use("api").authenticate();
    let transactionId: number;
    let transaction: Transaction | null;
    try {
      transactionId = request.body().transactionId;
    } catch (e) {
      return response.status(400).json("Wrong input. Must specify : transactionOwnerPublicKey & transactionId")
    }
    try {
      transaction = await Transaction.findBy('id', transactionId);
    } catch (e) {
      return response.status(500).json("Error while fetching transaction")
    }
    if (!transaction) return response.status(404).json("Transaction not found")
    else {
      const transactionService = new TransactionService();
      const signatureIsValid = await transactionService.verifySignature(transaction);
      if (signatureIsValid) return response.status(200).json("Transaction signature is valid.")
      else return response.status(204).json("Transaction signature isn't valid.")
    }
  }

  // Mine a new block (put all the transactions without block into this new block and mine it)
  public async mineBlock({ auth, response }: HttpContextContract){
    await auth.use("api").authenticate();
    const user = auth.use("api").user!;
    const blockService = new BlockService();

    // Get all the new transactions without block
    const transactions = await Transaction.query()
      .whereNull('block_id')
      .preload('receivers')
      .preload('outputs')
      .preload('senders')
      .preload('inputs')

    // Check if we really have transactions to put in a new block
    if (transactions.length === 0) {
      return response.status(200).json("There is no need to mine blocks because no new transaction was found.")
    }

    // Fee transaction creation: in out case we put a fee of 4 coins generated by the system. It's not the sender who pays the fee.
    const coinOutputFee = await Coin.create({
      amount: 4,
      ownerKey: user.publicKey
    })
    const transactionService = new TransactionService();
    const feeTransaction = await transactionService.createTransaction(
      [],
      [user!],
      [],
      [coinOutputFee]
    );

    transactions.push(feeTransaction)

    // Get the last block
    const lastBlock = await blockService.findLastBlock();
    console.log("last block id: " + lastBlock!.id)

    // Creation of a new block
    const block : Block = await Block.create({});
    await block.related('transactions').saveMany(transactions);

    // Putting the block_id into the transactions
    for(const transaction of transactions) {
      transaction.blockId = block.id;
      await transaction.save();
    }

    // We create the Merkle tree of our block
    const merkleTreeService = new MerkleTreeService(transactions);
    const merkleRoot = merkleTreeService.getRoot();

    // We create the block
    // A previous hash is the hash of the previous block header (not the whole block, cf. part 7 and 8 of the white paper)
    await block.related('header').create({
      nounce: 0,
      rootHash: merkleRoot,
      previousHash: merkleTreeService.hashString(blockService.getBlockHeaderSummarize(lastBlock)),
      difficulty: 4
    })

    const blockToMine = await blockService.findBlockById(block.id)

    // We mine the block using the ProofOfWorkService
    const proofOfWorkService = new ProofOfWorkService(blockToMine!);
    const nonce: number = await proofOfWorkService.mine();

    return response.status(200).json({
      "message": "New block mined successfully.",
      "nounce": nonce
    })
  }

  // Verify the blockchain integrity
  public async verifyBlockChain({ auth }: HttpContextContract){
    await auth.use("api").authenticate();
    const blockChainService = new BlockChainService();
    return blockChainService.verifyBlockChain();
  }

}
