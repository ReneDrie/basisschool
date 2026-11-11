import { WifiOff } from 'lucide-react';

/** How to put the app on an iPad's home screen and get it ready for offline use. */
export function InstallGuide() {
  return (
    <>
      <p className="modal-intro">Zet Kleine Ontdekkers op je beginscherm. Zo voelt het als je eigen app.</p>
      <ol className="install-steps">
        <li>
          <span>1</span>
          <div>
            <strong>Open deze website in Safari</strong>
            <p>Gebruik op je iPad het adres van de gepubliceerde app.</p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>Tik op de deelknop</strong>
            <p>Kies ‘Zet op beginscherm’ en, als je die optie ziet, ‘Open als webapp’.</p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Open je nieuwe app</strong>
            <p>Laat hem één keer online alles opslaan. Wacht op ‘Klaar voor offline spelen’.</p>
          </div>
        </li>
      </ol>
      <div className="install-tip">
        <WifiOff size={22} />
        <p>Daarna kun je ook zonder wifi oefenen. Test het gerust even in vliegtuigstand.</p>
      </div>
      <p className="small-text">
        Maak profielen aan vanuit de app op het beginscherm. Een andere browser of een ander apparaat kan eigen, aparte opslag
        gebruiken.
      </p>
    </>
  );
}
