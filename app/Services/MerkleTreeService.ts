import * as crypto from 'crypto';
import Transaction from "App/Models/Transaction"
import TransactionService from "App/Services/TransactionService";

export default class MerkleTreeService {
  private leaves: string[];
  private tree: string[][];

  constructor(transactions: Transaction[]) {
    this.leaves = transactions.map(this.hashTransaction);
    this.tree = this.buildTree(this.leaves);
  }

  // Hashes a transaction and returns the result in hexadecimal
  public hashTransaction(transaction: Transaction): string {
    const transactionService = new TransactionService();
    return crypto.createHash('sha256').update(transactionService.getTransactionSummarize(transaction)).digest('hex');
  }

  // Hashes a string and returns the result in hexadecimal
  public hashString(string: string){
    return crypto.createHash('sha256').update(string).digest('hex');
  }


  // Builds a Merkle tree from a list of leaves
  private buildTree(leaves: string[]): string[][] {
    const tree: string[][] = [];
    let currentLevel = leaves;

    // We get all leaves of a level, hash them by pairs, and store the result in the next level
    // Then we repeat the process until we have only one hash left
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate the last hash if odd number of hashes
        const combinedHash = crypto.createHash('sha256').update(left + right).digest('hex');
        nextLevel.push(combinedHash);
      }
      tree.push(currentLevel);
      currentLevel = nextLevel;
    }
    tree.push(currentLevel);
    return tree;
  }

  // Returns the Merkle root of the tree
  public getRoot(): string {
    return this.tree[this.tree.length - 1][0];
  }

  public printTree(): void {
    console.log("Merkle Tree:");
    for (let i = 0; i < this.tree.length; i++) {
      console.log(`Level ${i}: ${this.tree[i].join(' ')}`);
    }
  }
}
