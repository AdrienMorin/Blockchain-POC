import { DateTime } from 'luxon'
import { BaseModel, column} from '@ioc:Adonis/Lucid/Orm'

export default class Coin extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public amount: number

  @column()
  public ownerKey: string

  @column()
  public usable: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
