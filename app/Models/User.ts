import Hash from '@ioc:Adonis/Core/Hash'
import {column, beforeSave, BaseModel, hasMany, HasMany} from '@ioc:Adonis/Lucid/Orm'
import Coin from "App/Models/Coin";
import Transaction from "App/Models/Transaction";

export default class User extends BaseModel {

  @column({ isPrimary: true })
  public publicKey: string

  @column()
  public privateKey: string

  @column()
  public firstname: string

  @column()
  public lastname: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @hasMany(() => Coin, {
    foreignKey: 'ownerKey'
  })
  public coins: HasMany<typeof Coin>

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
