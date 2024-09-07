import BlockService from "App/Services/BlockService";
import TransactionService from "App/Services/TransactionService";
import MerkleTreeService from "App/Services/MerkleTreeService";
import ProofOfWorkService from "App/Services/ProofOfWorkService";
import Coin from "App/Models/Coin";
import Database from '@ioc:Adonis/Lucid/Database'


export default class BlockChainService {
  constructor() {
  }

  public async verifyBlockChain(): Promise<{status: boolean, message: string}> {
    const blockService = new BlockService();
    const transactionService = new TransactionService();

    // Fetch all the blocks
    const blocks = await blockService.findAll();

    if (blocks.length === 0) {
      return {
        status: false,
        message: "Blockchain empty."
      };
    }

    // Verify the genesis block :
    // Structure of the block
    if (blocks[0].transactions.length > 1) return {
      status: false,
      message: "More than one transaction in the genesis block."
    };
    // Signature
    if (!await transactionService.verifySignature(blocks[0].transactions[0])) return {
      status: false,
      message: "Genesis block transaction signature verification failed."
    };
    // Root hash
    const merkleTreeService: MerkleTreeService = new MerkleTreeService(blocks[0].transactions);
    const merkleRoot: string = merkleTreeService.getRoot();
    if (merkleRoot !== blocks[0].header.rootHash) return {
      status: false,
      message: "The root hash of the genesis block is not valid."
    };

    // Proof of work
    const proofOfWorkService = new ProofOfWorkService(blocks[0]);
    if (!proofOfWorkService.verifyPoW()) return {
      status: false,
      message: "The genesis block PoW is wrong."
    }

    // Verify all the blocks
    for (let i = 1; i < blocks.length; i++) {
      // Header verification
      // Verify the previous hash
      const merkleTreeService = new MerkleTreeService(blocks[i].transactions);
      const computedPrevHash: string = merkleTreeService.hashString(blockService.getBlockSummarize(blocks[i-1]));
      if (computedPrevHash !== blocks[i].header.previousHash) return {
        status: false,
        message: "The block " + (i+1) + " has a wrong previous hash"
      }
      // Verify the root hash
      if (merkleTreeService.getRoot() !== blocks[i].header.rootHash) return {
        status: false,
        message: "The block " + (i+1) + " has a wrong root hash"
      }
      // Verify PoW
      const proofOfWorkService = new ProofOfWorkService(blocks[0]);
      if (!proofOfWorkService.verifyPoW()) return {
        status: false,
        message: "The block " + (i+1) + " PoW is wrong."
      }

      let feeTransactionFound: boolean = false;
      // Transactions verification
      for (const transaction of blocks[i].transactions) {
        // Signature verifications
        if (!await transactionService.verifySignature(transaction)) return {
          status: false,
          message: "Block " + (i+1) + "got a transaction with wrong signature."
        };
        // Verify the fee transaction (only one per block)
        if (transaction.inputs.length === 0) {
          if (feeTransactionFound) throw new Error("A block can't have multiple fee transactions")
          else {
            feeTransactionFound = true;
          }
        } else {
          // Verify the inputs and outputs amounts
          let inputAmount: number = 0;
          for (const input of transaction.inputs) {
            inputAmount += input.amount;
          }
          let outputAmount: number = 0;
          let outputSentToReceivers: number = 0;
          let outputChange: number = 0;
          for (const output of transaction.outputs) {
            outputAmount += output.amount;
            const isSender = transaction.senders.some((sender) => sender.publicKey === output.ownerKey);
            const isReceiver = transaction.receivers.some((receiver) => receiver.publicKey === output.ownerKey);

            if (isSender) {
              outputChange += output.amount;
            } else if (isReceiver) {
              outputSentToReceivers += output.amount;
            }

            if (!isSender && !isReceiver) {
              throw new Error("Block " + (i + 1) + " got a transaction with outputs not corresponding to senders or receivers : " + JSON.stringify(transaction));
            }
          }
          if (outputAmount - outputSentToReceivers !== outputChange || outputAmount !== inputAmount) return {
            status: false,
            message: "Block " + (i+1) + " transaction " + transaction.id + " with wrong coin amounts : inputAmount = " + inputAmount + ", outputAmount = " + outputAmount + ", outputSentToReceivers = " + outputSentToReceivers + ", outputChange = " + outputChange
          }
        }

      }
    }

    // Coin double spend verification
    const usedCoins = await Coin.query()
      .where('usable', 0)
      .exec()

    const usableCoins = await Coin.query()
      .where('usable', 1)
      .exec()

    for (const coin of usedCoins) {
      const inputOccurence = await Database.query()
        .from('transactions_coins_inputs')
        .where('coin_id', coin.id)
        .count('id')
        .first()
      const countInputs = inputOccurence['count(`id`)']
      if (countInputs !== 1) return {
        status: false,
        message: "The used coin with id " + coin.id + " is the input of " + countInputs + " transactions."
      }
      const outputOccurence = await Database.query()
        .from('transactions_coins_outputs')
        .where('coin_id', coin.id)
        .count('id')
        .first()
      const countOutputs = outputOccurence['count(`id`)']
      if (countOutputs !== 1) return {
        status: false,
        message: "The used coin with id " + coin.id + " is the outputs of " + countOutputs + " transactions."
      }
    }

    for (const coin of usableCoins) {
      const inputOccurence = await Database.query()
        .from('transactions_coins_inputs')
        .where('coin_id', coin.id)
        .count('id')
        .first()
      const countInputs = inputOccurence['count(`id`)']
      if (countInputs !== 0) return {
        status: false,
        message: "The usable coin with id " + coin.id + " is the input of " + countInputs + " transactions."
      }
      const outputOccurence = await Database.query()
        .from('transactions_coins_outputs')
        .where('coin_id', coin.id)
        .count('id')
        .first()
      const countOutputs = outputOccurence['count(`id`)']
      if (countOutputs !== 1) return {
        status: false,
        message: "The usable coin with id " + coin.id + " is the outputs of " + countOutputs + " transactions."
      }
    }

    return {
      status: true,
      message: "Blockchain verified with success."
    };
  }

}
