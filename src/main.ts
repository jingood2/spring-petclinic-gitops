//import path from 'path';
import { App, Chart, ChartProps, Size } from 'cdk8s';
import * as cdk8s from 'cdk8s';
import * as kplus from 'cdk8s-plus-22';
import { Construct } from 'constructs';
import { envVars } from './lib/env-vars';

interface MyChartProps extends ChartProps {
  stage: string;
}

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: MyChartProps ) {
    super(scope, id, props);

    const label = { app: envVars.SERVICE_NAME };

    const appData = new kplus.ConfigMap(this, 'AppData');
    //appData.addDirectory(path.join(__dirname, '.'));
    appData.addData('index.js',
      "var http = require('http'); var port = process.argv[2]; http.createServer(function (req, res) { res.write('Hello World!'); res.end();}).listen(port);");


    // Populate Volume from ConfigMap
    const appVolume = kplus.Volume.fromConfigMap(this, 'VolumeFromConfigMap', appData);

    // lets create a deployment to run a few instances of a Pod
    const deployment = new kplus.Deployment(this, 'Deployment', {
      metadata: { labels: label },
      replicas: props.stage == 'dev' ? envVars.mapping.dev.REPLICAS : envVars.mapping.prod.REPLICAS,
      progressDeadline: cdk8s.Duration.seconds(120),
    });

    // now we create a container that runs our app
    const appPath = '/var/lib/app';
    const port = 80;
    const container = deployment.addContainer({
      image: envVars.IMAGE_URI,
      command: ['node', 'index.js', `${port}`],
      port: port,
      workingDir: appPath,
      resources: { memory: { request: Size.mebibytes(64), limit: Size.mebibytes(128) } },
      readiness: kplus.Probe.fromHttpGet('/'),
      liveness: kplus.Probe.fromHttpGet('/'),
    });

    // make the app accessible to the container
    container.mount(appPath, appVolume, {});

    // finally, we expose the deployment as a load balancer service and make it run
    deployment.exposeViaService({ serviceType: kplus.ServiceType.LOAD_BALANCER });

    // ingress

    app.synth();
  }
}

const app = new App();
new MyChart(app, `${envVars.SERVICE_NAME}-dev`, { stage: 'dev' });
new MyChart(app, `${envVars.SERVICE_NAME}-staging`, { stage: 'staging' });
new MyChart(app, `${envVars.SERVICE_NAME}-prod`, { stage: 'prod' });
app.synth();