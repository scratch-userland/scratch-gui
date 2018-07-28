
var opt = {
    host: '127.0.0.1',
    port: 9000,
    path: '/mirror'
};

// var peer = new Peer('sender_peer_manson');
// peer.on('open', function(id) {
//     console.log('My peer ID is: ' + id);
//
//     // send data
//     var conn = peer.connect('receiver_peer_manson');
//     conn.on('open', function() {
//         // Receive messages
//         conn.on('data', function(data) {
//             console.log('sender - Received', data);
//         });
//
//         // Send messages
//         conn.send('Hello!');
//     });
// });

// send media
navigator.mediaDevices.getUserMedia({
    // audio: true, // 这里也可以开启声音
    video: true
}).then(function (mediaStream) {
    console.log('navigator stream!');
    // Answer the call, providing our mediaStream
    console.log('call stream!');
    var peer = new Peer('sender_peer_manson', opt);
    var call = peer.call('receiver_peer_manson', mediaStream);
});
