import { BaseModel, column, hasOne, HasOne, hasMany, HasMany} from '@ioc:Adonis/Lucid/Orm'
import BlockHeader from "App/Models/BlockHeader";
import Transaction from "App/Models/Transaction";

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(() => BlockHeader)
  public header: HasOne<typeof BlockHeader>

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>
}
