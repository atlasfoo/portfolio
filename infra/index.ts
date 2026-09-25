import * as cloudflare from '@pulumi/cloudflare';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

const accountId = config.require('accountId');
const zoneId = config.require('zoneId');
const hostname = config.require('hostname');
const workerName = config.require('workerName');

// `cloudflare.Worker` is a pure container (no content fields) — wrangler
// owns the deployed code/assets for this same Worker name. See
// infra/README.md § Spike (T-006).
export const worker = new cloudflare.Worker('site', {
  accountId,
  name: workerName,
});

export const customDomain = new cloudflare.WorkersCustomDomain('site-domain', {
  accountId,
  hostname,
  service: worker.name,
  zoneId,
});

export const workerNameOutput = worker.name;
export const hostnameOutput = customDomain.hostname;
export const url = pulumi.interpolate`https://${customDomain.hostname}`;
