declare module 'ali-oss' {
  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    secure?: boolean;
  }

  interface PutResult {
    name: string;
    url: string;
    res: {
      status: number;
      statusCode: number;
      headers: Record<string, string>;
    };
  }

  interface PutOptions {
    headers?: Record<string, string>;
  }

  class OSS {
    constructor(options: OSSOptions);
    put(path: string, file: Buffer, options?: PutOptions): Promise<PutResult>;
  }

  export default OSS;
} 