# xxstats Hasura load test

Simulate user load by subscribing to all xxstats block explorer home page's subscriptions.

Run test for 100 clients (default):

```
git clone https://github.com/mariopino/xxstats-hasura-load-test.git
yarn
node index.js
```

You can configure a custom number of clients to run in `index.js`

```
// number of clients to run
const instances = 100;
```