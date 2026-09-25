import * as pulumi from '@pulumi/pulumi';
import { beforeAll, describe, expect, it } from 'vitest';

pulumi.runtime.setMocks(
  {
    newResource: (args: pulumi.runtime.MockResourceArgs) => ({
      id: `${args.name}_id`,
      state: { ...args.inputs },
    }),
    call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
  },
  'portfolio-infra',
  'test',
  false,
);

pulumi.runtime.setAllConfig({
  'portfolio-infra:accountId': 'test-account-id',
  'portfolio-infra:zoneId': 'test-zone-id',
  'portfolio-infra:hostname': 'example.test',
  'portfolio-infra:workerName': 'portfolio-site',
});

describe('infra stack', () => {
  let infra: typeof import('./index');

  beforeAll(async () => {
    infra = await import('./index');
  });

  it('creates the Worker with the configured name', async () => {
    const name = await new Promise((resolve) =>
      infra.worker.name.apply(resolve),
    );
    expect(name).toBe('portfolio-site');
  });

  it('creates a custom domain over the configured hostname and zone, routed to the Worker', async () => {
    const [hostname, zoneId, service] = await Promise.all([
      new Promise((resolve) => infra.customDomain.hostname.apply(resolve)),
      new Promise((resolve) => infra.customDomain.zoneId.apply(resolve)),
      new Promise((resolve) => infra.customDomain.service.apply(resolve)),
    ]);
    expect(hostname).toBe('example.test');
    expect(zoneId).toBe('test-zone-id');
    expect(service).toBe('portfolio-site');
  });
});
