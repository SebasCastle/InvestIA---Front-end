import { useState, type FormEvent } from 'react';
import { insightsService } from '../services/insights.service';

type Turn = { role: 'user' | 'assistant'; content: string; toolsUsed?: string[] };

export function ChatPanel() {
  const [messages, setMessages] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) {
      return;
    }
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setDraft('');
    setSending(true);
    setError(null);
    try {
      const reply = await insightsService.chat(message, history);
      setMessages((current) => [...current, { role: 'assistant', content: reply.reply, toolsUsed: reply.toolsUsed }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo consultar a la IA');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="panel p-4">
      <h2 className="font-semibold">Analista</h2>
      <p className="mt-1 text-sm text-stone-500">
        Interpreta cifras que ya calculó el servidor. No modifica movimientos ni inventa precios.
      </p>
      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto sm:max-h-96">
        {messages.length === 0 ? (
          <p className="text-sm text-stone-500">Pregunta por el valor, la asignación, el benchmark o las noticias de tus activos.</p>
        ) : null}
        {messages.map((turn, index) => (
          <div key={`${turn.role}-${index}`} className={turn.role === 'user' ? 'text-right' : ''}>
            <p className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 text-left text-sm ${turn.role === 'user' ? 'bg-teal-800 text-white' : 'bg-stone-100 text-stone-900 dark:bg-[#0c1424] dark:text-slate-100'}`}>
              {turn.content}
            </p>
            {turn.toolsUsed && turn.toolsUsed.length > 0 ? (
              <p className="mt-1 text-xs text-stone-500">Datos: {turn.toolsUsed.join(', ')}</p>
            ) : null}
          </div>
        ))}
        {sending ? <p className="text-sm text-stone-500">Consultando los datos del portafolio...</p> : null}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-700 dark:text-rose-400">{error}</p> : null}
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void handleSubmit(event)}>
        <input
          className="field min-h-11 min-w-0 flex-1 text-sm"
          value={draft}
          placeholder="¿Cómo va el portafolio frente a SPY?"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={sending || !draft.trim()} className="min-h-11 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white disabled:opacity-60">
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </section>
  );
}
