# Kleine Ontdekkers

Een Nederlandstalige leerapp voor groep 2, 3, 4 en 5. Kinderen kiezen een profiel en oefenen in rondjes van tien opdrachten. Elk afgerond rondje verdient één ster, ook met hulp. Na 1, 3, 5, 8, 12 en 20 rondjes verschijnt een sticker op hun eiland.

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
| 2 | Tellen, rijmen, vormen herkennen, beginklanken, vergelijken en patronen |
| 3 | Rekenen tot 20, woorden bij plaatjes, eerste/laatste letters en korte leesvragen |
| 4 | Optellen en aftrekken, tafels, spelling, begrijpend lezen, klokkijken en geld |
| 5 | Rekenen tot 1.000, tafels en delen, spelling, begrijpend lezen, breuken en tabellen/grafieken |

De inhoud is een eerste oefenaanbod, geen volledige leerlijn. Kinderen kiezen eerst een leerwereld (Rekenen, Taal & lezen of Kijken & ontdekken), daarna een onderwerp. De ouder kiest de groep en kan die wijzigen. Automatische niveau-aanpassing is nog niet ingebouwd.

De zes nieuwe onderwerpen (vergelijken, patronen, klokkijken, geld, breuken en tabellen/grafieken) hebben elk twintig opdrachten: tien voor stap 1 en tien voor stap 2. De vier onderwerpen van groep 3 hebben eveneens elk twintig opdrachten op twee niveaus. Dat zijn samen 200 toegevoegde opdrachten. Vóór een rondje kies je stap 1, stap 2 of beide door elkaar. De bestaande onderwerpen bieden voorlopig alleen stap 1.

Een rondje bevat tien verschillende opdrachten van het gekozen onderwerp en niveau, met maximaal drie geschikte open vragen op willekeurige plekken. Bij rekenen, tafels en geld zijn dat getalantwoorden; bij geschikte spellingvragen in groep 4 en 5 woordantwoorden. Groep 2 en 3 gebruiken grote cijfertoetsen en hoeven geen woorden te typen. Leesvragen blijven meerkeuze. Bij groep 3 worden de leesverhaaltjes en woordopties niet voorgelezen, zodat kinderen die zelf lezen; de opdracht en hint zijn wel te beluisteren.

De nieuwe visuele opdrachten gebruiken eigen illustraties: hoeveelheden vergelijken, kleurpatronen aanvullen, analoge klokken aflezen, muntwaarden optellen in centen, gekleurde of ontbrekende breukdelen herkennen en tabellen/staafgrafieken aflezen. Slepen, koppelen en sorteren zijn vervolgstappen; deze versie gebruikt tikken en invullen.

- Profielen hebben een voornaam/bijnaam, avatar en groep; namen zijn nog niet achteraf te wijzigen.
- Voortgang staat in IndexedDB, apart per profiel en per browser/websiteadres.
- Het oudergedeelte biedt groep wijzigen, reservekopie downloaden, reservekopie terugzetten en profiel verwijderen.
- Terugzetten vervangt de huidige profielen pas na controle van het bestand en bevestiging.
- Geen synchronisatie, advertenties, externe lettertypen of analytics.
- De voorleesknoppen voor groep 2 en 3 gebruiken 353 meegeleverde Nederlandse audiofragmenten. Er is geen online spraakdienst nodig.
- Open getallen worden exact gecontroleerd; voorloopnullen zijn toegestaan. Bij open woorden worden hoofdletters en spaties aan het begin en einde genegeerd, maar spelfouten tellen als een nieuwe poging. Lege antwoorden kunnen niet worden ingestuurd.
- Hints, opnieuw proberen en dezelfde beloning per afgerond avontuur werken ook bij open vragen.
- Kleine geluidseffecten zijn uit te zetten tijdens een spel.

## Controleren

```sh
npm test
npm run build
npm run check:offline
npm run preview
```

De inhoudstests controleren alle groepen en niveaus, tien unieke opdrachten per ronde, leerdoelen, rekenantwoorden, overeenstemming tussen diagrammen en antwoorden, eenduidige antwoordopties, de audiolijst, beloningen en reservekopieën. Oude reservekopieën (versie 1) blijven leesbaar; groep 3 en de nieuwe onderwerpen worden ook geaccepteerd. Tests voor de PWA-updater controleren het wachten op volledige installatie, bestaande updates, netwerkfouten, time-outs, mislukte downloads en expliciete activatie vóór herladen. De offline-controle controleert of de productiebuild alle benodigde luisterfragmenten, afbeeldingen, code en stijlen in de precachelijst bevat.

De uitbreiding met groep 3 en de zes nieuwe onderwerpen is in de browser gecontroleerd op iPad- en telefoonformaat. Een volledig groep 3-rondje met meerkeuze en cijfertoetsen gaf bij één foute poging correct negen van de tien zonder hulp en één ster. De nieuwe klok-, munt-, breuk-, vergelijk- en patroonopdrachten zijn visueel gecontroleerd en nagekeken; ook de grafiekweergave is bekeken. Met de productieserver uit kon de app opnieuw openen, een luisterfragment gebruiken, een volledig groep 3-rondje afronden en de verdiende ster en sticker na herladen behouden.

