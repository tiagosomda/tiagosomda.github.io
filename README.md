# tiago.dev

The personal website at [www.tiago.dev](https://www.tiago.dev), reimagined as the personal exploration vessel TIAGO.DEV.

## Command Bridge

The default theme is a cinematic glass-and-starlight command bridge. Wide screens use three columns: navigation and the cognitive core on the port side, the portrait-friendly mission channel in the center, and radar/ship systems on starboard. At tablet and phone sizes, the center channel becomes the complete experience.

Source: `src/themes/tiago-command-bridge`

## Captain's Logs

The theme fetches the latest entries from `https://notes.tiago.dev/index.xml` in the browser. The feed supports cross-origin requests. If the downlink is unavailable, the interface falls back to a direct archive link.

## Build

From the repository root:

```sh
sh src/deploy.sh
```

The script builds Command Bridge into `docs/` and preserves the GitHub Pages `CNAME`. Committing the generated `docs/` directory publishes the site through the existing GitHub Pages setup.

Shared profile content lives in `src/data/mission.toml`. The active root theme is selected in `src/config.toml`.
