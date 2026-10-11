// Test-only preload. No production module imports this network policy.
const net = process.getBuiltinModule('node:net');
const original = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const options = Array.isArray(args[0]) ? args[0][0] : args[0];
  const host = typeof options === 'object' ? options.host : args[1];
  if (typeof host === 'string' && !['127.0.0.1', '::1', 'localhost'].includes(host)) {
    throw new Error(`External socket prohibited by contract sandbox: ${host}`);
  }
  return original.apply(this, args);
};
