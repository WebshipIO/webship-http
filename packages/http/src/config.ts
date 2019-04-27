export interface FormConfig {
  formKeepExtensions?: boolean
  formUploadDir?: string
  formMaxFieldsSize?: number
  formMaxFields?: number
  formMaxFileSize?: number
  formMultiples?: boolean
}

export interface ServerConfig extends FormConfig {
  hostname?: string
  port?: number
  keepAliveTimeout?: number
  timeout?: number
}
