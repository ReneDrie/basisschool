# Kleine Ontdekkers

Een Nederlandstalige leerapp voor groep 2, 4 en 5. Kinderen kiezen een profiel en oefenen in rondjes van vijf opdrachten. Elk afgerond rondje verdient één ster, ook met hulp. Na 1, 3, 5, 8, 12 en 20 rondjes verschijnt een sticker op hun eiland.

## Lokaal starten

Gebruik Node.js 22.18 of nieuwer (de tests gebruiken de ingebouwde TypeScript-ondersteuning).

```sh
npm ci
npm run dev
```

De app gebruikt React, TypeScript, Vite en vite-plugin-pwa. Alle oefeningen zitten in de app. Een backend, API-sleutel en account zijn niet nodig.

## Wat zit erin?

| Groep | Oefeningen |
| --- | --- |
| 2 | Tellen, rijmen, vormen herkennen en beginklanken |
| 4 | Optellen en aftrekken, tafels, spelling en begrijpend lezen |
| 5 | Rekenen tot 1.000, tafels en delen, spelling en begrijpend lezen |

De inhoud is een eerste oefenaanbod, geen volledige leerlijn. De ouder kiest de groep en kan die wijzigen. Automatische niveau-aanpassing is nog niet ingebouwd. Een nieuw rondje kiest willekeurig vijf verschillende opdrachten uit de bijbehorende oefenbank.

- Profielen hebben een voornaam/bijnaam, avatar en groep; namen zijn nog niet achteraf te wijzigen.
- Voortgang staat in IndexedDB, apart per profiel en per browser/websiteadres.
- Het oudergedeelte biedt groep wijzigen, reservekopie downloaden, reservekopie terugzetten en profiel verwijderen.
- Terugzetten vervangt de huidige profielen pas na controle van het bestand en bevestiging.
- Geen synchronisatie, advertenties, externe lettertypen of analytics.
- De voorleesknoppen voor groep 2 gebruiken 73 meegeleverde Nederlandse audiofragmenten. Er is geen online spraakdienst nodig.
- Kleine geluidseffecten zijn uit te zetten tijdens een spel.

## Controleren

```sh
npm test
npm run build
npm run check:offline
npm run preview
```

De inhoudstests controleren de oefenbanken van alle groepen, de rekenantwoorden, unieke antwoordopties, beloningen en het importeren van reservekopieën. De offline-controle controleert of de productiebuild alle benodigde luisterfragmenten, afbeeldingen, code en stijlen in de precachelijst bevat.

De browsercontrole omvat het aanmaken van groep 2- en groep 5-profielen, wisselen tussen gescheiden voortgang, een foute poging met hint, vijf opdrachten afronden, de eerste sticker verdienen en herladen met behouden voortgang. Ook de PWA-updateknop is getest. Met de webserver uit kon de app opnieuw openen, luisterfragmenten afspelen en een volledig groep 2-rondje afronden en opslaan. De vormgeving is bekeken op iPad-portretformaat. Installatie en herstart in vliegtuigstand op een echte iPad moeten nog worden getest.

`npm audit` meldt momenteel 2 lage en 8 matige meldingen in de Workbox-buildketen. `npm audit fix` heeft die niet verholpen. Deze pakketten zijn ontwikkelafhankelijkheden; de gepubliceerde app is statisch. Er zijn geen gemelde problemen in de productieafhankelijkheden. Controleer updates van vite-plugin-pwa/Workbox bij onderhoud.

## Op Vercel zetten

1. Zet dit project in een eigen Git-repository.
2. Importeer die repository in Vercel en kies het Vite-framework.
3. De configuratie staat in `vercel.json`: bouwopdracht `npm run build`, uitvoermap `dist`.
4. Open de HTTPS-link die Vercel na publicatie geeft.

Deze oplevering is lokaal voorbereid; er is nog geen Vercel-project aangemaakt of gepubliceerd. Persoonlijk, niet-commercieel gezinsgebruik past bij Vercel Hobby, binnen de geldende limieten. Een eigen domeinnaam is optioneel.

## Op de iPad installeren en offline testen

1. Open de gepubliceerde HTTPS-link in Safari.
2. Tik op Delen → Zet op beginscherm. Kies ‘Open als webapp’ als die optie beschikbaar is.
3. Open de app vanaf het beginscherm en wacht online op ‘Klaar voor offline spelen’ onderaan de pagina.
4. Maak de kinderprofielen in die geïnstalleerde app aan.
5. Zet de iPad in vliegtuigstand, sluit de app en open hem opnieuw. Controleer een opdracht, de luisterknoppen en opgeslagen voortgang.

De service worker bewaart de app, oefeningen, illustraties en audio. Nieuwe versies worden pas toegepast als je buiten een rondje op ‘App bijwerken’ tikt. Offline ondersteuning werkt in de productiebuild; `npm run dev` is voor ontwikkelen. Op localhost is HTTPS niet verplicht; op een gepubliceerd adres wel. Sommige ingebouwde browsers ondersteunen geen service workers: de app verwijst dan naar Safari.

Profielen worden niet naar Vercel gestuurd. Ze zijn apparaatgebonden en kunnen verdwijnen wanneer websitegegevens worden gewist of de browser opslag opruimt. Download daarom af en toe een reservekopie. Een andere browser, ander domein of andere iPad deelt deze opslag niet automatisch.

## Inhoud uitbreiden

- `src/content.ts`: groepen, spelcategorieën, vragen, antwoordopties, hints en stickermijlpalen.
- `src/storage.ts`: profielmodel, opslag en controle van reservekopieën.
- `src/main.tsx`: profielen, speelrondjes, beloningen en ouderfuncties.
- `src/Island.tsx`: eigen SVG-illustraties en de groeiende eilandverzameling.
- `src/styles.css`: responsive vormgeving met ondersteuning voor verminderde beweging.

Nieuwe groepen vereisen een uitbreiding van het type `Group`, het aanbod, de vragen, de groepskeuzes in de interface en de reservekopievalidatie. Bestaande spelvormen zijn opnieuw te gebruiken.

De luisterfragmenten zijn al aanwezig in `public/audio`. Alleen wanneer instructies voor groep 2 veranderen, kun je ze op macOS opnieuw maken met de geïnstalleerde Nederlandse stem Xander en FFmpeg:

```sh
node --experimental-strip-types scripts/generate-audio.mjs
```

De eigen appiconen zijn reproduceerbaar met `python3 scripts/generate-icons.py` (Pillow vereist). Beide hulpprogramma's zijn uitsluitend voor het maken van assets en draaien niet bij publicatie of op de iPad.
