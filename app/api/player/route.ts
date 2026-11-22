import { loginPlayer, PlayerInputError, registerPlayer, saveProgress } from '../../player/store';

export async function POST(request: Request) {
  const reply = (body: unknown, status = 200) => Response.json(body, {
    status, headers: { 'Cache-Control': 'no-store' }
  });
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reply({ error: 'Expected JSON.' }, 415);
  }
  try {
    const input = await request.json();
    switch (input?.action) {
      case 'register': return reply(await registerPlayer(input), 201);
      case 'login': return reply(await loginPlayer(input.id));
      case 'save':
        await saveProgress(input);
        return reply({ saved: true });
      default: return reply({ error: 'Unknown player action.' }, 400);
    }
  } catch (error) {
    if (error instanceof PlayerInputError) return reply({ error: error.message }, 400);
    if (error instanceof SyntaxError) return reply({ error: 'Invalid JSON.' }, 400);
    console.error('Player storage unavailable', error instanceof Error ? error.name : 'Unknown error');
    return reply({ error: 'Player storage is unavailable. Please try again.' }, 503);
  }
}
