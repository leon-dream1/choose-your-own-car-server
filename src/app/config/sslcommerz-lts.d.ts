/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'sslcommerz-lts' {
  import { SSLCommerzInitData } from './sslcommerz';

  class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, isLive: boolean);

    init(data: SSLCommerzInitData): Promise<{
      GatewayPageURL?: string;
      [key: string]: any;
    }>;
  }

  export = SSLCommerzPayment;
}
