# Kleine Ontdekkers

Een Nederlandstalige leerapp voor groep 2, 3, 4 en 5. Kinderen kiezen een profiel en oefenen in rondjes van tien opdrachten. Elk afgerond rondje verdient één ster, ook met hulp. De eilandenwereld groeit met 36 schatten, verdeeld over zes gebieden tot en met 360 rondjes. Daarna gaat het ontdekken verder met verkennersrangen en edelstenen.

## Lokaal starten

Gebruik Node.js 22.18 of nieuwer (de tests gebruiken de ingebouwde TypeScript-ondersteuning).

```sh
npm ci
npm run dev
```

De app gebruikt React, TypeScript, Vite en vite-plugin-pwa. Alle oefeningen zitten in de app. Een backend, API-sleutel en account zijn niet nodig.

## Een app voor kinderen

De app opent op het eiland en heeft drie vaste tabs met grote pictogrammen:

- **Eiland:** je eigen eiland, je sterren en de knop Ga spelen. Het huisje opent Lessen en de schattenknop opent je verzameling.
- **Lessen:** grote vakknoppen, daarna de onderwerpen met een kort label. Heeft een vak maar één onderwerp, dan opent dat direct. Een onderwerp met één niveau start meteen; bij twee niveaus kies je stap 1, stap 2 of Verras me.
- **Schatten:** je verdiende stickers en hoeveel rondjes je nog nodig hebt voor de volgende.

De nieuwe tabs en schermen zijn bekeken op telefoon- en iPad-formaat. Een volledig rondje met fout antwoord en hint is afgerond met de juiste beloning. In de productieversie zijn na herladen met de server uit de tabs, luisterknop en een volledig rondje getest; de ster bleef na opnieuw herladen behouden.

De kinderschermen hebben geen websitefooter, promotieteksten, bijschriften of zijpanelen. Tijdens een rondje verdwijnen de tabs; alleen de vraag, antwoorden en hulp blijven centraal. Na afloop kun je naar je eiland of nog een rondje doen. Profielen en instellingen staan bovenaan. Installatie, offline status, updates en reservekopieën staan bij het tandwiel voor ouders.

## Een wereld die verder groeit

De Wereldkaart op het eiland toont zes gebieden. Ontgrendelde gebieden zijn te bezoeken; komende gebieden tonen hoeveel rondjes er nog nodig zijn. Elk gebied groeit in zes stappen. De eerste zes schatten en hun mijlpalen zijn behouden, zodat oude profielen meteen dezelfde beloningen terugzien.

| Gebied | Gaat open na | Laatste schat na |
| --- | ---: | ---: |
| Groene tuin | 0 | 20 |
| Strandbaai | 25 | 50 |
| Bloesembos | 60 | 90 |
| Sterrenheuvel | 100 | 150 |
| Sneeuwtoppen | 165 | 240 |
| Wolkenrijk | 260 | 360 |

Bij het vrijspelen van een nieuw gebied verschijnt een melding na de les. Het eiland opent daarna op dat gebied. Eerdere gebieden en schatten blijven beschikbaar. De Schattentab toont zes beloningen tegelijk, met een eilandkiezer voor de andere gebieden.

Na 360 rondjes blijft er een volgend doel: iedere twintig extra rondjes levert een edelsteen en een nieuwe verkennersrang op. Dit voegt geen oneindig aantal nieuwe eilanden toe; de zes gebieden zijn de huidige inhoud. Nieuwe gebieden en beloningen kunnen later via `src/progression.ts` worden toegevoegd. Voortgang is afgeleid van voltooide rondjes; profielen, sterren, groepskeuzes en reservekopieën blijven compatibel.

Alle eilandonderdelen, beloningen, vriendjes en oefenplaatjes gebruiken dezelfde eigen SVG-illustraties. Telefoonemoji zijn uitsluitend nog interne, bestaande profiel- en inhoudscodes; ze worden als vectorillustratie weergegeven. Er is geen afbeeldingsdienst of extra download nodig tijdens het spelen. De eilanden hebben gelaagde grond, zachte schaduwen en vaste plekken voor elke schat. Contouren worden per plaatsingsschaal gecompenseerd, zodat kleine en grote onderdelen dezelfde lijndikte hebben. Bomen en huisjes delen materiaal- en kleuraccenten. De vaste tabs en de speelknop houden de tekening vrij van zwevende navigatieknoppen.

