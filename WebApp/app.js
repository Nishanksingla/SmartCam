var app = angular.module("DropCam", []);

app.controller("dropcamController", function ($scope) {
    $scope.host = "54.187.15.61";
    $scope.port = 8001;
    $scope.buttonVal = "Connect";
    $scope.Status = "Disconnected";
    $scope.topics = [];
    $scope.subscribed_topic = "";
    $scope.messages = [];
    $scope.onoff = false;
    $scope.clientID = "Client_01";
    $scope.threshold = "50";
    $scope.angle = 0;
    var pictures = {};
    var canvas = document.getElementById('canvas-video');
    var context = canvas.getContext('2d');
    var img = new Image();

    // show loading notice
    context.fillStyle = '#333';
    context.fillText('Loading...', canvas.width / 2 - 30, canvas.height / 3);

    function reconstructBase64String(chunk) {
        pChunk = JSON.parse(chunk);
        console.log(pChunk.pos);
        //creates a new picture object if receiving a new picture, else adds incoming strings to an existing picture 
        if (pictures[pChunk["pic_id"]] == undefined) {
            pictures[pChunk["pic_id"]] = { "count": 0, "total": pChunk["size"], pieces: {}, "pic_id": pChunk["pic_id"] };
            pictures[pChunk["pic_id"]].pieces[pChunk["pos"]] = pChunk["data"];

        }
        else {
            pictures[pChunk["pic_id"]].pieces[pChunk["pos"]] = pChunk["data"];
            pictures[pChunk["pic_id"]].count += 1;

            if (pictures[pChunk["pic_id"]].count == pictures[pChunk["pic_id"]].total) {
                console.log("Image reception compelete");
                var str_image = "";

                for (var i = 0; i <= pictures[pChunk["pic_id"]].total; i++)
                    str_image = str_image + pictures[pChunk["pic_id"]].pieces[i];

                debugger
                img.onload = function () {
                    context.drawImage(this, 0, 0, canvas.width, canvas.height);
                };
                img.src = 'data:image/jpeg;base64,' + str_image;

                // var source = 'data:image/jpeg;base64,' + str_image;
                // var myImageElement = document.getElementById("picture_to_show");
                // myImageElement.src = source;
            }
        }
    }

    $scope.connect_mosquitto = function () {
        debugger
        if ($scope.buttonVal === "Connect") {
            
            $scope.buttonVal = "Connecting..";
            $scope.mqtt_client = new Paho.MQTT.Client(
                $scope.host,
                $scope.port,
                $scope.clientID
            );

            $scope.mqtt_client.onConnectionLost = $scope.onConnectionLost;

            $scope.mqtt_client.onMessageArrived = $scope.onMessageArrived;

            var options = {
                // timeout: 10,
                // keepAliveInterval: 60,
                // cleanSession: true,
                onSuccess: $scope.onConnect,
                onFailure: $scope.onFailure
            };  
            $scope.mqtt_client.connect(options);

        } else if ($scope.buttonVal === "Disconnect") {
            debugger
            $scope.Status = "Disconnected";
            $scope.buttonVal = "Connect";
            $scope.mqtt_client.disconnect();
            $scope.topics = [];
            $scope.messages = [];
        }
    };
    
    $scope.onFailure = function (message) {
        debugger
        $scope.Status = "Failed to connect";
        console.log("error: " + message.errorMessage);
        alert(message.errorMessage);
        $scope.buttonVal = "Connect";
        $scope.$apply();
    };
    
    $scope.onMessageArrived = function (message) {
        console.log(message);
        var messageObj = {
            'topic': message.destinationName,
            'retained': message.retained,
            'qos': message.qos,
            'payload': message.payloadString,
        };
        reconstructBase64String(message.payloadString);
    };

    $scope.onConnectionLost = function (responseObject) {
        $scope.Status = "Disconnected";
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    };
    $scope.onConnect = function () {
        debugger
        $scope.Status = "Connected";
        $scope.buttonVal = "Disconnect";
        console.log("connected");
        $scope.mqtt_client.subscribe("dropcam");
        $scope.topics.push("dropcam");
        $scope.$apply();
    };
    
    $scope.move = function(){
        console.log($scope.angle);
        var message = new Paho.MQTT.Message($scope.angle);
        message.destinationName = "servoAngle";
        $scope.mqtt_client.send(message);
    }
});