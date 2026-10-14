/** Ponto de extensão futuro. Nenhuma mensagem é enviada sem um provedor configurado. */
export async function sendReminder(){ return { sent:false, reason:"Integração de WhatsApp ainda não configurada" }; }
