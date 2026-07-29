global.self = {
  addEventListener: () => {},
  registration: {}
};
global.importScripts = () => {};
Object.defineProperty(global, 'define', {
  get: () => global.self.define,
  set: (val) => { global.self.define = val; }
});
try {
  require('./public/sw.js');
  console.log('Syntax is valid');
} catch (e) {
  console.error('Syntax error:', e);
}