De overgang van 24 naar 25 rondjes is in de browser getest: Strandbaai en de eerste nieuwe schat komen vrij. Ook de overgang van 379 naar 380 is zonder productieserver doorlopen: een nieuwe verkennersrang en de eerste edelsteen verschijnen. De kaart, eilandkeuze en schatten zijn op telefoon- en iPad-formaat bekeken. De automatische tests controleren alle ontgrendelgrenzen, de oorspronkelijke schatten, doorlopende rangen en lokale illustraties voor alle oefenplaatjes.

## Wat zit erin?

| Groep | Oefeningen |
| --- | --- |
| 2 | Tellen, rijmen, vormen herkennen, beginklanken, vergelijken en patronen |
| 3 | Rekenen tot 20, woorden bij plaatjes, eerste/laatste letters en korte leesvragen |
| 4 | Optellen en aftrekken, tafels, spelling, begrijpend lezen, klokkijken en geld |
| 5 | Rekenen tot 1.000, tafels en delen, spelling, begrijpend lezen, breuken en tabellen/grafieken |

De inhoud is een eerste oefenaanbod, geen volledige leerlijn. Onder Lessen kiezen kinderen een vak (Rekenen, Taal & lezen of Ontdekken), daarna een onderwerp. De ouder kiest de groep en kan die wijzigen. Automatische niveau-aanpassing is nog niet ingebouwd.

De zes nieuwe onderwerpen (vergelijken, patronen, klokkijken, geld, breuken en tabellen/grafieken) hebben elk twintig opdrachten: tien voor stap 1 en tien voor stap 2. De vier onderwerpen van groep 3 hebben eveneens elk twintig opdrachten op twee niveaus. Dat zijn samen 200 toegevoegde opdrachten. Vóór een rondje kies je stap 1, stap 2 of beide door elkaar. De bestaande onderwerpen bieden voorlopig alleen stap 1.

Rekenen (inclusief tellen en tafels), klokkijken, geld en patronen maken lokaal extra varianten. Groep 3 heeft bijvoorbeeld 400 verschillende sommen tot twintig; klokkijken heeft 48 tijden binnen hele uren, halve uren en kwartieren. Geld wisselt muntcombinaties en patronen wisselen kleuren en herhalingen. Reken- en geldvragen wisselen ook de onjuiste antwoordopties. De moeilijkheid blijft binnen het gekozen niveau. Woorden en leesteksten blijven zorgvuldig samengestelde, vaste inhoud.

Per profiel, groep en onderwerp bewaart de app de laatste dertig aangeboden opdrachten. Een nieuw rondje kiest eerst andere opdrachten. Zijn er te weinig ongeziene opdrachten, dan komen de langst geleden aangeboden vragen eerst terug. Bij een niveau met precies tien vaste vragen blijven dat dezelfde tien vragen. Eindeloos oefenen kan dus, met eindige variatie binnen ieder leerdoel.

De geschiedenis wordt vóór het starten van een rondje opgeslagen en geldt ook als je een rondje verlaat. Ze blijft behouden na herladen en in reservekopieën. Oude reservekopieën zonder geschiedenis blijven bruikbaar. Voorlezen van nieuwe groep 3-sommen gebruikt losse, meegeleverde getallen en rekenwoorden; er is geen online spraakdienst nodig.

Een rondje bevat tien verschillende opdrachten van het gekozen onderwerp en niveau, met maximaal drie geschikte open vragen op willekeurige plekken. Bij rekenen, tafels en geld zijn dat getalantwoorden; bij geschikte spellingvragen in groep 4 en 5 woordantwoorden. Groep 2 en 3 gebruiken grote cijfertoetsen en hoeven geen woorden te typen. Leesvragen blijven meerkeuze. Bij groep 3 worden de leesverhaaltjes en woordopties niet voorgelezen, zodat kinderen die zelf lezen; de opdracht en hint zijn wel te beluisteren.

