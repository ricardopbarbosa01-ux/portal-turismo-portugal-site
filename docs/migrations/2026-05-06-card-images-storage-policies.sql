-- Storage policies for card-images bucket
-- IMPORTANT: Run AFTER creating the bucket via Supabase Dashboard
-- Date: 2026-05-06

-- Public read access
CREATE POLICY "Public read card-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'card-images');

-- Service role write (Edge Functions only)
CREATE POLICY "Service role insert card-images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'card-images');

CREATE POLICY "Service role update card-images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'card-images');

CREATE POLICY "Service role delete card-images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'card-images');

-- Rollback:
--   DROP POLICY "Public read card-images" ON storage.objects;
--   DROP POLICY "Service role insert card-images" ON storage.objects;
--   DROP POLICY "Service role update card-images" ON storage.objects;
--   DROP POLICY "Service role delete card-images" ON storage.objects;
