# contracts

## Testing

A set of test code for the contracts is included.  Use the following steps to run the tests against a simulated chain.

1. Install dependancies: `npm install`
2. Run `./node_modules/.bin/testrpc -p 18545 --deterministic smartpool`
3. Run `./node_modules/.bin/truffle test`
