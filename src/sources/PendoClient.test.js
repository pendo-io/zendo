import Pendo from './PendoClient';

const mockRequest = jest.fn();
const mockClient = { request: mockRequest };
const HOST = 'app.pendo.io';
const SECURE_HEADER = { 'X-Pendo-Integration-Key': '{{setting.apiKey}}' };

beforeEach(() => {
  mockRequest.mockReset();
});

// ─── getBaseUrl ───────────────────────────────────────────────────────────────

describe('getBaseUrl', () => {
  [
    ['app.pendo.io',                 'https://app.pendo.io'],
    ['app.eu.pendo.io',              'https://app.eu.pendo.io'],
    ['app.pendo-dev.pendo-dev.com',  'https://app.pendo-dev.pendo-dev.com'],
    ['app.pendo-link.pendo-dev.com', 'https://app.pendo-link.pendo-dev.com'],
  ].forEach(([host, expected]) => {
    it(`builds URL for ${host}`, () => {
      expect(Pendo.getBaseUrl(host)).toBe(expected);
    });
  });
});

// ─── Secure request contract ──────────────────────────────────────────────────
// Every API method must proxy through ZAF with {{setting.apiKey}} so the key is
// never exposed in the browser. Verify the invariant for every method.

describe('secure request contract', () => {
  [
    {
      name: 'fetchUserById',
      call: () => Pendo.fetchUserById(mockClient, HOST, 'user@example.com'),
      mockResponse: { id: 'v1' },
    },
    {
      name: 'findAccountStream',
      call: () => Pendo.findAccountStream(mockClient, HOST, 'acct1'),
      mockResponse: { id: 'acct1' },
    },
    {
      name: 'getMetadataSchema',
      call: () => Pendo.getMetadataSchema(mockClient, HOST, 'visitor'),
      mockResponse: {},
    },
    {
      name: 'getVisitorHistory',
      call: () => Pendo.getVisitorHistory(mockClient, HOST, 'v1', new Date()),
      mockResponse: [],
    },
    {
      name: 'getPages',
      call: () => Pendo.getPages(mockClient, HOST),
      mockResponse: [],
    },
    {
      name: 'getFeatures',
      call: () => Pendo.getFeatures(mockClient, HOST),
      mockResponse: [],
    },
    {
      name: 'getTrackTypes',
      call: () => Pendo.getTrackTypes(mockClient, HOST),
      mockResponse: [],
    },
    {
      name: 'getGuides',
      call: () => Pendo.getGuides(mockClient, HOST, ['g1']),
      mockResponse: [],
    },
  ].forEach(({ name, call, mockResponse }) => {
    it(`${name} sends {{setting.apiKey}} with secure: true`, () => {
      mockRequest.mockImplementation(() => Promise.resolve(mockResponse));
      return call().toPromise().then(() => {
        expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
          headers: expect.objectContaining(SECURE_HEADER),
          secure: true,
        }));
      });
    });
  });

  it('runAggregation sends {{setting.apiKey}} with secure: true', () => {
    mockRequest.mockImplementation(() => Promise.resolve({ results: [] }));
    return Pendo.runAggregation(mockClient, HOST, {}).toArray().toPromise().then(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        headers: expect.objectContaining(SECURE_HEADER),
        secure: true,
      }));
    });
  });
});

// ─── fetchUserById ────────────────────────────────────────────────────────────

describe('fetchUserById', () => {
  it('requests the correct visitor URL', () => {
    mockRequest.mockImplementation(() => Promise.resolve({ id: 'user@example.com' }));
    return Pendo.fetchUserById(mockClient, HOST, 'user@example.com').toPromise().then(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://app.pendo.io/api/v1/visitor/user@example.com',
        type: 'GET',
      }));
    });
  });
});

// ─── findUsersByField ─────────────────────────────────────────────────────────

