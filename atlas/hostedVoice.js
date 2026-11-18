// Keep the upstream local action runner used by non-voice view controls,
// without constructing a voice provider, microphone, remote agent or panel.
export function createHostedVoiceCommands(options, createRunner) {
  const runner = createRunner(options);
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    options.signal?.removeEventListener('abort', stop);
    runner.dispose?.();
  };
  options.signal?.addEventListener('abort', stop, { once: true });
  if (options.signal?.aborted) stop();
  return Object.freeze({ runner, signal: options.signal, session: null, stop });
}
