const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/diagnose', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Por favor describe la falla del equipo.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'Eres el asistente técnico virtual de Nova Technologies, una plataforma que conecta clientes con técnicos expertos en reparación de celulares, tablets, consolas, controles y computadoras. Da diagnósticos preliminares claros, breves y amigables en español (máximo 3 o 4 líneas), menciona posibles causas y recomienda solicitar una cotización con un técnico certificado.'
      }
    });

    return res.json({ reply: response.text });
  } catch (error) {
    console.error('Error detallado en el asistente de IA:', error.message);
    
    // Devolvemos una respuesta de respaldo amigable en formato JSON (status 200) 
    // para que la interfaz nunca se rompa ni se quede bloqueada.
    return res.json({ 
      reply: `Entiendo tu consulta sobre "${prompt}". En este momento la IA está ocupada o experimentando intermitencia de red, pero te sugiero crear una solicitud de cotización directamente en la plataforma para que un técnico verificado revise tu equipo.` 
    });
  }
});

module.exports = router;