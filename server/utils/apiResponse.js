const apiResponse = ({ success = true, message = '', data = null }) => ({
  success,
  message,
  data
});

module.exports = apiResponse;
