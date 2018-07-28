
var opt = {
    host: '127.0.0.1',
    port: 9000,
    path: '/mirror'
};

var peer = new Peer('receiver_peer_manson', opt);
peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);


});

// data message
// peer.on('connection', function(conn) {
//     console.log('receiver connected!!!');
//     conn.on('data', function(data) {
//         console.log('Received', data);
//         // Send messages
//         conn.send('Hello back!');
//     });
// });

peer.on('call', function(call) {
    console.log('received call!');

    // Answer the call, providing our mediaStream
    call.on('stream', function(stream) {
        console.log('received stream!');
        // `stream` is the MediaStream of the remote peer.
        // Here you'd add it to an HTML video/canvas element.
        var myVideo = document.getElementById('myVideo');
        myVideo.srcObject = stream;
        myVideo.onloadedmetadata = function () {
            myVideo.controls = "controls";
            myVideo.play();
        }
    });

    // Answer the call, providing our mediaStream
    call.answer();
});
