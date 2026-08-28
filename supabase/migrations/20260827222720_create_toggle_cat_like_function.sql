/*
# Cat like toggle function

1. New Function
  - `toggle_cat_like(target uuid)` — SECURITY DEFINER
    - Toggles the current user's like on a cat spot.
    - Inserts or removes the row in `cat_likes` for `auth.uid()`.
    - Keeps `cat_spots.like_count` accurate atomically (needed because the
      owner-only UPDATE policy would otherwise block one user from bumping
      another user's cat like tally).
    - Returns the new like_count and whether the user now likes the spot.

2. Security
  - Runs as definer with a fixed search_path.
  - Requires an authenticated user (raises if auth.uid() is null).
  - EXECUTE granted to the authenticated role only.
*/

CREATE OR REPLACE FUNCTION toggle_cat_like(target uuid)
RETURNS TABLE (like_count integer, liked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing uuid;
  new_count integer;
  now_liked boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO existing FROM cat_likes
    WHERE user_id = uid AND cat_spot_id = target;

  IF existing IS NULL THEN
    INSERT INTO cat_likes (user_id, cat_spot_id) VALUES (uid, target);
    UPDATE cat_spots SET like_count = like_count + 1
      WHERE id = target RETURNING cat_spots.like_count INTO new_count;
    now_liked := true;
  ELSE
    DELETE FROM cat_likes WHERE id = existing;
    UPDATE cat_spots SET like_count = GREATEST(like_count - 1, 0)
      WHERE id = target RETURNING cat_spots.like_count INTO new_count;
    now_liked := false;
  END IF;

  RETURN QUERY SELECT COALESCE(new_count, 0), now_liked;
END;
$$;

REVOKE EXECUTE ON FUNCTION toggle_cat_like(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION toggle_cat_like(uuid) TO authenticated;
