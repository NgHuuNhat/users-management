import Pusher from 'pusher-js';

let pusherClient: any;

export function getPusherClient() {
  if (!pusherClient && typeof window !== 'undefined') {
    pusherClient = new Pusher('85a671177c6acaa8de58', {
      cluster: 'ap1',
    });
  }
  return pusherClient;
}