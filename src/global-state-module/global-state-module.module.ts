import { Global, Module } from '@nestjs/common';
import { GlobalStateProvider } from './global-state.provider';


@Global()
@Module({
  providers: [GlobalStateProvider],
})
export class GlobalStateModule {
  constructor(
    private globalStateProvider: GlobalStateProvider
    ) {}

    set(key: string, value: any) {
        this.globalStateProvider.set(key, value);
      }
    
      get(key: string) {
        return this.globalStateProvider.get(key);
      }

}
