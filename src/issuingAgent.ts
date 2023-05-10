import {
  InitConfig,
  Agent,
  WsOutboundTransport,
  HttpOutboundTransport,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  DidExchangeState,
  AutoAcceptCredential,
  OutOfBandRecord,
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { Schema } from 'indy-sdk'
import fetch from 'node-fetch'
import { setupCredentialListener } from './holderAgent'
var indy = require('indy-sdk');

const getGenesisTransaction = async (url: string) => {
  // Legacy code has a small issue with the call-signature from node-fetch
  // @ts-ignore
  const response = await fetch(url)

  return await response.text()
}
// The agent initialization configuration
export const initializeIssuingAgent = async (agentLabel, agentID, agentKey) => {
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label.
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
    console.log('genesisTransactionsBCovrinTestNet')
    console.log(genesisTransactionsBCovrinTestNet)
    const config: InitConfig = {
      label: agentID ? agentID : 'issueragent02',
      walletConfig: {
        id: agentID ? agentID : 'issueragent02',
        key:  agentKey ? agentKey : 'issueragent020000000000000000000',
      },
      publicDidSeed: agentKey ? agentKey : 'issueragent020000000000000000000',
      indyLedgers: [
        {
          id: 'bcovrin-test-net',
          isProduction: false,
          indyNamespace: 'bcovrin:test',
          genesisTransactions: genesisTransactionsBCovrinTestNet,
        },
      ],
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptConnections: true,
      endpoints: ['http://localhost:3001'],
    }
  
    // A new instance of an agent is created here
    const agent : Agent = new Agent({ config, dependencies: agentDependencies })
  
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())
  
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())
  
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))

    // agent.wallet.walletConfig.id = agentID``
    // agent.wallet

    // Initialize the agent
    await agent.initialize()
    console.log('Initialized the agent')
    // localStorage.setItem('ISSUING_AGENT', agent)
    return agent
  }

  export const createNewInvitation = async (agent: Agent) => {
    const outOfBandRecord = await agent.oob.createInvitation()
  
    return {
      invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'http://localhost:3001' }),
      outOfBandRecord,
    }
  }

  export const setupConnectionListener = async (
    issuer: Agent,
    outOfBandRecord: OutOfBandRecord
    // ,cb: (...args: any) => Promise<unknown>
  ) => {
    // console.log('setupConnectionListener')
    // console.log(outOfBandRecord)

    issuer.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
      if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
      if (payload.connectionRecord.state === DidExchangeState.Completed) {
        // the connection is now ready for usage in other protocols!
        console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)
  
        // Custom business logic can be included here
        // In this example we can send a basic message to the connection, but
        // anything is possible
        console.log('payload.connectionRecord.id')
        console.log(payload.connectionRecord.id)
        // await cb(payload.connectionRecord.id)
      }
    })
    await setupCredentialListener(issuer)

  }
  


  // Registering the schema and credential definition
  export const registerSchema = async (issuer: Agent) =>
  issuer.ledger.registerSchema({ attributes: ['firstName', 'lastName','valueChainRole','creditScore','commoditiesWalletID','tradingWalletID'], name: 'FamerVChainIdentity', version: '2.0' })


  export const registerCredentialDefinition = async (issuer: Agent, schema: Schema, tag :string ) =>{
    console.log('schema')
    console.log(schema)
    

  return issuer.ledger.registerCredentialDefinition({ schema, supportRevocation: false, tag })
}
  export const issueCredential = async (issuer: Agent, credentialDefinitionId: string, connectionId: string) =>{
    const credential = await issuer.credentials.offerCredential({
      protocolVersion: 'v1',
      connectionId,
      credentialFormats: {
        indy: {
          credentialDefinitionId,
          attributes: [
            { "name": "firstName", "value": "Innnocent M" },
            { "name": "lastName", "value": "Greats" },
            { "name": "valueChainRole", "value": "farmer" },
            { "name": "creditScore", "value": "300" },
            { "name": "commoditiesWalletID", "value": "1234567" },
            { "name": "tradingWalletID", "value": "1234567aaas" },
          ],
        },
      },
    })
    console.log('credential')
    console.log(credential)


  }
