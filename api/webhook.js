export default async function handler(req, res) {
  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // 1. GET para Meta
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'lexilegal_token_2026';
    if (mode === 'subscribe' && token === VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).json({ error: 'Token incorrecto' });
  }

  // 2. POST para Twilio y Meta
  if (req.method === 'POST') {
    try {
      let b = req.body;
      if (typeof b === 'string') {
        try { b = JSON.parse(b); } catch { b = Object.fromEntries(new URLSearchParams(b)); }
      }

      // Obtener el texto del mensaje
      let userText = '';
      let fromNumber = '';
      let senderName = 'Cliente';

      if (b && (b.Body || b.From)) {
        userText = (b.Body || '').trim();
        fromNumber = b.From || '';
        senderName = b.ProfileName || 'Cliente';
      }

      // Si es Twilio
      const isTwilio = req.headers['x-twilio-signature'] || b?.From || b?.Body;

      if (isTwilio) {
        const reply = await generateLexiResponse(userText, senderName);
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`;
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        return res.status(200).send(twiml);
      }

      return res.status(200).send('OK');
    } catch (err) {
      const errTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Disculpe, ocurrió un problema técnico temporal.</Message>
</Response>`;
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      return res.status(200).send(errTwiml);
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

async function generateLexiResponse(userText, senderName) {
  const textLower = (userText || '').toLowerCase();

  if (textLower.includes('despido') || textLower.includes('echar') || textLower.includes('trabajo') || textLower.includes('carta')) {
    return 'Lamento mucho su situación con el despido. Para proteger sus derechos procesales ante el SMAC, ¿en qué fecha exacta le comunicaron o entregaron la carta?';
  }

  if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(textLower) || textLower.includes('ayer') || textLower.includes('hace') || textLower.includes('días')) {
    return 'Entendido. En materia laboral disponemos de un plazo perentorio de 20 días hábiles para impugnar ante el SMAC. ¿Podría adjuntar foto o PDF de la carta de despido o finiquito recibido?';
  }

  if (textLower.includes('si') || textLower.includes('adjunto') || textLower.includes('subo') || textLower.includes('tengo') || textLower.includes('vale')) {
    return 'Perfecto, tomo nota de la documentación. El análisis jurídico pormenorizado lo realizará nuestro letrado titular. ¿Estaría dispuesto/a a agendar una consulta formal? Indíqueme su nombre completo y teléfono móvil.';
  }

  if (textLower.length > 5 && /\d{9}/.test(textLower)) {
    return `Muchas gracias por facilitarnos sus datos. Acabo de preparar el expediente con carácter prioritario para que nuestro letrado titular se ponga en contacto con usted hoy mismo.

[FICHA RESUMEN PARA EL LETRADO]
- Cliente: ${senderName} (${textLower.match(/\d{9}/)?.[0] || 'Registrado'})
- Materia: Laboral / Despido
- Hechos relevantes: Cliente despedido recientemente. Solicita impugnación urgente ante el SMAC y cálculo de indemnización.
- Alerta procesal: Plazo crítico de 20 días hábiles en curso.
- Calificación: ALTO
- Acción requerida: Agendar consulta urgente con el letrado titular`;
  }

  return 'Buenas tardes. Le atiende Lexi, coordinadora de admisiones de Valenzuela & Asociados Abogados. ¿En qué asunto legal podemos ayudarle hoy: Laboral, Familia, Tráfico/Seguros o Reclamación de Deudas?';
}
