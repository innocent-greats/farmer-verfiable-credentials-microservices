import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { GlobalStateProvider } from 'src/global-state-module/global-state.provider';
import { GlobalStateModule } from 'src/global-state-module/global-state-module.module';
import { initializeIssuingAgent } from 'src/issuingAgent';
import { startServer } from '@aries-framework/rest';

@Module({
  imports:[GlobalStateModule],
  controllers: [ApiController],
  providers: [ApiService, GlobalStateProvider]
})
export class ApiModule {
  constructor(private globalState: GlobalStateProvider) {}
  async onModuleInit() {
    const agentLabel = 'issueragent02'
    const agentID = 'issueragent02'
    const agentKey = 'issueragent020000000000000000000'
    const issuerAgent: any = await initializeIssuingAgent(agentLabel, agentID, agentKey)
    this.globalState.set('issuerAgent', issuerAgent);
    const issuerAgen = this.globalState.get('issuerAgent');
    console.log(issuerAgen); // Output: 'myValue'
    await startServer(issuerAgen, { port: 3005 })
  }
}