describe('findUsersByField', () => {
  it('prepends _lc_ to the field key before requesting', () => {
    mockRequest.mockImplementation(() => Promise.resolve([{ id: 'v1' }]));
    return Pendo.findUsersByField(mockClient, HOST, 'visitor/email', 'u@example.com').toPromise().then(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://app.pendo.io/api/v1/visitor/metadata/visitor/_lc_email/u@example.com',
      }));
    });
  });

  it('does not double-apply _lc_ if already present', () => {
    mockRequest.mockImplementation(() => Promise.resolve([{ id: 'v1' }]));
    return Pendo.findUsersByField(mockClient, HOST, 'visitor/_lc_email', 'u@example.com').toPromise().then(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://app.pendo.io/api/v1/visitor/metadata/visitor/_lc_email/u@example.com',
      }));
    });
  });

  it('emits each matching user', () => {
    const users = [{ id: 'v1' }, { id: 'v2' }];
    mockRequest.mockImplementation(() => Promise.resolve(users));
    return Pendo.findUsersByField(mockClient, HOST, 'visitor/email', 'u@example.com')
      .toArray().toPromise().then((result) => {
        expect(result).toEqual(users);
      });
  });

  it('errors when no users are returned', () => {
    mockRequest.mockImplementation(() => Promise.resolve([]));
    return Pendo.findUsersByField(mockClient, HOST, 'visitor/email', 'u@example.com')
      .toPromise()
      .then(() => { throw new Error('expected rejection'); })
      .catch((err) => {
        expect(err.message).toBe('No Users Found');
      });
  });
});

// ─── runAggregation ───────────────────────────────────────────────────────────

describe('runAggregation', () => {
  it('sends a POST with the aggregation body as JSON', () => {
    const agg = { source: { visitors: null } };
    mockRequest.mockImplementation(() => Promise.resolve({ results: [] }));
    return Pendo.runAggregation(mockClient, HOST, agg).toArray().toPromise().then(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://app.pendo.io/api/v1/aggregation',
        type: 'POST',
        data: JSON.stringify(agg),
      }));
    });
  });

  it('emits each result row', () => {
    const results = [{ count: 5 }, { count: 3 }];
    mockRequest.mockImplementation(() => Promise.resolve({ results }));
    return Pendo.runAggregation(mockClient, HOST, {}).toArray().toPromise().then((emitted) => {
      expect(emitted).toEqual(results);
    });
  });
});

// ─── getVisitorHistory ────────────────────────────────────────────────────────

describe('getVisitorHistory', () => {
  it('includes a numeric starttime parameter in the URL', () => {
    mockRequest.mockImplementation(() => Promise.resolve([]));
    return Pendo.getVisitorHistory(mockClient, HOST, 'v1', new Date('2024-06-15T14:30:00Z'))
      .toPromise().then(() => {
        const { url } = mockRequest.mock.calls[0][0];
        expect(url).toMatch(/\/api\/v1\/visitor\/v1\/history\?starttime=\d+/);
      });
  });

  it('normalizes the date to midnight before computing starttime', () => {
    mockRequest.mockImplementation(() => Promise.resolve([]));
    const date = new Date('2024-06-15T14:30:45.999Z');
    return Pendo.getVisitorHistory(mockClient, HOST, 'v1', date).toPromise().then(() => {
      const { url } = mockRequest.mock.calls[0][0];
      const starttime = parseInt(url.match(/starttime=(\d+)/)[1], 10);
      const d = new Date(starttime);
      expect(d.getSeconds()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getMilliseconds()).toBe(0);
    });
  });
});

// ─── getGuides ────────────────────────────────────────────────────────────────

describe('getGuides', () => {
  it('returns empty observable immediately without making a request for empty ids', () => {
    return Pendo.getGuides(mockClient, HOST, []).toPromise().then((result) => {
      expect(result).toEqual([]);
      expect(mockRequest).not.toHaveBeenCalled();
    });
  });

  it('joins multiple ids into the query string', () => {
    mockRequest.mockImplementation(() => Promise.resolve([]));
    return Pendo.getGuides(mockClient, HOST, ['g1', 'g2', 'g3']).toPromise().then(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://app.pendo.io/api/v1/guide?id=g1,g2,g3',
      }));
    });
  });

  it('returns empty array when the request fails', () => {
    mockRequest.mockImplementation(() => Promise.reject(new Error('not found')));
    return Pendo.getGuides(mockClient, HOST, ['g1']).toPromise().then((result) => {
      expect(result).toEqual([]);
    });
  });
});

// ─── getItemId ────────────────────────────────────────────────────────────────

describe('getItemId', () => {
  [
    [{ pageId: 'p1' },      'p1'],
    [{ featureId: 'f1' },   'f1'],
    [{ guideId: 'g1' },     'g1'],
    [{ trackTypeId: 't1' }, 't1'],
  ].forEach(([item, expected]) => {
    it(`returns ${expected} for ${Object.keys(item)[0]}`, () => {
      expect(Pendo.getItemId(item)).toBe(expected);
    });
  });
});
