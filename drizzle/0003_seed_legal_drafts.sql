INSERT INTO "content_pages" ("slug", "title", "body", "status")
VALUES
  ('kvkk', 'Kişisel Verilerin Korunması', '', 'draft'),
  ('gizlilik', 'Gizlilik Politikası', '', 'draft')
ON CONFLICT ("slug") DO NOTHING;
