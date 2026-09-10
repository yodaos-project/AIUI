# Account and Identity

This section explains how an AIUI agent reads Rokid account information after the user grants authorization, and how it passes the user identity to your server through a one-time account code.

> **Regional availability**: Rokid account information authorization is currently available only on the China platform (AIUI Studio China and Rokid AI App China). It is not yet available on the Overseas platform.

The documentation covers the following steps:

- Declaring the account information permission and its usage purpose in AIUI Studio.
- Guiding users through third-party service authorization in the Rokid AI App.
- Checking authorization status and reading basic account information in agent code.
- Verifying the account code and agent ownership on your server.
- Handling the security boundaries of sensitive fields, credentials, and one-time codes.
