# infra — Pulumi

Provisiona la infraestructura durable de Cloudflare (Worker de assets
estáticos + custom domain) para el sitio. El contenido del Worker
(versiones, assets) lo publica `wrangler`, no Pulumi — ver
`.ai/work/plan.md § Frontera Pulumi ↔ wrangler`.

## Backend de state (S3, AWS)

El state vive en un bucket S3 aportado por el maintainer — no lo crea
este stack (huevo y gallina: un stack no puede crear el bucket donde
vive su propio state).

```sh
pulumi login 's3://<bucket>?region=<region>'
```

- `PULUMI_CONFIG_PASSPHRASE` — cifra los secrets del stack. Generada y
  guardada en el gestor de contraseñas del maintainer; **no entra al
  repo**.
- **Credenciales AWS:**
  - Local: la sesión AWS del maintainer (perfil o `aws login`).
  - CI: `aws-actions/configure-aws-credentials` asumiendo el rol IAM
    vía OIDC de GitHub — sin claves estáticas (`infra.yml`, T-026).

**Estado (T-010): confirmado end-to-end.** El bucket
`atlasfoo-pulumi-state-182618816378-us-east-1-an` (us-east-1) cumple
los cuatro requisitos (Block Public Access completo, versionado
activado, SSE-S3, Bucket owner enforced). CLI de Pulumi instalado
(`brew install pulumi`, v3.263.0 — coincide con el SDK
`@pulumi/pulumi` fijado). `pulumi login` al backend S3, `pulumi stack
init prod`, `pulumi config set --secret cloudflare:apiToken` y `pulumi
preview` corridos por el maintainer contra la cuenta real: **3
recursos a crear** (`Stack`, `Worker`, `WorkersCustomDomain`), sin
errores.

Nota: `pulumi preview` no ejerce completamente los permisos de
escritura del token contra la API de Cloudflare — eso solo se
confirma en un `pulumi up` real (fuera del alcance de T-010).

## Spike (T-006): recursos confirmados en `@pulumi/cloudflare@6.21.0`

Provider fijado en `^6.21.0` (instalado: `6.21.0`). Confirmado leyendo
los `.d.ts` instalados, no la doc pública (puede desalinearse entre
versiones):

- **`cloudflare.Worker`** (beta) — contenedor puro. Args: `accountId`
  (requerido), `name` (requerido), y solo metadata (`observability`,
  `subdomain`, `tags`, `logpush`, `tailConsumers`). **Sin ningún campo
  de contenido** (no `content`, no `mainModule`, no `assets`). Esto
  resuelve limpio el riesgo que el plan anticipaba: no hace falta
  `ignoreChanges` sobre contenido porque el recurso no tiene contenido
  que gestionar. wrangler despliega código/assets al mismo `name`
  después, sin que Pulumi lo vea nunca.
- **`cloudflare.WorkersCustomDomain`** — ata el hostname: `accountId`,
  `hostname` (requerido), `service` (requerido, = nombre del Worker),
  `zoneId`, `zoneName`.

Alternativa descartada: `cloudflare.WorkersScript` (el recurso estable,
no beta) sí requiere contenido (`content`/`mainModule`) o
`assets.directory` para crearse — ahí sí habría hecho falta el patrón
de placeholder + `ignoreChanges`. Se prefiere `Worker` por ser
contenedor puro; el costo es que aún está en beta en este provider.

Plan B (invertir el orden con `pulumi import` si `Worker` resultaba no
viable) **no hizo falta** — `pulumi preview` confirmó el recurso limpio
contra la cuenta real.

## Config del stack

`infra/Pulumi.prod.yaml` tiene los valores reales del stack `prod`:
`portfolio-infra:accountId`, `portfolio-infra:zoneId`,
`portfolio-infra:hostname`, `portfolio-infra:workerName`, más
`cloudflare:apiToken` cifrado (`secure:`, solo legible con
`PULUMI_CONFIG_PASSPHRASE`).

**Namespace de config — importante:** el namespace `cloudflare:` está
reservado para la config del *provider* (`apiKey`, `apiToken`,
`apiUserServiceKey`, `baseUrl`, `email`,
`userAgentOperatorSuffix` — ver `node_modules/@pulumi/cloudflare/config/vars.d.ts`).
`accountId` **no** es una de esas claves: va bajo el namespace propio
del proyecto (`portfolio-infra:accountId`), igual que `zoneId`,
`hostname` y `workerName`. Ponerlo bajo `cloudflare:accountId` rompe
`pulumi preview` con `is not a valid configuration key for the
cloudflare provider` (encontrado y corregido en T-010).

`wrangler.jsonc` (raíz) tiene `name: "atlasfoo-portfolio-worker"` —
**coincide** con `portfolio-infra:workerName`, como debe ser para que
Pulumi y wrangler apunten al mismo Worker.

El token de API de Cloudflare **nunca** va en texto plano en este
archivo — se setea con `pulumi config set --secret` en el stack.

## Runbook (T-027)

Inventario permanente de todo lo que vive **fuera** del state de
Pulumi y del repo, provisionado a mano por el maintainer. Los nombres
de variables y secrets son los fijados en
`.ai/work/plan.md § Requerido para finalizar`; si cambian, se enmiendan
en ambos lugares.

### AWS — acceso al backend de state

