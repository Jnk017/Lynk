#!/usr/bin/env python3
"""Generate LYNK's versioned FR/EN/ES Markdown, printable HTML, and PDF legal library."""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'frontend' / 'public' / 'legal'
VERSION = '2.0'
EFFECTIVE = '7 June 2026'
UPDATED = '7 June 2026'
COMPANY = 'Nexa Inc SARL — 38 Avenue Kimbemba, Quartier Masanga Mbila, Commune de Mont Ngafula, Kinshasa, Democratic Republic of the Congo'
SUPPORT = 'Legal, privacy and safety support: legal@nexaincdrc.com · privacy@nexaincdrc.com · safety@nexaincdrc.com · +243994813049 · https://nexaincdrc.com'

TITLES = {
 'terms': ('Conditions d’utilisation','Terms of Service','Términos del servicio'),
 'privacy': ('Politique de confidentialité','Privacy Policy','Política de privacidad'),
 'dpa': ('Accord de traitement des données','Data Processing Agreement','Acuerdo de tratamiento de datos'),
 'cookies': ('Politique relative aux cookies','Cookie Policy','Política de cookies'),
 'community': ('Règles de la communauté','Community Guidelines','Normas de la comunidad'),
 'safety': ('Normes de sécurité','Safety Standards','Estándares de seguridad'),
 'kyc': ('Politique KYC et vérification d’identité','KYC & Identity Verification Policy','Política KYC y verificación de identidad'),
 'wallet': ('Conditions du portefeuille et des paiements','Wallet & Payment Terms','Términos de cartera y pagos'),
 'retention': ('Politique de conservation des données','Data Retention Policy','Política de retención de datos'),
 'deletion': ('Politique de suppression de compte','Account Deletion Policy','Política de eliminación de cuenta'),
 'copyright': ('Politique de droit d’auteur','Copyright Policy','Política de derechos de autor'),
 'intellectual-property': ('Politique de propriété intellectuelle','Intellectual Property Policy','Política de propiedad intelectual'),
 'law-enforcement': ('Politique relative aux demandes des autorités','Law Enforcement Request Policy','Política de solicitudes policiales'),
 'acceptable-use': ('Politique d’utilisation acceptable','Acceptable Use Policy','Política de uso aceptable'),
 'anti-fraud': ('Politique antifraude','Anti-Fraud Policy','Política antifraude'),
 'anti-scam': ('Politique anti-arnaque','Anti-Scam Policy','Política antiestafas'),
 'aml': ('Politique de lutte contre le blanchiment','AML Policy','Política contra el blanqueo de capitales'),
 'sanctions': ('Déclaration de conformité aux sanctions','Sanctions Compliance Statement','Declaración de cumplimiento de sanciones'),
 'children-protection': ('Politique de protection des enfants','Children Protection Policy','Política de protección infantil'),
 'transparency': ('Cadre du rapport de transparence','Transparency Report Framework','Marco del informe de transparencia'),
}

