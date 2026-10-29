export default async function handler(req, res) {
  // 1. Verificación del Webhook por parte de Meta (petición GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'lexilegal_token_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado con éxito por Meta');
      return res.status(200).send(challenge);
    } else {
      console.warn('Fallo de verificación de token en el webhook');
      return res.status(403).json({ error: 'Token de verificación incorrecto' });
    }
  }

  // 2. Recepción de mensajes de WhatsApp (petición POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      res.status(200).send('EVENT_RECEIVED');

      if (body?.object && body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const text = message.text?.body;
        console.log(`[WhatsApp] De: ${from} | Texto: ${text}`);
      }
    } catch (err) {
      console.error('Error procesando mensaje entrante:', err);
    }
    return;
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
