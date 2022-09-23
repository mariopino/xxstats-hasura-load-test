import { execute } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import gql from 'graphql-tag';
import ws from 'ws';

// number of clients to run
const instances = 100;

// graphql endpoint
const GRAPHQL_ENDPOINT = 'wss://dev.xx-network.polkastats.io/graphql';

// home page subscriptions
const subscriptions = [
  {
    name: 'network_last_block',
    query: `subscription blocks {
      block(order_by: { block_number: desc }, where: {}, limit: 1) {
        block_number
        total_issuance
        current_index
        active_era
      }
    }`,
  },
  {
    name: 'network_last_finalized_block',
    query: `subscription blocks {
      block(
        limit: 1
        order_by: { block_number: desc }
        where: { finalized: { _eq: true } }
      ) {
        block_number
      }
    }`,
  },
  {
    name: 'network_totals',
    query: `subscription total {
      total {
        name
        count
      }
    }`,
  },
  {
    name: 'network_accounts',
    query: `subscription account_aggregate {
      account_aggregate {
        aggregate {
          count
        }
      }
    }`,
  },
  {
    name: 'network_total_staked',
    query: `subscription ranking_aggregate {
      ranking_aggregate(where: { active: { _eq: true } }) {
        aggregate {
          sum {
            total_stake
          }
        }
      }
    }`,
  },

  {
    name: 'blocks',
    query: `subscription blocks {
      block(order_by: { block_number: desc }, limit: 10) {
        block_number
        finalized
        block_hash
        total_extrinsics
        total_events
      }
    }`,
  },
  {
    name: 'transfers',
    query: `subscription transfers {
      transfer(order_by: { block_number: desc }, limit: 10) {
        hash
        source
        destination
        amount
      }
    }`,
  },
  {
    name: 'extrinsics',
    query: `subscription extrinsics {
      signed_extrinsic(order_by: { block_number: desc }, limit: 10) {
        block_number
        extrinsic_index
        signer
        section
        method
        hash
        doc
      }
    }`,
  },
  {
    name: 'events',
    query: `subscription events {
      event(order_by: { block_number: desc }, limit: 10) {
        block_number
        event_index
        section
        method
      }
    }`,
  },
  {
    name: 'whale_alert',
    query: `subscription whale_alert {
      whale_alert(
        order_by: { amount: desc, block_number: desc }
        limit: 10
      ) {
        block_number
        hash
        source
        destination
        amount
        timestamp
      }
    }`,
  }
];

const getWsClient = function(wsurl) {
  const client = new SubscriptionClient(
    wsurl, {reconnect: true}, ws
  );
  return client;
};

const createSubscriptionObservable = (wsurl, query) => {
  const link = new WebSocketLink(getWsClient(wsurl));
  return execute(link, { query });
};

function subscribe(client, name, query) {
  const GRAPHQL_QUERY = gql`${query}`;
  const subscriptionClient = createSubscriptionObservable(
    GRAPHQL_ENDPOINT,
    GRAPHQL_QUERY,
  );
  const consumer = subscriptionClient.subscribe(eventData => {
    const timestamp = Date.now();
    console.log(`${timestamp} Received event from client ${client} in '${name}' subscription: ${JSON.stringify(eventData).substring(0,80)}...`);
  }, (err) => {
    console.log(`${timestamp} Error in client ${client} for subscription '${name}'`, err);
  });
}

for (let client = 1; client <= instances; client++) {
  for (const { name, query } of subscriptions) {
    subscribe(client, name, query);
  }
}