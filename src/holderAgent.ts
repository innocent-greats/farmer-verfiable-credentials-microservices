import {
  InitConfig,
  Agent,
  WsOutboundTransport,
  HttpOutboundTransport,
  CredentialEventTypes,
  CredentialState,
  CredentialStateChangedEvent,
  OutOfBandRecord,
} from '@aries-framework/core'
import { agentDependencies,  } from '@aries-framework/node'
import fetch from 'node-fetch'


export const initializeHolderAgent = async () => {
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label. It also sets the mediator invitation url,
    // because this is most likely required in a mobile environment.
    const config: InitConfig = {
      label: 'holder-agent-user01',
      walletConfig: {
        id: 'holderUser01',
        key: 'holderagentuser0100000000000000000000',
      },
      autoAcceptConnections: true,
    }
  
    // A new instance of an agent is created here
    const agent = new Agent({ config, dependencies: agentDependencies })
  
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())
  
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())
  
    // Initialize the agent
    await agent.initialize()

    return agent
  }


export const holderReceiveInvitation = async (invitationUrl: string) => {
    const holderAgent: Agent = await initializeHolderAgent()
    console.log('holderReceiveInvitation invitation from Issuer...')
    console.log(invitationUrl)

    // const { outOfBandRecord } = 
    await holderAgent.oob.receiveInvitationFromUrl(invitationUrl)
    await setupCredentialListener(holderAgent)
  
    // return outOfBandRecord
  }

export const setupCredentialListener = async(holder: Agent) => {
  console.log('receiving a credential')

  holder.events.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
  console.log('receiving a credential payload')
  console.log(payload)

    switch (payload.credentialRecord.state) {
      case CredentialState.OfferReceived:
        console.log('received a credential')
        // custom logic here
        await holder.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
      case CredentialState.Done:
        console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
        // For demo purposes we exit the program here.
        process.exit(0)
    }
  })
}  