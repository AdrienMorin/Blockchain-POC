import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BlockChainService from "App/Services/BlockChainService";

export default class extends BaseSeeder {
  public async run () {
    const blockChainService = new BlockChainService()
    const blockChainVerification = await blockChainService.verifyBlockChain()
    if (!blockChainVerification.status) throw new Error("BlockChain verification failed: "+blockChainVerification.message);
  }
}
