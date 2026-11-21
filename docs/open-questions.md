# Open questions

What is the maintainer's to decide or to supply, and what the site says meanwhile. Nothing on the site pretends that one of these is settled.

## Could not be done

- **The text from the Cowork session** (`cse_01RmAvHDCXcxKiEwW57GkrDh`) is not in the site. The session is not among those that can be read from the session the site was made in, and nothing of it was found in Drive. The privacy policy and the terms here were written from what the app's code does, and are in force since 16/11/2026 (decision 29). If the session's text is ever at hand (exported, or pasted into a document), it is read against them.

## About the association

| question | what the site says meanwhile |
|---|---|
| **Who monitors the public mailbox?** | The board arranges coverage for `hello@kumpa.fi`. The contact page is at `/about/contact/`. |
| **A privacy contact**, by name or by role | the privacy policy gives the association's postal address for requests about personal data, on the maintainer's word of 08/11/2026 (decision 29), and names no person and no officer |
| **Social channels**: YouTube | LinkedIn, GitHub, TikTok and Instagram are in the footer (`social` in `src/site.ts`); YouTube is not shown until it exists |
| **Remaining team profiles and photos** | The people page at `/about/people/` lists the people who have agreed to appear, with their approved roles and available photos. |
| **Those who help**: whether Telia, Väestöliitto or anybody else has agreed to be named | "nobody is listed yet" |
| **The story of the app’s name** | The people page credits the designers of the seal emblem and the Saiga typeface. |
| **When the app opens** | The app is in development for iPhone and Android. The public release date is still open. |
| **Membership fees** | The bylaws describe how the annual meeting sets them. |

## About the texts

| question | what the site says meanwhile |
|---|---|
| **The bylaws are registered** (06/10/2026), as worded in the correction notice of that day | in force, in Finnish, at `/legal/bylaws/` (`status: in_force`, `registered: 2026-10-06`). The notice's "sanotunmääräajan" in 8 is shown as "sanotun määräajan"; whether the registered text has the typo too is unchecked |
| **Native review of the translated legal documents** | The translations and their controlling originals are listed in `docs/translation-review.md`. |
| **Native review of the Finnish sensitive-answers consent** | The privacy page uses the Finnish wording from the app. English controls the current version. |
| **A lawyer's reading** of the terms and the privacy policy: none, on the maintainer's word of 08/11/2026 (decision 29). What a lawyer would look at first is below, under "What the texts of 16/11/2026 found" | in force as a model wrote them |
| **Native review of Finnish site copy** | See `docs/translation-review.md` and the `machine` flags on the Finnish pages. |
| **The licence of the texts.** The code is AGPL-3.0; whether the texts are too, or under a licence for texts, or not licensed at all | the README names the code's licence only |

## What the privacy policy found in the app

Drafting it in September and October 2026 meant reading what the app keeps. These are for the app's repository, not for the site. Items 5, 6 and 10 are as they stood on 16/11/2026; the others were not read again then.

1. **Which bank was used is kept.** The identification's `amr` names the bank, is stored on the identity row and stays after an account is deleted. The app's own privacy summary (`legal.privacy.summary`) lists what is kept and does not mention the record of the identification.
2. **More of the identification is kept than `docs/vendors/telia.md` says**: also Telia's reference to the session and to the token.
3. **A session keeps the beginning of the user agent.** The app's summary does not mention devices.
4. **The export leaves out some of what is held**: the record of the identification, the standing and the count of refused sign-ins, the day from which a new account is possible, the user agent of a session, and the cards that were shown. The right of access covers them.
5. **Retention that is not carried out**: the log of staff actions (five years in the documents and in the policy, no deletion in the code). Settled since the first draft: a consent goes with the account, and the record of photos fetched is kept for a year.
6. **Amazon's use of content to improve its services** is not refused yet in the infrastructure's code (ADR-006 leaves it to the maintainer, once there is an AWS organisation). The policy in force does not speak of it.
7. **Photos are delivered through a network with nodes outside the EU** (CloudFront, price class 100, no geographic restriction).
8. **What Telia keeps, and where**, is an open question to Telia. **What the app's update check tells Expo, and where**, is not in the repository.
9. **An error's message can quote what was typed**, and goes to the error service as it is.
10. **No procedure for a personal data breach** was found (72 hours to the ombudsman), and **no way to appeal a ban**. The terms in force promise neither.
11. A **data protection impact assessment** before the first real person, as the founding notes plan. 17/11/2026: drafted by an agent from the app's repository, as a document in the maintainer's Drive; dating it and reading it as its reviewer are his (kuutti-ry/kumpa-app#190). **18/11/2026:** settled. The maintainer put the assessment in the draft minutes of the board's next meeting himself, and the summary is in force (decision 35).

## What the texts of 16/11/2026 found

Writing the texts that are in force meant reading the app's code and infrastructure again (the app's commit 935dc8b7). The texts say what is so, or what is decided. These are the places where the code or the association does not do it yet, and what no text can settle. They are the maintainer's, and most belong to the app's repository.

