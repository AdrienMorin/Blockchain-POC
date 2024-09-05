import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from "App/Models/User";
import crypto from 'crypto';

export default class extends BaseSeeder {

  public async run () {
    const keyPairAdrien: { privateKey: string, publicKey: string } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    const keyPairJean: { privateKey: string, publicKey: string } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    const keyPairLucie: { privateKey: string, publicKey: string } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    const keyPairBaptiste: { privateKey: string, publicKey: string } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    await User.createMany([
      {
        "firstname": "Adrien",
        "lastname": "Morin",
        "email": "amorin@gmail.com",
        "password": "amorin123",
        "privateKey": keyPairAdrien.privateKey,
        "publicKey": keyPairAdrien.publicKey
      },
      {
        "firstname": "Jean",
        "lastname": "Dupont",
        "email": "jdupont@gmail.com",
        "password": "jdupont123",
        "privateKey": keyPairJean.privateKey,
        "publicKey": keyPairJean.publicKey
      },
      {
        "firstname": "Lucie",
        "lastname": "Deschamps",
        "email": "ldeschamps@gmail.com",
        "password": "ldeschamps123",
        "privateKey": keyPairLucie.privateKey,
        "publicKey": keyPairLucie.publicKey
      },
      {
        "firstname": "Baptiste",
        "lastname": "Durand",
        "email": "bdurand@gmail.com",
        "password": "bdurand123",
        "privateKey": keyPairBaptiste.privateKey,
        "publicKey": keyPairBaptiste.publicKey
      }
    ])
  }
}
