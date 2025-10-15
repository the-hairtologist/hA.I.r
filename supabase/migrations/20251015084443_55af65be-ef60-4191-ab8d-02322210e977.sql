-- Clean up user roles for tomtocutit@gmail.com
-- Remove client role, keep admin and stylist
DELETE FROM user_roles 
WHERE user_id = '068e1b8d-77b2-4e50-918f-dd8b0d8c3d1e' 
AND role = 'client';

-- Also remove the client profile since they won't be using client role
DELETE FROM client_profiles 
WHERE user_id = '068e1b8d-77b2-4e50-918f-dd8b0d8c3d1e';