const inflightRequests = new Map();
const recentResponses = new Map();

const sortObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(value[key]);
        return acc;
      }, {});
  }
  return value;
};

const serializeKey = (url, config = {}) => {
  const params = config.params ? JSON.stringify(sortObject(config.params)) : '';
  return `${url}::${params}`;
};

export const dedupedGet = (api, url, config = {}, options = {}) => {
  const ttlMs = options.ttlMs ?? 1200;
  const key = serializeKey(url, config);
  const now = Date.now();

  const cached = recentResponses.get(key);
  if (cached && now - cached.timestamp < ttlMs) {
    return Promise.resolve(cached.response);
  }

  const existing = inflightRequests.get(key);
  if (existing) return existing;

  const request = api.get(url, config)
    .then((response) => {
      recentResponses.set(key, { response, timestamp: Date.now() });
      return response;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, request);
  return request;
};
