var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
var fs = require('fs');
const { uuid } = require('uuidv4')
// display books page
router.get('/', function (req, res, next) {

    dbConn.query('SELECT * FROM users ORDER BY id desc', function (err, rows) {

        if (err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('books', { data: '' });
        } else {
            // render to views/books/index.ejs
            res.render('books', { data: rows });
        }
    });
});

router.get('/users', function (req, res, next) {
    let name = req.query.name;
    console.log(name)
    if (name && name != "") {
        dbConn.query('SELECT * FROM users WHERE name LIKE  "%' + name + '%" ORDER BY name asc', function (err, rows) {
            if (err) {
                res.send({ err: err });
            }
            console.log(err);
            res.send(rows);
        });
    } else {
        dbConn.query('SELECT * FROM users ORDER BY id desc', function (err, rows) {
            if (err) {
                res.send({ err: err });
            }
            console.log(err);
            res.send(rows);
        });

    }
});

// display add book page
router.get('/add', function (req, res, next) {
    // render to add.ejs
    res.render('books/add', {
        name: '',
        image: ''
    })
})

// add a new book
router.post('/add', function (req, res, next) {

    let name = req.body.name;
    let errors = false;

    if (name.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and image");
        // render to add.ejs with flash message
        res.render('books/add', {
            name: name,
        })
    }

    // if no error
    if (!errors) {

        if (!req.files) {
            req.flash('error', 'No files were uploaded.')
            res.redirect('/')
        }

        var file = req.files.uploaded_image;
        var img_name = `${uuid()}-${file.name}`

        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
            file.mv('public/images/upload_images/' + img_name, function (err) {
                if (err) {
                    req.flash('error', err)
                    res.redirect('/')
                }
            });
        } else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            req.flash('error', message)
            res.redirect('/')
        }
        var form_data = {
            name: name,
            image: img_name
        }

        // insert query
        dbConn.query('INSERT INTO users SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('books/add', {
                    name: form_data.name,
                    image: form_data.image
                })
            } else {
                req.flash('success', 'User successfully added');
                res.redirect('/');
            }
        })
    }
})

// display edit book page
router.get('/edit/(:id)', function (req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM users WHERE id = ' + id, function (err, rows, fields) {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'User not found with id = ' + id)
            res.redirect('/')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('books/edit', {
                title: 'Edit User',
                id: rows[0].id,
                name: rows[0].name,
                image: rows[0].image
            })
        }
    })
})

// update book data
router.post('/update', function (req, res, next) {

    let id = req.body.id;
    let name = req.body.name;
    let errors = false;

    if (name.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name");
        // render to add.ejs with flash message
        res.render('books/edit', {
            id: req.params.id,
            name: name,
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            name: name,
        }

        if (!req.files) {
            req.flash('error', 'No files were uploaded.')
            res.redirect('/')
        }

        var file = req.files.uploaded_image;
        var img_name = `${uuid()}-${file.name}`

        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
            file.mv('public/images/upload_images/' + img_name, function (err) {
                if (err) {
                    req.flash('error', err)
                    res.redirect('/')
                }
            });
            form_data.image = img_name
        } else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            req.flash('error', message)
            res.redirect('/')
        }

        // update query
        dbConn.query('UPDATE users SET ? WHERE id = ' + id, form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('books/edit', {
                    id: req.params.id,
                    name: form_data.name
                })
            } else {
                req.flash('success', 'User successfully updated');
                res.redirect('/');
            }
        })
    }
})

// delete book
router.get('/delete/(:id)', function (req, res, next) {

    let id = req.params.id;
    dbConn.query('SELECT * FROM users WHERE id = ' + id, function (err, rows, fields) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect t/ books page
            res.redirect('/')
        }
    })
    dbConn.query('DELETE FROM users WHERE id = ' + id, function (err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect t/ books page
            res.redirect('/')
        } else {
            // set flash message
            req.flash('success', 'User successfully deleted! ID = ' + id)
            // redirect t/ books page
            res.redirect('/')
        }
    })
})

module.exports = router;