In de huidige versie is een volledig avontuur van tien vragen in de browser getest: na vraag vijf gaat het rondje door, pas na vraag tien volgt de beloning en de score toont correct negen van de tien zonder hulp bij één foute poging. De eerdere browsercontrole omvatte het aanmaken van groep 2- en groep 5-profielen, wisselen tussen gescheiden voortgang, stickers verdienen en herladen met behouden voortgang. Ook de PWA-updateknop is getest. Met de webserver uit kon die eerste versie opnieuw openen, luisterfragmenten afspelen en een volledig groep 2-rondje afronden en opslaan. De vormgeving is bekeken op iPad-portretformaat. Voor open vragen zijn lege invoer, cijfers invoeren en wissen, fout antwoord met hint, opnieuw proberen en woorden met hoofdletters en randspaties in de browser gecontroleerd. Een compleet avontuur met meerkeuze- en open telvragen is zonder webserver afgerond en opgeslagen, met behouden voortgang na herladen. De handmatige updatecontrole is getest met twee opeenvolgende productiebuilds: actuele versie melden, nieuwe versie vinden, laden naar een gewijzigde buildtijd en behoud van profiel, ster en sticker. Ook een onbereikbare updateserver en opnieuw laden zonder nieuwe versie zijn gecontroleerd. Installatie en herstart in vliegtuigstand op een echte iPad moeten nog worden getest.

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

De service worker bewaart de app, oefeningen, illustraties en audio. Nieuwe versies worden pas na een bewuste klik geladen. Ga naar **Voor ouders → De nieuwste versie** en kies **Controleer op updates**. Na het volledig downloaden van een update verschijnt **Nieuwe versie laden**. Met **App opnieuw laden** controleert de app eerst op updates en herlaadt daarna de nieuwste beschikbare versie. De banner **App bijwerken** blijft ook beschikbaar. Deze knoppen zijn buiten een avontuur te gebruiken; tijdens het controleren en laden kan geen nieuw rondje worden gestart. Het oudergedeelte toont ook de datum en tijd van de huidige build. Een mislukte controle of ontbrekende internetverbinding geeft een melding en laat de huidige app bruikbaar. Een al volledig opgeslagen update kan ook offline worden geladen. Profielen en voortgang blijven behouden; er worden geen websitegegevens gewist. Offline ondersteuning werkt in de productiebuild; `npm run dev` is voor ontwikkelen. Op localhost is HTTPS niet verplicht; op een gepubliceerd adres wel. Sommige ingebouwde browsers ondersteunen geen service workers: de app verwijst dan naar Safari.

Profielen worden niet naar Vercel gestuurd. Ze zijn apparaatgebonden en kunnen verdwijnen wanneer websitegegevens worden gewist of de browser opslag opruimt. Download daarom af en toe een reservekopie. Een andere browser, ander domein of andere iPad deelt deze opslag niet automatisch.

## Inhoud uitbreiden

- `src/content.ts`: publieke ingang voor de oefenbanken, niveaus, rondjes en stickers.
- `src/learning/model.ts`: ondersteunde groepen en onderwerpen, vraagtypen en diagrammen.
- `src/learning/catalog.ts`: leerwerelden, onderwerpkaarten en leerdoelen per groep.
- `src/learning/legacy.ts`: de bestaande oefenbanken voor groep 2, 4 en 5.
- `src/learning/group3.ts`: het startaanbod voor groep 3.
- `src/learning/new-topics.ts`: de zes nieuwe onderwerpen, ieder met twee niveaus.
- `src/learning/rounds.ts`: rondjes samenstellen en antwoorden controleren.
- `src/learning/audio.ts`: gedeelde lijst van instructies, hints en antwoordaudio.
- `src/QuestionAnswers.tsx` en `src/OpenAnswer.tsx`: meerkeuze en invullen.
- `src/QuestionVisual.tsx`: klokken, munten, breuken, patronen, vergelijkingen en grafieken.
- `src/storage.ts`: profielmodel, opslag en controle van reservekopieën.
- `src/main.tsx`: profielen, leerwereld- en niveaukeuze, speelrondjes en ouderfuncties.
- `src/Island.tsx` en `src/styles.css`: illustraties en responsive vormgeving.

Elke runtimevraag bevat een groep, onderwerp, leerdoel en moeilijkheid. Voeg groepen toe aan `GROUPS`, onderwerpen aan `SKILLS`, en registreer het aanbod in de catalogus. De profielvalidatie gebruikt deze gedeelde lijsten. Voor ieder aangeboden niveau zijn minimaal tien verschillende opdrachten nodig.

Voortgang blijft voorlopig een rondjeteller per onderwerp, ook als een profiel van groep verandert. Er wordt nog geen beheersing per groep of leerdoel afgeleid uit die tellers.

Alle 353 luisterfragmenten staan in `public/audio`. Nieuwe fragmenten voor groep 2 en 3 worden op macOS gemaakt met de geïnstalleerde Nederlandse stem Xander en FFmpeg:

```sh
node --experimental-strip-types scripts/generate-audio.mjs
```

De generator maakt standaard alleen ontbrekende bestanden. Gebruik `--force` wanneer bestaande gesproken tekst verandert. De offline-controle gebruikt dezelfde audiolijst, zodat ook nieuwe onderwerpen automatisch worden gecontroleerd.

De eigen appiconen zijn reproduceerbaar met `python3 scripts/generate-icons.py` (Pillow vereist). Beide hulpprogramma's zijn uitsluitend voor het maken van assets en draaien niet bij publicatie of op de iPad.
