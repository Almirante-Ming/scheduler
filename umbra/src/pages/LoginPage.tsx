import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginPageProps {
  onLogin: (user?: any) => void
  onGuestAccess: () => void
  onRegister: () => void
}

export function LoginPage({ onLogin, onGuestAccess, onRegister }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Dynamic import to avoid loading authService on initial page load
      const { authService } = await import('../services/lumusService')
      
      // Authenticate the user
      const response = await authService.login(formData)
      
      console.log('Login successful:', response.user)
      
      // Call the onLogin callback to navigate to the next page
      onLogin(response.user)
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Email ou senha incorretos')
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        setError('Erro no login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full bg-gray-800 border-[#00b97e]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Bem-vindo ao Umbra</CardTitle>
            <CardDescription className="text-gray-300">
              Digite suas credenciais para acessar sua conta
            </CardDescription>
            <CardAction>
              <Button 
                variant="link"
                onClick={onRegister}
                className="text-[#00b97e] hover:text-[#059669]"
              >
                Não tem uma conta? Cadastre-se
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-200">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00b97e] focus:ring-[#00b97e] disabled:opacity-50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-gray-200">Senha</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-[#00b97e] hover:text-[#059669]"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required 
                    disabled={loading}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00b97e] focus:ring-[#00b97e] disabled:opacity-50"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-[#00b97e] hover:bg-[#059669] text-white disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardFooter>
          {error && (
            <div className="p-4 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </Card>
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={onGuestAccess}
            className="w-full border-[#00b97e] text-[#00b97e] hover:bg-[#00b97e] hover:text-white"
          >
            Continuar como Visitante - Visualizar Reservas
          </Button>
        </div>
      </div>
    </div>
  )
}
