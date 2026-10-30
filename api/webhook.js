export default async function handler(req, res) {
  // Helper para escapar caracteres especiales en XML (TwiML)
  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // 1. Verificación para Meta (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'lexilegal_token_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Token incorrecto' });
  }

  // 2. Recepción de mensajes (POST)
  if (req.method === 'POST') {
    try {
      // Normalizar el body independientemente de cómo lo envíe Twilio (JSON, URLSearchParams, String o Buffer)
      let parsedBody = req.body || {};

      if (typeof parsedBody === 'string') {
        try {
          parsedBody = JSON.parse(parsedBody);
        } catch {
          parsedBody = Object.fromEntries(new URLSearchParams(parsedBody));
        }
      } else if (Buffer.isBuffer(parsedBody)) {
        const str = parsedBody.toString('utf-8');
        try {
          parsedBody = JSON.parse(str);
        } catch {
          parsedBody = Object.fromEntries(new URLSearchParams(str));
        }
      }

      // Comprobar si es mensaje de Twilio
      const isTwilio =
        parsedBody.Body !== undefined ||
        parsedBody.From !== undefined ||
        req.headers['x-twilio-signature'] !== undefined;

      if (isTwilio) {
        const userText = (parsedBody.Body || '').trim();
        const fromNumber = parsedBody.From || '';
        const senderName = parsedBody.ProfileName || 'Cliente';

        console.log(`[Twilio WhatsApp] De: ${fromNumber} (${senderName}) | Mensaje: "${userText}"`);

        // Generar respuesta con la IA / motor de Lexi
        const reply = await generateLexiResponse(userText, senderName);

        // Devolver TwiML en UTF-8 estricto para que Twilio envíe el WhatsApp
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`;

        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        return res.status(200).send(twiml);
      }

      // Si es de Meta Cloud API
      if (parsedBody?.object && parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        res.status(200).send('EVENT_RECEIVED');
        return;
      }

      return res.status(200).send('OK');
    } catch (err) {
      console.error('Error en webhook:', err);
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Disculpe, ha ocurrido un error temporal. Por favor, vuelva a intentarlo en unos instantes.</Message>
</Response>`;
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      return res.status(200).send(errorTwiml);
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

// Función del cerebro de Lexi
async function generateLexiResponse(userText, senderName) {
  const apiKey = process.env.GEMINI_API_KEY;
  const todayStr = new Date().toISOString().split('T')[0];

  const SYSTEM_INSTRUCTION = `Eres "Lexi", la asistente virtual y coordinadora de admisiones de un prestigioso despacho jurídico ("Valenzuela & Asociados Abogados").
Tu misión es realizar la admisión y recopilación inicial a clientes potenciales que escriben por WhatsApp con un tono empático, impecable, profesional y cercano.

REGLAS DE ACTUACIÓN INVIOLABLES:
1. NUNCA des asesoramiento legal de fondo ni afirmes si ganarán o perderán el caso. Aclara con delicadeza que la valoración jurídica y la viabilidad procesal corresponden en exclusiva al letrado titular de nuestro despacho.
2. Mantén las respuestas CORTAS (MÁXIMO 2-3 frases por turno). Debe leerse exactamente como un mensaje de WhatsApp real: directo, humano y sin rodeos extensos. Haz UNA SOLA PREGUNTA a la vez. No formules listas de preguntas.
3. DETECCIÓN DE PLAZOS CRÍTICOS: Si el caso es de ámbito LABORAL (despido objetivo, disciplinario, fin de contrato o sanción), es imperativo que detectes inmediatamente la fecha exacta en la que el cliente recibió la carta o notificación, advirtiendo del perentorio plazo de caducidad de 20 días hábiles que marca la legislación laboral española para impugnar ante el SMAC.
4. NUNCA uses la palabra "triaje" ni nada relacionado. Habla de "admisión", "revisión inicial" o "coordinación de expediente".

FASES DE LA INTERACCIÓN:
- Paso 1: Saludo cordial e identificación clara del motivo de consulta (Laboral, Familia, Tráfico/Seguros, Deudas). Si el usuario ya lo mencionó en su primer mensaje, acéptalo de inmediato y no repitas la pregunta.
- Paso 2: Hechos clave y fechas (¿Qué ocurrió exactamente y en qué fecha?). Haz una sola pregunta concisa.
- Paso 3: Documentación (Solicita amablemente foto o PDF de la carta de despido, burofax, contrato, convenio regulador o reclamación previa). Si el usuario ya adjuntó o dice que lo tiene a mano, agradéceselo y pasa al siguiente punto.
- Paso 4: Capacidad y urgencia (Pregunta si está dispuesto/a a formalizar una consulta personalizada con el letrado titular para defender sus derechos y solicita su nombre completo y teléfono de contacto).

SALIDA FINAL OBLIGATORIA:
Cuando el cliente facilite su contacto o la interacción llegue a su conclusión natural:
Tu mensaje debe incluir una breve despedida confirmando que pasas el expediente al letrado para agendar la cita, y JUSTO DESPUÉS debes imprimir OBLIGATORIAMENTE este bloque exacto:

[FICHA RESUMEN PARA EL LETRADO]
- Cliente: [Nombre y teléfono facilitados por el usuario]
- Materia: [Laboral / Familia / Tráfico-Seguros / Deudas]
- Hechos relevantes: [Exactamente 3 líneas con el resumen sintético de los hechos]
- Alerta procesal / Fechas: [Fecha del hecho o notificación y días hábiles estimados restantes, destacando si hay urgencia por caducidad de 20 días]
- Documentos aportados: [Documentos adjuntos o mencionados por el cliente]
- Calificación: [ALTO / MEDIO / DESCARTAR]
- Acción requerida: [Agendar consulta urgente con el letrado / Agendar consulta estándar]

Fecha actual del sistema: ${todayStr}.`;

  // Si hay clave de Gemini en Vercel, llamamos a la IA oficial
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userText }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            generationConfig: { temperature: 0.5, maxOutputTokens: 500 }
          })
        }
      );

      const data = await response.json();
      const generatedReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedReply) return generatedReply;
    } catch (e) {
      console.error('Error llamando a Gemini API:', e);
    }
  }

  // Fallback inteligente determinista de alta calidad si aún no está configurada la API KEY
  const textLower = userText.toLowerCase();

  if (textLower.includes('despido') || textLower.includes('echar') || textLower.includes('trabajo') || textLower.includes('carta')) {
    return 'Lamento mucho su situación con el despido. Para proteger sus derechos procesales, ¿en qué fecha exacta le comunicaron o entregaron la carta?';
  } else if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(textLower) || textLower.includes('ayer') || textLower.includes('hace') || textLower.includes('días')) {
    return 'Entendido. Tenga presente que en materia laboral disponemos de un plazo estricto de 20 días hábiles para impugnar ante el SMAC. ¿Podría adjuntar foto o PDF de la carta de despido o finiquito recibido?';
  } else if (textLower.includes('si') || textLower.includes('adjunto') || textLower.includes('subo') || textLower.includes('tengo') || textLower.includes('vale')) {
    return 'Perfecto, tomo nota de la documentación. El análisis jurídico pormenorizado lo realizará nuestro letrado titular. ¿Estaría dispuesto/a a agendar una consulta formal? Indíqueme su nombre completo y teléfono móvil.';
  } else if (textLower.length > 5 && /\d{9}/.test(textLower)) {
    return `Muchas gracias por facilitarnos sus datos. Acabo de preparar el expediente con carácter prioritario para que nuestro letrado titular se ponga en contacto con usted hoy mismo.

[FICHA RESUMEN PARA EL LETRADO]
- Cliente: ${senderName} (${textLower.match(/\d{9}/)?.[0] || 'Registrado'})
- Materia: Laboral / Despido
- Hechos relevantes: Cliente despedido recientemente. Solicita impugnación urgente ante el SMAC y cálculo de indemnización.
- Alerta procesal / Fechas: Plazo crítico de 20 días hábiles en curso. Papeleta de conciliación prioritaria.
- Documentos aportados: Carta de despido / Finiquito
- Calificación: ALTO
- Acción requerida: Agendar consulta urgente con el letrado titular`;
  } else {
    return 'Buenas tardes. Le atiende Lexi, coordinadora de admisiones de Valenzuela & Asociados Abogados. ¿En qué asunto legal podemos ayudarle hoy: Laboral, Familia, Tráfico/Seguros o Reclamación de Deudas?';
  }
}
