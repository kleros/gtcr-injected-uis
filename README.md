<p align="center">
  <b style="font-size: 32px;">GTCR Injected UIs</b>
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

Remeber to provide dispute data on the URL. It should be a JSON object containing the arbitrator and arbitrable addresses, as well as the disputeID as follows:

```
?{"arbitrableContractAddress":"0xdeadbeef...","arbitratorContractAddress":"0xdeadbeef...","disputeID":"111"}
```

Which URL encoded and concatenated with the site's path would look something like:

`http://localhost:3000?%7B%22arbitrableContractAddress%22%3A%220xdeadbeef%22%2C%22arbitratorContractAddress%22%3A%220xdeadbeeff%22%2C%22disputeID%22%3A%22111%22%7D`

## Other Scripts

- `yarn format` - Lint, fix and prettify all the project.
.js files with styled components and .js files.
- `yarn run cz` - Run commitizen.
