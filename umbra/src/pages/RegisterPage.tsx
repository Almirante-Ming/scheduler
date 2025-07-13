import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'

type UserType = 'user' | 'admin'

interface RegisterPageProps {
  onRegister: (user?: any) => void
  onBack: () => void
}

export function RegisterPage({ onRegister, onBack }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'user' as UserType
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      setApiError(null)
      
      try {
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          type: formData.type
        }
        
        console.log('Registering user:', registerData)
        
        // Try to import and use the service dynamically
        const { authService } = await import('../services/lumusService')
        const response = await authService.register(registerData)
        
        console.log('Registration successful')
        onRegister(response.user)
      } catch (error: any) {
        console.error('Registration error:', error)
        setApiError(
          error.response?.data?.error || 
          error.response?.data?.message || 
          'Erro ao criar conta. Tente novamente.'
        )
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Login
          </Button>
        </div>

        <Card className="w-full bg-gray-800 border-2 border-[#00b97e]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Criar Sua Conta</CardTitle>
            <CardDescription className="text-gray-300">
              Junte-se ao Umbra para gerenciar suas reservas de laboratório
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {apiError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{apiError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
                
                <div>
                  <Label htmlFor="name" className="text-gray-200">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00b97e] focus:ring-[#00b97e] ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Digite seu nome completo"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400 mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-200">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00b97e] focus:ring-[#00b97e] ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Digite seu e-mail"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-gray-200">Tipo de Usuário</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-[#00b97e] focus:ring-[#00b97e] rounded-md px-3 py-2"
                    disabled={loading}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Segurança da Conta</h3>
                
                <div>
                  <Label htmlFor="password" className="text-gray-200">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00b97e] focus:ring-[#00b97e] ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Crie uma senha forte"
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00b97e] focus:ring-[#00b97e] ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirme sua senha"
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#00b97e] hover:bg-[#059669] text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
