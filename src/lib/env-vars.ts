
export const envVars = {
  IMAGE_URI: 'node:14.4.0-alpine3.12',
  SERVICE_NAME: 'hello-app',
  REGION: 'ap-northeast-2',

  mapping: {
    dev: {
      REPLICAS: 1,
      MEM_REQUESTED: 64,
      MEM_LIMITED: '128',
    },
    /* staging: {
      REPLICAS: 1,
      MEM_REQUESTED: 64,
      MEM_LIMITED: 128,
    },
    prod: {
      REPLICAS: 2,
      MEM_REQUESTED: 64,
      MEM_LIMITED: 128,
    }, */
  },
};