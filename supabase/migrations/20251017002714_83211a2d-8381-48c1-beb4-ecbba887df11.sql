-- Fix mutable function search path
-- Set explicit search_path for all public schema functions

DO $$
DECLARE
    func record;
    func_signature text;
BEGIN
    FOR func IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        BEGIN
            -- Build function signature
            func_signature := quote_ident(func.schema_name) || '.' || quote_ident(func.function_name);
            
            IF func.args != '' THEN
                func_signature := func_signature || '(' || func.args || ')';
            ELSE
                func_signature := func_signature || '()';
            END IF;
            
            -- Set search_path for the function
            EXECUTE format('ALTER FUNCTION %s SET search_path = public', func_signature);
            
            RAISE NOTICE 'Set search_path for function: %', func_signature;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not alter function %: %', func_signature, SQLERRM;
        END;
    END LOOP;
END $$;