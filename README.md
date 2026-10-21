# Chesa Somplaz – Ferienwohnung St. Moritz

Website für die Saisonmiete der Ferienwohnung Via Somplaz 10, St. Moritz Dorf (DE/EN/IT).

- `src/` – Inhalte und Grundrisse (Quelle aus dem Design-Entwurf)
- `build.js` – erzeugt die statischen Seiten in `site/`
- `site/` – fertige Website (`/`, `/en/`, `/it/`), Bilder, Sitemap
- `.github/workflows/deploy.yml` – baut die Seite bei jedem Push und veröffentlicht sie über GitHub Pages auf chesa-somplaz.ch

Lokal bauen: `node build.js`