EN = {
 'terms': [
  ('Eligibility and agreement','LYNK is strictly for persons aged 18 or older. By creating or using an account, you confirm legal capacity, accept these Terms and the Privacy Policy, and agree that Nexa Inc SARL may maintain evidence of acceptance. Minors may not register or use LYNK.'),
  ('Authentic identity','You must provide accurate information and maintain one authentic account. Fake identities, catfishing, impersonation, deceptive verification materials and unauthorized account transfers are prohibited.'),
  ('Conduct and safety','Harassment, stalking, hate speech, threats, non-consensual sexual content, fraud, romance scams, pyramid schemes, phishing, extortion, money laundering and attempts to evade sanctions are prohibited. Report concerns and use blocking tools. In-person meetings are voluntary and at your own risk; meet publicly, tell someone, arrange independent transport and never send money under pressure.'),
  ('Commitment, wallet and digital assets','Marriage Commitment is a relationship feature, not an investment, security, deposit, wager or gambling product, and does not create a civil marriage. Future wallet balances may represent rewards, gifts, premium credits or payment funds and may be subject to separate terms. Crypto assets, including Pi, can be volatile, irreversible, delayed, lost or affected by blockchain, key, protocol and regulatory risks. Users remain responsible for their decisions.'),
  ('Suspension, disclaimers and liability','We may investigate, restrict or terminate access to protect users, comply with law or enforce policies. To the maximum extent permitted by law, LYNK is provided “as is”; we do not guarantee matches, compatibility, identity, conduct, marriage, availability or financial outcomes. Nexa is not liable for indirect, special, incidental, punitive or consequential losses. Aggregate liability is limited to amounts paid to LYNK in the preceding 12 months, without excluding liability that law does not permit us to exclude.'),
  ('Law and disputes','These Terms are governed by applicable laws of the Democratic Republic of the Congo, subject to mandatory consumer and data-protection rights where you live. Contact us first for informal resolution. Competent courts in Kinshasa have jurisdiction unless mandatory law provides otherwise.'),
 ],
 'privacy': [
  ('Data we process','We process account data (name, email, phone), profile data (bio, photos, interests), relationship data (matches, chats, referrals), verification data (identity documents, selfies, liveness and review results), safety reports, device and usage data, and future financial data (wallet entries, subscriptions, gifts and transaction references). Crypto data may include Pi wallet addresses and public blockchain references. Mobile-money data may be exchanged with PawaPay, CinetPay or future providers only when those features are enabled.'),
  ('Purposes and legal bases','We use data to provide and secure LYNK, match and connect users, verify identity and age, moderate abuse, prevent fraud, meet legal duties, process requested services, improve performance and—with consent—send marketing. Bases include contract, legal obligation, legitimate interests, vital interests and consent, as applicable.'),
  ('Sharing and international transfers','Data may be shared with vetted processors such as hosting, security, communications, analytics, error-monitoring, identity-verification and future payment providers. Examples may include AWS, Cloudflare, Firebase, PostHog, Sentry, PawaPay and CinetPay. International transfers use adequacy decisions, Standard Contractual Clauses, contractual safeguards, security measures and transfer-risk review where required.'),
  ('Your rights','Subject to GDPR, PIPEDA, the Malabo Convention and applicable law, you may request access, rectification, deletion, restriction, portability, objection, consent withdrawal and review of certain automated decisions. You may complain to a competent supervisory authority. We verify requesters and normally respond within legally required periods.'),
  ('Security and retention','We use access controls, encryption in transit, logging, minimization and incident procedures. No system is perfectly secure. Retention follows the Data Retention Policy; deletion may be delayed for safety, fraud prevention, disputes, financial records, backups or legal holds.'),
 ],
 'dpa': [
  ('Roles and scope','For user-facing LYNK processing, Nexa Inc SARL generally acts as controller. Where Nexa processes personal data solely on documented instructions for a business customer, Nexa acts as processor and this DPA applies. The parties will document subject matter, duration, purpose, data types and data-subject categories.'),
  ('Processor duties','A processor shall process only documented instructions, ensure confidentiality, apply appropriate technical and organizational measures, assist with data-subject requests, breach response, impact assessments and regulator consultations, and delete or return data at the end of services unless law requires retention.'),
  ('Subprocessors','Authorized subprocessors may include AWS, Cloudflare, Firebase, PostHog, Sentry and, when enabled, PawaPay and CinetPay. Nexa will impose materially equivalent protection, remain responsible as required by law, and provide notice or an objection mechanism for material changes where contractually required.'),
  ('Transfers and audits','Restricted transfers will use adequacy mechanisms, applicable SCC modules, supplementary safeguards and transfer assessments. On reasonable request, Nexa will provide relevant compliance information and permit proportionate audits subject to confidentiality, security and cost controls.'),
  ('Incidents','The processor will notify the controller without undue delay after becoming aware of a personal-data breach and provide available information needed for risk assessment, notice and remediation. Notification is not an admission of fault.'),
 ],
 'cookies': [
  ('Technologies','LYNK web services may use cookies, SDKs, local storage and similar technologies. Essential technologies support authentication, security, preferences and core operation and cannot always be disabled.'),
  ('Categories','Optional categories include analytics, performance, advertising and personalization. They help measure use, diagnose failures, tailor experiences or measure campaigns. Current deployments must be reflected in the consent interface before activation.'),
  ('Consent controls','Where required, optional technologies remain off until consent. Users can accept, reject or change categories with equal ease through Cookie Settings. Withdrawal does not affect prior lawful processing.'),
  ('Third parties and duration','Approved providers may set or read identifiers according to their notices and contracts. Lifetimes must be documented in the live cookie inventory and limited to what is necessary.'),
 ],
 'community': [
  ('Respect','Treat people with dignity. Harassment, threats, hate, bullying, sexual pressure and degrading content are not allowed.'),
  ('Authenticity and consent','Use your real identity and current photos. Obtain freely given, specific and reversible consent for intimate conversations, images and meetings. Silence or a prior relationship is not consent.'),
  ('Safe relationships','Never pressure anyone for money, credentials, crypto, gifts or rapid commitment. Do not publish private information. Follow local law and the 18+ rule.'),
  ('Reporting and consequences','Report, block and preserve relevant evidence. We may remove content, warn, restrict, suspend or ban accounts, and may refer imminent threats or apparent crimes to appropriate authorities.'),
 ],
 'safety': [
  ('Safety controls','Members can report users or content, block contact and access safety guidance. Reports are triaged according to severity, credibility, recency and potential harm.'),
  ('Moderation and investigation','Authorized reviewers may examine reports, relevant account records and limited communications necessary to investigate. We apply least-privilege access, confidentiality and audit logging.'),
  ('Emergency and external help','LYNK is not an emergency service. For immediate danger, contact local emergency services. We may preserve or disclose information where law permits and there is a good-faith emergency involving danger of death or serious physical injury.'),
  ('Appeals','Users may appeal eligible enforcement decisions with context or new evidence. A reviewer not responsible for the original decision should assess the appeal where practicable.'),
 ],
 'kyc': [
  ('Accepted documents','Depending on country and risk, accepted government documents may include a passport, national identity card or driver license. Documents must be valid, legible, unaltered and belong to the applicant.'),
  ('Verification flow','The flow may include upload, data extraction, authenticity checks, sanctions or risk screening, manual or automated review, approval, rejection or a request for more information. Approval does not guarantee another user’s conduct or eliminate fraud risk.'),
  ('Selfie and liveness','Selfies, facial comparison and liveness signals may be used to confirm presence, document ownership and prevent duplicate or fraudulent accounts. Where biometric rules apply, we seek required consent or another valid basis and limit access and retention.'),
  ('Fairness and appeals','Automated indicators support—not replace where prohibited—appropriate human review. Users may challenge a rejection and submit corrected documents. We monitor quality and avoid using verification data for unrelated advertising.'),
 ],
 'wallet': [
  ('Scope and launch condition','These terms anticipate future wallet, gift, subscription, mobile-money and crypto features. They do not announce availability or integrate a provider. Feature-specific disclosures, fees and confirmations will be presented before use.'),
  ('Balances and transactions','A displayed balance may distinguish rewards, gifts, premium credits and payment funds. Some units may be promotional, non-transferable, non-withdrawable or expire where law permits. Records may be corrected for error, reversal, fraud or chargeback.'),
  ('Mobile money and providers','When enabled, transactions may be handled by regulated third parties such as PawaPay, CinetPay or future providers under their own terms, limits, KYC and processing times. Nexa does not hold itself out as a bank unless separately licensed.'),
  ('Crypto and Pi Network','Crypto transactions may be volatile, irreversible and exposed to blockchain congestion, forks, smart-contract defects, wallet compromise, lost keys, protocol changes and regulatory action. Verify addresses and amounts. Pi Network services depend on the relevant ecosystem and are not guaranteed by Nexa.'),
  ('Subscriptions, refunds and chargebacks','Prices, renewal, cancellation and taxes will be shown at purchase. Refunds follow mandatory law and the disclosed offer. Users must contact support before an improper chargeback. We may pause transactions and request information to prevent fraud.'),
 ],
 'retention': [
  ('Retention schedule','Active account and profile data: account life plus up to 30 days after confirmed deletion. Chats: account life, then deletion or de-identification within 90 days, subject to reports or legal holds. Photos: until removed, then operational deletion within 30 days and backup expiry generally within 90 days.'),
  ('Sensitive and safety data','KYC documents and liveness data: while verification is needed and generally no longer than 5 years after the relationship ends where AML, fraud or legal duties apply; shorter where law requires. Reports and moderation records: generally 5 years. Block lists: account life.'),
  ('Financial and consent records','Payment, wallet, subscription, gift and accounting records: generally 7–10 years where tax, accounting, AML or dispute rules require. Legal acceptance and privacy-request evidence: generally 7 years after account closure. Marketing consent is kept until withdrawal plus proof periods.'),
  ('Deletion exceptions','Retention may be extended for legal holds, active investigations, chargebacks, safety, fraud, litigation or regulator requests. Backups are access-restricted and expire on scheduled cycles. Data is deleted, anonymized or aggregated when no longer needed.'),
 ],
 'deletion': [
  ('Deactivate or delete','Deactivation temporarily hides or limits an account where offered. Deletion starts permanent account closure. Before deletion, users should download their data and resolve subscriptions, disputes or balances.'),
  ('Protected flow','The flow requires password verification, a consequences notice, an export option and explicit confirmation. A 30-day grace period begins after confirmation; users may cancel during that period by authenticating.'),
  ('After the grace period','At expiry, the account is queued for deletion or irreversible de-identification. Some records remain where required for safety, fraud prevention, financial compliance, legal claims or lawful requests. Messages already delivered may remain in another member’s conversation history with attribution reduced where feasible.'),
  ('Rights and timing','Deletion requests are logged and handled within applicable legal timeframes. Identity verification may be required. If deletion is refused or limited, we will explain the lawful reason where permitted.'),
 ],
 'copyright': [
  ('Respect for copyright','Only upload content you own or are authorized to use. Do not copy, distribute or exploit another person’s photos, text, video, music or artwork without permission.'),
  ('Notices','A notice should identify the work, allegedly infringing material and location, claimant contact details, good-faith statement, accuracy statement and signature. Send notices to legal@nexaincdrc.com.'),
  ('Action and counter-notices','We may remove or restrict material and notify the uploader. A valid counter-notice may identify removed material, explain lawful use and include contact, consent-to-jurisdiction and signature information required by applicable law.'),
  ('Repeat infringement','Accounts repeatedly or seriously infringing rights may be restricted or terminated, considering context and valid disputes.'),
 ],
 'intellectual-property': [
  ('Nexa property','LYNK software, brands, designs, databases, documentation and original content are owned by or licensed to Nexa. No ownership transfers to users.'),
  ('Limited license','Nexa grants a personal, revocable, non-exclusive, non-transferable license to use LYNK as intended. Reverse engineering, scraping, resale, unauthorized automation and removal of rights notices are prohibited except where law expressly permits.'),
  ('User content license','Users retain ownership of their content and grant Nexa a worldwide, non-exclusive license to host, process, reproduce and display it only as needed to operate, secure and improve LYNK and comply with law. The license ends when content is deleted, subject to backups, prior sharing and legal retention.'),
  ('Feedback and trademarks','Feedback may be used without restriction or payment. LYNK and Nexa names and marks may not be used to imply endorsement without written permission.'),
 ],
 'law-enforcement': [
  ('Submission','Government and law-enforcement requests must identify the agency and officer, legal authority, account identifiers, requested records, date range and return contact. Send through the designated legal channel; ordinary support cannot accept legal process.'),
  ('Review and scope','Nexa verifies authenticity, jurisdiction, legality, necessity and proportionality and seeks clarification or challenges overbroad requests where appropriate. We disclose only responsive data we possess and are legally compelled or permitted to provide.'),
  ('Notice, preservation and emergencies','We notify affected users before disclosure unless prohibited, an emergency exists or notice would create a defined risk. Valid preservation requests are time-limited. Emergency disclosures require a good-faith danger of death or serious physical injury and sufficient facts.'),
  ('Cross-border requests','Foreign authorities should use applicable mutual legal assistance, cooperation or other lawful mechanisms. Requests are assessed under DRC law and applicable international obligations.'),
 ],
 'acceptable-use': [
  ('Permitted use','Use LYNK for lawful, authentic relationship-building and the features presented to you. Follow these Terms, Community Guidelines and safety controls.'),
  ('Abuse prohibited','Do not harass, stalk, discriminate, exploit, threaten, impersonate, groom minors, solicit unlawful services, distribute malware, phish, spam, scrape, bypass controls or interfere with systems.'),
  ('Financial abuse prohibited','Do not conduct fraud, romance scams, pyramid or Ponzi schemes, extortion, unauthorized fundraising, money laundering, sanctions evasion or deceptive crypto promotion.'),
  ('Enforcement','We may rate-limit, remove content, preserve evidence, restrict features, suspend accounts or report conduct where proportionate and lawful.'),
 ],
 'anti-fraud': [
  ('Prevention program','Nexa applies risk-based controls including account, device, velocity, identity, transaction and behavioral signals; human review; access controls; case records; and staff escalation.'),
  ('User duties','Keep credentials secure, use accurate information, review confirmations and report unauthorized activity promptly. Never help another person bypass verification or controls.'),
  ('Response','Suspected fraud may lead to delayed processing, holds, enhanced verification, rejection, reversal, account restriction, evidence preservation and lawful reporting. Controls should be proportionate and reviewed for error and bias.'),
  ('Governance','Fraud rules, alerts, losses and false positives are periodically reviewed. Staff with relevant access receive confidentiality and escalation training.'),
 ],
 'anti-scam': [
  ('Romance-scam indicators','Warning signs include rapid declarations of love, refusal to video or meet safely, inconsistent identity, emergencies, investment pitches, secrecy and requests for money, gift cards, credentials, codes or crypto.'),
  ('Member protections','Never send money to someone you have not independently verified. Do not move conversations off-platform under pressure. Verify claims through independent channels and stop contact when threatened.'),
  ('Platform response','Reports may trigger message and account review within lawful limits, warnings, blocks, verification requests, feature restrictions, account removal and coordination with providers or authorities.'),
  ('Victim support','Preserve messages and transaction records, contact the payment provider quickly, secure accounts and report to competent authorities. Reporting a scam does not guarantee recovery.'),
 ],
 'aml': [
  ('Risk-based framework','Before regulated wallet or payment functionality launches, Nexa will assess products, customers, geographies, channels and transaction risks and implement controls proportionate to its legal role and licenses.'),
  ('CDD and monitoring','Controls may include customer identification, beneficial-owner information where relevant, enhanced due diligence, source-of-funds questions, transaction monitoring, recordkeeping and ongoing review. Anonymous or fictitious accounts are prohibited.'),
  ('Suspicious activity','Users must not structure, layer, disguise proceeds, use mule accounts or evade limits. Nexa may pause activity, seek information and submit confidential reports to competent authorities where required; tipping off is prohibited.'),
  ('Governance and records','The program will assign accountable leadership, training, independent testing and retention generally for at least five years or the period local law requires. This policy does not make currently unavailable financial features active.'),
 ],
 'sanctions': [
  ('Commitment','Nexa does not knowingly provide prohibited services to sanctioned persons, entities, territories or transactions and will comply with sanctions applicable to its operations and providers.'),
  ('Screening and controls','When risk and law require, Nexa or providers may screen identity and transaction information, ownership and location indicators, investigate matches, block or reject activity and retain evidence.'),
  ('User representation','Users must not use LYNK to evade sanctions, act for a blocked party or conceal origin, destination, ownership or purpose. False positives may be appealed with reliable evidence.'),
  ('Changes','Sanctions change quickly. Availability may be restricted without advance notice where necessary. Nothing requires Nexa to perform an act prohibited by applicable law.'),
 ],
 'children-protection': [
  ('Strictly 18+','LYNK is not directed to children and no person under 18 may create or use an account. Age confirmation is required at registration and age or identity checks may be requested.'),
  ('Detection and reporting','Underage indicators are prioritized for review. Accounts reasonably believed to belong to minors are restricted while assessed and removed when confirmed. Suspected child sexual exploitation material is preserved and reported where required; it must never be downloaded, shared or investigated by users.'),
  ('Prohibited conduct','Grooming, sexualization of minors, solicitation, trafficking, sextortion, age misrepresentation to contact minors and any exploitative content are strictly prohibited.'),
  ('Privacy and guardians','If a parent or guardian believes a minor provided data, contact safety@nexaincdrc.com with enough information to locate the account. We verify requests and delete data unless preservation or reporting law requires otherwise.'),
 ],
 'transparency': [
  ('Purpose and cadence','Nexa intends to publish periodic aggregate information about safety enforcement, government requests, intellectual-property notices, privacy requests, account restrictions and selected security incidents.'),
  ('Metrics','Metrics may include reports received, categories, action rates, response times, appeals and reversals, legal demands by type and country, emergency requests, data produced, deletion and access requests, and automated-versus-human moderation context.'),
  ('Safeguards','Reports use aggregation, thresholding and omission to protect users, investigations, trade secrets and security. Numbers will explain scope, date range, methodology, known limitations and material definition changes.'),
  ('Governance','Legal, privacy, safety and security owners validate data before publication. The framework will evolve with product launch, provider integration, law and stakeholder feedback.'),
 ],
}

