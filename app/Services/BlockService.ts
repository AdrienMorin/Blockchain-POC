import Block from "App/Models/Block";

export default class BlockService {

  constructor() {
  }

  // Method to find the last block of the blockchain
  public async findLastBlock(): Promise<Block> {
    const block = await Block.query()
      .orderBy('id', "desc")
      .preload('header')
      .preload('transactions', (transactionsQuery) => {
        try{transactionsQuery.preload('receivers')} finally {}
        try{transactionsQuery.preload('outputs')} finally {}
        try{transactionsQuery.preload('senders')} finally {}
        try {transactionsQuery.preload('inputs')} finally {}
      }).first()
    return block!;
  }

  // Method to find a block by its id
  public async findBlockById(id: number): Promise<Block> {
    const block = await Block.query()
      .where('id', id)
      .preload('header')
      .preload('transactions', (transactionsQuery) => {
        try{transactionsQuery.preload('receivers')} finally {}
        try{transactionsQuery.preload('outputs')} finally {}
        try{transactionsQuery.preload('senders')} finally {}
        try {transactionsQuery.preload('inputs')} finally {}
      }).first()
    return block!;
  }

  // Method to find all the blocks with a filter to not see some unnecessary fields
  public async findAllWithFilter() {
    const blocks = await Block.query()
      .preload('header')
      .preload('transactions', (transactionsQuery) => {
        try{transactionsQuery.preload('receivers')} finally {}
        try{transactionsQuery.preload('outputs')} finally {}
        try{transactionsQuery.preload('senders')} finally {}
        try {transactionsQuery.preload('inputs')} finally {}
      })
    return this.serializeBlockList(blocks!);
  }

  // Method to find all the blocks
  public async findAll() {
    return Block.query()
      .preload('header')
      .preload('transactions', (transactionsQuery) => {
        try{transactionsQuery.preload('receivers')} finally {}
        try{transactionsQuery.preload('outputs')} finally {}
        try{transactionsQuery.preload('senders')} finally {}
        try {transactionsQuery.preload('inputs')} finally {}
      });
  }

  // Method to find all the blocks with a filter to not see some unnecessary fields
  serializeBlockList(blocks : Block[]) {
    return blocks.map((block) => this.serializeBlock(block))
  }

  // Method to return the block header summarize JSON of a block (used for the PoW and when hashing a block is needed)
  public getBlockHeaderSummarize(block: Block) {
    return JSON.stringify({
      id: block.header.id,
      rootHash: block.header.rootHash,
      previousHash: block.header.previousHash,
      nounce: Number(block.header.nounce),
      blockId: block.header.blockId,
      difficulty: block.header.difficulty
    })
  }

  public getBlockSummarize(block: Block) {
    return JSON.stringify({
      id: block.id,
      header: {
        id: block.header.id,
        rootHash: block.header.rootHash,
        previousHash: block.header.previousHash,
        nounce: Number(block.header.nounce),
        blockId: block.header.blockId,
        difficulty: block.header.difficulty
      },
      transactions: block.transactions.map((transaction) =>
        JSON.stringify({
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
        })
      )
    })
  }

  // Method to serialize a block (put a filter to not see some unnecessary fields)
  private serializeBlock(block: Block){
    return block.serialize({
      relations: {
        header: {
          fields: {
            omit: ['block_id']
          }
        },
        transactions: {
          fields: {
            omit: ['block_id'],
          },
          relations: {
            receivers: {
              fields: {
                omit: ['remember_me_token', 'private_key']
              }
            },
            senders: {
              fields: {
                omit: ['remember_me_token', 'private_key']
              }
            }
          }
        }
      }
    });
  }

}
