# contracts

## Testing

A set of test code for the contracts is included.  Use the following steps to run the tests against a simulated chain.

These tests requre a recent (v7 at least) version of node.  v7.10.0 is known to work although more recent ones should also work.

1. Install dependancies: `npm install`
2. Run: `npm test`

Alternatively, you can run the commands manually:
1. Run `./node_modules/.bin/testrpc -p 18545 --deterministic smartpool`
2. Run `./node_modules/.bin/truffle test`
