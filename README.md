<p align="center">
  <b style="font-size: 32px;">Curate Injected UIs</b>
</p>

<p align="center">
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with Prettier"></a>
</p>

Service and database for handling Generalized TCR contract events.

## Get Started

1.  Clone this repo.
2.  Duplicate `.env.example`, rename it to `.env` and fill in the environment variables.
3.  Run `yarn` to install dependencies and then `yarn start` to run the UI in development mode.

Remeber to provide dispute data on the URL. It should be a JSON object containing the arbitrator and arbitrable addresses, the disputeID, RPC endpoint and chainID as follows:

```
?{"arbitrableContractAddress":"0xdeadbeef...","arbitratorContractAddress":"0xdeadbeef...","disputeID":"111","jsonRpcUrl":"http://localhost:8545","chainId":"1"}
```

### Classic or Light

This codebase has two different iframes: one for classic curate (iframes/item-details) and one for light curate (iframes/light-item-details). You must pick one to build your evidence display.

You can do so by changing the component inside bootstrap/app.jss

### Fallback Provider

Keep in mind that the hardcoded, fallback provider has a specific chainId. Remember to update it if you are building for a specific chain.

## Deploy

This interface is meant to be deployed to IPFS.
To do so, you should:

1. Copy the `.env.example` file to `.env`:
   ```sh
   cp .env.example .env
   ```
2. Set the appropriate environment variables.
3. Bundle the app for production:
   ```sh
   yarn build
   ```
4. Zip the `dist/` directory.
5. Send the zip file to Kleros IPFS host server through SSH (ask a team member if you are not sure how).
6. Unzip the file and jump to the folder.
7. Add the contents of the folder to IPFS:
   ```sh
   ipfs add -w -r .
   ```
8. The `evidenceDisplayURI` will be `/ipfs/<root_hash>`

## Other Scripts

- `yarn format` - Lint, fix and prettify all the project.
  .js files with styled components and .js files.
- `yarn run cz` - Run commitizen.
