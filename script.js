var config = {
	apiKey: "AIzaSyBaCH93nqApGGTrZYbcRYyetzBMapq4kFs",
	authDomain: "cmontoya-219bd.firebaseapp.com",
	databaseURL: "https://cmontoya-219bd.firebaseio.com",
	projectId: "cmontoya-219bd",
	storageBucket: "cmontoya-219bd.appspot.com",
	messagingSenderId: "1058990257317"
};
firebase.initializeApp(config);

// Reference the database
var database = firebase.database(),

// Initial variables
trainName = "",
destination = "",
time = "",
frequency = "",
nextTrain = "",
minutesAway = "";

$("#submit").on("click", function(event) {
  event.preventDefault();

	// Capture values from text boxes
	trainName = $("#trainName").val().trim();
	destination = $("#destination").val().trim();
	time = $("#time").val().trim();
	frequency = $("#frequency").val().trim();
	
	// add preceding '0' if ':' is at indexOf(1)
	if (time.match(/\D/).index === 1) { 
		time = "0" + time;
	}

	// Time calculations
	// format current time
	var currentTime = moment().format("YYYY-MM-DD HH:mm"),
	// convert time entered to match current time format
	convertedTime = moment().format("YYYY-MM-DD") + " " + time;

	// Set variable with next train time and correct for midnight
	function nextTrainTime() {
		nextTrain = moment(convertedTime).format("HH:mm A");
		if (nextTrain === "00:00 AM") {
			nextTrain = "12:00 AM";
		}
	}

	// Calculate next arrival
	if (convertedTime > currentTime) {
		nextTrain = time;
		minutesAway = moment(convertedTime).diff(moment(currentTime), "minutes");
		nextTrainTime();
	}
	else {
		while (convertedTime < currentTime) {
			// increment start time by frequency
			var incrementTime = moment(convertedTime).add(frequency, "minutes"),
			// capture matching '_d' retult and format
			newTime = moment(incrementTime._d).format("YYYY-MM-DD HH:mm");
			// change converted time to new incremented time
			convertedTime = newTime;
		}
		nextTrainTime();
		// Set variable with difference of next train and current time
		minutesAway = moment(convertedTime).diff(moment(currentTime), "minutes");
	}
	
	// Convert minutesAway to hour:minute format
	if (minutesAway > 60) {
		if (minutesAway%60 === 0) { // add 'hours'
			minutesAway = Math.floor(minutesAway/60) + " hours"
		}
		else {
			minutesAway = Math.floor(minutesAway/60) + "h " + minutesAway%60 + "m";
		}
	}
	else { // add 'minutes'
		minutesAway = minutesAway + " minutes";
	}

	// Convert frequency to hour:minute format
	if (frequency > 60) {
		if (frequency%60 === 0) { // add 'hours'
			frequency = Math.floor(frequency/60) + " hours"
		}
		else {
			frequency = Math.floor(frequency/60) + "h " + frequency%60 + "m";
		}
	}
	else { // add 'minutes'
		frequency = frequency + " minutes";
	}

	// Convert military time to standard time before output
	var hourConv = Math.abs(nextTrain.substr(0, 2));
	if (hourConv > 12) {
		hourConv = hourConv - 12;
		nextTrain = hourConv + nextTrain.substr(2);
	}

	// Push to database
	database.ref().push({
	trainName: trainName,
	destination: destination,
	frequency: frequency,
	nextTrain: nextTrain,
	minutesAway: minutesAway
	});
});

// Process snapshot values
database.ref().on("child_added", function(childSnapshot) {
	//Append lastest results
	$("#trainSchedule").append("<tr>" +
	"<td>" + childSnapshot.val().trainName + "</td>" +
	"<td>" + childSnapshot.val().destination + "</td>" +
	"<td>" + childSnapshot.val().frequency + "</td>" +
	"<td>" + childSnapshot.val().nextTrain + "</td>" +
	"<td>" + childSnapshot.val().minutesAway + "</td>" +
	"</tr>"
	);
	// clear variables
	nextTrain = "";
	minutesAway = "";

// Handle the errors
}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
});