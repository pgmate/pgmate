import { parsePGString } from './parse-pgstring';

describe('parsePGString', () => {
  it('should parse a connection string with all components', () => {
    const connectionString = 'postgres://user:password@localhost:5432/database';
    const result = parsePGString(connectionString);
    expect(result).toEqual({
      host: 'localhost',
      port: '5432',
      user: 'user',
      password: 'password',
      database: 'database',
    });
  });

  it('should parse a connection string without port', () => {
    const connectionString = 'postgres://user:password@localhost/database';
    const result = parsePGString(connectionString);
    expect(result).toEqual({
      host: 'localhost',
      port: '5432',
      user: 'user',
      password: 'password',
      database: 'database',
    });
  });

  it('should parse a connection string without user and password', () => {
    const connectionString = 'postgres://localhost:5432/database';
    const result = parsePGString(connectionString);
    expect(result).toEqual({
      host: 'localhost',
      port: '5432',
      user: '',
      password: '',
      database: 'database',
    });
  });

  it('should parse a connection string without database', () => {
    const connectionString = 'postgres://user:password@localhost:5432/';
    const result = parsePGString(connectionString);
    expect(result).toEqual({
      host: 'localhost',
      port: '5432',
      user: 'user',
      password: 'password',
      database: '',
    });
  });

  // it('should parse a connection string with IPv6 host', () => {
  //   const connectionString = 'postgres://user:password@[::1]:5432/database';
  //   const result = parsePGString(connectionString);
  //   expect(result).toEqual({
  //     host: '::1',
  //     port: '5432',
  //     user: 'user',
  //     password: 'password',
  //     database: 'database',
  //   });
  // });
});
