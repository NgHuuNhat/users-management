'use client';

import Pusher from 'pusher-js';

// Khởi tạo một lần duy nhất để dùng chung cho toàn bộ ứng dụng
export const pusherFe = new Pusher('85a671177c6acaa8de58', {
  cluster: 'ap1',
});