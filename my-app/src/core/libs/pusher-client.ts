import Pusher from 'pusher-js';

let pusher: any;

export function getPusher() {
  if (!pusher && typeof window !== 'undefined') {
    pusher = new Pusher('85a671177c6acaa8de58', {
      cluster: 'ap1',
    });
  }
  return pusher;
}