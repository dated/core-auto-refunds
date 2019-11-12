# Automatic HTLC Refunds

> Automatically send HTLC refunds for expired locks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
yarn global add @dated/auto-refunds
```

## Configuration

Register the plugin at the end of your plugins file, `~/.config/ark-core/devnet/plugins.js`:

```js
module.exports = {
  ...
  "@dated/auto-refunds": {
    enabled: true,
    passphrase: "super dooper passphrase",
    publicKeys: ["*"], // list of sender public keys for which to send refunds
    interval: 5 // interval in blocks between checks for expired locks, defaults to 5
  },
};
```

## Security

If you discover a security vulnerability within this package, please send an e-mail to hello@dated.fun.

## Credits

-   [All Contributors](../../contributors)

## License

[MIT](LICENSE) © [Edgar Goetzendorff](https://dated.fun)
