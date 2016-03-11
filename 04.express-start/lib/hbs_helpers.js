/* global Handlebars:true */

const register = (Handlebars) => {
  const helpers = {
    section: (name, options) => {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    ifEq: (v1, v2, options) => {
      if (v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    ifCond: (v1, operator, v2, options) => {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },
  };

  if (Handlebars && typeof Handlebars.registerHelper === 'function') {
    // register helpers
    for (const prop in helpers) {
      if ({}.hasOwnProperty.call(helpers, prop)) {
        Handlebars.registerHelper(prop, helpers[prop]);
      }
    }
  } else {
    // just return helpers object if we can't register helpers here
    return helpers;
  }
  return null;
};

// client
if (typeof window !== 'undefined') {
  register(Handlebars);
} else { // server
  module.exports.register = register;
  module.exports.helpers = register(null);
}
