// Shared by the private integration and real-process teardown regressions.
function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null || !child.pid;
}

function signalAndWait(child, signal, timeoutMs) {
  return new Promise((resolve, reject) => {
    let timer;
    const done = (error) => {
      clearTimeout(timer);
      child.removeListener('exit', onExit);
      child.removeListener('error', onError);
      if (error) reject(error);
      else resolve(hasExited(child));
    };
    const onExit = () => done();
    const onError = error => done(error);
    // Subscribe before sending a signal, then recheck already-emitted exits.
    child.once('exit', onExit);
    child.once('error', onError);
    if (hasExited(child)) { done(); return; }
    timer = setTimeout(() => done(), timeoutMs);
    try { child.kill(signal); } catch (error) { done(error); }
  });
}

export async function cleanupIntegration(next, provider, { graceMs = 1000, killMs = 1000 } = {}) {
  try {
    if (next && !hasExited(next)) {
      if (!await signalAndWait(next, 'SIGTERM', graceMs) &&
          !await signalAndWait(next, 'SIGKILL', killMs)) {
        throw new Error('Child did not exit after SIGKILL');
      }
    }
  } finally {
    // Provider closure must not depend on successful child termination.
    if (provider) {
      await new Promise(resolve => {
        provider.close(resolve);
        provider.closeAllConnections();
      });
    }
  }
}
