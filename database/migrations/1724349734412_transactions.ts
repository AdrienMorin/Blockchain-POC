import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('created_at', { useTz: true })
      table
        .integer('block_id')
        .unsigned()
        .references('blocks.id')
      table.string('signature')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
