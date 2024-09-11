import * as crypto from 'crypto';
import Block from "App/Models/Block";
import BlockService from "App/Services/BlockService";

export default class ProofOfWorkService {
  private block: Block;

  constructor(block: Block) {
    this.block = block;
  }

  // Method to mine a block
  public async mine(): Promise<number> {
    let nonce = 0;
    // The target is a string of 0s with a length equal to the difficulty
    const target = '0'.repeat(this.block.header.difficulty);
    const blockService = new BlockService();

    while (true) {
      this.block.header.nounce = nonce;

      // A block hash is the hash of the block header (not the whole block, cf. part 7 and 8 of the white paper)
      const hash = crypto.createHash('sha256').update(blockService.getBlockHeaderSummarize(this.block)).digest('hex');

      // We check if the hash starts with the target
      if (hash.startsWith(target)) {
        console.log(`Found nonce: ${nonce}`);
        console.log(`Hash: ${hash}`);
        await this.block.related('header').save(this.block.header)
        return nonce;
      }
      nonce++;
    }
  }

  // Method to verify the PoW of a block
  public verifyPoW(): boolean {
    const blockService = new BlockService();
    const target = '0'.repeat(this.block.header.difficulty);
    // A block hash is the hash of the block header (not the whole block, cf. part 7 and 8 of the white paper)
    const hash = crypto.createHash('sha256').update(blockService.getBlockHeaderSummarize(this.block)).digest('hex');
    // We check if the hash starts with the target
    return hash.startsWith(target);
  }
}
