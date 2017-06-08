export default function start() {
  window.addEventListener('load', () => {

    if (typeof ZAFClient !== 'undefined') {
      /* eslint-disable no-undef */
      if (!ZAFClient) return;

      var client = ZAFClient.init();
      if (!client) {
        console.log("Failed to initialized ZAFClient");
        return;
      }

      client.invoke('resize', {
        width: '100%',
        height: '400px'
      });
    }
  });
};
