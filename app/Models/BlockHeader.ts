import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class BlockHeader extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public rootHash: string

  @column()
  public previousHash: string

  @column()
  public nounce: number

  @column()
  public blockId: number

  @column()
  public difficulty: number

}
