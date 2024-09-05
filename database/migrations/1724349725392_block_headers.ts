import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'block_headers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('root_hash')
      table.string('previous_hash')
      table.string('nounce')
      table
        .integer('block_id')
        .unsigned()
        .references('blocks.id')
      table.integer('difficulty')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
