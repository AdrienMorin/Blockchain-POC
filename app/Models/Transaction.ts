import { DateTime } from 'luxon'
import {BaseModel, column, manyToMany, ManyToMany} from '@ioc:Adonis/Lucid/Orm'
import Coin from "App/Models/Coin";
import User from "App/Models/User";

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @manyToMany(() => User, {
    localKey: 'id',
    pivotForeignKey: 'transaction_id',
    relatedKey: 'publicKey',
    pivotRelatedForeignKey: 'sender_key',
    pivotTable: 'transactions_users_senders'
  })
  public senders: ManyToMany<typeof User>

  @manyToMany(() => User, {
    localKey: 'id',
    pivotForeignKey: 'transaction_id',
    relatedKey: 'publicKey',
    pivotRelatedForeignKey: 'receiver_key',
    pivotTable: 'transactions_users_receivers'
  })
  public receivers: ManyToMany<typeof User>

  @manyToMany(() => Coin, {
    localKey: 'id',
    pivotForeignKey: 'transaction_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'coin_id',
    pivotTable: 'transactions_coins_inputs'
  })
  public inputs: ManyToMany<typeof Coin>

  @manyToMany(() => Coin, {
    localKey: 'id',
    pivotForeignKey: 'transaction_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'coin_id',
    pivotTable: 'transactions_coins_outputs'
  })
  public outputs: ManyToMany<typeof Coin>

  @column()
  public blockId: number

  @column()
  public signature: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
