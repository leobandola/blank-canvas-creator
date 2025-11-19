export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleSupabaseError(error: any): string {
  if (error.code === 'PGRST116') {
    return 'Registro não encontrado';
  }
  
  if (error.code === '23505') {
    return 'Este registro já existe';
  }
  
  if (error.code === '23503') {
    return 'Não é possível excluir este registro pois existem dados relacionados';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Sessão expirada. Por favor, faça login novamente';
  }
  
  return error.message || 'Erro ao processar sua solicitação';
}

export function logError(error: any, context?: string) {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, você pode enviar para um serviço de monitoramento
    console.error(`[${context || 'Error'}]:`, error);
  } else {
    // Em desenvolvimento, log detalhado
    console.error(`[${context || 'Error'}]:`, error);
  }
}