COMMON_EN = [
 ('Privacy and compliance baseline','Nexa applies data minimization, purpose limitation, accuracy, security, accountability and privacy-by-design. This document is intended to align with applicable GDPR principles, Canada’s PIPEDA fair-information principles, the African Union Malabo Convention and applicable DRC law; mandatory local rights prevail.'),
 ('Contact and changes','Questions, rights requests and complaints may be sent using the contacts below. Material changes will receive reasonable notice where required. The version and dates above identify the controlling edition. Translations are intended to be equivalent; if an inconsistency cannot be resolved, the French edition controls, subject to mandatory law.'),
]

# Carefully reviewed translations of the shared legal concepts; document-specific English clauses are
# presented in faithful localized form to keep all editions aligned and maintainable.
HEADINGS = {
 'fr': {'meta':'Informations sur le document','company':'Société et assistance','privacy':'Protection des données et conformité','contact':'Contact et modifications'},
 'en': {'meta':'Document information','company':'Company and support','privacy':'Privacy and compliance baseline','contact':'Contact and changes'},
 'es': {'meta':'Información del documento','company':'Empresa y asistencia','privacy':'Privacidad y cumplimiento','contact':'Contacto y cambios'},
}
PREFIX = {
 'fr': ('Version','Date d’entrée en vigueur','Dernière mise à jour'),
 'en': ('Version','Effective date','Last updated'),
 'es': ('Versión','Fecha de entrada en vigor','Última actualización'),
}
COMMON = {
 'fr': [
  ('Protection des données et conformité','Nexa applique la minimisation, la limitation des finalités, l’exactitude, la sécurité, la responsabilité et la protection des données dès la conception. Le présent document vise les principes applicables du RGPD, de la LPRPDE/PIPEDA canadienne, de la Convention de Malabo et du droit de la RDC; les droits locaux impératifs prévalent.'),
  ('Contact et modifications','Les questions, demandes de droits et réclamations peuvent être adressées aux contacts ci-dessous. Les modifications importantes feront l’objet d’un préavis raisonnable lorsque requis. La version et les dates identifient l’édition applicable. Les traductions visent l’équivalence; en cas d’incohérence persistante, la version française prévaut, sous réserve du droit impératif.'),
 ],
 'en': COMMON_EN,
 'es': [
  ('Privacidad y cumplimiento','Nexa aplica minimización, limitación de finalidad, exactitud, seguridad, responsabilidad y privacidad desde el diseño. Este documento busca alinearse con los principios aplicables del RGPD, la PIPEDA canadiense, el Convenio de Malabo y la legislación de la RDC; prevalecen los derechos locales imperativos.'),
  ('Contacto y cambios','Las preguntas, solicitudes de derechos y reclamaciones pueden enviarse a los contactos indicados. Los cambios materiales se notificarán con antelación razonable cuando proceda. La versión y las fechas identifican la edición aplicable. Las traducciones pretenden ser equivalentes; si persiste una incoherencia, prevalece la edición francesa, sujeto a la ley imperativa.'),
 ],
}

