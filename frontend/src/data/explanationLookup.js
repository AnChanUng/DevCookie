import notes from './questionExplanations.json' with { type: 'json' };

// IDs and topic labels change in copied topic-bank questions; content does not.
export const explanationKey = q => JSON.stringify([q.q, q.ctx || '', q.code || '', q.o || [], q.a ?? null, q.ans || '']);
export const explanationFor = q => q.explanation || notes[explanationKey(q)];
