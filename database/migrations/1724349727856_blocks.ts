import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'blocks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
