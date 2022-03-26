var express = require('express');
var router = express.Router();
var session_store;
/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/stokmobil');
});

router.get('/', function(req, res, next) {
	res.redirect('/customers');
});

router.get('/gate',function(req,res,next){
	if(req.session.email) {
		res.redirect('/stokmobil');
	}
	else if(!req.session.email){
		res.render('main/login',{title:"Login Page"});
	}
});

router.get('/register',function(req,res,next){
	if(req.session.email) {
		res.redirect('/stokmobil');
	}
	else if(!req.session.email){
		res.render('main/register',{title:"Register Page"});
	}
});

router.post("/register", function (req, res, next) {
  req.assert("name", "Please fill the name").notEmpty();
	req.assert("email", "Please fill the email").notEmpty();
	req.assert("phone", "Please fill the phone").notEmpty();
	req.assert("password", "Please fill the password").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_name = req.sanitize("name").escape().trim();
    v_email = req.sanitize("email").escape().trim();
    v_password = req.sanitize("password").escape().trim();
    v_phone = req.sanitize("phone").escape();

    var user = {
      name: v_name,
      password: v_password,
      email: v_email,
      phone: v_phone,
    };

    var insert_sql = "INSERT INTO user SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        user,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("main/register", {
              name: req.param("name"),
              password: req.param("password"),
              email: req.param("email"),
              phone: req.param("phone"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create user success");
            res.redirect("/gate");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("main/register", {
      name: req.param("name"),
      password: req.param("password"),
      session_store: req.session,
    });
  }
});

router.post('/gate',function(req,res,next){
	session_store=req.session;
	req.assert('email', 'Mohon Isi Kolom Email').notEmpty();
	req.assert('email', 'Email Tidak Valid').isEmail();
	req.assert('password', 'Mohon Isi Kolom Password').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		req.getConnection(function(err,connection){
			pass = req.body.password; 
			email = req.body.email;
			
			var query = connection.query('select * from user where email="'+email+'" and password="'+pass+'"',function(err,rows)
			{
				if(err)
				{
					var errornya  = ("Error Selecting : %s ",err.code );  
					console.log(err.code);
					req.flash('msg_error', errornya); 
					res.redirect('/gate'); 
				}else
				{
					if(rows.length <=0)
					{

						req.flash('msg_error', "Wrong email address or password. Try again."); 
						res.redirect('/gate');
					}
					else
					{	
						session_store.is_login = true;
						session_store.email = req.body.email;
						res.redirect('/stokmobil');
					}
				}

			});
		});
	}
	else
	{
		errors_detail = "<p>Sory there are error</p><ul>";
		for (i in errors) 
		{ 
			error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		console.log(errors_detail);
		req.flash('msg_error', errors_detail); 
		res.redirect('/gate'); 
	}
});

router.get('/logout', function(req, res)
{ 
	req.session.destroy(function(err)
	{ 
		if(err)
		{ 
			console.log(err); 
		} 
		else
		{ 
			res.redirect('/stokmobil'); 
		} 
	}); 
});
module.exports = router;
