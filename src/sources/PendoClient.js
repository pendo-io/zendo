import PropTypes from 'prop-types';

var int_token;

const Pendo = {
  init (token) {
    int_token = token;
    console.log(`got token to be ${token}`);
  },

  findUser (email) {
    console.log(`use ${int_token} to try to find ${email}`);
  }
};

Pendo.init.propTypes = {
  token: PropTypes.string.isRequired,
};
Pendo.findUser.propTypes = {
  email: PropTypes.string.isRequired
}

export default Pendo;
