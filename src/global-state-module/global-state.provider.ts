import { Injectable, Global } from '@nestjs/common';

@Injectable()
export class GlobalStateProvider {
  private globalState: any = {};

  async set(key: string, value: any) {
    this.globalState[key] = value;
  }

   get(key: string) {
    console.log('key', key)
    try {
      const value =  this.globalState[key];
      return value
    } catch (error) {
      console.log('err',error)
    }
  }
}
