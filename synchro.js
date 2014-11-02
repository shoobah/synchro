var fs = require('fs-extra'),
    moment = require('moment'),
    walker = require('walker'),
    exec = require('child_process').execFile,
    // path = 'C:\\Bilder\\Foton\\2014\\2014-05-22',
    path = 'C:\\Bilder\\Foton\\2014',
    now = Date.now(),
    n = 0;

moment.locale('sv');

// var viewData = function(filename) {
//     exec(command, function(err, data) {
//         console.log('command:', command);
//         if (err) {
//             console.error('error:', err);
//             return false;
//         }
//         return data;
//     });
// };

// var command = '.\\exiv2\\exiv2.exe';
// console.log('trying ', command);
// exec(command,["C:\\Bilder\\Foton\\2005\\2005-03-30\\IMG_7547.JPG"], function(err, data){
//                 if (err) {
//                     console.error('exec error:', err);
//                 } else {
//                     console.log('exif data:', data);
//                 }	
// });

var getFilename = function(fullPath) {
    var myregexp = /(\b[a-z]:)\\((?:[^\\\/:*?"<>|\x00-\x1F]+\\)*)([^\\\/:*?"<>|\x00-\x1F]*)/i;
    var match = myregexp.exec(fullPath);
    if (match !== null) {
        filename = match[3];
    } else {
        filename = "";
    }
    return filename;
};

walker(path)
    .filterDir(function(dir, stat) {
        if (/[.]git/i.test(dir)) return false;
        return true;
    })
    .on('file', function(file, stat) {
        if (/[.]jpg|[.]cr2|[.]dng|[.]arw/i.test(file)) {
            var command = '.\\exiv2\\exiv2.exe';
            var exif = exec(command, [file], function(err, data) {
                if (err) {
                    console.error('exec error:', err);
                } else {
                    var myregexp = /([^:|^\r\n]*):([^\r\n]*)/img;
                    var match = myregexp.exec(data);
                    var jsonString = '{';
                    while (match !== null) {
                        // matched text: match[0]
                        // match start: match.index
                        // capturing group n: match[n]
                        match = myregexp.exec(data);
                        if (match && match[1] && match[2]) {
                            var item = '"' + match[1].replace(/([ ]*)/img, "") + '":"' + match[2].replace(/[ ](.*)/img, "$1") + '"';
                            // console.log('item', item);
                            jsonString += item + ",";
                        }
                    }
                    jsonString = jsonString.replace(/,"Exifcomment":"[^"]*",/ig, "");
                    jsonString += '}';
                    var imageData = JSON.parse(jsonString);
                    imageData.FileName = getFilename(file);

                    console.log('Name', imageData.FileName);
                    console.log('Taken', imageData.Imagetimestamp);
                }
            });
        }
    });
