DELETE FROM place_content WHERE place_id IN (SELECT id FROM places WHERE name = 'Mahabalipuram') AND content_hi IS NULL;
