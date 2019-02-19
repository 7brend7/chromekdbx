# ChromeKdbx

> Chrome extension for manage site's password using Kdbx format.

## Why do we need this?

No clouds! All passwords stores locally.

Kdbx is a great format and KeeWeb is a great utility for managing passwords... but not useful for
browser pages even with auto-type function.

This extension helps us to automatically login into sites.
It inserts previously stored login and password into appropriate fields;

ChromeKdbx uses kdbxweb for working with local db with ability to import/export to local directory;

## Security

Kdbx file and password for them are stored in extension's IndexedDB store.

Some research shows me that it's ok to store such data in local storage.

## How it works

- `webRequest.onBeforeRequest` track all post requests and fetch username and password;
- `window.onbeforeunload` get css selectors for input fields;
- `IndexedDB` there we store kdbx file and main password;
- `kdbx` format with import/export ability; used `chromekdbx` group as root;
- `custom_scripts` helpers for specific sites where we can't fetch data;

## Dependencies
- [kdbxweb](https://github.com/keeweb/kdbxweb) -  javascript library for read/write KeePass v2 databases

## Todo

- [ ] Typescript!
- [ ] Use regexp in custom scripts;
- [ ] Implement kdbx import with merge (after installation case);
- [ ] Add search input to popup passwords list;
- [ ] Ability to copy username / password;
- [ ] Remove icon after entry removed;

## Contributing
The project is opensource so fill free to comment and participate to it.

## Licence

[GPL 3.0.](https://github.com/7brend7/chromekdbx/blob/master/LICENSE)

## Author

[7brend7](https://github.com/7brend7)