| Recurso | Detalle |
|---|---|
| Bucket S3 | `atlasfoo-pulumi-state-182618816378-us-east-1-an` (us-east-1). Block Public Access completo, versionado activado, SSE-S3, Bucket owner enforced. |
| OIDC provider (IAM) | `token.actions.githubusercontent.com`, audience `sts.amazonaws.com`. |
| Rol IAM para CI | Trust policy `sts:AssumeRoleWithWebIdentity` sobre el provider, `sub` acotado a `repo:atlasfoo/portfolio:pull_request` (preview en PRs) y `repo:atlasfoo/portfolio:ref:refs/heads/master` (`up` al mergear). **`infra.yml` (T-026) no corre bajo un GitHub Environment** — el `sub` queda en `pull_request`/`ref:refs/heads/master`, no `environment:<env>`; si eso cambia algún día, la trust policy se ajusta junto con el workflow. Duración máxima de sesión: 1h. Política: `s3:ListBucket`/`s3:GetBucketLocation` sobre el bucket, `s3:GetObject`/`s3:PutObject`/`s3:DeleteObject` sobre `<bucket>/*`. |
| Acceso local del maintainer | Misma política que el rol de CI, vía perfil o `aws login`. |

### Cloudflare — dos tokens, separados por diseño

| Token | Usado por | Permisos |
|---|---|---|
| Pulumi (`CLOUDFLARE_API_TOKEN_INFRA`) | `infra.yml`, local (`pulumi config set --secret cloudflare:apiToken`) | Workers → Admin (crear el Worker), Zone → Workers Routes → Write (zona del dominio) |
| Deploy (`CLOUDFLARE_API_TOKEN_DEPLOY`) | `deploy.yml` únicamente | Workers → Editor (subir/desplegar versiones — no toca rutas ni dominios) |

Separados a propósito: el token de deploy no puede crear ni borrar
Workers ni tocar el custom domain, aunque quede comprometido.

### Pulumi

`PULUMI_CONFIG_PASSPHRASE` — cifra los secrets del stack (hoy solo
`cloudflare:apiToken`). Perderla deja ilegibles los secrets del state;
vive únicamente en el gestor de contraseñas del maintainer y en los
secrets de GitHub listados abajo.

### GitHub — inventario de variables y secrets

**Variables del repo** (`Settings → Variables → Actions`, no
secretas):

| Nombre | Valor | Usado por |
|---|---|---|
| `AWS_REGION` | región del bucket de state | `infra.yml` |
| `AWS_ROLE_ARN` | ARN del rol IAM de CI | `infra.yml` |
| `PULUMI_BACKEND_URL` | `s3://<bucket>?region=<region>` | `infra.yml` |
| `CLOUDFLARE_ACCOUNT_ID` | account id de Cloudflare | `infra.yml`, `deploy.yml` |
| `BUMP_APP_ID` | El App ID numérico de la GitHub App de bump (`release.yml` pinea `actions/create-github-app-token@v1`, cuyo `action.yml` solo acepta `app-id`, no `client-id` — verificado con `actionlint`) | `release.yml` |

**Secrets del repo** (`Settings → Secrets → Actions`):

| Nombre | Usado por |
|---|---|
| `PULUMI_CONFIG_PASSPHRASE` | `infra.yml` |
| `CLOUDFLARE_API_TOKEN_INFRA` | `infra.yml` |
| `BUMP_APP_PRIVATE_KEY` | `release.yml` |

**Environment `production`** (`Settings → Environments`) — **pendiente
de crear, ver nota abajo**:

| Nombre | Tipo | Usado por |
|---|---|---|
| `CLOUDFLARE_API_TOKEN_DEPLOY` | secret de Environment | `deploy.yml` |

Reglas de protección del Environment (revisores requeridos,
ramas/tags permitidos) quedan a gusto del maintainer — el plan no las
fija.

> **Pendiente (T-021):** el Environment `production` y su secret no se
> pudieron crear desde este agente — `gh api -X PUT
> .../environments/production` fue denegado por el clasificador de
> auto-mode de Claude Code (acción de infraestructura fuera de su
> alcance autorizado en esta sesión). Crearlo manualmente desbloquea
> T-021 y T-025.

**GitHub App de bump** — ya existe (construida fuera de este plan);
falta instalarla en el repo con permiso *Contents: write* y, si
`master` está protegida, permitirle saltar la regla de push del commit
de bump.

## Flujo de promoción y rollback

```
PR ──→ pr-check.yml      (gate; no produce artefacto)
                            │
master ──→ release.yml   (bump → tag → build → Release + tarball)
                            │ release: published
                            ▼
           deploy.yml    (descarga el tarball · sin rebuild · wrangler)

infra/** en PR  ──→ infra.yml (pulumi preview)
infra/** en master ──→ infra.yml (pulumi up)
```

- **Deploy normal**: publicar un Release dispara `deploy.yml` solo —
  descarga el tarball adjunto, `wrangler versions upload` +
  `versions deploy ...@100`.
- **Rollback**: `workflow_dispatch` en `deploy.yml` con el `tag` de una
  release anterior. Descarga *ese* tarball (ya construido, nunca se
  reconstruye) y lo vuelve a promover a 100% — el mismo camino que un
  deploy normal, solo que apuntando a un artefacto viejo.
- **Infra**: cambios en `infra/**` se previsualizan en cada PR y se
  aplican solos al mergear a `master`. Nunca corre en el mismo flujo
  que el release del sitio — son dos ciclos de vida independientes
  (ver `.ai/work/plan.md § Frontera Pulumi ↔ wrangler`).

## Restricción: "un solo build" para todos los ambientes

El tarball que produce `release.yml` es el único artefacto — `deploy.yml`
nunca reconstruye. Eso solo se sostiene si **nada específico de un
ambiente se hornea en build time**. Hoy se cumple: `astro.config.mjs`
no define `site` ni usa variables `PUBLIC_*`. Si en el futuro se agrega
un `site` distinto por ambiente, o una `PUBLIC_*` que varíe entre
producción y otro ambiente, esta premisa se rompe y habría que
reconstruir por ambiente. `pr-check.yml` no lo custodia
automáticamente — queda como restricción documentada, no como gate.
