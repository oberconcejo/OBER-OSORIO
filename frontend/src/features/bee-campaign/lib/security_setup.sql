-- =========================================================================
-- CAMPAÑA GANADORA AI - MÁXIMA SEGURIDAD & AISLAMIENTO MULTI-INQUILINO (RLS)
-- =========================================================================
-- Este archivo contiene las políticas avanzadas de seguridad a nivel de fila (RLS)
-- para Postgres/Supabase. Garantiza aislamiento absoluto entre campañas.

-- 1. Función para obtener de forma segura el client_id del usuario autenticado actual
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS TEXT AS $$
DECLARE
  v_client_id TEXT;
  v_email TEXT;
BEGIN
  -- Obtener el email del token JWT de la sesión autenticada de Supabase Auth
  v_email := auth.jwt() ->> 'email';
  
  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  -- Buscar la organización asociada en la tabla users_list
  SELECT client_id INTO v_client_id
  FROM public.users_list
  WHERE email = v_email
  LIMIT 1;

  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS en todas las tablas operativas de la campaña
ALTER TABLE public.users_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- 2. Políticas RLS para la tabla users_list (Gestión de Miembros de Campaña)
DROP POLICY IF EXISTS users_list_tenant_policy ON public.users_list;
CREATE POLICY users_list_tenant_policy ON public.users_list
    FOR ALL
    TO authenticated
    USING (
        -- Un usuario puede ver y modificar registros si pertenecen a su mismo client_id
        client_id = public.get_user_client_id()
        -- O si es su propio registro de usuario
        OR email = (auth.jwt() ->> 'email')
    )
    WITH CHECK (
        client_id = public.get_user_client_id()
        OR email = (auth.jwt() ->> 'email')
    );


-- 3. Políticas RLS para la tabla clients (Información de la Campaña Organizadora)
DROP POLICY IF EXISTS clients_tenant_policy ON public.clients;
CREATE POLICY clients_tenant_policy ON public.clients
    FOR ALL
    TO authenticated
    USING (
        id = public.get_user_client_id()
    )
    WITH CHECK (
        id = public.get_user_client_id()
    );


-- 4. Políticas RLS para la tabla campaigns (Metas y Detalles Electorales)
DROP POLICY IF EXISTS campaigns_tenant_policy ON public.campaigns;
CREATE POLICY campaigns_tenant_policy ON public.campaigns
    FOR ALL
    TO authenticated
    USING (
        client_id = public.get_user_client_id()
    )
    WITH CHECK (
        client_id = public.get_user_client_id()
    );


-- 5. Políticas RLS para la tabla notifications (Alertas e Incidentes de Seguridad)
DROP POLICY IF EXISTS notifications_tenant_policy ON public.notifications;
CREATE POLICY notifications_tenant_policy ON public.notifications
    FOR ALL
    TO authenticated
    USING (
        client_id = public.get_user_client_id()
    )
    WITH CHECK (
        client_id = public.get_user_client_id()
    );


-- 6. Políticas RLS para la tabla audit_logs (Bitácora Inalterable para Auditores)
DROP POLICY IF EXISTS audit_logs_tenant_policy ON public.audit_logs;
CREATE POLICY audit_logs_tenant_policy ON public.audit_logs
    FOR SELECT -- Solo lectura para auditoría interna
    TO authenticated
    USING (
        client_id = public.get_user_client_id()
    );

CREATE POLICY audit_logs_insert_policy ON public.audit_logs
    FOR INSERT -- Inserción automática de logs del sistema
    TO authenticated
    WITH CHECK (
        client_id = public.get_user_client_id()
    );
