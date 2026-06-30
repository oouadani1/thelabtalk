# Mind the Gap — Fellowship Lightning Talk

A simple web app encapsualting my time and projects as Innovation Fellowship at The Lab @ MassDOT as a transit map. I built this for a 10-minute lightning talk to internal MassDOT teammates, on June 24 2026. Feel free to use this architecture for your own projects. Check it out here: https://oouadani1.github.io/thelabtalk/

## Run locally

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

## Keyboard controls

| Key | Action |
|-----|--------|
| `→` `↓` `Space` | Advance to next stop |
| `←` `↑` | Back to previous stop |
| `M` or `Esc` | Toggle map view |
| `F` | Fullscreen |

Click anywhere in stop view to advance. In map view, click any station to jump to it.

## Edit content

**Everything you'll need to change lives in `content.js`.** This should cover all the basic, including: 

- Editing stop text (title, context, objective, how, result)
- Adding or swapping a photo (`image: "images/your-photo.jpg"`)
- Changing the result label to "Insight" instead of "Result" -- or whatever label you want, depending on the project (i.e., outcome, product, etc.)
- Adding people to the Duckling Line (the `PEOPLE` array) -- I didn't have time to build this out, but my idea was to create a second "transit" line with all the people I met and collaborated with during my Fellowship both within and outside of MassDOT, and having them intersect with relevant projects. You can feel free to build this out for your own projects. 

One-line examples:
```js
image: "images/snow.jpg"          // add a photo to a stop
resultLabel: "Insight"            // change the 4th-point label
```

## Add a photo

1. Drop the image in `/images/`
2. In `content.js`, set `image: "images/your-file.jpg"` on the stop

The line routes around the photo automatically.

## File structure

```
index.html      main landing page
style.css       all styles — CSS variables at the top for easy recoloring to your taste
app.js          controls all interactivity
content.js      ALL CONTENT — add and edit your own projects here
fonts/          self-hosted Poppins + IBM Plex Sans (works offline)
images/         project photos (you can add your own once you copy to your local drive)
```
