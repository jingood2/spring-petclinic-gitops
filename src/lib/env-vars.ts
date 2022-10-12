
export const envVars = {
  REGION: process.env.REGION || 'ap-northeast-2',
  SERVICE_NAME: process.env.SERVICE_NAME || 'hello-app',
  REPLICAS: 2,
  IMAGE_URI: 'node:14.4.0-alpine3.12',

};