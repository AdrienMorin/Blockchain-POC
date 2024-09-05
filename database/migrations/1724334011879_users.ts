import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('public_key').primary()
      table.string('private_key').notNullable()
      table.string('firstname').notNullable()
      table.string('lastname').notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
