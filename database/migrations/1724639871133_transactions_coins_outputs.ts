import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'transactions_coins_outputs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('transaction_id').unsigned().references('transactions.id')
      table.integer('coin_id').unsigned().references('coins.id')
      table.unique(['transaction_id', 'coin_id'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
