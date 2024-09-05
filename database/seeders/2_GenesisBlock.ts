import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Block from "App/Models/Block";
import User from "App/Models/User";
import Coin from "App/Models/Coin";
import ProofOfWorkService from "App/Services/ProofOfWorkService";
import BlockService from "App/Services/BlockService";
import TransactionService from "App/Services/TransactionService";
import MerkleTreeService from "App/Services/MerkleTreeService";

export default class extends BaseSeeder {

  public async run () {
    const userA: User | null = await User.findBy('email', 'amorin@gmail.com')

    const blockService = new BlockService();
    const transactionService = new TransactionService();


    // Genesis block
    const genesisCoin = await Coin.create({
      amount: 50,
      ownerKey: userA!.publicKey
    })
    const genesisTransaction = await transactionService.createTransaction(
      [],
      [userA!],
      [],
     [genesisCoin]
    )

    const genesisBlock : Block = await Block.create({})

    genesisBlock.related('transactions').saveMany([genesisTransaction])

    const merkleTreeService = new MerkleTreeService([genesisTransaction]);

    await genesisBlock.related('header').create({
      nounce: 0,
      rootHash: merkleTreeService.getRoot(),
      difficulty: 3
    })

    const blockToMine = await blockService.findLastBlock()

    const proofOfWorkService = new ProofOfWorkService(blockToMine!);
    await proofOfWorkService.mine();
  }
}