The maintainer's dispositions of 17/11/2026 (kuutti-ry/kumpa-app#190) follow each item. None changes a text: `2026-11-1` stands.

1. **The log of staff actions is kept for good by the code.** The policy says 5 years, the decided period; nothing deletes a row, and a trigger refuses it. No row is five years old before 2031. **17/11/2026:** stands until then; the app's trigger carries a `shortcut:` note naming 2031, and the deletion is kuutti-ry/kumpa-app#714.
2. **Copies of the database beyond the 35 days.** The policy says that backup copies are kept for 35 days. A snapshot taken by hand before a release's migration has no stated end, and production keeps a last snapshot if the database is ever deleted. **17/11/2026:** the app's runbooks say that a snapshot taken by hand, and the last one of a deleted database, is deleted within 35 days.
3. **An e-mail address that bounced** stays on the mail service's suppression list with no end. The policy says so: "for as long as the service is provided". **17/11/2026:** stands; the policy says so.
4. **This website's access log** is kept by Amplify Hosting until the app there is deleted. The policy says so in its own words. **17/11/2026:** stands; the policy says so.
5. **Error reports: "no longer than 90 days".** Sentry keeps them for 30 or 90 days by plan, and the association's plan is written down nowhere. **17/11/2026:** true on either plan; the app's docs name the plan.
6. **Expo.** No data processing agreement with Expo was found. Its privacy policy names the Data Privacy Framework and standard contractual clauses, which the policy's paragraph on transfers relies on. Production sends no notification yet. Apple's and Google's terms for transfers were not read. **17/11/2026:** a request for Expo's agreement is drafted in the maintainer's mailbox; sending it is his.
7. **A limit on what others see is applied without telling the person, and a suspension or a closure comes with no statement of reasons and no appeal.** The terms and the policy say the first openly. If the Digital Services Act applies to a free service of an association, its Article 17 asks every host for a statement of reasons to the person. Articles 20 and 27 (a complaint system, the main parameters of the order people are shown in) do not bind a micro or small enterprise (Article 19). **17/11/2026:** kuutti-ry/kumpa-app#715: whether it applies and, if it does, the reason and how to contest it.
8. **Photos sent in a conversation are checked by a machine.** Whether that fits the confidentiality of communications was not assessed. **17/11/2026:** stands; the impact assessment (item 11 above) weighs it.
9. **Answers that a strict reading could count as special categories**, outside the consent: the label a person gives a non-binary gender, monogamy, and smoking, drinking and the attitude to drugs. **17/11/2026:** stand outside the consent; the impact assessment gives the reading.
10. **Whether the server's proxy logs network addresses** is not known; the app's runbook for disclosures leaves it open. The policy names the network address among the data either way. **17/11/2026:** stands.
11. **The earlier drafts stayed on the pages**, folded, because every published version is kept (decision 14). Nobody but the association's own testers agreed to one. Settled 17/11/2026 (decision 32): they are on `/legal/earlier/`, under their anchors, and no row is removed.
12. **The name.** Settled since: the rest of the site and the app's own texts say Kumpa too (decision 30, kuutti-ry/kumpa-app#700). Left: the name under the app's icon and in the stores, which follows at the app's next native build.

## About the site itself

| question | what is done meanwhile |
|---|---|
| **The repository's name**, and when it is published | published 28/09/2026 as `kuutti-fi/kuutti-app-site` (`kuutti-ry/kuutti-app-site` since the organisation was renamed on 03/10/2026, `kuutti-ry/kumpa-app-site` since the maintainer renamed the repositories for Kumpa on 16/11/2026), public like the app's, on the maintainer's word after he had looked at the site |
| **The move of Amplify Hosting** to the new repository | done 28/09/2026: a new app, `kuutti-app-site`, created in the console and connected to this repository, `kuutti.app` moved to it, the old app deleted; `amplify.yml` and `customHttp.yml` work as written. The setup is in the app repository's `infra/README.md`, "The website" |
| **Removing `site/`** from the app's repository, with its `amplify.yml` and the mentions in `CLAUDE.md` and ADR-001 | kuutti-ry/kumpa-app#109 |
| **A public service status** | The details page links directly to `https://api.kumpa.fi/health`. The site makes no request to the API when a visitor loads the page. |
| **Gaiane's structure** at `/ga/`: whether, and when, it becomes the site's | removed on 16/11/2026, on the maintainer's word, with the pond demo (decision 27) |
| **How far Saiga goes on the site.** Decision 28 (16/11/2026, on the maintainer's word) puts it on every page; that it draws the headings and the header and no more was the agent's choice | what is read is in Inter. The token for Saiga's files is in the Amplify app (`FONTS_TOKEN`, decision 18), and previews of pull requests stay off there |
| **The store links** | Add the public iOS and Android listings to `SITE.stores` when available. Download links appear on App once both exist. |
