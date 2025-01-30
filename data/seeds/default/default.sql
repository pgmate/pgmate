
INSERT INTO pgmate.connections VALUES 
  ('default', 'PGMate default db', '6ab72ce6d262350106a9439751ee8b96:829bb3246bcc98c9aefb967d1a2f98ef2edbfe005fda49edd5744818ebc35a25d9062541f1ccf7f7f775314a8f6d903bc1ed2c0f6f3b45ef0326841b584867a9', 'false', '2024-12-04 10:28:16.494423+00', '2024-12-04 12:54:22.217053+00')
, ('c1', NULL, '6ab72ce6d262350106a9439751ee8b96:829bb3246bcc98c9aefb967d1a2f98ef2edbfe005fda49edd5744818ebc35a25d9062541f1ccf7f7f775314a8f6d903bc1ed2c0f6f3b45ef0326841b584867a9', 'false', '2024-12-04 10:28:16.494423+00', '2024-12-04 12:54:22.217053+00')
, ('c2', 'db: template1', '1e1c153fa2fb80c918ffc217fc64a349:7cb0c115e1eb672f119c78bcf0231aa5254b22ef6985ee0f329efca80562cc6f65950eada11ba8fefb879bc400749d41d16adee3ef2e3543cfc4a5a1ba280f25', 'false', '2024-12-04 12:54:20.892407+00', '2024-12-04 12:54:20.892407+00')
ON CONFLICT ON CONSTRAINT "connections_pkey" DO UPDATE SET
    "desc" = EXCLUDED."desc", 
    "conn" = EXCLUDED."conn", 
    "ssl" = EXCLUDED."ssl", 
    "created_at" = EXCLUDED."created_at", 
    "updated_at" = EXCLUDED."created_at";