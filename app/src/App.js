import React, { useState } from 'react'
import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'
import { supabase } from './utils/supabaseClient'

const sampleObject = { query: `How many times does the letter 'r' appear in the word 'strawberry'?` }

function App() {
  const [requestJson, setRequestJson] = useState(sampleObject)
  const [responseJson, setResponseJson] = useState({})

  const invokeFunction = async () => {
    setResponseJson({ loading: true })
    const { data, error } = await supabase.functions.invoke('openai', {
      body: JSON.stringify(requestJson),
    })
    if (error) alert(error)
    setResponseJson(data)
  }

  return (
    <div className="p-2">
      <h2 className="mb-2 text-4xl">Supabase Egde Functions Test Client</h2>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-2">
          <h3 className="mb-2 text-3xl">Request</h3>
          <h4 className="text-2xl">Function</h4>

          <p className="mb-2">
            Note: when using locally, this selection doesn't have any effect and the function that's
            currently being served via the CLI is called instead.
          </p>
          <h4 className="mb-2 text-2xl">Body</h4>
          <JSONInput
            onChange={({ jsObject }) => setRequestJson(jsObject)}
            placeholder={sampleObject}
            locale={locale}
            height="100"
            width="100%"
          />
          <button
            className="mt-2 rounded bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700"
            onClick={invokeFunction}
          >
            Invoke Function
          </button>
        </div>
        <div className="p-2">
          <h3 className="mb-2 text-3xl">Response</h3>
          <pre className="bg-gray-300 p-2	whitespace-normal">{JSON.stringify(responseJson, null, 2)}</pre>
        </div>

      </div>
    </div>
  )
}

export default App
