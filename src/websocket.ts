import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ port: 5001 }); // separate port for ws

wss.on('connection', (socket) => {
  console.log('ws client connected');

  socket.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // optional: handle client messages (typing, etc.)
    } catch {}
  });

  socket.on('close', () => console.log('ws client disconnected'));
});

// ! note; the websocket was completely vibe coded in as i have no idea how to code
// ! one and i was in a hurry to finish this shit faster because of some censorship
// ! laws, i'll come back to this later when i can understand it better and add more
// ! things such as typing etc...