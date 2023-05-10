import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { createNewInvitation, initializeIssuingAgent, issueCredential, registerCredentialDefinition, registerSchema, setupConnectionListener } from 'src/issuingAgent';
import { Agent } from '@aries-framework/core'
import {holderReceiveInvitation } from 'src/holderAgent';
import { GlobalStateProvider } from 'src/global-state-module/global-state.provider';
@Injectable()
export class ApiService {
  constructor(private globalState: GlobalStateProvider) {}


  create(createApiDto: CreateApiDto) {
    return 'This action adds a new api';
  }



  async sendInvitation(){
    const issuerAgent = await this.globalState.get('issuerAgent');
    const { outOfBandRecord, invitationUrl } = await this.generateInvitation(issuerAgent)
    console.log('invitation Url')
    console.log(invitationUrl)
    return invitationUrl 
  }


  async generateInvitation(issuerAgent: Agent){
    const {outOfBandRecord, invitationUrl } = await createNewInvitation(issuerAgent)
    console.log('generated invitation Url')
    console.log(invitationUrl)

    return {outOfBandRecord, invitationUrl }
  }

  async setupConnectionListener(){
    const issuerAgent = this.globalState.get('issuerAgent');
    console.log('Creating the invitation as Issuer...')
    const { outOfBandRecord } = await this.generateInvitation(issuerAgent)
    setupConnectionListener(issuerAgent, outOfBandRecord)

  }

  async holderReceiveInvitation(invitationUrl: string){
        await holderReceiveInvitation(invitationUrl)
  }

  async issueCredential(connectionId: string, tag: string){
    console.log('issuerAgent')
    const issuerAgent = this.globalState.get('issuerAgent');

    console.log('Registering the schema...')
    const schema = await registerSchema(issuerAgent)
    const credentialDefinition = await registerCredentialDefinition(issuerAgent, schema, tag)

    console.log('Issuing the credential...')
    await issueCredential(issuerAgent, credentialDefinition.id, connectionId)
  }


  findAll() {
    return `This action returns all api`;
  }

  findOne(id: number) {
    return `This action returns a #${id} api`;
  }

  update(id: number, updateApiDto: UpdateApiDto) {
    return `This action updates a #${id} api`;
  }

  remove(id: number) {
    return `This action removes a #${id} api`;
  }
}

const flow = (issuer: Agent) => async (connectionId: string, tag:string) => {
  console.log('Registering the schema...')
  const schema = await registerSchema(issuer)
  console.log('Registering the credential definition...')
  const credentialDefinition = await registerCredentialDefinition(issuer, schema, tag)
  console.log('Issuing the credential...')
  await issueCredential(issuer, credentialDefinition.id, connectionId)
}