var client;

const ZAF = {
  start() {
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

      return client;
  },

  getEmail() {
    return client.get(['ticket.requester.email']).then((data) => {
      return data['ticket.requester.email'];
    });
  },

  getRequester() {
    return client.get(['ticket.requester']).then((data) => {
      return data['ticket.requester'];
    });
  },

  getMetadata() {
    return client.metadata().then((md) => {
      console.log(md);
      return md;
    });
  },

  getContext() {
    return client.context().then((context) => {
      console.log(context);
    });
  }
};

export default ZAF;
