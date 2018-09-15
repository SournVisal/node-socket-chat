var socket = io();

function scroolToButtom () {
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');

    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight>= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', () => {
    console.log('connected');
});

socket.on('disconnect', () => {
    console.log('disconnect');
});

function addNewMessage (template, text, from, createdAt, lo) {

    var template = jQuery('#' + template).html();
    var timeFormat = moment(createdAt).format('h:mm a');
    var html;

    if (!lo) {
        html = Mustache.render(template, {
            text,
            from,
            createdAt: timeFormat
        });
    } else {
        html = Mustache.render(template, {
            url: text,
            from,
            createdAt: timeFormat
        });
    }
    

    jQuery('#messages').append(html);

    scroolToButtom();
}

socket.on('newMessage', function (message) {
    
    addNewMessage("message-template", 
                    message.text,
                    message.from,
                    message.createdAt,
                    false);
});

socket.on('newLocationMessage', function (message) {
   
    addNewMessage("location-message-template", 
                    message.url,
                    message.from,
                    message.createdAt,
                    true);
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val()
    }, function (str) {
        console.log(str);
    });
});

var locationButton = jQuery('#send-location');

locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolcation not supported by your browser');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location');

    navigator.geolocation.getCurrentPosition(function (position) {
        
        locationButton.removeAttr('disabled').text('Send location');

        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, function (str) {
            console.log(str);
        });
    }, function () {
        alert('Unable to fetch location.');
    });
});
