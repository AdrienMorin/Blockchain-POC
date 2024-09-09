import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Block from "App/Models/Block";
import User from "App/Models/User";
import Coin from "App/Models/Coin";
import Transaction from "App/Models/Transaction"
import MerkleTreeService from "App/Services/MerkleTreeService"
import ProofOfWorkService from "App/Services/ProofOfWorkService";
import BlockService from "App/Services/BlockService";
import TransactionService from "App/Services/TransactionService";

export default class extends BaseSeeder {

  public async run () {
    const userA: User | null = await User.findBy('email', 'amorin@gmail.com')
    const userB: User | null = await User.findBy('email', 'jdupont@gmail.com')
    const userC: User | null = await User.findBy('email', 'ldeschamps@gmail.com')
    const userD: User | null = await User.findBy('email', 'bdurand@gmail.com')
    const blockService = new BlockService();
    const transactionService = new TransactionService();

    // Transaction 2
    const coin1 = await Coin.findBy('id', 1)
    const coin2 = await Coin.create({
      amount: 10,
      ownerKey: userB!.publicKey
    })
    const coin3 = await Coin.create({
      amount: 5,
      ownerKey: userB!.publicKey
    })
    const coin4 = await Coin.create({
      amount: 35,
      ownerKey: userB!.publicKey
    })
    const transaction2 = await transactionService.createTransaction(
      [userA!],
      [userB!],
      [coin1!],
      [coin2, coin3, coin4])


    // Transaction 3
    const coinOutputT3_1 = await Coin.create({
      amount: 5,
      ownerKey: userC!.publicKey
    })
    const coinOutputT3_2 = await Coin.create({
      amount: 5,
      ownerKey: userC!.publicKey
    })
    const transaction3 = await transactionService.createTransaction(
      [userB!],
      [userC!],
      [coin2!],
      [coinOutputT3_1, coinOutputT3_2]
    )

    // Transaction 4
    const coinOutputT4_1 = await Coin.create({
      amount: 5,
      ownerKey: userA!.publicKey
    })
    const transaction4 = await transactionService.createTransaction(
      [userB!],
      [userA!],
      [coin3!],
      [coinOutputT4_1]
    )

    // Transaction 5
    const coinOutputT5_1 = await Coin.create({
      amount: 10,
      ownerKey: userD!.publicKey
    })
    const coinOutputT5_2 = await Coin.create({
      amount: 25,
      ownerKey: userD!.publicKey
    })

    const transaction5 = await transactionService.createTransaction(
      [userB!],
      [userD!],
      [coin4!],
      [coinOutputT5_1, coinOutputT5_2]
    )

    // Transaction 6 (fee)
    const coinOutputT6_1 = await Coin.create({
      amount: 4,
      ownerKey: userA!.publicKey
    })
    const transaction6 = await transactionService.createTransaction(
      [],
      [userA!],
      [],
      [coinOutputT6_1]
    )

    // Creation of the block

    const block : Block = await Block.create({})

    const blockTransactions: Transaction[] = [
      transaction2,
      transaction3,
      transaction4,
      transaction5,
      transaction6
    ]

    block.related('transactions').saveMany(blockTransactions)

    const merkleTree = new MerkleTreeService(blockTransactions);
    const merkleRoot = merkleTree.getRoot();

    const genesisBlock = await blockService.findBlockById(1);

    // We create the block
    // A previous hash is the hash of the previous block header (not the whole block, cf. part 7 and 8 of the white paper)
    await block.related('header').create({
      nounce: 0,
      rootHash: merkleRoot,
      previousHash: merkleTree.hashString(blockService.getBlockHeaderSummarize(genesisBlock)),
      difficulty: 3
    })

    // Fetch all the uploaded information of or block
    const blockToMine = await blockService.findBlockById(block.id);

    const proofOfWorkService = new ProofOfWorkService(blockToMine!);
    await proofOfWorkService.mine();

  }
}
