import { splitSql } from './split-sql';

describe('Split SQL', () => {
  it('should split simple statements', () => {
    expect(
      splitSql(`
      SELECT now();
      SELECT now();
      `),
    ).toHaveLength(2);
  });

  it('should group transactions', () => {
    expect(
      splitSql(`
      BEGIN;
      SELECT now();
      SELECT now();
      COMMIT;
      `),
    ).toHaveLength(1);
  });

  // it('should group DO blocks', () => {
  //   expect(
  //     splitSql(`
  //     DO $$
  //     BEGIN
  //       RAISE NOTICE 'Inside DO block 1';
  //     END
  //     $$;
  //     DO $$
  //     BEGIN
  //       RAISE NOTICE 'Inside DO block 2';
  //     END
  //     $$;
  //     SELECT now();
  //     `),
  //   ).toEqual([
  //     `DO $$ BEGIN RAISE NOTICE 'Inside DO block 1'; END $$`,
  //     `DO $$ BEGIN RAISE NOTICE 'Inside DO block 2'; END $$`,
  //     `SELECT now()`,
  //   ]);
  // });
});
