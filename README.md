# Mind the Gap — Fellowship Lightning Talk

A static web app presenting Oussama Ouadani's Innovation Fellowship at The Lab @ MassDOT as a transit map. Built for a 10-minute lightning talk to internal MassDOT staff, Spring 2026.

## Run it

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

No build step. No dependencies. Just open the file.

## Keyboard controls

| Key | Action |
|-----|--------|
| `→` `↓` `Space` | Advance to next stop |
| `←` `↑` | Back to previous stop |
| `M` or `Esc` | Toggle map view |
| `N` | Toggle presenter notes (off by default — keep off during the talk) |
| `F` | Fullscreen |

Click anywhere in stop view to advance. In map view, click any station to jump to it.

## Edit content

**Everything you'll need to change lives in `content.js`.** You should not need to touch any other file for:

- Editing stop text (title, context, objective, how, result)
- Adding or swapping a photo (`image: "images/your-photo.jpg"`)
- Changing the result label to "Insight" instead of "Result"
- Moving the `peak: true` flag to a different stop
- Filling in TODOs (visible on screen — search for `[TODO`)
- Adding people to the Duckling Line (the `PEOPLE` array)

One-line examples:
```js
image: "images/snow.jpg"          // add a photo to a stop
resultLabel: "Insight"            // change the 4th-point label
peak: true                        // mark the high point (one stop only)
```

## Add a photo

1. Drop the image in `/images/`
2. In `content.js`, set `image: "images/your-file.jpg"` on the stop

The line routes around the photo automatically.

## File structure

```
index.html      main page
style.css       all styles — CSS variables at the top for easy recoloring
app.js          all interactivity
content.js      ALL CONTENT — edit here
fonts/          self-hosted Poppins + IBM Plex Sans (works offline)
images/         project photos (add your own)
reference/      deck screenshots + essays (voice reference)
```

## Open TODOs (visible on screen)

1. Stop 6: number of posts/animations in the campaign
2. Stop 12: actual scope of the public engagement research
3. Confirm the peak stop (currently stop 9 — Explore Micromobility)
