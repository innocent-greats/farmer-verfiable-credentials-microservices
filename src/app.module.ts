import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { GlobalStateModule } from './global-state-module/global-state-module.module';
import { initializeIssuingAgent } from './issuingAgent';
import { startServer } from '@aries-framework/rest';
import { GlobalStateProvider } from './global-state-module/global-state.provider';

@Module({
  imports: [ApiModule, GlobalStateModule],
  controllers: [AppController],
  providers: [AppService, GlobalStateProvider],
})

export class AppModule {
  constructor(private globalState: GlobalStateProvider) {}

  // async onModuleInit() {
  //   const issuerAgent = this.globalState.get('issuerAgent');
  //   // console.log(issuerAgen); // Output: 'myValue'
  //   await startServer(issuerAgent, { port: 3005 })
  // }
}
