const { sync: globby } = require('globby');
const { job } = require('./converter');

(async () => {
    await job(
        './out_html/anal-2',
        globby('/Users/joshuacoles/Documents/University/NotesSnaps/moodle.bath.ac.uk/pluginfile.php/1578210/mod_resource/content/9/**/*.html')
    );

    await job(
        './out_html/alg-2',
        globby('/Users/joshuacoles/Documents/University/NotesSnaps/people.bath.ac.uk/feb/ma20216/notes/**/*.html')
    );

    await job(
        './out_html/vector-calc',
        globby('/Users/joshuacoles/Documents/University/NotesSnaps/moodle.bath.ac.uk/pluginfile.php/1714527/mod_resource/content/9/**/*.html')
    );
})()