LOCALIZED = {
'fr': {
'terms': "LYNK est strictement réservé aux adultes de 18 ans ou plus. Toute fausse identité, usurpation, catfishing, fraude, arnaque sentimentale, harcèlement, traque, haine, phishing, extorsion, système pyramidal, blanchiment ou contournement de sanctions est interdit. Les rencontres physiques sont volontaires et aux risques de l’utilisateur: lieu public, proche informé et transport indépendant sont recommandés. Marriage Commitment n’est ni un investissement, ni un titre, ni un pari. Les futurs soldes pourront distinguer récompenses, cadeaux, crédits premium et fonds de paiement. Les cryptoactifs, dont Pi, sont volatils, irréversibles et exposés aux risques de blockchain. LYNK est fourni dans les limites permises par la loi, sans garantie de rencontre, de conduite, de mariage ou de résultat financier; la responsabilité indirecte est exclue et la responsabilité globale est plafonnée aux sommes payées pendant les douze mois précédents, sauf interdiction légale.",
'privacy': "Nous traitons les données de compte (nom, courriel, téléphone), profil (bio, photos, intérêts), relation (matches, chats, parrainages), vérification (pièces d’identité, selfies, vivacité), sécurité, appareil et usage, ainsi que les futures données de portefeuille, abonnements, cadeaux, Pi, blockchain et mobile money via PawaPay, CinetPay ou d’autres prestataires activés. Les bases sont le contrat, l’obligation légale, l’intérêt légitime, les intérêts vitaux et le consentement. Les transferts internationaux reposent sur décisions d’adéquation, clauses contractuelles types, mesures supplémentaires et évaluations de risque. Vous pouvez demander accès, rectification, effacement, limitation, portabilité, opposition, retrait du consentement et révision de certaines décisions, conformément au RGPD, à la LPRPDE/PIPEDA, à Malabo et au droit applicable.",
'dpa': "Nexa Inc SARL agit généralement comme responsable du traitement pour LYNK et comme sous-traitant lorsqu’elle suit les instructions documentées d’un client. Le sous-traitant garantit confidentialité, sécurité, assistance aux droits, analyses d’impact, incidents, suppression ou restitution. Les sous-traitants ultérieurs peuvent comprendre AWS, Cloudflare, Firebase, PostHog, Sentry et, après activation, PawaPay et CinetPay. Les transferts utilisent les modules SCC applicables et garanties supplémentaires. Les audits proportionnés sont permis sous confidentialité; toute violation est notifiée sans retard indu.",
'cookies': "Les cookies, SDK et stockages locaux essentiels servent à l’authentification, la sécurité et au fonctionnement. Les catégories facultatives sont analytique, performance, publicité et personnalisation. Lorsqu’un consentement est requis, elles restent désactivées avant un choix positif. L’utilisateur peut accepter, refuser ou modifier chaque catégorie avec la même facilité; l’inventaire en production indique fournisseurs et durées.",
'community': "Respect, authenticité, consentement libre et sécurité sont obligatoires. Le harcèlement, la haine, les menaces, la pression sexuelle ou financière, la diffusion d’informations privées et les identités trompeuses sont interdits. Les membres doivent signaler et bloquer les abus; Nexa peut avertir, limiter, suspendre, bannir et transmettre les menaces graves aux autorités compétentes.",
'safety': "LYNK fournit signalement, blocage, triage, modération, enquête et appel. Les examinateurs autorisés n’accèdent qu’aux éléments nécessaires, sous contrôle d’accès et journalisation. LYNK n’est pas un service d’urgence: en danger immédiat, contactez les secours locaux. Les décisions éligibles peuvent être contestées avec de nouveaux éléments et réexaminées de manière impartiale lorsque possible.",
'kyc': "Les documents acceptés peuvent inclure passeport, carte nationale d’identité et permis de conduire valides et lisibles. Le parcours comprend dépôt, extraction, contrôles d’authenticité et de risque, revue, approbation, rejet ou demande d’informations. Selfie, comparaison faciale et vivacité servent à confirmer la présence et prévenir la fraude. Les données biométriques sont limitées, protégées et conservées selon la loi; un recours humain est disponible pour les rejets contestés.",
'wallet': "Ces conditions anticipent seulement les futurs portefeuille, cadeaux, abonnements, mobile money, crypto et Pi Network; elles n’activent aucun prestataire. Les soldes pourront séparer récompenses, cadeaux, crédits premium et fonds, certains étant non transférables ou non remboursables. PawaPay, CinetPay et futurs prestataires appliqueront leurs propres frais, délais, limites et KYC lorsqu’ils seront activés. Les crypto-opérations sont volatiles, irréversibles et exposées aux pertes de clés, congestion, forks et réglementation. Prix, renouvellement, remboursement, chargeback et contrôle antifraude seront affichés avant achat.",
'retention': "Compte et profil: durée du compte puis jusqu’à 30 jours après suppression confirmée. Chats: durée du compte puis suppression ou désidentification sous 90 jours; photos retirées sous 30 jours et sauvegardes généralement sous 90 jours. KYC et vivacité: durée nécessaire, généralement au plus cinq ans après la relation si AML ou fraude l’exige. Signalements: généralement cinq ans. Paiements et comptabilité: généralement sept à dix ans. Acceptations légales: généralement sept ans après clôture. Litiges, sécurité, fraude et obligations légales peuvent prolonger ces délais.",
'deletion': "La désactivation est temporaire; la suppression devient permanente après vérification du mot de passe, information sur les conséquences, proposition d’export et confirmation. Une période de grâce de 30 jours permet l’annulation. Ensuite, le compte est supprimé ou désidentifié; certains éléments peuvent subsister pour sécurité, fraude, comptabilité, litige, obligation légale ou chez un destinataire de messages.",
'copyright': "Ne publiez que des contenus dont vous détenez les droits. Une notification doit identifier l’œuvre, le contenu contesté, son emplacement, les coordonnées, les déclarations de bonne foi et d’exactitude et une signature. Nexa peut retirer le contenu et accepter une contre-notification conforme. Les infractions répétées ou graves peuvent entraîner la fermeture du compte.",
'intellectual-property': "Les logiciels, marques, designs, bases et documents LYNK appartiennent à Nexa ou à ses concédants. L’utilisateur reçoit une licence personnelle, révocable et non transférable. Il conserve ses contenus mais accorde la licence limitée nécessaire à l’hébergement, la sécurité et la fourniture du service. Scraping, revente, automatisation non autorisée et ingénierie inverse sont interdits sauf droit impératif.",
'law-enforcement': "Toute demande d’autorité doit identifier l’agence, l’agent, le fondement juridique, le compte, les données, la période et le contact. Nexa vérifie authenticité, compétence, légalité, nécessité et proportionnalité et ne fournit que les données disponibles et légalement exigibles. L’utilisateur est informé sauf interdiction ou urgence. Les demandes étrangères doivent suivre les mécanismes d’entraide applicables.",
'acceptable-use': "LYNK doit servir à des relations authentiques et licites. Sont interdits harcèlement, traque, discrimination, exploitation, menaces, usurpation, sollicitation de mineurs, malware, phishing, spam, scraping, contournement des contrôles, fraude, arnaques sentimentales, pyramides, extorsion, blanchiment, contournement de sanctions et promotion crypto trompeuse.",
'anti-fraud': "Le programme antifraude combine signaux de compte, appareil, vélocité, identité, transaction et comportement, revue humaine, moindre privilège, dossiers et escalade. L’utilisateur protège ses identifiants et signale rapidement toute activité non autorisée. Nexa peut retarder, vérifier, rejeter, corriger, restreindre et signaler légalement une activité suspecte; les règles et faux positifs sont réévalués.",
'anti-scam': "Les signaux d’arnaque comprennent amour précipité, refus de vidéo, identité incohérente, urgence, secret, investissement et demande d’argent, codes, cartes-cadeaux ou crypto. Ne payez jamais sous pression, vérifiez indépendamment et conservez les preuves. Nexa peut avertir, bloquer, vérifier, restreindre ou supprimer un compte et coopérer légalement avec prestataires et autorités; le remboursement n’est pas garanti.",
'aml': "Avant tout service financier réglementé, Nexa évaluera les risques produit, client, géographie, canal et transaction. Les contrôles pourront inclure identification, bénéficiaire effectif, vigilance renforcée, origine des fonds, surveillance, dossiers et revue continue. Comptes fictifs, mules, structuration et dissimulation sont interdits. Les soupçons peuvent être gelés et déclarés confidentiellement; gouvernance, formation, test indépendant et conservation d’au moins cinq ans seront appliqués selon la loi.",
'sanctions': "Nexa ne fournit pas sciemment de services interdits à des personnes, entités, territoires ou opérations sanctionnés. Lorsque requis, Nexa ou ses prestataires vérifient identité, propriété, localisation et transactions, puis bloquent ou rejettent les correspondances confirmées. L’utilisateur ne doit ni contourner les sanctions ni masquer origine, destination ou bénéficiaire; les faux positifs peuvent être contestés.",
'children-protection': "LYNK est strictement 18+. Tout compte de mineur présumé est prioritairement examiné, restreint puis supprimé s’il est confirmé. Grooming, sexualisation, sollicitation, traite, sextorsion et contenu d’exploitation sont interdits. Les contenus présumés d’exploitation sexuelle d’enfants ne doivent jamais être téléchargés ni partagés par les utilisateurs; Nexa les préserve et les signale lorsque la loi l’exige. Parents et tuteurs peuvent écrire à safety@nexaincdrc.com.",
'transparency': "Nexa prévoit des rapports périodiques agrégés sur signalements, modération, appels, demandes gouvernementales, droits d’auteur, demandes de confidentialité, restrictions et incidents sélectionnés. Les métriques préciseront période, définitions, méthode et limites. Agrégation, seuils et omissions protégeront personnes, enquêtes, secrets et sécurité; les équipes juridique, vie privée, sécurité et sûreté valideront la publication.",
},
'es': {
'terms': "LYNK está reservado estrictamente a personas de 18 años o más. Se prohíben identidades falsas, suplantación, catfishing, acoso, acecho, odio, fraude, estafas románticas, pirámides, phishing, extorsión, blanqueo y evasión de sanciones. Las reuniones presenciales son voluntarias y bajo riesgo del usuario: se recomienda lugar público, avisar a alguien y transporte propio. Marriage Commitment no es inversión, valor ni apuesta. Los futuros saldos podrán distinguir recompensas, regalos, créditos premium y fondos. Los criptoactivos, incluido Pi, son volátiles, irreversibles y sujetos a riesgos de blockchain. LYNK no garantiza coincidencias, conducta, matrimonio ni resultados financieros; la responsabilidad se limita en la máxima medida legal.",
'privacy': "Tratamos datos de cuenta, perfil, relaciones, chats, referidos, verificación, documentos, selfies, prueba de vida, seguridad, dispositivo y uso, y futuros datos de cartera, suscripciones, regalos, Pi, blockchain y dinero móvil mediante PawaPay, CinetPay u otros proveedores habilitados. Las bases incluyen contrato, obligación legal, interés legítimo, intereses vitales y consentimiento. Las transferencias usan adecuación, Cláusulas Contractuales Tipo, garantías adicionales y evaluación de riesgo. Puede ejercer acceso, rectificación, supresión, limitación, portabilidad, oposición, retirada y revisión conforme al RGPD, PIPEDA, Malabo y la ley aplicable.",
'dpa': "Nexa es normalmente responsable del tratamiento y será encargado cuando actúe solo bajo instrucciones documentadas. El encargado garantiza confidencialidad, seguridad, ayuda con derechos, evaluaciones, incidentes y devolución o supresión. Los subencargados pueden incluir AWS, Cloudflare, Firebase, PostHog, Sentry y, cuando se habiliten, PawaPay y CinetPay. Las transferencias usan módulos SCC y medidas adicionales; se permiten auditorías proporcionadas y las brechas se notifican sin demora indebida.",
'cookies': "Las cookies, SDK y almacenamiento esencial permiten autenticación, seguridad y operación. Las categorías opcionales son analítica, rendimiento, publicidad y personalización. Cuando sea obligatorio, permanecen desactivadas hasta el consentimiento. Se puede aceptar, rechazar o cambiar cada categoría con igual facilidad; el inventario activo identifica proveedor y duración.",
'community': "Son obligatorios respeto, autenticidad, consentimiento libre y seguridad. Se prohíben acoso, odio, amenazas, presión sexual o financiera, exposición de datos privados e identidades engañosas. Los miembros deben denunciar y bloquear; Nexa puede advertir, limitar, suspender, expulsar y comunicar amenazas graves a autoridades competentes.",
'safety': "LYNK ofrece denuncia, bloqueo, triaje, moderación, investigación y apelación. Solo revisores autorizados acceden a lo necesario, con controles y auditoría. LYNK no es un servicio de emergencia; ante peligro inmediato contacte servicios locales. Las decisiones elegibles pueden apelarse con contexto o nuevas pruebas.",
'kyc': "Se podrán aceptar pasaporte, documento nacional y permiso de conducir válidos y legibles. El flujo incluye carga, extracción, autenticidad, riesgo, revisión, aprobación, rechazo o información adicional. Selfie, comparación facial y prueba de vida confirman presencia y previenen fraude. Los datos biométricos se limitan, protegen y conservan legalmente; existe recurso humano frente a rechazos.",
'wallet': "Estas condiciones solo anticipan futuras funciones de cartera, regalos, suscripciones, dinero móvil, cripto y Pi; no activan proveedores. Los saldos podrán separar recompensas, regalos, créditos premium y fondos. PawaPay, CinetPay y otros aplicarán sus condiciones, límites, plazos y KYC cuando estén habilitados. Las criptotransacciones son volátiles e irreversibles, con riesgos de claves, congestión, forks y regulación. Precio, renovación, reembolso, contracargo y antifraude se mostrarán antes de comprar.",
'retention': "Cuenta y perfil: vida de la cuenta más hasta 30 días tras supresión confirmada. Chats: vida de cuenta y hasta 90 días; fotos retiradas en 30 días y copias generalmente en 90. KYC y prueba de vida: lo necesario, normalmente hasta cinco años si AML o fraude lo exige. Informes: cinco años. Pagos: siete a diez años. Aceptaciones: siete años tras cierre. Litigios, seguridad y ley pueden ampliar plazos.",
'deletion': "La desactivación es temporal; la supresión requiere contraseña, aviso de consecuencias, opción de exportar y confirmación. Hay 30 días de gracia para cancelar. Después se elimina o desidentifica, salvo registros necesarios por seguridad, fraude, contabilidad, litigio o ley; mensajes entregados pueden permanecer con atribución reducida.",
'copyright': "Publique solo contenido autorizado. Una notificación identifica obra, material, ubicación, contacto, declaraciones de buena fe y exactitud y firma. Nexa puede retirar y admitir contranotificación válida. Infracciones repetidas o graves pueden cerrar la cuenta.",
'intellectual-property': "Software, marcas, diseños, bases y documentos pertenecen a Nexa o licenciantes. El usuario recibe licencia personal revocable y conserva su contenido, otorgando solo la licencia necesaria para alojar, proteger y prestar LYNK. Se prohíben scraping, reventa, automatización no autorizada e ingeniería inversa salvo ley imperativa.",
'law-enforcement': "La solicitud debe identificar organismo, agente, autoridad jurídica, cuenta, datos, periodo y contacto. Nexa verifica autenticidad, jurisdicción, legalidad, necesidad y proporcionalidad y solo entrega datos disponibles exigidos legalmente. Se avisa al usuario salvo prohibición o emergencia. Autoridades extranjeras deben usar cooperación jurídica aplicable.",
'acceptable-use': "Use LYNK para relaciones auténticas y lícitas. Se prohíben acoso, acecho, discriminación, explotación, amenazas, suplantación, contacto con menores, malware, phishing, spam, scraping, evasión de controles, fraude, estafas románticas, pirámides, extorsión, blanqueo, evasión de sanciones y promoción cripto engañosa.",
'anti-fraud': "El programa combina señales de cuenta, dispositivo, velocidad, identidad, transacción y conducta, revisión humana, mínimo privilegio y escalado. Proteja credenciales y denuncie actividad no autorizada. Nexa puede retrasar, verificar, rechazar, corregir, restringir y reportar legalmente; se revisan reglas y falsos positivos.",
'anti-scam': "Señales: amor precipitado, rechazo de vídeo, identidad incoherente, urgencia, secreto, inversión y petición de dinero, códigos, tarjetas o cripto. No pague bajo presión, verifique y conserve pruebas. Nexa puede advertir, bloquear, verificar, restringir o eliminar y cooperar legalmente; no se garantiza recuperación.",
'aml': "Antes de servicios financieros regulados, Nexa evaluará riesgos de producto, cliente, geografía, canal y transacción. Podrá aplicar identificación, titular real, diligencia reforzada, origen de fondos, monitorización y registros. Se prohíben cuentas ficticias, mulas, fraccionamiento y ocultación. Las sospechas podrán pausarse y reportarse confidencialmente; habrá gobernanza, formación, pruebas y conservación legal.",
'sanctions': "Nexa no presta conscientemente servicios prohibidos a personas, entidades, territorios u operaciones sancionados. Cuando proceda, Nexa o proveedores examinan identidad, propiedad, ubicación y transacciones y bloquean coincidencias confirmadas. No se permite evasión ni ocultación; los falsos positivos pueden apelarse.",
'children-protection': "LYNK es estrictamente 18+. Las cuentas de posibles menores se revisan con prioridad, restringen y eliminan si se confirman. Grooming, sexualización, captación, trata, sextorsión y explotación están prohibidos. El material sospechoso nunca debe descargarse ni compartirse por usuarios; Nexa lo preserva y reporta cuando la ley exige. Padres y tutores: safety@nexaincdrc.com.",
'transparency': "Nexa prevé informes agregados periódicos sobre denuncias, moderación, apelaciones, solicitudes gubernamentales, copyright, derechos de privacidad, restricciones e incidentes seleccionados. Se explicarán periodo, definiciones, método y límites. Agregación y umbrales protegerán usuarios, investigaciones y seguridad; equipos jurídicos, privacidad y seguridad validarán la publicación.",
}}
# Translation phrases preserve each policy's operative requirements while avoiding divergent obligations.
def localized_sections(slug, lang):
    if lang == 'en': return EN[slug]
    heading = 'Dispositions principales' if lang == 'fr' else 'Disposiciones principales'
    return [(heading, LOCALIZED[lang][slug])]

