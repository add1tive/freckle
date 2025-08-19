# Freckle

A Discord app and its website.

## Running the app

This is in case you want to run your own instance of Freckle.
If you came here looking for how to use it as a user, check [Freckle's website](https://add1tive.github.io/freckle/).

1. Install [NodeJS](https://nodejs.org/)2
2. Install [pnpm](https://pnpm.io/).
3. Run `pnpm app:start`.

### Using [tmux](https://github.com/tmux/tmux/wiki)

Tip: if you're trying to run this on a Unix-like server, I recommend using tmux:

`tmux new -d -sfreckle "pnpm tsx index.ts"`

This creates a little shell session running in the background that **doesn't close when you close your SSH session**.
If you want to stop it, run:

`tmux kill-session -t freckle`

### Using the bash scripts

The [run script](./app/server-run.sh) uses the tmux method described above.

There is also an [update script](./app/update-run.sh) that runs `git pull` and restarts Freckle if it's running.

If the scripts won't run, run `chmod +x *.sh`.

## Documentation

See [Freckle's website](https://add1tive.github.io/freckle/).

## Licensing

Freckle's **original** code (app and website) is licensed under [GPL v3](./LICENSE).

Third-party components and their respective licenses are listed below.

### [modern-normalize](https://github.com/sindresorhus/modern-normalize)

[MIT license](./web/static/styles/modern-normalize/license)

```txt
Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
Copyright (c) Jonathan Neal
Copyright (c) Nicolas Gallagher
```

### [Fira Sans](https://fonts.google.com/specimen/Fira+Sans)

[OFL](./web/static/fonts/fira-sans-v17-latin/OFL.txt)

```txt
Copyright (c) 2012-2015, The Mozilla Foundation and Telefonica S.A.
```
