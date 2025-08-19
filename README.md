# Freckle

A Discord app and its website.

## Running the app

This is in case you want to run your own instance of Freckle.
If you came here looking for how to use it as a user, check [Freckle's website](https://add1tive.github.io/freckle/).

1. Install [NodeJS](https://nodejs.org/).
2. Install [pnpm](https://pnpm.io/).
3. Rename the "[.env_template](./app/.env_template)" file inside the app/ folder to ".env" and populate it with your credentials.
    1. `TOKEN` is your Discord app's bot token
    2. `CLIENT_ID` is your Discord app's ID
    3. `SECRET` can be any string
        * it acts as a password for encrypted user files (such as their settings)
        * if you ever lose it, you'll lose that data too
4. Run `pnpm install` or `pnpm i`.
5. Run `pnpm app:start` (or `pnpm start` if you're inside the app/ folder).

### Using [tmux](https://github.com/tmux/tmux/wiki)

Tip: if you're trying to run this on a Unix-like server, I recommend using tmux:

`tmux new -d -sfreckle "pnpm app:start"`

(or `tmux new -d -sfreckle "pnpm start"` if you're inside the app/ folder)

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
