UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{plan_tier}', '"white_label"')
WHERE email = 'sagarfalcon@gmail.com';
