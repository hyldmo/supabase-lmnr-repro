import { Laminar as L } from 'npm:@lmnr-ai/lmnr@0.4.8'
import OpenAI from 'npm:openai'
import { corsHeaders } from '../_shared/cors.ts'

const ai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

Deno.serve(async req => {
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: corsHeaders
		})
	}
	try {
		L.initialize({
			projectApiKey: Deno.env.get('LMNR_PROJECT_API_KEY'),
			instrumentModules: {
				openAI: OpenAI
			}
		})

		const { query } = await req.json().catch(() => ({ query: null }))
		const message = query || 'How many times does the letter "r" appear in the word "strawberry"?'

		L.event('chat_started', message)
		const response = await ai.chat.completions.create({
			model: 'chatgpt-4o-latest',
			messages: [{ role: 'user', content: message }]
		})

		const text = response.choices[0].message.content
		if (text) L.event('chat_completed', text)
		else L.event('chat_errored', response.id)

		return new Response(text, {
			headers: {
				...corsHeaders,
				'Content-Type': 'text/plain'
			}
		})
	} catch (e) {
		return new Response(e.message, {
			status: 500,
			headers: {
				...corsHeaders,
				'Content-Type': 'text/plain'
			}
		})
	}
})