De nieuwe visuele opdrachten gebruiken eigen illustraties: hoeveelheden vergelijken, kleurpatronen aanvullen, analoge klokken aflezen, muntwaarden optellen in centen, gekleurde of ontbrekende breukdelen herkennen en tabellen/staafgrafieken aflezen. Slepen, koppelen en sorteren zijn vervolgstappen; deze versie gebruikt tikken en invullen.

- Profielen hebben een voornaam/bijnaam, avatar en groep; namen zijn nog niet achteraf te wijzigen.
- Voortgang staat in IndexedDB, apart per profiel en per browser/websiteadres.
- Het oudergedeelte biedt groep wijzigen, reservekopie downloaden, reservekopie terugzetten en profiel verwijderen.
- Terugzetten vervangt de huidige profielen pas na controle van het bestand en bevestiging.
- Geen synchronisatie, advertenties, externe lettertypen of analytics.
- De voorleesknoppen voor groep 2 en 3 gebruiken 379 meegeleverde Nederlandse audiofragmenten. Er is geen online spraakdienst nodig.
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

De variatie is met 24 tests gecontroleerd, waaronder alle gegenereerde antwoorden, niveaus, luisterfragmenten, herhaling bij kleine oefenbanken en behoud van geschiedenis in reservekopieën. Twee volledige groep 3-rondjes zijn in de browser afgerond, waarvan het tweede na herladen met de productieserver uit. De tien sommen verschilden allemaal van het eerste rondje; de twee sterren bleven na herladen behouden.

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
- `src/learning/rounds.ts`: rondjes samenstellen, recente herhaling beperken en antwoorden controleren.
- `src/learning/variants.ts`: varianten genereren binnen het getalbereik en leerdoel.
- `src/learning/audio.ts`: gedeelde lijst van instructies, hints en antwoordaudio.
- `src/QuestionAnswers.tsx` en `src/OpenAnswer.tsx`: meerkeuze en invullen.
- `src/QuestionVisual.tsx`: klokken, munten, breuken, patronen, vergelijkingen en grafieken.
- `src/storage.ts`: profielmodel, opslag en controle van reservekopieën.
- `src/main.tsx`: profielen, niveaukeuze, speelrondjes en ouderfuncties.
- `src/AppPages.tsx`: Eiland, Lessen, Schatten en de vaste navigatie.
- `src/app.css`: de app-indeling, grotere knoppen en speelsere kinderschermen.
- `src/progression.ts`: gebieden, mijlpalen en verkennersrangen.
- `src/Art.tsx` en `src/art-catalog.ts`: de gedeelde vectorillustraties en koppeling met bestaande avatars/oefenplaatjes.
- `src/Island.tsx` en `src/IslandScenery.tsx`: compositie per gebied, landschap en schaalvaste contouren.
- `src/styles.css` en `src/app.css`: responsive vormgeving.

Elke runtimevraag bevat een groep, onderwerp, leerdoel en moeilijkheid. Voeg groepen toe aan `GROUPS`, onderwerpen aan `SKILLS`, en registreer het aanbod in de catalogus. De profielvalidatie gebruikt deze gedeelde lijsten. Voor ieder aangeboden niveau zijn minimaal tien verschillende opdrachten nodig.

Naast de recente oefengeschiedenis blijft voortgang voorlopig een rondjeteller per onderwerp, ook als een profiel van groep verandert. Er wordt nog geen beheersing per groep of leerdoel afgeleid uit die tellers.

Alle 379 luisterfragmenten staan in `public/audio`. Nieuwe fragmenten voor groep 2 en 3 worden op macOS gemaakt met de geïnstalleerde Nederlandse stem Xander en FFmpeg:

```sh
node --experimental-strip-types scripts/generate-audio.mjs
```

De generator maakt standaard alleen ontbrekende bestanden. Gebruik `--force` wanneer bestaande gesproken tekst verandert. De offline-controle gebruikt dezelfde audiolijst, zodat ook nieuwe onderwerpen automatisch worden gecontroleerd.

De eigen appiconen zijn reproduceerbaar met `python3 scripts/generate-icons.py` (Pillow vereist). Beide hulpprogramma's zijn uitsluitend voor het maken van assets en draaien niet bij publicatie of op de iPad.
