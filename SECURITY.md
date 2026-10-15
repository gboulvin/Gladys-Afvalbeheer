# Security policy

## Reporting a vulnerability

Please do **not** report a security problem in a public issue, pull request or
forum post.

Report it privately through GitHub instead: open the **Security** tab of this
repository, then **Report a vulnerability**.

No such button? Private reporting is not enabled yet: open an issue that only
asks the maintainer for a private contact, without any detail of the problem,
and send the report there.

Include, when you can:

- the version of the integration and of Gladys;
- the waste collector selected in the configuration;
- what an attacker can do, and the steps to reproduce it;
- the log lines that help (remove your address, tokens and IP addresses
  first).

The fix ships as a new version of the integration, and the advisory is
published once users can update.

## Supported versions

Only the latest release receives security fixes: update the integration from
Gladys before reporting a problem.

## What the integration handles

- **Your address** (postcode, house number, street, municipality) is stored in
  the Gladys configuration and sent only to the waste collector you selected,
  over HTTPS, to look up your schedule. It only shows up in the logs when a
  lookup fails ("street … not found in …"): remove it before sharing logs.
- **No account, no password, no API key of yours** is ever asked. Some
  collectors use the public keys shipped in their own web or mobile apps; the
  Burgerportaal collectors create an anonymous session whose refresh token is
  kept in `/data/state.json`, inside the integration's private volume.
- The container runs as a non-root user on a read-only root filesystem and only
  writes to `/data`.

## Scope

In scope: the code of this repository and the Docker image it publishes.

Out of scope: Gladys Assistant itself (see its
[security policy](https://github.com/GladysAssistant/Gladys/security/policy)),
and the waste collectors' services the integration reads.
