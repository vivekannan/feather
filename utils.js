const POSSIBLE_OPTIONS = {
  refresher: {
    type: 'function',
    mandatory: true
  },
  refreshInterval: {
    type: 'number',
    mandatory: false,
    default: 30 * 1000
  }
};

function validate(options) {
  var type,
      expected;

  const validated = {};

  Object.keys(POSSIBLE_OPTIONS).forEach((key) => {
    expected = POSSIBLE_OPTIONS[key];

    if (!(key in options)) {
      if(expected.mandatory) {
        throw new Error(`Mandatory key "${key}" missing.`);
      }

      validated[key] = expected.default;
      return;
    }

    type = typeof options[key];

    if (type !== expected.type) {
      throw new Error(`Mandatory key "${key}" of wrong type. Expected: "${expected.type}" Got: "${type}".`);
    }

    validated[key] = options[key];
  });

  return validated;
}

module.exports = {
  validate
};