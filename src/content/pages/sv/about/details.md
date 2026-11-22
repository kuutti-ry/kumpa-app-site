---
title: "Teknisk information"
description: "Kumpas källkod, hur appen är byggd och hur tjänsten fungerar just nu."
reviewedBy: "native speaker"
---

Kumpas app och server finns i ett [offentligt kodförråd](https://github.com/kuutti-ry/kumpa-app). Där kan du läsa hur matchningen fungerar, rapportera en bugg eller föreslå en ändring.

## Så är appen byggd

Appen för iPhone och Android använder React Native och Expo. Servern använder TypeScript och PostgreSQL. Användaridentifiering sker genom stark elektronisk autentisering via det finländska förtroendenätet för elektronisk identifiering (Finnish Trust Network, FTN), med Telia som leverantör av identifierings&shy;förmedlings&shy;tjänsten. Servrarna, databasen och bilderna finns i Tyskland.

Koden är tillgänglig under [GNU Affero General Public License](https://github.com/kuutti-ry/kumpa-app/blob/main/LICENSE) med ett [undantag för appbutiker](https://github.com/kuutti-ry/kumpa-app/blob/main/LICENSE-EXCEPTION).

## Tjänstens status

@status
