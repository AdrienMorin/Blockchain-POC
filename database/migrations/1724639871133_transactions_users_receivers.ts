import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'transactions_users_receivers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('transaction_id').unsigned().references('transactions.id')
      table.integer('receiver_key').unsigned().references('users.public_key')
      table.unique(['transaction_id', 'receiver_key'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
