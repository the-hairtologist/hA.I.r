
-- Remove admin role from tomtocutit@gmail.com account
-- This account will remain as stylist-only
DELETE FROM user_roles 
WHERE user_id = '068e1b8d-77b2-4e50-918f-dd8b0d8c3d1e' 
AND role = 'admin';