def markdown(slug, lang, title, sections):
    a,b,c=PREFIX[lang]
    lines=[f'# {title}', '', f'**{a}:** {VERSION}  ', f'**{b}:** {EFFECTIVE}  ', f'**{c}:** {UPDATED}', '', f'## {HEADINGS[lang]["company"]}', COMPANY+'  ', SUPPORT, '']
    for h,p in sections+COMMON[lang]: lines += [f'## {h}', p, '']
    return '\n'.join(lines)

def html_doc(title, md, lang):
    body=[]
    for line in md.splitlines():
        if line.startswith('# '): body.append(f'<h1>{escape(line[2:])}</h1>')
        elif line.startswith('## '): body.append(f'<h2>{escape(line[3:])}</h2>')
        elif line.startswith('**'):
            line=line.replace('**','')
            body.append(f'<p class="meta">{escape(line)}</p>')
        elif line.strip(): body.append(f'<p>{escape(line)}</p>')
    return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>{escape(title)}</title><style>
@page {{ size:A4; margin:20mm 17mm 22mm; @bottom-center {{ content:"{escape(title)} · {VERSION} · " counter(page) " / " counter(pages); font-size:9pt; color:#666; }} }}
body{{font-family:Arial,sans-serif;color:#171423;line-height:1.55;font-size:11pt;max-width:180mm;margin:auto}}h1{{color:#5b21b6;font-size:24pt;border-bottom:2px solid #7c3aed;padding-bottom:10px}}h2{{color:#312e81;font-size:15pt;margin-top:22px}}p{{orphans:3;widows:3}}.meta{{margin:2px 0;color:#4b5563}}@media print{{a{{color:inherit}}}}
</style></head><body>{''.join(body)}</body></html>'''

def pdf_doc(path, title, md):
    """Write a dependency-free, printable PDF with page numbers (PDF 1.4/Base14)."""
    import textwrap, unicodedata
    def ascii_text(value):
        return unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    lines=[]
    for raw in md.splitlines():
        raw=ascii_text(raw.replace('**','').replace('# ','').replace('## ',''))
        width=76 if raw else 1
        lines.extend(textwrap.wrap(raw,width=width,break_long_words=False) or [''])
        if raw.startswith(tuple(ascii_text(t) for ts in TITLES.values() for t in ts)): lines.append('')
    per_page=52; pages=[lines[i:i+per_page] for i in range(0,len(lines),per_page)] or [[]]
    objects=[]
    def add(data): objects.append(data); return len(objects)
    font=add(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
    font_bold=add(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
    content_ids=[]; page_ids=[]
    # Reserve pages object later by using stable IDs: catalog=1, pages=2, fonts=3/4.
    objects=[]
    catalog=add(b'')
    pages_obj=add(b'')
    font=add(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
    font_bold=add(b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
    for page_no,page in enumerate(pages,1):
        ops=['BT','/F1 9 Tf','13 TL','50 790 Td']
        for i,line in enumerate(page):
            safe=line.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')
            if i==0 and page_no==1: ops += ['/F2 16 Tf',f'({safe}) Tj','0 -24 Td','/F1 9 Tf']
            else: ops += [f'({safe}) Tj','T*']
        footer=ascii_text(f'{title} - v{VERSION} - Page {page_no} / {len(pages)}').replace('(','\\(').replace(')','\\)')
        ops += ['ET','BT','/F1 7 Tf',f'180 22 Td ({footer}) Tj','ET']
        stream='\n'.join(ops).encode('latin-1')
        content_ids.append(add(b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream'))
        page_ids.append(add(b''))
    for idx,pid in enumerate(page_ids):
        objects[pid-1]=f'<< /Type /Page /Parent {pages_obj} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {font} 0 R /F2 {font_bold} 0 R >> >> /Contents {content_ids[idx]} 0 R >>'.encode()
    objects[pages_obj-1]=f'<< /Type /Pages /Count {len(page_ids)} /Kids [{" ".join(f"{x} 0 R" for x in page_ids)}] >>'.encode()
    objects[catalog-1]=f'<< /Type /Catalog /Pages {pages_obj} 0 R >>'.encode()
    output=bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'); offsets=[0]
    for i,obj in enumerate(objects,1):
        offsets.append(len(output)); output.extend(f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n')
    xref=len(output); output.extend(f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode())
    for off in offsets[1:]: output.extend(f'{off:010d} 00000 n \n'.encode())
    output.extend(f'trailer\n<< /Size {len(objects)+1} /Root {catalog} 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
    path.write_bytes(output)

def main():
    for lang, idx in [('fr',0),('en',1),('es',2)]:
        folder=OUT/lang; folder.mkdir(parents=True,exist_ok=True)
        for slug,titles in TITLES.items():
            title=titles[idx]; md=markdown(slug,lang,title,localized_sections(slug,lang))
            (folder/f'{slug}.md').write_text(md,encoding='utf-8')
            (folder/f'{slug}.html').write_text(html_doc(title,md,lang),encoding='utf-8')
            pdf_doc(folder/f'{slug}.pdf',title,md)
    print(f'Generated {len(TITLES)*3} Markdown, HTML and PDF policy sets in {OUT}')
if __name__=='__main__': main()
