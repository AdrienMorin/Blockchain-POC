import * as crypto from 'crypto';
import Block from "App/Models/Block";
import BlockService from "App/Services/BlockService";

export default class ProofOfWorkService {
  private block: Block;

  constructor(block: Block) {
    this.block = block;
  }

  public async mine(): Promise<number> {
    let nonce = 0;
    const target = '0'.repeat(this.block.header.difficulty);
    const blockService = new BlockService();

    while (true) {
      this.block.header.nounce = nonce;

      const hash = crypto.createHash('sha256').update(blockService.getBlockSummarize(this.block)).digest('hex');

      if (hash.startsWith(target)) {
        console.log(`Found nonce: ${nonce}`);
        console.log(`Hash: ${hash}`);
        await this.block.related('header').save(this.block.header)
        return nonce;
      }
      nonce++;
    }
  }

  public verifyPoW(): boolean {
    const blockService = new BlockService();
    const target = '0'.repeat(this.block.header.difficulty);
    const hash = crypto.createHash('sha256').update(blockService.getBlockSummarize(this.block)).digest('hex');
    console.log("hash: ", hash)
    return hash.startsWith(target);
  }
}
