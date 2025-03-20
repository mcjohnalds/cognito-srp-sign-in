# cognito-srp-sign-in

CLI tool which signs in to a Cognito user pool using SRP.

## Usage

```
npm i -g cognito-srp-sign-in
cognito-srp-sign-in \
  --username <username> \
  --password <password> \
  --clientId <clientId> \
  --userPoolId <userPoolId>
```

## Development

```
npm run lint
npm run build
npm publish
```
