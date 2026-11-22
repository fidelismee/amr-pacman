'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import BacteriaGame from '../game/components/BacteriaGame';
import { LEVELS } from '../game/levels';
import './player-entry.css';
import ConsentTerms from './ConsentTerms';
import { categories, termsVersion, type Player } from './types';

type Step = 'menu' | 'terms' | 'register' | 'login' | 'ready' | 'play';

const lastPlayerKey = 'amr-pacman:last-player-id';

function readLastPlayer() {
  try {
    return window.localStorage.getItem(lastPlayerKey);
  } catch {
    return null;
  }
}

function updateLastPlayer(id: string | null) {
  try {
    if (id) window.localStorage.setItem(lastPlayerKey, id);
    else window.localStorage.removeItem(lastPlayerKey);
    window.dispatchEvent(new Event('amr-player-changed'));
  } catch {
    // The player can still use manual login when browser storage is unavailable.
  }
}

function subscribeToLastPlayer(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener('amr-player-changed', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('amr-player-changed', onChange);
  };
}

export default function PlayerEntry() {
  const lastPlayerId = useSyncExternalStore(subscribeToLastPlayer, readLastPlayer, () => null);
  const [step, setStep] = useState<Step>('menu');
  const [consent, setConsent] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [isNew, setIsNew] = useState(false);

  function navigate(next: Step) {
    setStep(next);
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const values = new FormData(event.currentTarget);
    const registering = step === 'register';
    const payload = registering ? {
      action: 'register', nickname: values.get('nickname'), category: values.get('category'),
      heardAmr: values.get('awareness') === 'yes', version: termsVersion, consent
    } : { action: 'login', id: values.get('id') };
    void openPlayer(payload);
  }

  async function openPlayer(payload: { action: string; id?: FormDataEntryValue | null }, continuing = false) {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/player', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        if (continuing && response.status === 400) {
          if (readLastPlayer() === payload.id) updateLastPlayer(null);
          setError('That saved Player ID is no longer valid. Enter your ID or create a new player.');
        } else {
          setError(data.error || 'Please try again.');
        }
        return;
      }
      if (!continuing) updateLastPlayer(data.id);
      setPlayer(data);
      setIsNew(payload.action === 'register');
      navigate(continuing ? 'play' : 'ready');
    } catch {
      setError('Could not reach the game. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  if (step === 'play' && player) return <BacteriaGame player={player} />;
  return <main className={`player-entry ${step === 'menu' ? 'player-entry--title' : ''}`}>
    <div className="player-wordmark" role="img" aria-label="AMR Buster" />
    <section key={step} className="player-dialog">
      <div className="player-dialog-body">
        {step === 'menu' && <>
          <h1>Player select</h1>
          <div className="player-menu">
            {lastPlayerId && <button disabled={pending} onClick={() => openPlayer({ action: 'login', id: lastPlayerId }, true)}>
              <span className="player-sprite player-sprite--evolved" aria-hidden="true" />{pending ? 'Loading…' : 'Continue last game'}
            </button>}
            <button disabled={pending} onClick={() => navigate('terms')}><span className="player-sprite" aria-hidden="true" />New player</button>
            <button disabled={pending} onClick={() => navigate('login')}><span className="player-sprite player-sprite--evolved" aria-hidden="true" />{lastPlayerId ? 'Use another ID' : 'Returning player'}</button>
          </div>
          {error && <p className="player-error" role="alert">{error}</p>}
          {lastPlayerId && <button className="player-back" disabled={pending} onClick={() => {
            updateLastPlayer(null);
            setError('');
          }}>Forget saved ID</button>}
        </>}
        {step === 'terms' && <>
          <h1>Terms &amp; Conditions and Data Consent</h1>
          <div className="player-terms" role="region" aria-label="Terms and data consent" tabIndex={0}><ConsentTerms /></div>
          <label className="player-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            I agree to the Terms &amp; Conditions and consent to the collection and storage of my registration and gameplay details.
          </label>
          <div className="player-actions">
            <button className="player-back" onClick={() => navigate('menu')}>Back</button>
            <button className="player-primary" disabled={!consent} onClick={() => navigate('register')}>Continue</button>
          </div>
        </>}
        {(step === 'register' || step === 'login') && <>
          <h1>{step === 'login' ? 'Returning player' : 'New player'}</h1>
          <form key={step} onSubmit={submit} className="player-form">
            {step === 'login' ? <label>Player ID
              <input className="player-field player-code" name="id" required maxLength={32} autoCapitalize="characters" spellCheck={false} autoComplete="off" />
            </label> : <>
              <label>Name or nickname<input className="player-field" name="nickname" required maxLength={40} pattern=".*\S.*" autoComplete="nickname" /></label>
              <label>Role / Category<select className="player-field" name="category" defaultValue="" required>
                <option value="" disabled>Select your category</option>{categories.map(value => <option key={value}>{value}</option>)}
              </select></label>
              <fieldset><legend>Have you previously heard about AMR (Antimicrobial Resistance)?</legend>
                <div className="player-choices">{['Yes', 'No'].map(choice =>
                  <label key={choice}><input type="radio" name="awareness" value={choice.toLowerCase()} required />{choice}</label>)}</div>
              </fieldset>
            </>}
            {error && <p className="player-error" role="alert">{error}</p>}
            <div className="player-actions">
              <button type="button" className="player-back" disabled={pending} onClick={() => navigate(step === 'register' ? 'terms' : 'menu')}>Back</button>
              <button className="player-primary" disabled={pending}>{pending ? 'Please wait…' : step === 'login' ? 'Log in' : 'Create Player ID'}</button>
            </div>
          </form>
        </>}
        {step === 'ready' && player && <>
          <h1>{isNew ? 'Player ID ready' : 'Welcome back'}, {player.nickname}!</h1>
          <div className="player-id"><span>Player ID</span><strong>{player.id}</strong></div>
          <p>Keep this ID private. Use it to log back in and find your progress.</p>
          {!isNew && <p>Best score: {player.bestScore} · Levels cleared: {player.clearedLevels} of {LEVELS.length}</p>}
          <div className="player-actions"><button className="player-primary" onClick={() => navigate('play')}>
            {player.clearedLevels === LEVELS.length ? 'Play again' : player.clearedLevels ? `Resume at Level ${player.clearedLevels + 1}` : 'Start game'}
          </button></div>
        </>}
      </div>
    </section>
  </main>;
}
