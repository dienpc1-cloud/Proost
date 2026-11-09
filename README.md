# Proost! 🍻

Drankspellen voor de hele tafel, op ieders eigen telefoon. Eén persoon start een spel, de rest doet mee met een code van vier letters.

**Spellen:** Bussen, Blackjack, Never have I ever, Imposter, Wie zou het eerst en Tikkende bom (die laatste werkt op één telefoon, zonder code).

**Ook erin:** Nederlands en Engels, geluid (aan/uit), statistieken, achievements, een avondscore met awards, en bots om alleen te testen.

---

## Wat zit er in deze map

| Bestand | Wat het doet |
|---|---|
| `server.js` | De server. Bewaart de spelgegevens en stuurt elke wijziging meteen naar alle telefoons. |
| `public/index.html` | Het hele spel: schermen, regels en vertalingen. |
| `public/sync.js` | Koppelt het spel aan de server. |
| `public/manifest.webmanifest`, `icon-*.png` | Zorgen dat je het als app op je beginscherm kunt zetten. |
| `package.json` | Vertelt Node welke onderdelen nodig zijn. |
| `render.yaml` | Instellingen voor Render, zodat online zetten bijna vanzelf gaat. |

---

## Stappenplan: online zetten

Je hebt niets te installeren op je computer nodig, alleen een browser. Reken op ongeveer 15 minuten. Alles is gratis.

### Stap 1: maak een GitHub-account
1. Ga naar [github.com](https://github.com) en maak een gratis account.
2. Klik rechtsboven op **+** en kies **New repository**.
3. Geef het een naam, bijvoorbeeld `proost`. Laat de rest staan en klik **Create repository**.

### Stap 2: zet de bestanden op GitHub
1. Pak de zip uit op je computer.
2. Klik op de pagina van je nieuwe repository op **uploading an existing file**.
3. Sleep **de inhoud** van de map `proost` erin: `server.js`, `package.json`, `render.yaml`, `README.md`, `.gitignore` en de map `public`. Let op dat `public` als map meekomt.
4. Klik onderaan op **Commit changes**.

### Stap 3: zet het online met Render
1. Ga naar [render.com](https://render.com) en log in met je GitHub-account.
2. Klik **New +** en kies **Blueprint**.
3. Kies je repository `proost`. Render leest `render.yaml` en vult alles zelf in.
4. Klik **Apply**. Na een paar minuten staat er een groen vinkje en een adres zoals `https://proost-xxxx.onrender.com`.

Lukt Blueprint niet? Kies dan **New +** › **Web Service**, kies je repository en vul in:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free

### Stap 4: spelen
1. Open je adres op je telefoon.
2. Kies een spel, vul je naam in en tik **Nieuw spel**.
3. Stuur het adres naar je vrienden. Zij vullen de code van vier letters in en tikken **Meedoen**.

### Stap 5: als app op je beginscherm (optioneel)
- **iPhone:** open het adres in Safari › deelknop › **Zet op beginscherm**.
- **Android:** open het adres in Chrome › menu ⋮ › **App installeren** of **Toevoegen aan startscherm**.

Daarna opent Proost! schermvullend, als een gewone app.

---

## Goed om te weten

- **Gratis bij Render valt de server in slaap** als er een kwartier niemand speelt. De eerste keer openen duurt dan ongeveer 30–60 seconden. Daarna is hij weer snel. Wil je dat niet, dan kun je bij Render een betaald abonnement kiezen.
- **Spellen worden in het geheugen bewaard.** Herstart de server (bijvoorbeeld na een update of als hij in slaap valt), dan zijn lopende spellen weg. Statistieken en achievements staan op ieders eigen telefoon en blijven gewoon bewaard.
- **Oude spellen worden na 12 uur vanzelf opgeruimd.**
- **De host houdt het spel bij.** Valt de telefoon van de host uit of gaat het scherm op slot, dan neemt na ongeveer 15 seconden automatisch een andere speler het over.
- **Het is gemaakt voor vrienden, niet voor vreemden.** Iedereen met de code kan meedoen. Iemand die technisch handig is kan in principe de gedeelde spelgegevens bekijken (zoals andermans kaarten of het geheime woord bij Imposter).

---

## Lokaal testen (optioneel)

Heb je [Node.js](https://nodejs.org) (versie 18 of nieuwer)? Dan kun je het ook op je eigen computer draaien:

```bash
npm install
npm start
```

Open daarna `http://localhost:3000`. De terminal laat ook een wifi-adres zien, zoals `http://192.168.1.20:3000`. Dat kunnen vrienden op hetzelfde wifi-netwerk openen.

---

## Iets aanpassen

- **Teksten en vertalingen** staan in `public/index.html`. Zoek op `I18N`.
- **Kaarten voor Never have I ever, Wie zou het eerst, Imposter en Tikkende bom** staan bovenaan in `public/index.html`. Zoek op `CONTENT`. Elke regel heeft de vorm `['Engels', 'Nederlands']`.
- Na een wijziging upload je het bestand opnieuw naar GitHub. Render zet de nieuwe versie dan vanzelf online.

Proost, en drink met mate! 🍻
