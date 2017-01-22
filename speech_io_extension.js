/*  Speech input/output extension
    based on speech to text and text to speech extensions 
    by Sayamindu Dasgupta <sayamindu@media.mit.edu> 
*/

new (function() {
    var ext = this;
    
    var recognized_speech = '';
    var recognition = new webkitSpeechRecognition();

    ext.speak_text = function (text, callback) {
        var u = new SpeechSynthesisUtterance(text.toString());
        u.voice = window.speechSynthesis.getVoices()[26]; // "junior" voice
        u.onend = function(event) {
            clearTimeout(tookTooLong);
            callback();
        };
        
        speechSynthesis.speak(u);

        var tookTooLong = window.setTimeout(function() {
            callback();
        }, 5000);

    };

    ext.recognize_speech = function (callback) {
        console.log('speech recognition started');

        var tookTooLong = window.setTimeout(function() {
            recognition.stop();
            recognized_speech = '';
            callback();
        }, 5000);

        recognition.onresult = function(event) {
            clearTimeout(tookTooLong);
            if (event.results.length > 0) {
                recognized_speech = event.results[0][0].transcript;
                console.log('speech recognition result: ' + recognized_speech);
                callback();
            } else {
                console.log('speech recognition failed');
                recognized_speech = '';
                callback();
            }
        };
        recognition.start();
    };

    ext.get_recognized_speech = function () {
        return recognized_speech;
    };

    ext.get_recognized_number = function () {
        // convert a number name anywhere in the string to a number
        var converted = wordsToNumbers(recognized_speech); 
        if (typeof converted == 'number') {
            // console.log('converted to: ' + converted);
            return converted;
        }

        // extract numbers from the string
        var extracted = extractNumber(recognized_speech);
        if (typeof extracted == 'number') {
            // console.log('extracted: ' + extracted);
            return extracted;
        }

        return '';
    }

    // convert the string names of numbers to numbers (up to twenty)
    // if there are multiple names in the string, return the last one
    function wordsToNumbers (string) {
        var numberNames = [
            'zero',
            'one',
            'two',
            'three',
            'four',
            'five',
            'six',
            'seven',
            'eight',
            'nine',
            'ten',
            'eleven',
            'twelve',
            'thirteen',
            'fourteen',
            'fifteen',
            'sixteen',
            'seventeen',
            'eighteen',
            'nineteen',
            'twenty'
        ];

        var result = 'none';
        for (var i=0; i<numberNames.length; i++) {
            if (string.includes(numberNames[i])) {
                result = i;
            }
        }
        return result;
    }

    // extract the first contiguous set of numbers in the string
    // this could be done more compactly with a regex match, but there is some problem
    // with using the excape chars in the extension
    function extractNumber (string) {
        var numString = '';
        var numStartedFlag = false;
        for (var i=0; i < string.length; i++) {
            var maybeNum = parseInt(string[i]);
            if (!isNaN(maybeNum)) {
                numString += maybeNum;
                numStartedFlag = true;
            } else {
                if (numStartedFlag) {
                    break;
                }
            }
        }
        if (numString.length > 0) {
            return Number(numString);
        } else {
            return 'none';
        }
    }

    ext._shutdown = function() {};

    ext._getStatus = function() {
        if (window.webkitSpeechRecognition === undefined) {
            return {status: 1, msg: 'Your browser does not support speech recognition. Try using Google Chrome.'};
        }
        return {status: 2, msg: 'Ready'};
    };

    var descriptor = {
        blocks: [
            ['w', 'speak %s', 'speak_text', 'Hello!'],
            ['w', 'listen for speech and wait', 'recognize_speech'],
            ['r', 'recognized speech', 'get_recognized_speech'],
            ['r', 'recognized number', 'get_recognized_number']
        ],
    };

    ScratchExtensions.register('Speech IO', descriptor, ext);
})();