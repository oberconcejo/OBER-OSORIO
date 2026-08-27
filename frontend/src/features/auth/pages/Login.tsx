import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../services/auth.service';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@electoral360.com'); // Valor inicial para agilizar QA
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = await authService.login(email, password);
      // El backend retorna: { success: true, data: { access_token, user } }
      const { access_token, user } = payload.data;
      
      login(user, access_token);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'No se pudo conectar al servidor. Verifica tu conexin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Lock size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl">Electoral360</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-danger/15 p-3 text-sm text-danger">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Usuario o Correo
              </label>
              <Input 
                type="text" 
                placeholder="operador@electoral360.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Contrasea
              </label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Validando...' : 'Iniciar Sesin'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
