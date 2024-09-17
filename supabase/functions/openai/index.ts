import 'jsr:@std/dotenv/load'
import { Laminar as L, observe } from '@lmnr-ai/lmnr'
import OpenAI from 'openai'
import { corsHeaders } from '../_shared/cors.ts'

const ai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

const handler: Deno.ServeHandler = async req => {
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
		const res = await observe({ name: req.url }, async () => {
			L.event('chat_started', message)
			const response = await ai.chat.completions.create({
				model: 'chatgpt-4o-latest',
				messages: [{ role: 'user', content: message }]
			})

			const text = response.choices[0].message.content
			if (text) L.event('chat_completed', text)
			else L.event('chat_errored', response.id)
			return text
		})

		return new Response(res, {
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
}

// Detect if we're running inside Supabase
if (Deno.env.get('SUPABASE_DB_URL')) {
	Deno.serve(handler)
} else {
	Deno.serve({ port: 3333, hostname: '127.0.0.1' }, handler)
}
