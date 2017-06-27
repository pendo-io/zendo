var client;

export function start() {
    /* eslint-disable no-undef */
    client = ZAFClient.init();
    if (!client) {
      console.log("Failed to initialized ZAFClient");
      return;
    }

    client.invoke('resize', {
      width: '100%',
      height: '400px'
    });
};

export function getEmail() {
  return client.get(['ticket.requester.email']).then((data) => {
    console.log(`Found ticket.requester.name to be -> ${JSON.stringify(data)}`)
  });
}

export function getMetadata() {
  return client.metadata().then((md) => {
    console.log(md);
  });
}

export function getContext() {
  return client.context().then((context) => {
    console.log(context);
  });
}
