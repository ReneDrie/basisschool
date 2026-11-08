# Kleine Ontdekkers

Een Nederlandstalige leerapp voor groep 2, 3, 4 en 5. Kinderen kiezen een profiel en oefenen in rondjes van zes opdrachten in groep 2, acht in groep 3 en tien in groep 4 en 5. Elk afgerond rondje verdient één ster, ook met hulp. De eilandenwereld groeit met 36 schatten, verdeeld over zes gebieden tot en met 360 rondjes. Daarna gaat het ontdekken verder met verkennersrangen en edelstenen.

## Lokaal starten

Gebruik Node.js 22.18 of nieuwer (de tests gebruiken de ingebouwde TypeScript-ondersteuning).

```sh
npm ci
npm run dev
```

De app gebruikt React, TypeScript, Vite en vite-plugin-pwa. Alle oefeningen zitten in de app. Voor spelen zijn een backend, API-sleutel en account niet nodig. Optionele gebruiksstatistieken gebruiken een GoatCounter-account.

## Gebruiksstatistieken met GoatCounter

De productiebuild is ingesteld op [renedrie.goatcounter.com](https://renedrie.goatcounter.com/). Een extra omgevingsvariabele of API-sleutel is niet nodig. Dit adres staat als publieke standaard in `src/main.tsx`.

Het dashboard blijft voorlopig privé: alleen wie bij GoatCounter kan inloggen heeft toegang. Dit heeft geen invloed op het verzamelen van statistieken. Na publicatie van de nieuwe appbuild staat bij **Voor ouders → Gebruik van de app → Bekijk de statistieken** een link naar het dashboard; daar moet je inloggen.

Een openbaar overzicht kan later door de zichtbaarheid in GoatCounter te wijzigen; daarvoor is geen nieuwe appbuild nodig. Laat individuele pageviews uitgeschakeld als je alleen totalen wilt. Aanvullende gegevens zoals locatie en schermgrootte kun je in de GoatCounter-site-instellingen uitschakelen.

Voor een andere GoatCounter-site kun je in Vercel bij **Settings → Environment Variables** `VITE_GOATCOUNTER_URL=https://jouw-site.goatcounter.com` instellen. Gebruik het siteadres, zonder `/count`. Dit is een openbaar adres; zet hier nooit een API-sleutel in. Stel `VITE_GOATCOUNTER_URL` in op `off` om analytics uit te schakelen. Vite verwerkt deze instelling tijdens het bouwen, dus maak na een wijziging een nieuwe deployment.

| Telling in GoatCounter | Betekenis |
| --- | --- |
| `/` — Kleine Ontdekkers | De app is geladen met internet, of kwam tijdens dezelfde opening weer online. GoatCounter toont bezoeken en een schatting van bezoekers. |
| `home-screen-open` | De app is geladen vanaf het beginscherm, inclusief iPad/Safari. Dit telt openingen, geen unieke installaties. |
| `app-installed` | De browser meldde een geslaagde installatie. Dit werkt alleen in browsers met `appinstalled`; Safari/iPad meldt deze gebeurtenis niet. |
| `game-started/group/4/game/winkel` | Een rondje Eilandwinkel is gestart in groep 4. |
| `round-completed/group/4/game/winkel` | Een rondje Eilandwinkel is met internet afgerond in groep 4 en succesvol lokaal opgeslagen. Zonder namen, antwoorden of scores. |

Per start of afronding verstuurt de app één gebeurtenis met het spel en de groep, bijvoorbeeld `round-completed/group/4/game/winkel`. De losse totalen per spel, per groep en de algemene `round-completed` worden niet meer verstuurd. Filter op `game-started/group/4/game/` om gestarte spellen in groep 4 te vergelijken, of op `round-completed/group/4/game/` voor afgeronde rondjes. Voor een speltotaal over alle groepen tel je de bijbehorende groepsregels op. Starts en afrondingen zijn afzonderlijke tellingen; tel die niet bij elkaar op als aantal rondjes.

Koppelen en Memory hebben afzonderlijke spelcodes (`koppelen` en `memory`). Gemengde Koppelplein-rondjes hebben de spelcode `koppelplein-mix`. Deze tellingen meten rondjes, geen unieke kinderen. De groep is de gekozen profielgroep, geen klasnaam of school. Starts tellen pas nadat een rondje succesvol is voorbereid; afrondingen pas na het bewaren van de beloning. Oudere bezoeken en offline rondjes krijgen geen uitsplitsing achteraf.

Bestaande GoatCounter-gegevens blijven behouden. Gebruik de regels met zowel `/group/` als `/game/` om ook over de eerdere periode zonder dubbeltelling te vergelijken. Eerdere appversies kunnen de oude samenvattingsregels nog aanvullen totdat gebruikers hun app bijwerken.

Tel de twee beginschermgebeurtenissen niet op als installatietotaal: dezelfde installatie kan later vaak geopend worden. Bestaande installaties worden zichtbaar zodra ze de bijgewerkte app openen. Het hervatten van een nog geopende app telt niet als een nieuwe opening.

Deze integratie gebruikt geen trackingcookies of blijvend apparaat-ID. Alleen vaste paginanamen en gebeurtenislabels worden verstuurd; URL-query's en verwijzende pagina's worden weggelaten. GoatCounter verwerkt voor bezoekersschattingen ook normale netwerkgegevens; zie het [privacybeleid](https://www.goatcounter.com/help/privacy) en de uitleg over [bezoekers en sessies](https://www.goatcounter.com/help/sessions). Bezoekersaantallen zijn geen exacte telling van personen: een gezin kan een apparaat delen en iemand kan meerdere apparaten gebruiken. Offline rondjes en installaties worden niet achteraf verstuurd. Een app die nog openstaat wanneer de verbinding terugkomt kan wel zijn eerste bezoek en beginschermopening melden. Blokkades van analytics of Do Not Track kunnen de telling verlagen.

Analytics staat altijd uit in ontwikkeling, op localhost, bij Do Not Track en met `?test=1` (ook bij een productiepreview). Een storing bij GoatCounter blokkeert de app niet en het script is geen onderdeel van de offlinecache. Voor automatische browsercontroles blijft `?test=1` verplicht.

## Een app voor kinderen

De app opent op het eiland en heeft drie vaste tabs met grote pictogrammen:

- **Eiland:** je eigen eiland, je sterren en de knop Ga spelen. Het huisje opent Lessen en de schattenknop opent je verzameling.
- **Lessen:** grote vakknoppen, daarna de onderwerpen met een kort label. Heeft een vak maar één onderwerp, dan opent dat direct. Een onderwerp met één niveau start meteen; bij twee niveaus kies je stap 1, stap 2 of Verras me.
- **Schatten:** je verdiende stickers en hoeveel rondjes je nog nodig hebt voor de volgende.

De nieuwe tabs en schermen zijn bekeken op telefoon- en iPad-formaat. Een volledig rondje met fout antwoord en hint is afgerond met de juiste beloning. In de productieversie zijn na herladen met de server uit de tabs, luisterknop en een volledig rondje getest; de ster bleef na opnieuw herladen behouden.

De aanraakbediening laat scrollen toe en voorkomt knijpzoomen, dubbel tikken om te zoomen, tekstselectie en het menu bij lang indrukken. De instellingen gelden ook in de geïnstalleerde PWA. Namen en geschreven antwoorden blijven normaal te bewerken; naam- en groepsvelden hebben minstens 16-pixeltekst om automatisch inzoomen bij invoer te voorkomen. CSS, viewportinstellingen en aanvullende Safari-gebarenafhandeling werken samen, omdat [Safari alleen viewportlimieten kan negeren](https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/). Er wordt geen snelle tweede antwoordtik weggefilterd. Een volledig rekenrondje en de invoervelden zijn in de browser gecontroleerd; knijpgebaren en lang indrukken moeten nog op een echte iPad worden gecontroleerd.

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

## Eilandwinkel voor groep 2 en 4

Via **Lessen → Rekenen → Eilandwinkel** kunnen kinderen producten pakken en terugleggen, mandjes vergelijken of zelf een betaling samenstellen. Er zijn twee stappen per groep:

- Groep 2: aantallen 1–5 en het meeste herkennen; daarna aantallen 6–10 en het minste herkennen. Honderd opdrachten over beide stappen, met zes soorten producten.
- Groep 4: één soort product betalen met hele euro's; daarna de prijzen van twee soorten producten optellen en betalen met euro's en centen. 480 opdrachten: 120 met hele euro's en 360 met twee producten, wisselende prijzen en aantallen.

Een betaling mag op meerdere manieren worden samengesteld, zolang de munten samen precies het bedrag vormen. Bij het vullen telt zowel het juiste aantal als de juiste soort product. Tikken werkt met muis, aanraking en toetsenbord; spullen of munten kunnen terug en de hele selectie kan opnieuw. De rondelengte per groep, hints, sterren, eilandschatten en reservekopieën blijven van toepassing. De winkel heeft een eigen oefengeschiedenis; eerdere opdrachten worden zo veel mogelijk vermeden. Bestaande geschiedenissleutels blijven gelijk.

De 49 nieuwe lokale luisterfragmenten omvatten opdrachten en hints, ook voor de winkel in groep 4. Een groep 2-rondje is met een verkeerd product, terugleggen en herstellen getest. Een volledig groep 4-rondje, luisteren, verschillende muntcombinaties en opnieuw openen met behouden voortgang zijn met de productieserver uit getest. Beide spelvormen zijn op telefoon- en tabletformaat bekeken.

## Bouwplaats voor groep 2 en 4

De Bouwplaats staat bij **Lessen → Ontdekken**. Groep 2 heeft twee stappen: drie planken van kort naar lang leggen en blokken bij twee vormen sorteren; daarna vier planken van lang naar kort leggen en blokken bij drie vormen sorteren. Kleur bepaalt niet het juiste vak. Tik op een plank om die aan de volgorde toe te voegen; tik op een geplaatste plank om die terug te pakken. Bij sorteren tik je eerst op een blok en daarna op het vak. Ook geplaatste blokken kunnen terug.

Groep 4 maakt een brug af door met een liniaal de opening te meten en een passende plank te kiezen. Stap 1 begint bij nul; stap 2 begint op verschillende plaatsen op de liniaal en bevat ook planklabels in decimeters. Slechts één van de vier planken past precies. De gekozen plank wordt over de opening gelegd, zodat een te korte of lange plank zichtbaar wordt. De liniaal gebruikt gelijke afstand tussen centimeterstreepjes en grotere cijfers voor telefoonweergave.

Alle opdrachten worden lokaal samengesteld. De bestaande afwisseling tussen rondjes, de rondelengte per groep, hints, sterren, eilandschatten en reservekopieën blijven werken. Negen nieuwe lokale luisterfragmenten worden mee opgeslagen voor offline gebruik. Er zijn automatische controles op volgordes, volledige vormsortering, liniaalgrenzen, eenheden, unieke passende planken, variatie en bewaarde voortgang.

Een groep 2-rondje is op telefoonformaat doorlopen met een verkeerd geplaatst blok en een verkeerde plankvolgorde, inclusief terugpakken en herstellen. Een volledig groep 4-rondje is met de productieserver uit afgerond, inclusief luisteren, meten vanaf een ander beginpunt, decimeters en herstel van een te korte plank. Beide rondjes leverden één ster op.

## Verhalenpad voor groep 2 en 4

Het Verhalenpad staat bij **Lessen → Taal & lezen**. Er zijn dertig korte, zelfgeschreven verhalen met Vos of Haas als hoofdpersoon. Elke groep heeft twee stappen: drie gebeurtenissen op de eerste stap, vier op de tweede. Een rondje bevat zes verschillende verhaalsoorten in groep 2 en tien in groep 4; varianten met een ander vriendje of niveau verdringen elkaar binnen hetzelfde rondje. De geschiedenis herkent hetzelfde verhaal ook met een ander vriendje of niveau. Zo kunnen de dertig verhalen over vijf rondjes in groep 2 of drie rondjes in groep 4 worden verdeeld voordat een verhaal terugkomt.

Groep 2 luistert naar het verhaal en zet eigen SVG-plaatjes op volgorde. Het hele verhaal en ieder plaatje zijn apart te beluisteren. Groep 4 ordent zinnen en krijgt daarna een vraag over de tekst: op stap 1 over een concreet detail, op stap 2 over een oorzaak of gevolg. Zowel de volgorde als het antwoord moeten kloppen voordat de opdracht klaar is. De tekst blijft bij de vraag zichtbaar en kan worden voorgelezen. Antwoordopties hebben ook lokale audio.

Kaarten komen in een gemengde volgorde in beeld. Tik op een kaart om die aan je verhaal toe te voegen; een geplaatste stap kan terug en de hele volgorde kan opnieuw. Iedere illustratie toont de bijbehorende gebeurtenis met dezelfde kleuren en vectorstijl als de app. Alle vertellingen, vragen en antwoordopties worden mee opgeslagen voor offline gebruik. Sterren, hints, eilandschatten en reservekopieën gebruiken de bestaande werkwijze. Een volledig groep 2-rondje is met een verkeerde volgorde, terugpakken en opnieuw leggen getest. Een volledig groep 4-rondje met tien verschillende verhalen is zonder productieserver afgerond, inclusief voorlezen, begripsvragen en herstel van een fout antwoord. Beide rondjes leverden één ster op. Ook het groep 2-niveau met drie plaatjes is offline volledig afgerond, inclusief de gesproken vertelling en de volgende eilandschat.

## Koppelplein voor alle groepen

Via **Lessen → Ontdekken → Koppelplein** zijn er twee nieuwe spelvormen: **Koppelen**, met de kaarten zichtbaar, en **Memory**, met acht dichte kaarten. Bij groep 3 en 5 opent Ontdekken direct de spelkeuze, omdat dit daar het enige onderwerp is. Een bord heeft vier paren; na zes borden in groep 2, acht in groep 3 of tien in groep 4 en 5 volgt de gebruikelijke ster.

| Groep | Wat hoort bij elkaar? | Borden per spelvorm |
| --- | --- | ---: |
| 2 | Aantallen en cijfers; voorwerpen en hun schaduwen | 140 |
| 3 | Plaatjes en gelezen woorden; sommen en uitkomsten | 140 |
| 4 | Keersommen en uitkomsten; enkelvoud en meervoud; klokken en tijden | 210 |
| 5 | Breukplaatjes en breuken; lengtematen en inhoudsmaten; woorden en betekenissen | 210 |

Dit zijn samen 1.400 verschillende borden. Iedere ronde verdeelt de oefensoorten gelijkmatig. De kaarten worden opnieuw gemengd en de bestaande vraag- en begripsgeschiedenis spreidt eerdere borden, ook wanneer hetzelfde bord met een andere spelvorm terugkomt. Profielen en reservekopieën blijven compatibel.

Een gevonden paar blijft zichtbaar. Bij een verkeerd paar blijven de kaarten liggen tot het kind op **Nog eens** tikt; er is geen tijdsdruk en de andere gevonden paren blijven bewaard. Bij open kaarten telt een fout paar als een nieuwe poging. Bij memory hoort het ontdekken van verschillende kaarten bij het spel en kost dat geen score; een expliciet gebruikte hint telt wel als hulp. De kaartinhoud en namen van dichte memorykaarten staan nog niet in de zichtbare of voorgelezen kaartinhoud.

Alle plaatjes zijn bestaande eigen vectorillustraties. Drie nieuwe luisterfragmenten gebruiken Ellen en werken ook offline. Automatische tests controleren alle koppelingen, reken- en breukantwoorden, maten, niveaus, geheugenkaarten, afwisseling, beloningen en reservekopieën. Een volledig groep 2-koppelrondje is met een verkeerd paar, herstel en de juiste sterbeloning afgerond. Groep 3-memory is gecontroleerd op omdraaien, opnieuw proberen en het resetten van het volgende bord. Een volledig groep 4-koppelrondje bevatte tafels, meervouden en klokken. Een volledig groep 5-memoryrondje met breuken, maten en woordbetekenissen is zonder productieserver gespeeld, inclusief luisteren; de verdiende ster bleef na offline herladen behouden. De weergave is op telefoon- en iPad-formaat gecontroleerd.

## Wat zit erin?

| Groep | Oefeningen |
| --- | --- |
| 2 | Tellen, rijmen, vormen herkennen en tellen, beginklanken, vergelijken, patronen, Eilandwinkel, Bouwplaats, Verhalenpad en Koppelplein |
| 3 | Rekenen tot 20, woorden bij plaatjes, eerste/laatste letters, korte leesvragen en Koppelplein |
| 4 | Optellen en aftrekken, tafels, spelling, begrijpend lezen, klokkijken, geld, Eilandwinkel, Bouwplaats, Verhalenpad en Koppelplein |
| 5 | Rekenen tot 1.000, tafels en delen, spelling, begrijpend lezen, breuken, tabellen/grafieken en Koppelplein |

De inhoud is een eerste oefenaanbod, geen volledige leerlijn. Onder Lessen kiezen kinderen een vak (Rekenen, Taal & lezen of Ontdekken), daarna een onderwerp. De ouder kiest de groep en kan die wijzigen. Automatische niveau-aanpassing is nog niet ingebouwd.

Veel onderwerpen hebben twee niveaus. Vóór een rondje kies je stap 1, stap 2 of beide door elkaar. De oorspronkelijke onderwerpen voor groep 4 en 5 bieden voorlopig alleen stap 1. De moeilijkheid blijft binnen het gekozen niveau.

Rekenen maakt lokaal grote oefenbanken: 499 vragen voor groep 3, 5.226 voor groep 4 en 10.803 voor groep 5. Naast gewone sommen zijn er ontbrekende getallen en bij tafels vragen over groepjes. Groep 2 telt verschillende voorwerpen in rijtjes, verspreid of in tweetallen. Ook vergelijken, vormen tellen, patronen, muntcombinaties, klokken, breuken en grafieken hebben extra varianten. Patronen gebruiken kleuren, voorwerpen en vormen; breuken wisselen stroken, roosters en taartpunten. Antwoordopties wisselen mee.

Woorden, leesteksten en verhalen hebben extra samengestelde inhoud. Groep 2 heeft veertig rijmvragen en zeventig beginklankvragen. In het rijmspel hebben zowel het vraagwoord als alle vier de antwoorden een eigen SVG-illustratie. Er zijn 73 herkenbare woorden; abstracte rijmwoorden zijn vervangen door af te beelden woorden, bijvoorbeeld haas–vaas en doek–broek. De grote antwoordkaarten hebben een aparte luisterknop onderaan. De illustraties werken offline en blijven beperkt tot het rijmspel; woordkeuzes bij lezen en spelling blijven tekst. Op telefoonformaat is een volledig rondje met luisteren, een fout antwoord, herstel en een verdiende ster doorlopen. Alle 73 illustraties zijn visueel gecontroleerd. Ook een volledig rondje met luisterknoppen en een verdiende ster is zonder productieserver afgerond. Groep 3 heeft 51 plaatjeswoorden, 135 lettervragen en 52 leesvragen. Groep 4 heeft 51 spellingvragen en 106 leesvragen; groep 5 heeft 91 spellingvragen en 106 leesvragen. De Bouwplaats heeft 1.091 opdrachten voor groep 2 en 409 metingen voor groep 4. De dertig verhalen hebben elk een variant met Vos en Haas op beide niveaus.

Per profiel, groep en onderwerp bewaart de app maximaal duizend aangeboden vragen, met een totaal van vijfduizend per profiel. Een aparte geschiedenis met dezelfde grenzen onthoudt de onderliggende oefening: bijvoorbeeld 12 + 15 en 15 + 12, hetzelfde spellingwoord, dezelfde kloktijd of hetzelfde verhaal met een ander vriendje. Een rondje kiest eerst ongeziene vragen en spreidt de onderliggende oefeningen zo veel mogelijk. Bij verhalen krijgt afwisseling van verhaalsoorten voorrang op het wisselen van hoofdpersoon. Als de voorraad opraakt, keren oudere oefeningen terug. Eindeloos oefenen kan dus; een leerdoel heeft een eindig aantal inhoudelijk verschillende vragen.

De geschiedenis wordt vóór het starten van een rondje opgeslagen en geldt ook als je een rondje verlaat. Ze blijft behouden na herladen en in reservekopieën. Oude reservekopieën zonder geschiedenis blijven bruikbaar. Bij bestaande geschiedenissen met alleen vraagsleutels wordt waar mogelijk de onderliggende oefening teruggevonden. Reservekopieën mogen maximaal 8 MB zijn, zodat ook grotere geschiedenissen teruggezet kunnen worden. Voorlezen van nieuwe groep 3-sommen gebruikt losse, meegeleverde getallen en rekenwoorden; er is geen online spraakdienst nodig.

Een rondje bevat zes verschillende opdrachten in groep 2, acht in groep 3 en tien in groep 4 en 5, steeds van het gekozen onderwerp en niveau, met maximaal drie geschikte open vragen op willekeurige plekken. Bij rekenen, tafels en geld zijn dat getalantwoorden; bij geschikte spellingvragen in groep 4 en 5 woordantwoorden. Groep 2 en 3 gebruiken grote cijfertoetsen en hoeven geen woorden te typen. Leesvragen blijven meerkeuze. Bij groep 3 worden de leesverhaaltjes en woordopties niet voorgelezen, zodat kinderen die zelf lezen; de opdracht en hint zijn wel te beluisteren.

De nieuwe visuele opdrachten gebruiken eigen illustraties: hoeveelheden vergelijken, patronen aanvullen, analoge klokken aflezen, muntwaarden optellen in centen, gekleurde of ontbrekende breukdelen herkennen en tabellen/staafgrafieken aflezen. De winkel, Bouwplaats en het Verhalenpad gebruiken tikken om spullen te pakken, vormen te sorteren en gebeurtenissen op volgorde te leggen.

- Profielen hebben een voornaam/bijnaam, avatar en groep; namen zijn nog niet achteraf te wijzigen.
- Voortgang staat in IndexedDB, apart per profiel en per browser/websiteadres.
- Het oudergedeelte biedt groep wijzigen, reservekopie downloaden, reservekopie terugzetten en profiel verwijderen.
- Terugzetten vervangt de huidige profielen pas na controle van het bestand en bevestiging.
- Geen synchronisatie, advertenties, externe lettertypen of analytics.
- De voorleesknoppen gebruiken 1.253 meegeleverde Nederlandse audiofragmenten, inclusief de spelopdrachten voor groep 4. Er is geen online spraakdienst nodig.
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

Browsercontroles draaien stil. De ontwikkelserver (`npm run dev`) dempt zowel voorleesfragmenten als de geluidjes bij goede antwoorden. Gebruik bij automatische browsercontroles altijd `?test=1`, ook op een productiepreview, bijvoorbeeld `http://127.0.0.1:4173/?test=1`. Deze testmodus blijft stil wanneer een test de geluidsknop aanzet. De luisterfragmenten worden wel geladen en stil afgespeeld, zodat laadfouten en afspeelvolgordes gecontroleerd kunnen worden.

De normale productie-URL heeft standaard geluid. Er wordt geen stille productiebuild gemaakt en de testmodus verandert geen opgeslagen voorkeuren of profielen. Voor een bewuste luistercontrole in ontwikkeling kan `?audio=on` worden gebruikt; `test=1` heeft altijd voorrang. De browserafspraken staan ook in `AGENTS.md`.

De inhoudstests controleren alle groepen en niveaus, zes, acht of tien unieke opdrachten per ronde volgens de groep, leerdoelen, rekenantwoorden, overeenstemming tussen diagrammen en antwoorden, eenduidige antwoordopties, de audiolijst, beloningen en reservekopieën. Oude reservekopieën (versie 1) blijven leesbaar; groep 3 en de nieuwe onderwerpen worden ook geaccepteerd. Tests voor de PWA-updater controleren het wachten op volledige installatie, bestaande updates, netwerkfouten, time-outs, mislukte downloads en expliciete activatie vóór herladen. De offline-controle controleert of de productiebuild alle benodigde luisterfragmenten, afbeeldingen, code en stijlen in de precachelijst bevat.

De 66 tests controleren onder meer alle gegenereerde antwoorden, niveaus, luisterfragmenten, kleine uitgeputte oefenbanken en behoud van beide geschiedenissen in reservekopieën. Een simulatie van honderd groep 4-rekenrondjes bevat duizend verschillende vragen; in de eerste vijftig rondjes herhaalt ook de onderliggende som zich niet. Vijf verhalenrondjes in groep 2 bevatten samen dertig verschillende verhaalsoorten. De maximale geschiedenis en een reservekopie met twintig volle profielen blijven binnen de opslag- en importgrenzen.

Twee volledige groep 4-rekenrondjes zijn in de browser afgerond, waarvan het tweede na herladen met de productieserver uit. Alle twintig vragen verschilden en beide sterren bleven bewaard. Ook volledige rondjes met de nieuwe vormtelvragen en breuken zijn offline afgerond en op telefoonformaat bekeken; de taartpunten, stroken en roosters gaven de juiste antwoorden.

De kortere rondes zijn zonder geluid in de productiepreview gecontroleerd: groep 2 loopt tot zes vragen, groep 3 tot acht. De afrondknop verschijnt pas bij de laatste vraag. Eén foute poging geeft correct vijf van de zes zonder hulp; beide volledige rondjes verdienen één ster en de voortgang blijft na herladen bewaard.

De uitbreiding met groep 3 en de zes nieuwe onderwerpen is in de browser gecontroleerd op iPad- en telefoonformaat. Een volledig groep 3-rondje met meerkeuze en cijfertoetsen gaf bij één foute poging correct negen van de tien zonder hulp en één ster. De nieuwe klok-, munt-, breuk-, vergelijk- en patroonopdrachten zijn visueel gecontroleerd en nagekeken; ook de grafiekweergave is bekeken. Met de productieserver uit kon de app opnieuw openen, een luisterfragment gebruiken, een volledig groep 3-rondje afronden en de verdiende ster en sticker na herladen behouden.

In een eerdere versie is een volledig avontuur van tien vragen in de browser getest: na vraag vijf gaat het rondje door, pas na vraag tien volgt de beloning en de score toont correct negen van de tien zonder hulp bij één foute poging. De eerdere browsercontrole omvatte het aanmaken van groep 2- en groep 5-profielen, wisselen tussen gescheiden voortgang, stickers verdienen en herladen met behouden voortgang. Ook de PWA-updateknop is getest. Met de webserver uit kon die eerste versie opnieuw openen, luisterfragmenten afspelen en een volledig groep 2-rondje afronden en opslaan. De vormgeving is bekeken op iPad-portretformaat. Voor open vragen zijn lege invoer, cijfers invoeren en wissen, fout antwoord met hint, opnieuw proberen en woorden met hoofdletters en randspaties in de browser gecontroleerd. Een compleet avontuur met meerkeuze- en open telvragen is zonder webserver afgerond en opgeslagen, met behouden voortgang na herladen. De handmatige updatecontrole is getest met twee opeenvolgende productiebuilds: actuele versie melden, nieuwe versie vinden, laden naar een gewijzigde buildtijd en behoud van profiel, ster en sticker. Ook een onbereikbare updateserver en opnieuw laden zonder nieuwe versie zijn gecontroleerd. Installatie en herstart in vliegtuigstand op een echte iPad moeten nog worden getest.

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

De service worker bewaart de app, oefeningen, illustraties en audio. Het controleren en volledig downloaden van een update mag vijf minuten duren; daarna krijgt het activeren van de nieuwe versie maximaal één minuut. De melding vraagt de app open te laten, omdat grote audio-updates enige tijd kunnen kosten. Tests met een gesimuleerde klok controleren een succesvolle download van vier minuten en de grenzen bij vastgelopen downloads en activatie. Nieuwe versies worden pas na een bewuste klik geladen. Ga naar **Voor ouders → De nieuwste versie** en kies **Controleer op updates**. Na het volledig downloaden van een update verschijnt **Nieuwe versie laden**. Met **App opnieuw laden** controleert de app eerst op updates en herlaadt daarna de nieuwste beschikbare versie. De banner **App bijwerken** blijft ook beschikbaar. Deze knoppen zijn buiten een avontuur te gebruiken; tijdens het controleren en laden kan geen nieuw rondje worden gestart. Het oudergedeelte toont ook de datum en tijd van de huidige build. Een mislukte controle of ontbrekende internetverbinding geeft een melding en laat de huidige app bruikbaar. Een al volledig opgeslagen update kan ook offline worden geladen. Profielen en voortgang blijven behouden; er worden geen websitegegevens gewist. Offline ondersteuning werkt in de productiebuild; `npm run dev` is voor ontwikkelen. Op localhost is HTTPS niet verplicht; op een gepubliceerd adres wel. Sommige ingebouwde browsers ondersteunen geen service workers: de app verwijst dan naar Safari.

Profielen worden niet naar Vercel gestuurd. Ze zijn apparaatgebonden en kunnen verdwijnen wanneer websitegegevens worden gewist of de browser opslag opruimt. Download daarom af en toe een reservekopie. Een andere browser, ander domein of andere iPad deelt deze opslag niet automatisch.

## Inhoud uitbreiden

- `src/content.ts`: publieke ingang voor de oefenbanken, niveaus, rondjes en stickers.
- `src/learning/model.ts`: ondersteunde groepen en onderwerpen, vraagtypen en diagrammen.
- `src/learning/catalog.ts`: leerwerelden, onderwerpkaarten en leerdoelen per groep.
- `src/learning/legacy.ts`: de bestaande oefenbanken voor groep 2, 4 en 5.
- `src/learning/group3.ts`: het startaanbod voor groep 3.
- `src/learning/new-topics.ts`: de zes nieuwe onderwerpen, ieder met twee niveaus.
- `src/learning/rounds.ts`: rondjes samenstellen, recente herhaling beperken, oefensoorten spreiden en antwoorden controleren.
- `src/MatchingGame.tsx` en `src/learning/matching.ts`: open paren en memory, met leeftijdsspecifieke kaarten en controle van koppelingen.
- `src/learning/variants.ts`: varianten genereren binnen het getalbereik en leerdoel.
- `src/learning/repetition.ts`: herkenning van inhoudelijk dezelfde oefening, los van vormgeving en antwoordvolgorde.
- `src/learning/extended-content.ts`: extra letter-, spelling- en leesvragen.
- `src/learning/rhymes.ts`, `src/RhymeWord.tsx` en `src/WordArt.tsx`: veertig rijmvragen met geïllustreerde vraagwoorden en antwoordkaarten.
- `src/learning/variation-assets.ts`: gedeelde patronen en vormnamen voor oefeningen en audio.
- `src/learning/audio.ts`: gedeelde lijst van instructies, hints en antwoordaudio.
- `src/QuestionAnswers.tsx` en `src/OpenAnswer.tsx`: meerkeuze en invullen.
- `src/QuestionVisual.tsx`: klokken, munten, breuken, patronen, vergelijkingen en grafieken.
- `src/storage.ts`: profielmodel, opslag en controle van reservekopieën.
- `src/main.tsx`: profielen, niveaukeuze, speelrondjes en ouderfuncties.
- `src/touch-controls.ts`: Safari-gebaren en lange-drukmenu's beperken, met behoud van normale invoer en snelle antwoordtikken.
- `src/AppPages.tsx`: Eiland, Lessen, Schatten en de vaste navigatie.
- `src/app.css`: de app-indeling, grotere knoppen en speelsere kinderschermen.
- `src/StoryGame.tsx`, `src/StoryScene.tsx`, `src/ExtraStoryScene.tsx` en `src/learning/stories.ts`: verhaalvolgordes, illustraties, begripsvragen en lokale vertellingen.
- `src/BuildingGame.tsx` en `src/learning/building.ts`: blokken sorteren, plankvolgordes en brugmetingen.
- `src/ShopGame.tsx` en `src/learning/shop.ts`: winkelbediening, opdrachten en controle van boodschappen/betalingen.
- `src/progression.ts`: gebieden, mijlpalen en verkennersrangen.
- `src/Art.tsx` en `src/art-catalog.ts`: de gedeelde vectorillustraties en koppeling met bestaande avatars/oefenplaatjes.
- `src/Island.tsx` en `src/IslandScenery.tsx`: compositie per gebied, landschap en schaalvaste contouren.
- `src/styles.css` en `src/app.css`: responsive vormgeving.

Elke runtimevraag bevat een groep, onderwerp, leerdoel en moeilijkheid. Voeg groepen toe aan `GROUPS`, onderwerpen aan `SKILLS`, en registreer het aanbod in de catalogus. De profielvalidatie gebruikt deze gedeelde lijsten. Voor ieder aangeboden niveau zijn minimaal zes verschillende opdrachten in groep 2, acht in groep 3 en tien in groep 4 en 5 nodig. De gedeelde instelling staat in `QUESTIONS_PER_ADVENTURE` in `src/learning/model.ts`.

Naast de recente oefengeschiedenis blijft voortgang voorlopig een rondjeteller per onderwerp, ook als een profiel van groep verandert. Er wordt nog geen beheersing per groep of leerdoel afgeleid uit die tellers.

Alle 1.253 luisterfragmenten staan in `public/audio`. De fragmenten gebruiken Ellen, een Nederlandstalige vrouwenstem met een Vlaams accent, op 125 woorden per minuut. Elk bestand heeft 180 milliseconden aanloop en 320 milliseconden rust aan het einde; ook losse getallen en rekenwoorden krijgen zo ruimte. De goedgekeurde stem wordt tijdens het maken van de bestanden gebruikt: afspelen blijft volledig lokaal en offline. Nieuwe fragmenten worden op macOS gemaakt met de geïnstalleerde stem Ellen en FFmpeg:

```sh
node --experimental-strip-types scripts/generate-audio.mjs
```

De generator maakt standaard alleen ontbrekende bestanden. Gebruik `--force` wanneer bestaande gesproken tekst of de stem verandert. `--voice=Ellen` en `--rate=125` stellen stem en tempo in; `--prefix=story-` beperkt de selectie. Voor parallel genereren kunnen afzonderlijke processen `--shard=0/4` tot en met `--shard=3/4` gebruiken. Bestanden worden pas na een geslaagde omzetting vervangen. Met `--encoder=afconvert` kan de ingebouwde macOS-converter worden gebruikt als alternatief voor FFmpeg; de stem, het tempo en de korte pauzes blijven hetzelfde. De offline-controle gebruikt dezelfde audiolijst, zodat ook nieuwe onderwerpen automatisch worden gecontroleerd.

De eigen appiconen zijn reproduceerbaar met `python3 scripts/generate-icons.py` (Pillow vereist). Beide hulpprogramma's zijn uitsluitend voor het maken van assets en draaien niet bij publicatie of op de iPad.

## Getallentrein en Speurneus voor alle groepen

**Lessen → Rekenen → Getallentrein** laat kinderen kaartjes naar genummerde wagons slepen. Tikken of toetsenbordbediening werkt ook: kies een kaartje en daarna een wagon. Geplaatste kaartjes kunnen worden verwisseld of terug naar het vak gesleept. Met **Trein klaar!** wordt de hele volgorde gecontroleerd. Stap 1 gaat van klein naar groot; stap 2 van groot naar klein.

**Lessen → Ontdekken → Speurneus** toont vier gehusselde kaarten waarvan er precies één afwijkt van de gevraagde regel. Na een fout antwoord blijft het bord staan en verschijnt een hint.

| Groep | Getallentrein | Speurneus, stap 1 / stap 2 |
| --- | --- | --- |
| 2 | Drie of vier getallen tot 10 | Dieren en fruit / een ander aantal |
| 3 | Vier getallen tot 20 | Woorden bij een groep / sommen met een andere uitkomst |
| 4 | Vier getallen tot 100 | Een getal buiten de tafel / enkelvoud tussen meervouden |
| 5 | Getallen tot 1.000, daarna breuken | Een afwijkende breuk / een afwijkende lengtemaat |

Beide spellen hebben eigen oefengeschiedenis, twee niveaus per groep, de gebruikelijke beloningen en 24 gedeelde lokale opdracht- en hintfragmenten. Bestaande profielen en reservekopieën blijven bruikbaar. De inhoud, beoordelingsregels, verwisselen van treinkaartjes, spreiding van opdrachten en reservekopieën worden gecontroleerd in `tests/playful.test.ts`.

## Woordfabriek en Zinnenbouwer

Onder **Lessen → Taal & lezen** staat **Woordfabriek** voor groep 2–5 en **Zinnenbouwer** vanaf groep 3. Beide spellen ondersteunen slepen met muis of vinger, twee keer tikken en het toetsenbord. Kaartjes kunnen worden verwisseld, vervangen of teruggelegd. Herhaalde letters zijn uitwisselbaar: de beoordeling gebruikt het opgebouwde woord, niet de identiteit van een letterkaartje.

| Groep | Woordfabriek, stap 1 / stap 2 | Zinnenbouwer, stap 1 / stap 2 |
| --- | --- | --- |
| 2 | Korte woorden nabouwen / woorden met vier letters, met plaatje en voorbeeld | — |
| 3 | Woorden bij plaatjes / langere woorden en medeklinkercombinaties | Korte zinnen / langere zinnen over dieren |
| 4 | Meervouden bouwen / langere woorden bij plaatjes | Zinnen met beschrijvingen / zinnen met plaatsen en vragen |
| 5 | Samengestelde woorden / moeilijkere spelling bij omschrijvingen | Langere zinnen / bijzinnen met komma's |

De knop **Luister naar het woord/de zin** speelt het doelwoord of de voorbeeldzin af. Bij Zinnenbouwer bouwen kinderen de gesproken zin na; dat maakt de bedoelde volgorde duidelijk, ook wanneer met dezelfde woorden andere zinnen mogelijk zijn. Een voorbeeld laten zien geldt vanaf groep 3 als hulp. Groep 2 krijgt het voorbeeld standaard als onderdeel van de oefening in letterherkenning. Het model verdwijnt bij de volgende opdracht. Hoofdletters staan op de woordkaartjes; punten, komma's en vraagtekens zijn losse kaartjes.

Opdrachten, hints, doelwoorden en zinnen zijn lokaal ingesproken en worden meegenomen in de offlinecache. De spellen gebruiken dezelfde sterren, oefengeschiedenis, felicitatie en vraagovergangen als de rest van de app. Bestaande reservekopieën blijven bruikbaar. In `tests/language.test.ts` staan controles voor woordopbouw, herhaalde letters, leestekens, niveaus, variatie, beloningen en lokale audio. De Getallentrein deelt de sleepbediening en is na het hergebruik opnieuw in de browser gecontroleerd.

## Klankstudio en Rekenbus

**Lessen → Taal & lezen → Klankstudio** is beschikbaar in groep 2 en 3. Kinderen luisteren naar een reeks losse spraakklanken of herhalen één klank met een eigen luisterknop. Daarna kiezen ze het bijbehorende plaatje. Het hele woord wordt uitgesproken als bevestiging bij een goed antwoord. De klanken zichtbaar maken telt als hulp; bij een nieuwe opdracht verdwijnen die weer.

**Lessen → Rekenen → Rekenbus** is beschikbaar in groep 2–4. Bij elke halte verplaatsen kinderen passagiers tussen de bus en het perron, met slepen, tikken of het toetsenbord. Verplaatsingen kunnen ongedaan worden gemaakt. Bij te veel uitstappers kunnen ze passagiers terugzetten; de volgende halte gaat pas open wanneer het gevraagde aantal is verplaatst. Na de laatste halte kiezen kinderen hoeveel passagiers nog in de bus zitten. Een hele rit kan opnieuw.

| Groep | Klankstudio, stap 1 / stap 2 | Rekenbus, stap 1 / stap 2 |
| --- | --- | --- |
| 2 | Korte woorden / woorden met lange klinkers en tweetekenklanken | Instappen tot 5 / in- en uitstappen tot 10 |
| 3 | Lange klinkers en tweetekenklanken / medeklinkercombinaties | Eén halte tot 10 / twee haltes tot 20 |
| 4 | — | Twee haltes tot 20 / drie haltes tot 30 |

Beide spellen hebben twee niveaus, lokale audio, eigen oefengeschiedenis en dezelfde sterren en felicitaties als de andere spellen. De bestaande profielen en reservekopieën blijven bruikbaar. `tests/sound-bus.test.ts` controleert de klankreeksen, plaatjes, rekenritten, over- en ondergrenzen, omkeerbare passagiersverplaatsingen, variatie, beloningen en audiobestanden.

### Losse klanken maken

De spraakklanken worden apart gegenereerd; gewone tekst-naar-spraak zou bijvoorbeeld de letternaam ‘em’ kunnen uitspreken in plaats van de klank /m/. De auteurstool gebruikt [IPA-uitspraak met AVSpeechUtterance](https://developer.apple.com/documentation/avfaudio/avspeechutterance/init(attributedstring:)) en schrijft alleen bestanden. De app zelf gebruikt geen spraakdienst, microfoon of native macOS-code.

```sh
node --experimental-strip-types scripts/generate-phonemes.mjs
node --experimental-strip-types scripts/generate-audio.mjs --prefix=klank- --encoder=afconvert
node --experimental-strip-types scripts/generate-audio.mjs --prefix=rekenbus- --encoder=afconvert
```

De eerste opdracht vereist macOS met Command Line Tools en de Nederlandse stemmen Xander en Ellen. De fonetische notaties staan in `src/learning/sound-studio.ts`. De auteurstool controleert op stil signaal, voegt korte pauzes toe en brengt de piekniveaus op gelijke hoogte. Voor de korte u gebruikt Xander een engine-specifieke uitspraakalias; die is vergeleken met de klinker in natuurlijk uitgesproken ‘mus’, ‘bus’ en ‘put’. De canonieke IPA-notatie in de inhoud blijft /ʏ/. Gebruik `--force` om bestaande klankbestanden opnieuw te maken. De gewone audiogenerator slaat deze fonetische bestanden bewust over.

## Geleidelijke uitdaging per eiland en spel

‘Verras me!’ bouwt de uitdaging op met het hoogst vrijgespeelde eiland. Het aandeel stap-2-opdrachten stijgt geleidelijk van ongeveer 15% naar 55%, zolang de recente resultaten van dat spel dat toelaten. Een nieuw spel begint ook op een laat eiland met hooguit één stap-2-opdracht. Bij veel hulp in recente opdrachten wordt het weer rustiger. Bij rekenen worden daarnaast de getalgroottes geleidelijk uitgebreid binnen de gekozen groep. Expliciet gekozen stap 1 en stap 2 houden hun vaste aanbod.

Het profiel bewaart per groep en spel maximaal 24 recente resultaten: het niveau, of de opdracht zonder fout antwoord of hint is opgelost en of het een proefvraag was. Deze informatie wordt samen met de ster opgeslagen na een afgeronde ronde. Een afgebroken rondje telt niet mee. Bestaande profielen beginnen zonder deze gegevens voorzichtig; sterren, eilanden en oude reservekopieën blijven werken. Een groepswijziging gebruikt de resultaten van de gekozen groep.

Vanaf Wolkenrijk kan bij rekenen en Woordfabriek maximaal één proefvraag uit de volgende groep verschijnen, na minstens twaalf gewone opdrachten, recente zelfstandige successen en voldoende succes op stap 2 wanneer dat spel twee niveaus heeft. Bij rekenen blijft de overstap beperkt: maximaal 12 vanuit groep 2, 25 vanuit groep 3 en 120 vanuit groep 4. Bij Woordfabriek worden eenvoudige opdrachten uit het volgende groepsniveau gebruikt. De profielgroep blijft gelijk, hulp is beschikbaar en groep 5 krijgt geen opdrachten uit een nog niet aangeboden groep 6. Na hulp bij een proefvraag volgen eerst weer gewone opdrachten. Andere spelvormen groeien voorlopig via hun eigen twee niveaus.

De proefvraag heet voor kinderen ‘Een kleine uitdaging’. De beschrijving bij de niveaukeuze en de informatie voor ouders leggen de opbouw uit. Een eerder eiland bekijken verlaagt het niveau niet: het hoogst vrijgespeelde eiland blijft de basis en stap 1 is de vaste rustige keuze. De checks in `tests/adaptive.test.ts` controleren grenzen, terugschakelen, de expliciete stappen, proefvragen, groepen, geschiedenis en reservekopieën.
